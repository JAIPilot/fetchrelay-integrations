import { readFile, writeFile, rename, unlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash, randomUUID } from 'node:crypto';
import { publicUrl, scrape } from './client.mjs';
export function snapshot(url, markdown, now = new Date().toISOString()) {
  if (typeof markdown !== 'string' || !markdown.trim())
    throw new Error('No usable Markdown; baseline preserved.');
  const content = markdown.replace(/\r\n/g, '\n').trim();
  return {
    version: 1,
    url: publicUrl(url),
    checkedAt: now,
    hash: createHash('sha256').update(content).digest('hex'),
    markdown: content,
  };
}
export function compare(previous, next) {
  if (!previous) return { status: 'baseline_created' };
  if (
    previous.version !== 1 ||
    previous.url !== next.url ||
    typeof previous.markdown !== 'string' ||
    previous.hash !== snapshot(previous.url, previous.markdown).hash
  )
    throw new Error(
      'Baseline is invalid or belongs to another URL. Use a separate state file.',
    );
  return {
    status: previous.hash === next.hash ? 'unchanged' : 'content_changed',
    previousCheckedAt: previous.checkedAt,
  };
}
export async function track(url, stateFile, extract = scrape) {
  url = publicUrl(url);
  const lock = stateFile + '.lock';
  const temporary = `${stateFile}.${randomUUID()}.tmp`;
  await writeFile(lock, '', { flag: 'wx' });
  try {
    let previous = null;
    try {
      previous = JSON.parse(await readFile(stateFile, 'utf8'));
    } catch (error) {
      if (error.code !== 'ENOENT')
        throw new Error('Cannot read baseline; it has not been replaced.');
    }
    // Validate before spending a credit.
    if (previous) compare(previous, { url });
    const data = await extract(url, {
      formats: ['markdown'],
      onlyMainContent: true,
    });
    const next = snapshot(url, data.markdown);
    const result = {
      ...compare(previous, next),
      url,
      checkedAt: next.checkedAt,
      hash: next.hash,
    };
    if (result.status === 'content_changed') {
      const before = new Set(previous.markdown.split('\n'));
      const after = new Set(next.markdown.split('\n'));
      result.removedLines = [...before].filter((line) => !after.has(line));
      result.addedLines = [...after].filter((line) => !before.has(line));
    }
    await writeFile(temporary, JSON.stringify(next, null, 2), {
      flag: 'wx',
      mode: 0o600,
    });
    await rename(temporary, stateFile);
    return result;
  } finally {
    await unlink(temporary).catch((error) => {
      if (error.code !== 'ENOENT') throw error;
    });
    await unlink(lock);
  }
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  try {
    if (!process.argv[2] || !process.argv[3])
      throw new Error('Usage: node pricing-tracker.mjs PUBLIC_URL STATE_FILE');
    console.log(
      JSON.stringify(
        await track(process.argv[2], resolve(process.argv[3])),
        null,
        2,
      ),
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
