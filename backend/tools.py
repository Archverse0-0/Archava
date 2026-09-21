from __future__ import annotations

import asyncio
import html
import json
import logging
import os
import re
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from urllib.parse import urlencode

from livekit.agents import RunContext, function_tool

logger = logging.getLogger("agent-tools")

_ALLOWED_DAYBEDS = {
    "lagoon": (0, "Lagoon Bed"),
    "lagoon bed": (0, "Lagoon Bed"),
    "cabana": (1, "VIP Cabana"),
    "vip cabana": (1, "VIP Cabana"),
    "party suite": (2, "Party Executive Suite"),
    "suite": (2, "Party Executive Suite"),
    "party executive suite": (2, "Party Executive Suite"),
    "sofa": (3, "Single Sofa"),
    "single sofa": (3, "Single Sofa"),
}

_EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def _resolve_room(context: RunContext):
    room = getattr(context, "room", None)
    if room:
        return room
    session = getattr(context, "session", None)
    if not session:
        return None
    room_io = getattr(session, "room_io", None)
    if room_io and getattr(room_io, "room", None):
        return room_io.room
    return getattr(session, "room", None)


async def _publish_navigation(context: RunContext, data: dict) -> bool:
    room = _resolve_room(context)
    if not room:
        return False
    payload = json.dumps(data).encode("utf-8")
    await room.local_participant.publish_data(payload, reliable=True, topic="navigation")
    return True


def _is_safe_internal_path(url: str) -> bool:
    if not isinstance(url, str) or not url:
        return False
    if "\r" in url or "\n" in url:
        return False
    if url.startswith("#"):
        return True
    return url.startswith("/") and not url.startswith("//")


@function_tool
async def open_browser(url: str, context: RunContext) -> str:
    """Navigate the guest's Archava UI to a safe internal route or hash."""
    if not _is_safe_internal_path(url):
        logger.warning("[guardrail] Blocked untrusted navigation target: %r", url)
        return "Gagal membuka URL: hanya halaman internal Archava yang diizinkan."

    try:
        published = await _publish_navigation(context, {"action": "navigate", "url": url})
        if not published:
            return f"Gagal membuka {url}: room session tidak aktif."
        logger.info("[tools] Published navigation target %s", url)
        return f"Berhasil membuka halaman {url} di layar pelanggan."
    except Exception:
        logger.exception("[tools] Error publishing navigation packet")
        return f"Gagal membuka {url}: terjadi kesalahan pada room session."


@function_tool
async def trigger_web3_booking(daybed_type: str, visit_date: str, context: RunContext) -> str:
    """Open the Web3 booking drawer for a supported daybed type and visit date."""
    normalized = daybed_type.strip().lower()
    mapping = _ALLOWED_DAYBEDS.get(normalized)
    if not mapping:
        return "Tipe daybed tidak dikenali. Pilih Lagoon Bed, VIP Cabana, Party Executive Suite, atau Single Sofa."

    daybed_id, canonical_name = mapping
    try:
        published = await _publish_navigation(
            context,
            {
                "action": "trigger_web3_booking",
                "daybedType": daybed_id,
                "daybedName": canonical_name,
                "visitDate": visit_date,
            },
        )
        if not published:
            return "Gagal memunculkan modal: room session tidak aktif."
        return f"Modal pembayaran 1-Click Pay telah dimunculkan untuk {canonical_name} tanggal {visit_date}."
    except Exception:
        logger.exception("[tools] Error in trigger_web3_booking")
        return "Gagal memunculkan modal reservasi Web3."


@function_tool
async def sign_web3_transaction(context: RunContext) -> str:
    """Ask the frontend to open the wallet confirmation for an existing pending booking."""
    try:
        published = await _publish_navigation(context, {"action": "auto_sign"})
        if not published:
            return "Gagal memicu wallet: room session tidak aktif."
        return "Popup Rabby Wallet / MetaMask telah dibuka untuk booking yang sedang menunggu konfirmasi."
    except Exception:
        logger.exception("[tools] Error in sign_web3_transaction")
        return "Gagal memicu wallet sign."


