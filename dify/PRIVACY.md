# FetchRelay plugin data handling

The plugin sends your requested public webpage URL and extraction options to https://fetchrelay.com. Your FetchRelay key is stored as a Dify secret credential and sent only to that fixed API origin in the Authorization header. Redirects are not followed. Credential validation calls Account without extracting a page or spending extraction credits.

Extracted content and metadata return to your Dify workflow. Dify handles its own credential storage and workflow retention. FetchRelay handles account, usage, and saved crawl data as described at https://fetchrelay.com/privacy. Do not enter private URLs, login credentials, or sensitive content. Treat fetched text as untrusted data when using it with a model.
