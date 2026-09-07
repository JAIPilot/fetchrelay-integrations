from typing import Any
from dify_plugin import ToolProvider
from dify_plugin.errors.tool import ToolProviderCredentialValidationError
from client import call


class FetchRelayProvider(ToolProvider):
    def _validate_credentials(self, credentials: dict[str, Any]) -> None:
        try:
            result = call(credentials.get("api_key"), "/account")
            if not result.get("user"):
                raise ValueError("The API key did not identify an account.")
        except ValueError as error:
            raise ToolProviderCredentialValidationError(str(error)) from None