def _smtp_settings() -> tuple[str, int, str, str, str, bool] | None:
    """Resolve the generic SMTP transport configuration.

    Reads ``SMTP_HOST`` / ``SMTP_PORT`` / ``SMTP_USER`` / ``SMTP_PASS`` /
    ``SMTP_FROM`` / ``SMTP_USE_SSL``. The transport is deliberately not
    provider-specific: any SMTP service that accepts a username/password login
    works, and the host is never hard-coded. Returns ``None`` when the service
    is not configured, which callers treat as "skip physical email" rather than
    as an error.
    """
    host = os.environ.get("SMTP_HOST", "").strip()
    if not host:
        return None
    raw_port = os.environ.get("SMTP_PORT", "").strip()
    try:
        port = int(raw_port) if raw_port else 465
    except ValueError:
        logger.warning("[tools] SMTP_PORT is not an integer (%r); falling back to 465", raw_port)
        port = 465
    if not 1 <= port <= 65535:
        logger.warning("[tools] SMTP_PORT %d is out of range; falling back to 465", port)
        port = 465
    user = os.environ.get("SMTP_USER", "").strip()
    password = os.environ.get("SMTP_PASS", "")
    sender = os.environ.get("SMTP_FROM", "").strip() or user
    if not sender:
        logger.info("[tools] SMTP_HOST is set but SMTP_FROM/SMTP_USER is empty; skipping physical email")
        return None
    use_ssl = os.environ.get("SMTP_USE_SSL", "true").strip().lower() in {"1", "true", "yes", "on"}
    return host, port, user, password, sender, use_ssl


def _open_smtp(host: str, port: int, user: str, password: str, use_ssl: bool) -> smtplib.SMTP:
    """Open an authenticated SMTP session (implicit TLS, or STARTTLS when asked)."""
    # Annotated as the base class because SMTP_SSL and SMTP are siblings: the
    # `if` branch alone would otherwise narrow the inferred type to SMTP_SSL
    # and mypy rejects the STARTTLS branch as an incompatible assignment.
    smtp: smtplib.SMTP
    if use_ssl:
        smtp = smtplib.SMTP_SSL(host, port, timeout=10)
    else:
        smtp = smtplib.SMTP(host, port, timeout=10)
        smtp.starttls()
    if user and password:
        smtp.login(user, password)
    return smtp


async def send_actual_email(
    to_email: str,
    name: str,
    room_type: str,
    check_in: str,
    check_out: str,
    guests: int,
) -> bool:
    settings = _smtp_settings()
    if settings is None:
        logger.info("[tools] SMTP is not configured; skipping physical email")
        return False
    host, port, user, password, sender, use_ssl = settings

    # `to_email` reaches the SMTP envelope and the To header verbatim. The
    # caller's validation already rejects whitespace, but this function is also
    # reachable from the booking tool directly, so the check is repeated here
    # rather than assumed: a CR/LF in a recipient is header injection.
    if not _EMAIL_RE.match(to_email):
        logger.warning("[tools] Refusing to email a malformed address")
        return False

    safe_name = html.escape(name)
    safe_room = html.escape(room_type)
    safe_check_in = html.escape(check_in)
    safe_check_out = html.escape(check_out)
    safe_guests = html.escape(str(guests))

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"White Rock VIP Daybed Request - {safe_room}"
        msg["From"] = f"White Rock Beach Club Bali <{sender}>"
        msg["To"] = to_email

        body = f"""
        <html>
          <body style="font-family: Arial, sans-serif; color: #1e293b; background-color: #f8fafc; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #cbd5e1; border-radius: 12px; background-color: #ffffff;">
              <h2 style="color: #0284c7;">WHITE ROCK</h2>
              <p>Halo <strong>{safe_name}</strong>, detail permintaan reservasi Anda telah diterima.</p>
              <table style="width:100%; border-collapse:collapse;">
                <tr><td><strong>Tipe:</strong></td><td>{safe_room}</td></tr>
                <tr><td><strong>Tanggal:</strong></td><td>{safe_check_in} — {safe_check_out}</td></tr>
                <tr><td><strong>Tamu:</strong></td><td>{safe_guests}</td></tr>
              </table>
              <p style="margin-top:20px;">Catatan: email ini bukan bukti pembayaran on-chain. Booking Web3 hanya valid setelah transaksi terverifikasi di Monad Testnet.</p>
              <p>Salam,<br><strong>Ava — AI Concierge</strong></p>
            </div>
          </body>
        </html>
        """
        msg.attach(MIMEText(body, "html"))

        with _open_smtp(host, port, user, password, use_ssl) as smtp:
            smtp.sendmail(sender, to_email, msg.as_string())
        logger.info("[tools] Physical reservation email dispatched")
        return True
    except Exception:
        logger.exception("[tools] Failed to dispatch physical SMTP email")
        return False


