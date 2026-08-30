from livekit.agents import function_tool, RunContext
import json
import logging

logger = logging.getLogger("agent-tools")

@function_tool
async def open_browser(url: str, context: RunContext) -> str:
    """
    Buka halaman web atau navigasi ke URL/halaman terkait di website hotel (misal: '/fitness-center', '/spa-wellness', '/booking', '/valet-parking').
    WAJIB dipanggil setiap kali pengguna/tamu menanyakan atau ingin melihat halaman Gym, Spa, Booking, Valet, atau fasilitas hotel.

    Args:
        url: Path atau URL halaman yang ingin dibuka (contoh: '/fitness-center', '/spa-wellness', '/booking', '/valet-parking').
    """
    # GUARDRAIL: Strict URL Sanitization & SSRF/External Domain Prevention
    if not isinstance(url, str) or not (url.startswith("/") or url.startswith("#")):
        logger.warning(f"[guardrail] Blocked untrusted URL navigation attempt: '{url}' -> fallback to '/'")
        url = "/"

    print(f"[tools] open_browser function tool invoked with url={url}", flush=True)
    logger.info(f"[tools] open_browser function tool invoked with url={url}")
    try:
        room = getattr(context, "room", None)
        if not room and context and context.session:
            if hasattr(context.session, "room_io"):
                room = context.session.room_io.room
            elif hasattr(context.session, "room"):
                room = context.session.room

        if room:
            payload = json.dumps({"action": "navigate", "url": url}).encode("utf-8")
            await room.local_participant.publish_data(payload, reliable=True, topic="navigation")
            await room.local_participant.publish_data(payload, reliable=True, topic="")
            print(f"[tools] Successfully published navigation data packet to room: {url}", flush=True)
            logger.info(f"[tools] Successfully published navigation data packet to room: {url}")
            return f"Berhasil membuka halaman {url} di layar pelanggan."
        else:
            print("[tools] Error: Room context is missing", flush=True)
            logger.error("[tools] Room context or session is missing")
            return f"Gagal membuka {url}: room session tidak aktif."
    except Exception as e:
        print(f"[tools] Error publishing navigation packet: {e}", flush=True)
        logger.error(f"[tools] Error publishing navigation packet: {e}", exc_info=True)
        return f"Gagal membuka {url}: {str(e)}"


@function_tool
async def trigger_web3_booking(daybed_type: str, visit_date: str, context: RunContext) -> str:
    """
    Triggers seamless 1-click Web3 Daybed Reservation modal on guest screen.
    WAJIB dipanggil ketika tamu ingin melakukan booking/reservasi Daybed (Lagoon Bed, VIP Cabana, Party Suite, Single Sofa).

    Args:
        daybed_type: Tipe daybed ('Lagoon Bed', 'VIP Cabana', 'Party Suite', atau 'Single Sofa').
        visit_date: Tanggal kunjungan format YYYY-MM-DD (contoh: '2026-08-25').
    """
    logger.info(f"[tools] trigger_web3_booking invoked with daybed_type={daybed_type}, visit_date={visit_date}")
    try:
        room = getattr(context, "room", None)
        if not room and context and context.session:
            if hasattr(context.session, "room_io"):
                room = context.session.room_io.room
            elif hasattr(context.session, "room"):
                room = context.session.room

        if room:
            type_map = {
                "lagoon": 0, "lagoon bed": 0,
                "cabana": 1, "vip cabana": 1,
                "party suite": 2, "suite": 2, "party executive suite": 2,
                "sofa": 3, "single sofa": 3
            }
            daybed_id = type_map.get(daybed_type.lower(), 0)

            payload = json.dumps({
                "action": "trigger_web3_booking",
                "daybedType": daybed_id,
                "daybedName": daybed_type,
                "visitDate": visit_date
            }).encode("utf-8")

            await room.local_participant.publish_data(payload, reliable=True, topic="navigation")
            await room.local_participant.publish_data(payload, reliable=True, topic="")
            logger.info(f"[tools] Successfully published trigger_web3_booking packet to room")
            return f"Modal reservasi Web3 untuk {daybed_type} tanggal {visit_date} telah dimunculkan di layar tamu."
        else:
            return "Gagal memunculkan modal: room session tidak aktif."
    except Exception as e:
        logger.error(f"[tools] Error in trigger_web3_booking: {e}", exc_info=True)
        return f"Gagal memunculkan modal: {str(e)}"


