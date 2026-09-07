from collections.abc import Generator
from typing import Any
from dify_plugin import Tool
from dify_plugin.entities.tool import ToolInvokeMessage
from client import call


class CrawlTool(Tool):
    def _invoke(self, tool_parameters: dict[str, Any]) -> Generator[ToolInvokeMessage]:
        result = call(self.runtime.credentials.get("api_key"), "/crawl", {
            "url": tool_parameters["url"], "formats": ["markdown"],
            "mode": "auto", "limit": 10, "maxDepth": 2, "async": True,
        })
        yield self.create_json_message(result)
