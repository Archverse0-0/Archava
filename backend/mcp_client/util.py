import json
from typing import Any

from degradation import tool_boundary_error


# A minimal FunctionTool class used by the agent.
class FunctionTool:
    def __init__(self, name: str, description: str, params_json_schema: dict[str, Any], on_invoke_tool, strict_json_schema: bool = False):
        self.name = name
        self.description = description
        self.params_json_schema = params_json_schema
        self.on_invoke_tool = on_invoke_tool  # This should be an async function.
        self.strict_json_schema = strict_json_schema

    def __repr__(self):
        return f"FunctionTool(name={self.name})"

class MCPUtil:
    @classmethod
    async def get_function_tools(cls, server, convert_schemas_to_strict: bool) -> list[FunctionTool]:
        tools = await server.list_tools()
        function_tools = []
        for tool in tools:
            ft = cls.to_function_tool(tool, server, convert_schemas_to_strict)
            function_tools.append(ft)
        return function_tools

    @classmethod
    def to_function_tool(cls, tool, server, convert_schemas_to_strict: bool) -> FunctionTool:
        # In a more complete implementation, you might convert the JSON schema into a strict version.
        schema = tool.inputSchema

        # Use a default argument to capture the current tool correctly in the closure
        async def invoke_tool(context: Any, input_json: str, current_tool_name=tool.name) -> str:
            try:
                arguments = json.loads(input_json) if input_json else {}
            except json.JSONDecodeError as exc:
                # Malformed model output is not a remote failure; report it verbatim.
                return f"Error parsing input JSON for tool '{current_tool_name}': {exc}"

            # Everything below talks to the remote MCP server. A failure here is a
            # tool boundary, not a session crash: format it for the model instead.
            try:
                result = await server.call_tool(current_tool_name, arguments)
                return _result_to_text(result)
            except Exception as exc:  # noqa: BLE001 - remote MCP tool boundary; see degradation.py
                return tool_boundary_error(f"Error calling tool '{current_tool_name}'", exc)

        return FunctionTool(
            name=tool.name,
            description=tool.description,
            params_json_schema=schema,
            on_invoke_tool=invoke_tool,
            strict_json_schema=convert_schemas_to_strict,
        )


def _result_to_text(result: Any) -> str:
    """Render an MCP tool result as the string the LLM tool interface expects.

    MCP returns ``{"content": [...]}`` where each item is a typed content block.
    The transport hands back either that raw mapping or an ``mcp.types``
    ``CallToolResult`` model exposing ``.content``, so both shapes are handled.
    Single scalar items become plain text; anything structured becomes JSON so no
    information is lost, with ``str()`` as the last resort for non-serialisable
    payloads.
    """
    if isinstance(result, dict):
        content = result.get("content")
    else:
        content = getattr(result, "content", None)

    if isinstance(content, list) and content:
        if len(content) == 1:
            return _dump(content[0])
        return _dump(content)
    return _dump(result)


def _dump(value: Any) -> str:
    """JSON-encode ``value``, falling back to ``str`` when it is not serialisable.

    Scalars are stringified directly (matching what the model expects from a
    text tool result) rather than JSON-quoted.
    """
    if isinstance(value, (str, int, float, bool)):
        return str(value)
    try:
        return json.dumps(value)
    except (TypeError, ValueError):
        return str(value)