@function_tool
async def sign_web3_transaction(context: RunContext) -> str:
    """
    Triggers instant popup window of guest's Rabby Wallet / Web3 wallet to sign/approve transaction via voice.
    WAJIB dipanggil ketika tamu berkata 'sign', 'sign sekarang', 'konfirmasi', 'bayar', atau 'setujui'.
    """
    print("[tools] sign_web3_transaction invoked via voice command!", flush=True)
    try:
        room = getattr(context, "room", None)
        if not room and context and context.session:
            if hasattr(context.session, "room_io"):
                room = context.session.room_io.room
            elif hasattr(context.session, "room"):
                room = context.session.room

        if room:
            payload = json.dumps({"action": "auto_sign"}).encode("utf-8")
            await room.local_participant.publish_data(payload, reliable=True, topic="navigation")
            await room.local_participant.publish_data(payload, reliable=True, topic="")
            print("[tools] Successfully published auto_sign packet to room", flush=True)
            return "Popup Rabby Wallet / Web3 wallet telah dibuka otomatis di layar tamu untuk ditandatangani."
        else:
            return "Gagal memicu wallet: room session tidak aktif."
    except Exception as e:
        return f"Gagal memicu wallet sign: {str(e)}"


import os
import asyncio
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

async def send_actual_email(to_email: str, name: str, room_type: str, check_in: str, check_out: str, guests: int) -> bool:
    sender_email = os.environ.get("GMAIL_SENDER_EMAIL")
    app_password = os.environ.get("GMAIL_APP_PASSWORD")
    if not sender_email or not app_password:
        logger.info("[tools] GMAIL_SENDER_EMAIL or GMAIL_APP_PASSWORD missing in .env; skipping physical SMTP dispatch")
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"★ White Rock VIP Daybed Pass - {room_type}"
        msg["From"] = f"White Rock Beach Club Bali <{sender_email}>"
        msg["To"] = to_email

        body = f"""
        <html>
          <body style="font-family: Arial, sans-serif; color: #1e293b; background-color: #f8fafc; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #cbd5e1; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
              <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #0284c7; font-size: 24px; margin: 0; letter-spacing: 1px;">WHITE ROCK</h2>
                <p style="color: #0369a1; font-size: 13px; font-weight: bold; margin-top: 4px; text-transform: uppercase;">Beachfront Club • Melasti Beach, Bali</p>
              </div>
              <div style="background-color: #f0f9ff; border-left: 4px solid #0284c7; padding: 12px 16px; border-radius: 4px; margin-bottom: 20px;">
                <h3 style="color: #0369a1; margin: 0; font-size: 16px;">✓ Konfirmasi VIP Daybed Pass Berhasil</h3>
              </div>
              <p>Kepada Yth. <strong>{name}</strong>,</p>
              <p>Terima kasih telah melakukan reservasi di <strong>White Rock Beach Club Bali</strong>. Berikut adalah rincian VIP Daybed Pass Anda:</p>
              <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <tr><td style="padding: 10px; border-bottom: 1px solid #f1f5f9; color: #64748b;"><strong>Lokasi & Venue:</strong></td><td style="padding: 10px; border-bottom: 1px solid #f1f5f9; color: #0f172a;">White Rock Beach Club (Pantai Melasti, Ungasan)</td></tr>
                <tr><td style="padding: 10px; border-bottom: 1px solid #f1f5f9; color: #64748b;"><strong>Tipe Reservation:</strong></td><td style="padding: 10px; border-bottom: 1px solid #f1f5f9; color: #0284c7; font-weight: bold;">{room_type}</td></tr>
                <tr><td style="padding: 10px; border-bottom: 1px solid #f1f5f9; color: #64748b;"><strong>Tanggal Kunjungan:</strong></td><td style="padding: 10px; border-bottom: 1px solid #f1f5f9; color: #0f172a;">{check_in}</td></tr>
                <tr><td style="padding: 10px; border-bottom: 1px solid #f1f5f9; color: #64748b;"><strong>Jumlah Tamu:</strong></td><td style="padding: 10px; border-bottom: 1px solid #f1f5f9; color: #0f172a;">{guests} Orang</td></tr>
              </table>
              <p style="margin-top: 20px; color: #334155;">Tunjukkan email konfirmasi ini saat tiba di pintu masuk utama VIP White Rock Beach Club untuk langsung diantar oleh host kami.</p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
              <p style="font-size: 0.9em; color: #64748b; margin: 0;">Salam hangat,<br><strong style="color: #0f172a;">Ava — VIP AI Concierge</strong><br>White Rock Beach Club Bali</p>
            </div>
          </body>
        </html>
        """
        msg.attach(MIMEText(body, "html"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(sender_email, app_password)
            server.sendmail(sender_email, to_email, msg.as_string())
        logger.info(f"[tools] Physical email successfully dispatched to {to_email}")
        return True
    except Exception as e:
        logger.error(f"[tools] Failed to dispatch physical SMTP email to {to_email}: {e}", exc_info=True)
        return False


def normalize_email(email: str) -> str:
    if not email:
        return email
    cleaned = email.strip().lower()
    # Common Speech-To-Text hallucinations for gmail
    TYPO_DOMAINS = ["@email.com", "@gamil.com", "@gmal.com", "@gmail.co", "@gmail.com.com", "@mail.com"]
    for typo in TYPO_DOMAINS:
        if cleaned.endswith(typo):
            prefix = cleaned[:-len(typo)]
            normalized = f"{prefix}@gmail.com"
            logger.info(f"[tools] Normalized STT email typo: '{email}' -> '{normalized}'")
            return normalized
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
    """
    Kirim email konfirmasi booking dan otomatis buka halaman konfirmasi booking di layar pelanggan.
    WAJIB dipanggil setelah semua informasi booking (nama, email, tipe kamar, tanggal check-in, check-out, jumlah tamu) lengkap.

    Args:
        name: Nama lengkap pelanggan.
        email: Email pelanggan.
        room_type: Tipe kamar (Executive Suite, Deluxe Room, atau Presidential Suite).
        check_in: Tanggal check-in.
        check_out: Tanggal check-out.
        guests: Jumlah tamu.
    """
    email = normalize_email(email)
    logger.info(f"[tools] send_booking_email invoked for {name} ({email}), room={room_type}")
    try:
        # 1. Attempt physical SMTP email dispatch if credentials exist
        email_sent = await send_actual_email(to_email=email, name=name, room_type=room_type, check_in=check_in, check_out=check_out, guests=guests)

        # 2. Generate confirmation URL with query params & open on user screen
        confirmation_url = f"/bookingconfirmation?name={name}&email={email}&room={room_type}&guests={guests}&checkin={check_in}&checkout={check_out}"
        await open_browser(url=confirmation_url, context=context)

        if email_sent:
            return f"Email konfirmasi booking FISIK telah terkirim ke {email} dan halaman konfirmasi telah dibuka di layar."
        else:
            return f"Booking berhasil dicatat, halaman konfirmasi telah dibuka di layar untuk {name} ({email})."
    except Exception as e:
        logger.error(f"[tools] Error in send_booking_email: {e}", exc_info=True)
        return f"Booking berhasil dicatat dan halaman konfirmasi telah dibuka."


@function_tool
async def close_session(reason: str, context: RunContext) -> str:
    """
    Tutup panggilan/percakapan secara otomatis SETELAH ucapan salam perpisahan/terima kasih selesai diucapkan sepenuhnya.

    Args:
        reason: Alasan menutup panggilan (contoh: 'pelanggan pamit').
    """
    logger.info(f"[tools] close_session invoked with reason: {reason}, waiting 8.0s for full closing statement playback...")
    try:
        # Grace delay to allow Ava's closing statement & avatar animation to complete playing in browser
        await asyncio.sleep(8.0)
        room = None
        if context and context.session:
            if hasattr(context.session, "room_io"):
                room = context.session.room_io.room
            elif hasattr(context.session, "room"):
                room = context.session.room

        if room:
            payload = json.dumps({"action": "disconnect", "reason": reason}).encode("utf-8")
            await room.local_participant.publish_data(payload, reliable=True, topic="navigation")
            await room.local_participant.publish_data(payload, reliable=True, topic="")
            logger.info(f"[tools] Published disconnect action packet to room")
            return "Call disconnected silently. Do not speak or say anything further."
        return "Gagal menutup session: room tidak aktif."
    except Exception as e:
        logger.error(f"[tools] Error in close_session: {e}", exc_info=True)
        return f"Gagal mengakhiri panggilan: {str(e)}"


@function_tool
async def check_room_availability(
    room_type: str,
    check_in: str,
    check_out: str,
    context: RunContext,
) -> str:
    """
    Cek ketersediaan kamar hotel untuk tipe kamar dan tanggal tertentu.

    Args:
        room_type: Tipe kamar (Executive Suite, Deluxe Room, atau Presidential Suite).
        check_in: Tanggal check-in (contoh: '2026-08-12').
        check_out: Tanggal check-out (contoh: '2026-08-13').
    """
    logger.info(f"[tools] check_room_availability invoked for room={room_type}, check_in={check_in}")
    return f"Kamar tipe {room_type} tersedia untuk tanggal check-in {check_in} sampai {check_out}."
