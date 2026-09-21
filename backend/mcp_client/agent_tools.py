import inspect
import json
import logging
import os
import typing
from collections.abc import Callable
from typing import Any

# ``agent.py`` puts the backend package root on sys.path before importing this
# module, so the shared degradation helper resolves as a top-level module.
from degradation import degraded

from .server import MCPServer
from .util import FunctionTool, MCPUtil

logger = logging.getLogger("mcp-agent-tools")


def allowed_mcp_tools() -> frozenset[str]:
    """Return the set of MCP tool names the agent is permitted to call.

    An MCP server is a remote tool catalogue: whatever it lists, the model can
    invoke. An n8n instance in particular can expose payment actions, database
    writes, outbound email and destructive operations, and nothing in the tool
    schema tells the agent which of those a deployment intends to expose. So the
    catalogue is filtered against an explicit opt-in allowlist rather than
    registered wholesale.

    The allowlist is the *only* way a remote tool becomes callable. When
    ``N8N_MCP_ALLOWED_TOOLS`` is unset or empty nothing is registered — the
    failure mode is a concierge that cannot reach n8n, which is visible and
    correctable, rather than an agent that can move money on someone's behalf.
    """
    raw = os.environ.get("N8N_MCP_ALLOWED_TOOLS", "")
    names = {name.strip() for name in raw.split(",") if name.strip()}
    if not names:
        logger.error(
            "N8N_MCP_ALLOWED_TOOLS is not set: no MCP tools will be registered. "
            "Set it to a comma-separated list of tool names this deployment is "
            "authorised to expose."
        )
    return frozenset(names)


