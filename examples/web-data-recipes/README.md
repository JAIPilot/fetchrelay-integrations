# Web data recipes by FetchRelay

Three small Node.js programs for collecting documentation, extracting catalog prices, and checking pricing-page changes. They call the hosted FetchRelay API. No SDK dependency, browser install, Google Drive connection, or automatic schedule is required.

## Start here

1. Install Node.js 22 or later.
2. Create a [FetchRelay API key](https://fetchrelay.com/account?utm_source=github&utm_medium=referral&utm_campaign=web-data-recipes).
3. Clone this repository and enter `examples/web-data-recipes`.
4. Set `FETCHRELAY_API_KEY` in your shell environment or local secret manager. Never commit the key or paste it into a public issue. The programs read the environment; they do not automatically load `.env` files.

```sh
git clone https://github.com/JAIPilot/fetchrelay-integrations.git
cd fetchrelay-integrations/examples/web-data-recipes
node --test recipes.test.mjs
```

Successful extracted pages consume your FetchRelay allowance; these examples disable cached reads. Start with the supplied fixtures, then inspect one representative page of your own. Each request has a 25-second server deadline and a 40-second client timeout. A timeout can happen after work completed: check usage before rerunning. There are no automatic retries. Account, allowance and rate errors stop multi-page processing. Public-page restrictions and SSRF protection are enforced by FetchRelay; login walls, CAPTCHA challenges and blocked sites may remain inaccessible.

## Export documentation to Markdown

```sh
node docs-to-markdown.mjs docs-urls.json exports-first-run
```

Edit `docs-urls.json` with 1–10 explicit public documentation URLs. The script deduplicates them, writes numbered Markdown files into a **new** directory, and creates `manifest.json` mapping files to source URLs and timestamps. It does not crawl an entire website or follow links automatically. Warnings and empty content are failures; a partial export exits nonzero and keeps its manifest. After an account error, remaining URLs are not attempted. Review headings, code blocks, and source links before using the files as retrieval material.

[Full documentation tutorial](https://fetchrelay.com/guides/documentation-to-markdown)

## Extract product prices from a URL list

```sh
node product-prices.mjs product-urls.json > prices.json
```

The included selectors target the public Books to Scrape practice catalog: `h1`, `.price_color`, and `.availability`. They are **site-specific**. Successful rows contain `priceText`, `currency`, title, source, availability and collection time. Missing or unexpected prices produce failed rows, never a zero price. An account error stops the batch; a failed row makes the CLI exit nonzero. Output is JSON so spreadsheet formula execution is avoided. For another store, change the selectors and currency validation together and verify tax, shipping, variant and subscription semantics.

[Full product-price tutorial](https://fetchrelay.com/guides/extract-product-prices)

## Detect pricing-page changes

```sh
node pricing-tracker.mjs https://fetchrelay.com/pricing pricing.state.json
node pricing-tracker.mjs https://fetchrelay.com/pricing pricing.state.json
```

The first run reports `baseline_created`; the next reports `unchanged` or `content_changed`. A changed result includes added and removed lines, and the successful snapshot becomes the next baseline. Each successful invocation consumes a credit. Keep stdout if you want a change history; the state file holds only the most recent successful snapshot. The comparison ignores line-ending differences and surrounding whitespace. It is a set-based line comparison, not a full ordered diff.

A content change is a review signal, **not proof of a price increase**. Dates, navigation, experiments and currency localization can change page text. Check the original pricing page and record billing period, currency and plan details before making a claim. A failed, empty or warning-bearing extraction preserves the prior baseline. A lock prevents simultaneous writers. If the process is forcibly killed, remove its `.lock` only after confirming no run is active. Keep state files local and outside version control; don't share snapshots of private data.

Run manually first. If you later schedule it, store your key in the scheduler's secret manager, retain the state file between runs, and prevent overlapping runs. This example sends no emails or webhooks and creates no hosted monitors.

[Full pricing-change tutorial](https://fetchrelay.com/guides/track-pricing-page-changes)

## Verification and support

`node --test recipes.test.mjs` verifies comparison behavior, preserved baselines after failures, partial exports, missing prices, account-error stopping and response warning handling. Synthetic $10/$20 test fixtures demonstrate the diff; they are not observed competitor price changes. See the tutorials for live-fixture verification.

Questions: [open an issue](https://github.com/JAIPilot/fetchrelay-integrations/issues) with the command, runtime version and sanitized error. Do not include API keys, state files or private URLs. MIT license; see the repository LICENSE.
