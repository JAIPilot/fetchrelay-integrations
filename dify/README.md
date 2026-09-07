# FetchRelay for Dify

Extract a public webpage into Markdown, or start a small crawl and retrieve its status. Your FetchRelay key is stored as a Dify secret credential. Validation checks your account without spending extraction credits.

## Install and connect

Install the supplied `.difypkg` using Dify's local-plugin installation flow, subject to your workspace's plugin policy, or install from Marketplace when the listing is approved. Add your API key without the Bearer prefix. Do not disable workspace verification policies just to install this package.

## Website knowledge workflow

Create a Workflow with a Start input named `url`. Add FetchRelay **Scrape**, map Start's URL into it, and connect the tool's text output to an End output named `markdown`. Run with `https://example.com`; expect an Example Domain heading. Inspect the JSON output for diagnostics and warnings before sending content to a knowledge store. This minimal workflow requires no model provider or model spend.

For crawling, **Crawl** creates an asynchronous job with at most ten pages and depth two. Store `data.id`, then call **Crawl Status** with that job ID. Poll with a delay in your workflow; do not invoke Crawl again to check status. Partial and failed results must be inspected. The plugin does not automatically schedule refreshes or ingest into a knowledge base.

## Limits

Blocked pages, invalid credentials, exhausted allowance, and connection failures raise errors. Successful pages consume FetchRelay credits. The JSON result retains warnings; the text output is untrusted website content. Keep warnings in your workflow's review path before relying on extracted data.

## Development

Use Python 3.12. Install `requirements.txt`, then use the official Dify CLI: `dify plugin package .`. Remote debugging requires a Dify workspace debug key. No debug key or API key is included in this repository.

See [PRIVACY.md](PRIVACY.md) for data handling.

Source: https://github.com/JAIPilot/fetchrelay-integrations/tree/main/dify

## Validation status

The package, SDK schema loading, credential validation, and a live Example Domain scrape have been verified. Unit tests cover credential and tool error handling. Installation and workflow execution in Dify Cloud and self-hosted Dify have not yet been verified.

Support: open an issue at https://github.com/JAIPilot/fetchrelay-integrations/issues.
