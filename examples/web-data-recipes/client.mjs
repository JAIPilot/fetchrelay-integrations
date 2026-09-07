export function publicUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('Use a complete HTTP(S) URL.');
  }
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password
  )
    throw new Error('Use HTTP(S) without embedded credentials.');
  url.hash = '';
  return url.href;
}
export class AccountError extends Error {}
export async function scrape(url, options = {}, request = fetch) {
  const key = process.env.FETCHRELAY_API_KEY;
  if (!key)
    throw new AccountError('Set FETCHRELAY_API_KEY in your environment.');
  let response;
  try {
    response = await request('https://fetchrelay.com/api/scrape', {
      method: 'POST',
      redirect: 'error',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        ...(process.env.FETCHRELAY_QA === '1'
          ? { 'x-fetchrelay-qa': '1' }
          : {}),
      },
      body: JSON.stringify({
        ...options,
        url: publicUrl(url),
        mode: 'http',
        timeout: 25000,
        maxAge: 0,
      }),
      signal: AbortSignal.timeout(40000),
    });
  } catch {
    throw new Error(
      'Request failed or timed out. Check usage before retrying.',
    );
  }
  if ([401, 402, 403, 429].includes(response.status))
    throw new AccountError(
      `HTTP ${response.status}: check your key, allowance, or rate limit. No automatic retry.`,
    );
  let body;
  try {
    body = await response.json();
  } catch {
    throw new Error('Invalid API response.');
  }
  if (!response.ok || body.success !== true)
    throw new Error(`Extraction failed (HTTP ${response.status}).`);
  if (body.diagnostics?.warnings?.length)
    throw new Error(
      'Extraction returned warnings. Review it in FetchRelay before using this result.',
    );
  if (!body.data) throw new Error('Extraction returned no data.');
  return body.data;
}
