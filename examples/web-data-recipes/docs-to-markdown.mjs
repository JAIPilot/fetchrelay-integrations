import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { publicUrl, scrape, AccountError } from './client.mjs';
export async function exportDocs(urls, directory, extract = scrape) {
  if (!Array.isArray(urls) || urls.length < 1 || urls.length > 10)
    throw new Error('Choose 1–10 documentation URLs.');
  const targets = [...new Set(urls.map(publicUrl))];
  // A new folder prevents old exports being mistaken for this run's output.
  await mkdir(directory, { recursive: false });
  const manifest = [];
  for (const [index, url] of targets.entries()) {
    try {
      const data = await extract(url, {
        formats: ['markdown'],
        onlyMainContent: true,
      });
      if (typeof data.markdown !== 'string' || !data.markdown.trim())
        throw new Error('No usable Markdown.');
      const file = `${String(index + 1).padStart(2, '0')}.md`;
      await writeFile(join(directory, file), data.markdown, { flag: 'wx' });
      manifest.push({
        url,
        file,
        success: true,
        collectedAt: new Date().toISOString(),
      });
    } catch (error) {
      manifest.push({ url, success: false, error: error.message });
      if (error instanceof AccountError) break;
    }
  }
  await writeFile(
    join(directory, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
    { flag: 'wx' },
  );
  if (manifest.some((row) => !row.success))
    throw new Error(
      'Export incomplete; inspect manifest.json. Remaining URLs may not have been attempted.',
    );
  return manifest;
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  try {
    if (!process.argv[2] || !process.argv[3])
      throw new Error(
        'Usage: node docs-to-markdown.mjs urls.json NEW_OUTPUT_DIRECTORY',
      );
    const rows = await exportDocs(
      JSON.parse(await readFile(process.argv[2], 'utf8')),
      resolve(process.argv[3]),
    );
    console.log(`Exported ${rows.length} pages with a source manifest.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
