"""Vendored MCP client used by the LiveKit agent.

Only the pieces the agent actually uses are re-exported here; ``__all__`` makes
the public surface explicit so the re-exports are not flagged as unused.
"""

from .server import (
    MCPServer,
    MCPServerSse,
    MCPServerSseParams,
    MCPServerStdio,
    MCPServerStdioParams,
)

__all__ = [
    "MCPServer",
    "MCPServerSse",
    "MCPServerSseParams",
    "MCPServerStdio",
    "MCPServerStdioParams",
]
