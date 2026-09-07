import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
export function requestFor(command, input) {
  if (command === 'status') {
    if (
      !/^[a-f\d]{8}-[a-f\d]{4}-[1-5][a-f\d]{3}-[89ab][a-f\d]{3}-[a-f\d]{12}$/i.test(
        input || '',
      )
    )
      throw new Error('Use the crawl job UUID returned by the API.');
    return { path: `/crawl/${input}`, method: 'GET' };
  }
  if (!['scrape', 'crawl'].includes(command))
    throw new Error(
      'Usage: fetchrelay.mjs scrape|crawl PUBLIC_URL, or status JOB_UUID',
    );
  let url;
  try {
    url = new URL(input);
  } catch {
    throw new Error('Use a complete public HTTP(S) URL.');
  }
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password
  )
    throw new Error('Use HTTP(S) without embedded credentials.');
  return {
    path: `/${command}`,
    method: 'POST',
    body: {
      url: url.href,
      formats: ['markdown'],
      mode: 'http',
      onlyMainContent: true,
      timeout: 25000,
      ...(command === 'crawl'
        ? { async: true, limit: 5, maxDepth: 1, sitemap: 'skip' }
        : {}),
    },
  };
}
export async function run(
  command,
  input,
  { key = process.env.FETCHRELAY_API_KEY, request = fetch } = {},
) {
  const spec = requestFor(command, input);
  if (!key || !/^fr_[A-Za-z0-9]+$/.test(key))
    throw new Error('Set FETCHRELAY_API_KEY in your environment.');
  let response;
  try {
    response = await request(`https://fetchrelay.com/api${spec.path}`, {
      method: spec.method,
      redirect: 'error',
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      ...(spec.body ? { body: JSON.stringify(spec.body) } : {}),
      signal: AbortSignal.timeout(40000),
    });
  } catch {
    throw new Error(
      'Request failed or timed out. Check usage or job status before retrying.',
    );
  }
  if (!response.ok)
    throw new Error(
      `FetchRelay returned HTTP ${response.status}. Check the key, allowance, rate limit or target page.`,
    );
  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error('FetchRelay returned an invalid response.');
  }
  if (result.success !== true)
    throw new Error('The API did not return a successful result.');
  if (
    command === 'scrape' &&
    (typeof result.data?.markdown !== 'string' || !result.data.markdown.trim())
  )
    throw new Error('No usable Markdown returned.');
  return result;
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  try {
    console.log(
      JSON.stringify(await run(process.argv[2], process.argv[3]), null, 2),
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
