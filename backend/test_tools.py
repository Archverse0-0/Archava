import pytest
from unittest.mock import AsyncMock, MagicMock, patch
import json
import asyncio

# Import the tools
import sys
sys.path.insert(0, '.')
from tools import (
    open_browser,
    trigger_web3_booking,
    sign_web3_transaction,
    send_booking_email,
    close_session,
    check_room_availability,
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
    """Test open_browser with valid relative URL"""
    room = MockRoom()
    context = MockContext(room)
    
    result = await open_browser("/spa-wellness", context)
    
    assert "Berhasil membuka halaman" in result
    assert room.local_participant.publish_data.call_count == 2
    
    # Check the payload
    call_args = room.local_participant.publish_data.call_args_list[0]
    payload = json.loads(call_args[0][0].decode('utf-8'))
    assert payload["action"] == "navigate"
    assert payload["url"] == "/spa-wellness"

@pytest.mark.asyncio
async def test_open_browser_blocks_external_url():
    """Test open_browser blocks external URLs (SSRF protection)"""
    room = MockRoom()
    context = MockContext(room)
    
    result = await open_browser("http://evil.com", context)
    
    assert "Gagal membuka" in result
    # Should not publish data for blocked URLs
    # (The guardrail logs a warning and falls back to "/")

@pytest.mark.asyncio
async def test_open_browser_missing_room():
    """Test open_browser when room context is missing"""
    context = MockContext(None)
    
    result = await open_browser("/booking", context)
    
    assert "room session tidak aktif" in result

@pytest.mark.asyncio
async def test_trigger_web3_booking_valid():
    """Test trigger_web3_booking with valid parameters"""
    room = MockRoom()
    context = MockContext(room)
    
    result = await trigger_web3_booking("Lagoon Bed", "2026-08-25", context)
    
    assert "Modal pembayaran 1-Click Pay telah dimunculkan" in result
    assert room.local_participant.publish_data.call_count == 2
    
    call_args = room.local_participant.publish_data.call_args_list[0]
    payload = json.loads(call_args[0][0].decode('utf-8'))
    assert payload["action"] == "trigger_web3_booking"
    assert payload["daybedType"] == 0  # Lagoon Bed = 0
    assert payload["visitDate"] == "2026-08-25"

@pytest.mark.asyncio
async def test_trigger_web3_booking_invalid_type():
    """Test trigger_web3_booking with invalid daybed type"""
    room = MockRoom()
    context = MockContext(room)
    
    result = await trigger_web3_booking("Invalid Type", "2026-08-25", context)
    
    assert "Tipe daybed tidak dikenali" in result

@pytest.mark.asyncio
async def test_sign_web3_transaction():
    """Test sign_web3_transaction"""
    room = MockRoom()
    context = MockContext(room)
    
    result = await sign_web3_transaction(context)
    
    assert "popup Rabby Wallet / MetaMask telah dibuka" in result
    assert room.local_participant.publish_data.call_count == 2
    
    call_args = room.local_participant.publish_data.call_args_list[0]
    payload = json.loads(call_args[0][0].decode('utf-8'))
    assert payload["action"] == "auto_sign"

@pytest.mark.asyncio
async def test_close_session():
    """Test close_session publishes disconnect action"""
    room = MockRoom()
    context = MockContext(room)
    
    with patch('asyncio.sleep', new_callable=AsyncMock) as mock_sleep:
        result = await close_session("pelanggan pamit", context)
        
        # Should wait 8 seconds for closing statement
        mock_sleep.assert_called_once_with(8.0)
        
    assert "Call disconnected silently" in result
    assert room.local_participant.publish_data.call_count == 2
    
    call_args = room.local_participant.publish_data.call_args_list[0]
    payload = json.loads(call_args[0][0].decode('utf-8'))
    assert payload["action"] == "disconnect"
    assert payload["reason"] == "pelanggan pamit"

@pytest.mark.asyncio
async def test_check_room_availability():
    """Test check_room_availability returns mock availability"""
    room = MockRoom()
    context = MockContext(room)
    
    result = await check_room_availability("VIP Cabana", "2026-08-25", "2026-08-26", context)
    
    assert "tersedia" in result
    assert "VIP Cabana" in result

if __name__ == "__main__":
    pytest.main([__file__, "-v"])
