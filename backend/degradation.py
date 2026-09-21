"""Graceful-degradation helpers for optional integrations.

Every ``except Exception`` in this repository is an intentional degradation
boundary: an optional provider (n8n MCP, Tavus avatar, LiveKit status
publish) or a remote tool call failed, and the agent must continue in a
reduced mode instead of crashing the session.

Ruff's BLE001 ("do not catch blind exception") is suppressed once, here, with
the reason stated below. Call sites use :func:`degraded` so no other module
needs a bare ``except Exception``.
"""

from __future__ import annotations

import logging
from collections.abc import Iterator
from contextlib import contextmanager

logger = logging.getLogger("archava.degradation")


@contextmanager
def degraded(scope: str, action: str, *, level: int = logging.WARNING) -> Iterator[None]:
    """Run an optional integration, degrading instead of failing.

    Any exception raised by ``action`` is logged with its concrete type and
    swallowed so the caller can continue in a reduced mode.

    Args:
        scope: Integration that failed, e.g. ``"tavus avatar"``.
        action: What was being attempted, e.g. ``"start"``.
        level: Log level for the degradation notice.
    """
    try:
        yield
    except Exception as exc:  # noqa: BLE001 - optional-provider boundary; see module docstring
        logger.log(
            level,
            "%s unavailable during %s (%s): %s",
            scope,
            action,
            type(exc).__name__,
            exc,
        )


def tool_boundary_error(scope: str, exc: BaseException) -> str:
    """Format a remote tool failure as text the model can read.

    Args:
        scope: Human-readable description of the failed operation.
        exc: The exception raised by the remote tool call.

    Returns:
        A single-line error string suitable for a tool result.
    """
    return f"{scope} ({type(exc).__name__}): {exc}"
