import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from tools import (
    check_room_availability,
    close_session,
    normalize_email,
    open_browser,
    sign_web3_transaction,
    trigger_web3_booking,
)


class MockRoom:
    def __init__(self):
        self.local_participant = AsyncMock()


class MockContext:
    def __init__(self, room=None):
        self.session = MagicMock()
        self.session.room = room
        self.session.room_io = MagicMock()
        self.session.room_io.room = room


@pytest.mark.asyncio
async def test_open_browser_valid_url():
    room = MockRoom()
    result = await open_browser("/spa-wellness", MockContext(room))
    assert "Berhasil membuka halaman" in result
    room.local_participant.publish_data.assert_awaited_once()
    payload = json.loads(room.local_participant.publish_data.call_args.args[0].decode())
    assert payload == {"action": "navigate", "url": "/spa-wellness"}


@pytest.mark.asyncio
async def test_open_browser_blocks_external_url():
    room = MockRoom()
    result = await open_browser("http://evil.com", MockContext(room))
    assert "Gagal membuka URL" in result
    room.local_participant.publish_data.assert_not_awaited()


@pytest.mark.asyncio
async def test_open_browser_blocks_protocol_relative_url():
    room = MockRoom()
    result = await open_browser("//evil.com/path", MockContext(room))
    assert "Gagal membuka URL" in result
    room.local_participant.publish_data.assert_not_awaited()


@pytest.mark.asyncio
async def test_open_browser_missing_room():
    result = await open_browser("/booking", MockContext(None))
    assert "room session tidak aktif" in result


@pytest.mark.asyncio
async def test_trigger_web3_booking_valid():
    room = MockRoom()
    result = await trigger_web3_booking("Lagoon Bed", "2026-10-25", MockContext(room))
    assert "Modal pembayaran 1-Click Pay" in result
    payload = json.loads(room.local_participant.publish_data.call_args.args[0].decode())
    assert payload["daybedType"] == 0
    assert payload["daybedName"] == "Lagoon Bed"


@pytest.mark.asyncio
async def test_trigger_web3_booking_invalid_type():
    room = MockRoom()
    result = await trigger_web3_booking("Invalid Type", "2026-10-25", MockContext(room))
    assert "Tipe daybed tidak dikenali" in result
    room.local_participant.publish_data.assert_not_awaited()


@pytest.mark.asyncio
async def test_sign_web3_transaction():
    room = MockRoom()
    result = await sign_web3_transaction(MockContext(room))
    assert "Rabby Wallet / MetaMask" in result
    payload = json.loads(room.local_participant.publish_data.call_args.args[0].decode())
    assert payload["action"] == "auto_sign"


@pytest.mark.asyncio
async def test_close_session():
    room = MockRoom()
    with patch("asyncio.sleep", new_callable=AsyncMock) as mock_sleep:
        result = await close_session("pelanggan pamit", MockContext(room))
    mock_sleep.assert_awaited_once_with(8.0)
    assert "Call disconnected silently" in result


@pytest.mark.asyncio
async def test_check_room_availability_does_not_fake_inventory():
    result = await check_room_availability(
        "VIP Cabana", "2026-10-25", "2026-10-26", MockContext(MockRoom())
    )
    assert "belum diverifikasi" in result
    assert "Jangan menjanjikan" in result


def test_normalize_email_does_not_rewrite_valid_mail_dot_com():
    assert normalize_email("person@mail.com") == "person@mail.com"


def test_normalize_email_repairs_common_gmail_stt_typo():
    assert normalize_email("person@gamil.com") == "person@gmail.com"
