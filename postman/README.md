# FetchRelay for Postman

Import `fetchrelay.postman_collection.json` and the blank environment file into Postman. Create a FetchRelay key at https://fetchrelay.com/account, set `fetchrelay_api_key` in a private environment, and select that environment. Keep shared values empty. Secret masking alone does not make a shared environment private.

Send the requests individually:

1. **Extract a public page:** retrieves Example Domain as Markdown and checks for usable content and no warnings.
2. **Start a crawl:** creates a new asynchronous job bounded to one page, depth zero. Its test script saves `data.id` to the local collection variable `crawl_id` and clears stale IDs before starting.
3. **Check the existing job:** uses `crawl_id`. Repeat only this status request with a delay while a job is pending. Do not rerun request 2 to poll.

Successful pages consume FetchRelay credits. A completed API request is not necessarily a completed crawl: inspect the job state and per-page outcomes. The collection has no automatic schedule, retries, emails, webhooks or Google Drive connection. API redirects are disabled. Stop and check usage after timeouts.

The starter defaults can cost up to two extraction credits when run as a whole (one scrape and one one-page crawl). Start with individual requests. Limits and endpoint options are documented at https://fetchrelay.com/docs/api; the OpenAPI contract is https://fetchrelay.com/api/openapi.

The saved response example is illustrative and contains no real job IDs or credentials. Before exporting a collection after testing, clear `crawl_id` and never export a populated environment or private API response. Use the pristine files here for public sharing.

Postman API Network publication requires a public workspace under the owner's account. The downloadable collection can be imported independently of that listing. See https://learning.postman.com/docs/postman-api-network/showcase/publish/public-apis for publication.
