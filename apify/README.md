# Website to Markdown by FetchRelay

Extract 1–10 public webpages into an Apify dataset using your own FetchRelay API key. This Actor calls the hosted FetchRelay API; it does not run a second scraping engine.

## Input

- `urls`: one to ten HTTP(S) URLs. Duplicate URLs are processed once.
- `fetchrelayApiKey`: your key, without `Bearer`. The input is marked secret.
- `mode`: `auto` (default), `http`, or `browser`.

Create a key at [FetchRelay](https://fetchrelay.com/integrations/n8n?utm_source=apify&utm_medium=integration&utm_campaign=apify-launch). Start with `https://example.com`.

## Output

Each dataset row contains `url`, `success`, and either `markdown`, `metadata`, `warnings`, or a safe `error` description. Review warnings and compare content to the source. Failed pages stay visible in the dataset. If every page fails, the Actor run fails. Account, allowance, and rate-limit errors stop the run; already-written rows are retained.

The `OUTPUT` record summarizes completed processing. No automatic retries are made. A network timeout can happen after FetchRelay completed a request, so check your usage before rerunning.

## Costs and data handling

You need both Apify and FetchRelay accounts. Apify platform usage is billed by Apify; successful pages consume your FetchRelay credits. There is no additional Actor rental fee in this initial distribution. Your key is sent only to `https://fetchrelay.com`, and redirects are not followed. URLs and results pass through both platforms. Never share input exports containing real credentials. FetchRelay's [privacy policy](https://fetchrelay.com/privacy) applies to its service; Apify controls Actor inputs and datasets.

## Development

Node 22 or newer. Run `npm ci`, `npm test`, then `npm start` with an Apify local input record or deploy through Apify's Git repository source using this subdirectory. The Docker image builds with `npm ci` using the committed lockfile.
