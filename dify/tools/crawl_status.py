from collections.abc import Generator
from typing import Any
from uuid import UUID
from dify_plugin import Tool
from dify_plugin.entities.tool import ToolInvokeMessage
from client import call


class CrawlStatusTool(Tool):
    def _invoke(self, tool_parameters: dict[str, Any]) -> Generator[ToolInvokeMessage]:
        try:
            job_id = str(UUID(str(tool_parameters["job_id"])))
        except (ValueError, KeyError):
            raise ValueError("Enter the valid job ID returned by Crawl.") from None
        yield self.create_json_message(call(self.runtime.credentials.get("api_key"), "/crawl/" + job_id))
