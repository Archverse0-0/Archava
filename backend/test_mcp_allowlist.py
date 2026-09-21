"""Tests for the MCP tool allowlist.

An MCP server hands the agent a catalogue of remote tools. Nothing in a tool
schema says which of them a deployment intends to expose, so registration is
gated on an explicit opt-in list. These tests pin the gate's two properties:
an unconfigured allowlist exposes nothing, and a configured one exposes only
what it names.
"""

from unittest.mock import AsyncMock

import pytest
from mcp_client.agent_tools import MCPToolsIntegration, allowed_mcp_tools


def _tool(name: str):
    tool = AsyncMock()
    tool.name = name
    tool.description = f"{name} description"
    tool.inputSchema = {
        "type": "object",
        "properties": {"query": {"type": "string"}},
        "required": ["query"],
    }
    return tool


def _server(tool_names: list[str]):
    server = AsyncMock()
    server.name = "n8n"
    server.connected = True
    server.list_tools.return_value = [_tool(name) for name in tool_names]
    return server


def test_allowlist_is_empty_when_env_unset(monkeypatch):
    monkeypatch.delenv("N8N_MCP_ALLOWED_TOOLS", raising=False)
    assert allowed_mcp_tools() == frozenset()


def test_allowlist_ignores_blank_and_placeholder_entries(monkeypatch):
    monkeypatch.setenv("N8N_MCP_ALLOWED_TOOLS", " , get_availability ,, ")
    assert allowed_mcp_tools() == frozenset({"get_availability"})


def test_allowlist_splits_on_commas(monkeypatch):
    monkeypatch.setenv("N8N_MCP_ALLOWED_TOOLS", "a,b , c")
    assert allowed_mcp_tools() == frozenset({"a", "b", "c"})


@pytest.mark.asyncio
async def test_unconfigured_allowlist_registers_no_tools(monkeypatch):
    monkeypatch.delenv("N8N_MCP_ALLOWED_TOOLS", raising=False)

    server = _server(["send_email", "charge_card", "delete_booking"])
    prepared = await MCPToolsIntegration.prepare_dynamic_tools([server], auto_connect=False)

    assert prepared == []


@pytest.mark.asyncio
async def test_only_allowlisted_tools_are_registered(monkeypatch):
    monkeypatch.setenv("N8N_MCP_ALLOWED_TOOLS", "get_availability")

    server = _server(["get_availability", "send_email", "charge_card"])
    prepared = await MCPToolsIntegration.prepare_dynamic_tools([server], auto_connect=False)

    assert len(prepared) == 1


@pytest.mark.asyncio
async def test_allowlist_is_enforced_per_server(monkeypatch):
    monkeypatch.setenv("N8N_MCP_ALLOWED_TOOLS", "get_availability")

    first = _server(["get_availability"])
    second = _server(["get_availability", "run_shell_command"])
    prepared = await MCPToolsIntegration.prepare_dynamic_tools(
        [first, second], auto_connect=False
    )

    assert len(prepared) == 2
