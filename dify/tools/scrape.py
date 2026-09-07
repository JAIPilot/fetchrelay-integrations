from collections.abc import Generator
from typing import Any
from dify_plugin import Tool
from dify_plugin.entities.tool import ToolInvokeMessage
from client import call


class ScrapeTool(Tool):
    def _invoke(self, tool_parameters: dict[str, Any]) -> Generator[ToolInvokeMessage]:
        result = call(self.runtime.credentials.get("api_key"), "/scrape", {
            "url": tool_parameters["url"], "formats": ["markdown"],
            "mode": "auto", "onlyMainContent": True, "timeout": 25000,
        })
        markdown = result.get("data", {}).get("markdown")
        if not isinstance(markdown, str) or not markdown.strip():
            raise ValueError("No usable Markdown was extracted.")
        yield self.create_json_message(result)
        yield self.create_text_message(markdown)
