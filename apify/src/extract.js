const API = 'https://fetchrelay.com/api/scrape';
export function validateInput(input) {
  if (!input || !Array.isArray(input.urls) || input.urls.length < 1 || input.urls.length > 10)
    throw new Error('Provide between 1 and 10 public URLs.');
  if (typeof input.fetchrelayApiKey !== 'string' || !/^fr_[a-zA-Z0-9]+$/.test(input.fetchrelayApiKey))
    throw new Error('Provide your FetchRelay API key without the Bearer prefix.');
  const mode = input.mode ?? 'auto';
  if (!['auto', 'http', 'browser'].includes(mode)) throw new Error('Invalid rendering mode.');
  const urls = [...new Set(input.urls.map(value => {
    let url;
    try { url = new URL(value); } catch { throw new Error('Each URL must be a valid public HTTP(S) URL.'); }
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password)
      throw new Error('Only HTTP(S) URLs without embedded credentials are supported.');
    return url.href;
  }))];
  return { urls, mode, key: input.fetchrelayApiKey };
}
export async function extract(url, key, mode, request = fetch) {
  let response;
  try {
    response = await request(API, {
      method: 'POST', redirect: 'error',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'X-FetchRelay-Integration': 'apify' },
      body: JSON.stringify({ url, formats: ['markdown'], mode, onlyMainContent: true, timeout: 25000 }),
      signal: AbortSignal.timeout(40000),
    });
  } catch {
    return { url, success: false, error: 'FetchRelay could not be reached or timed out. Check usage before retrying.', warnings: [] };
  }
  if ([401, 403, 402, 429].includes(response.status))
    throw new Error(`FetchRelay returned HTTP ${response.status}. Check your key, allowance, or rate limit before retrying.`);
  let result;
  try { result = await response.json(); } catch { return { url, success: false, error: 'FetchRelay returned an invalid response.', warnings: [] }; }
  if (!response.ok || result.success !== true || typeof result.data?.markdown !== 'string' || !result.data.markdown.trim())
    return { url, success: false, error: `No usable Markdown returned (HTTP ${response.status}). Inspect the target page in FetchRelay.`, warnings: [] };
  return { url, success: true, markdown: result.data.markdown, metadata: result.data.metadata, warnings: result.diagnostics?.warnings ?? [] };
}
