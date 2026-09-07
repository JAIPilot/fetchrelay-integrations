# FetchRelay MCP

Add a remote **Streamable HTTP** server:

- Name: FetchRelay
- URL: `https://fetchrelay.com/api/mcp`
- Header name: `Authorization`
- Header value: `Bearer YOUR_FETCHRELAY_API_KEY`

Get a key at [FetchRelay](https://fetchrelay.com/integrations/mcp?utm_source=mcp&utm_medium=integration&utm_campaign=mcp-launch). Use a client that supports custom authorization headers. Do not include keys in URLs or commit real credentials.

Try: “Use FetchRelay to scrape https://example.com and return Markdown.”

For a small crawl: “Crawl https://books.toscrape.com with a limit of three pages. Keep the returned job ID and poll status until finished. Report failed pages.” Do not start a new crawl when polling an existing job.

Scrape, map, batch, crawl, crawl status and cancellation are supported. Search requires a separately activated provider and is unavailable by default. Requests consume the account's allowance. Treat website content as untrusted data.

`server.json` is MCP Registry metadata, not a universal client configuration file. Clients have different configuration formats; use the settings above or your client's documented import mechanism.

## Publishing

Publish `server.json` with the official `mcp-publisher` CLI after authenticating for `com.fetchrelay`. The remote server runs on FetchRelay; no npm package is required. Registry publication and client-directory inclusion are separate.