class MCPToolsIntegration:
    """
    Helper class for integrating MCP tools with LiveKit agents.
    Provides utilities for registering dynamic tools from MCP servers.
    """

    @staticmethod
    async def prepare_dynamic_tools(mcp_servers: list[MCPServer],
                                   convert_schemas_to_strict: bool = True,
                                   auto_connect: bool = True) -> list[Callable]:
        """
        Fetches tools from multiple MCP servers and prepares them for use with LiveKit agents.

        Args:
            mcp_servers: List of MCPServer instances
            convert_schemas_to_strict: Whether to convert JSON schemas to strict format
            auto_connect: Whether to automatically connect to servers if they're not connected

        Returns:
            List of decorated tool functions ready to be added to a LiveKit agent
        """
        prepared_tools = []
        allowlist = allowed_mcp_tools()

        # Ensure all servers are connected if auto_connect is True
        if auto_connect:
            for server in mcp_servers:
                if not getattr(server, 'connected', False):
                    with degraded(f"MCP server {server.name}", "connect"):
                        logger.debug(f"Auto-connecting to MCP server: {server.name}")
                        await server.connect()

        # Process each server
        for server in mcp_servers:
            logger.info(f"Fetching tools from MCP server: {server.name}")
            mcp_tools: list[FunctionTool] | None = None
            with degraded(f"MCP server {server.name}", "list tools"):
                mcp_tools = await MCPUtil.get_function_tools(
                    server, convert_schemas_to_strict=convert_schemas_to_strict
                )
                logger.info(f"Received {len(mcp_tools)} tools from {server.name}")
            if mcp_tools is None:
                continue

            # Only tools named in N8N_MCP_ALLOWED_TOOLS are exposed to the model.
            permitted = [t for t in mcp_tools if t.name in allowlist]
            withheld = sorted(t.name for t in mcp_tools if t.name not in allowlist)
            if withheld:
                logger.warning(
                    "Withholding %d unauthorised MCP tool(s) from %s: %s",
                    len(withheld), server.name, ", ".join(withheld),
                )

            # Process each tool from this server
            for tool_instance in permitted:
                with degraded(f"tool {tool_instance.name}", "prepare"):
                    decorated_tool = MCPToolsIntegration._create_decorated_tool(tool_instance)
                    prepared_tools.append(decorated_tool)
                    logger.debug(f"Successfully prepared tool: {tool_instance.name}")

        return prepared_tools

    @staticmethod
    def _create_decorated_tool(tool: FunctionTool) -> Callable:
        """
        Creates a decorated function for a single MCP tool that can be used with LiveKit agents.

        Args:
            tool: The FunctionTool instance to convert

        Returns:
            A decorated async function that can be added to a LiveKit agent's tools
        """
        # Get function_tool decorator from LiveKit
        # Import locally to avoid circular imports
        from livekit.agents.llm import function_tool

        # Create parameters list from JSON schema
        params = []
        annotations = {}
        schema_props = tool.params_json_schema.get("properties", {})
        schema_required = set(tool.params_json_schema.get("required", []))
        type_map = {
            "string": str, "integer": int, "number": float,
            "boolean": bool, "array": list, "object": dict,
        }

        # Build parameters from the schema properties
        for p_name, p_details in schema_props.items():
            json_type = p_details.get("type", "string")
            py_type = type_map.get(json_type, typing.Any)
            annotations[p_name] = py_type

            # Use inspect.Parameter.empty for required params, None otherwise
            default = inspect.Parameter.empty if p_name in schema_required else p_details.get("default", None)
            params.append(inspect.Parameter(
                name=p_name,
                kind=inspect.Parameter.KEYWORD_ONLY,
                annotation=py_type,
                default=default
            ))

        # Define the actual function that will be called by the agent
        async def tool_impl(**kwargs):
            input_json = json.dumps(kwargs)
            # Tool arguments are model-generated and tool results are
            # server-generated, so both are untrusted data that routinely carries
            # personal information: a guest's name, email address, phone number,
            # booking reference, or an n8n credential echoed back in an error.
            # Logging them verbatim would copy that data into stdout, into the
            # platform log sink and into every downstream log shipper. The names
            # and types of the arguments are what debugging a tool call needs;
            # the values are not.
            logger.info(
                "Invoking MCP tool '%s' with argument names: %s",
                tool.name,
                sorted(kwargs),
            )
            result_str = await tool.on_invoke_tool(None, input_json)
            logger.info(
                "MCP tool '%s' returned %d character(s)",
                tool.name,
                len(result_str) if isinstance(result_str, str) else -1,
            )
            return result_str

        # Set function metadata
        # LiveKit's function_tool decorator reads __signature__ to build the tool
        # schema; mypy does not model it on function objects.
        tool_impl.__signature__ = inspect.Signature(parameters=params)  # type: ignore[attr-defined]
        tool_impl.__name__ = tool.name
        tool_impl.__doc__ = tool.description
        tool_impl.__annotations__ = {'return': str, **annotations}

        # Apply the decorator and return
        return function_tool()(tool_impl)

    @staticmethod
    async def register_with_agent(agent, mcp_servers: list[MCPServer],
                                 convert_schemas_to_strict: bool = True,
                                 auto_connect: bool = True) -> list[Callable]:
        """
        Helper method to prepare and register MCP tools with a LiveKit agent.

        Args:
            agent: The LiveKit agent instance
            mcp_servers: List of MCPServer instances
            convert_schemas_to_strict: Whether to convert schemas to strict format
            auto_connect: Whether to auto-connect to servers

        Returns:
            List of tool functions that were registered
        """
        # Prepare the dynamic tools
        tools = await MCPToolsIntegration.prepare_dynamic_tools(
            mcp_servers,
            convert_schemas_to_strict=convert_schemas_to_strict,
            auto_connect=auto_connect
        )

        # Register with the agent
        if hasattr(agent, '_tools') and isinstance(agent._tools, list):
            agent._tools.extend(tools)
            logger.info(f"Registered {len(tools)} MCP tools with agent")

            # Log the names of registered tools
            if tools:
                tool_names = [getattr(t, '__name__', 'unknown') for t in tools]
                logger.info(f"Registered tool names: {tool_names}")
        else:
            logger.warning("Agent does not have a '_tools' attribute, tools were not registered")

        return tools

    @staticmethod
    async def create_agent_with_tools(agent_class, mcp_servers: list[MCPServer], agent_kwargs: dict | None = None,
                                    convert_schemas_to_strict: bool = True) -> Any:
        """
        Factory method to create and initialize an agent with MCP tools already loaded.

        Args:
            agent_class: Agent class to instantiate
            mcp_servers: List of MCP servers to register with the agent
            agent_kwargs: Additional keyword arguments to pass to the agent constructor
            convert_schemas_to_strict: Whether to convert JSON schemas to strict format

        Returns:
            An initialized agent instance with MCP tools registered
        """
        # Connect to MCP servers
        for server in mcp_servers:
            if not getattr(server, 'connected', False):
                with degraded(f"MCP server {server.name}", "connect"):
                    logger.debug(f"Connecting to MCP server: {server.name}")
                    await server.connect()

        # Create agent instance
        agent_kwargs = agent_kwargs or {}
        agent = agent_class(**agent_kwargs)

        # Prepare tools
        tools = await MCPToolsIntegration.prepare_dynamic_tools(
            mcp_servers,
            convert_schemas_to_strict=convert_schemas_to_strict,
            auto_connect=False  # Already connected above
        )

        # Register tools with agent
        if tools and hasattr(agent, '_tools') and isinstance(agent._tools, list):
            agent._tools.extend(tools)
            logger.info(f"Registered {len(tools)} MCP tools with agent")

            # Log the names of registered tools
            tool_names = [getattr(t, '__name__', 'unknown') for t in tools]
            logger.info(f"Registered tool names: {tool_names}")
        else:
            if not tools:
                logger.warning("No tools were found to register with the agent")
            else:
                logger.warning("Agent does not have a '_tools' attribute, tools were not registered")

        return agent