def normalize_email(email: str) -> str:
    if not email:
        return email
    cleaned = email.strip().lower()
    typo_domains = ["@email.com", "@gamil.com", "@gmal.com", "@gmail.co", "@gmail.com.com"]
    for typo in typo_domains:
        if cleaned.endswith(typo):
            prefix = cleaned[: -len(typo)]
            return f"{prefix}@gmail.com"
    return cleaned


@function_tool
async def send_booking_email(
    name: str,
    email: str,
    room_type: str,
    check_in: str,
    check_out: str,
    guests: int,
    context: RunContext,
) -> str:
    """Send a reservation-request email and open the non-Web3 reservation summary page."""
    email = normalize_email(email)
    if not _EMAIL_RE.match(email):
        return "Alamat email tidak valid. Mohon konfirmasi ulang alamat email sebelum melanjutkan."
    if guests < 1 or guests > 50:
        return "Jumlah tamu tidak valid. Mohon konfirmasi ulang jumlah tamu."

    try:
        email_sent = await send_actual_email(
            to_email=email,
            name=name,
            room_type=room_type,
            check_in=check_in,
            check_out=check_out,
            guests=guests,
        )

        query = urlencode(
            {
                "name": name,
                "email": email,
                "room": room_type,
                "guests": guests,
                "checkin": check_in,
                "checkout": check_out,
            }
        )
        await open_browser(url=f"/bookingconfirmation?{query}", context=context)

        if email_sent:
            return f"Detail permintaan reservasi telah dikirim ke {email} dan ditampilkan di layar."
        return "Detail permintaan reservasi telah ditampilkan di layar; pengiriman email belum dikonfigurasi."
    except Exception:
        logger.exception("[tools] Error in send_booking_email")
        return "Gagal menyiapkan ringkasan reservasi. Mohon coba lagi."


@function_tool
async def close_session(reason: str, context: RunContext) -> str:
    """Close the room after the spoken closing statement has time to finish."""
    try:
        await asyncio.sleep(8.0)
        published = await _publish_navigation(context, {"action": "disconnect", "reason": reason})
        if not published:
            return "Gagal menutup session: room tidak aktif."
        return "Call disconnected silently. Do not speak or say anything further."
    except Exception:
        logger.exception("[tools] Error in close_session")
        return "Gagal mengakhiri panggilan."


@function_tool
async def check_room_availability(
    room_type: str,
    check_in: str,
    check_out: str,
    context: RunContext,
) -> str:
    """Return a safe status until a real inventory provider is connected."""
    _ = context
    logger.info(
        "[tools] Availability requested room=%s check_in=%s check_out=%s",
        room_type,
        check_in,
        check_out,
    )
    return (
        f"Ketersediaan real-time untuk {room_type} tanggal {check_in} sampai {check_out} "
        "belum diverifikasi oleh inventory system. Jangan menjanjikan slot tersedia sebelum sistem reservasi resmi mengonfirmasi."
    )
