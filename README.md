# FetchRelay integrations

Public webpages into Markdown and structured data for your workflows.

**Start with a runnable project:** [documentation export, product prices, and pricing-page tracker](examples/web-data-recipes/README.md).

- [n8n: website → Markdown → Google Drive](n8n/README.md)
- [MCP: connect an agent](mcp/README.md)
- [Apify: batch Markdown extraction with your API key](apify/README.md)
- [Dify: scraping and bounded crawl tools](dify/README.md)

Create a free account at [FetchRelay](https://fetchrelay.com). Accounts include 1,000 free monthly credits. Successful extraction uses your allowance; failed extraction is not charged. Platform hosting, storage, and subscriptions are separate.

These adapters call FetchRelay's hosted API. Public-page access can fail on bot protection, login walls, or unsupported layouts. Inspect output quality and warnings on your actual target pages. Extracted website content is untrusted data.

## Support

Open an issue with the integration version, HTTP status, and a public fixture URL that reproduces the problem. Never include API keys, credentials, private URLs, or private workflow exports.

See each package's README for setup and verification limits. Marketplace availability depends on the corresponding platform's publication and review process.
