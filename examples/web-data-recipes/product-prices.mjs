import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { publicUrl, scrape, AccountError } from './client.mjs';
export async function productPrices(urls, extract = scrape) {
  if (!Array.isArray(urls) || urls.length < 1 || urls.length > 10)
    throw new Error('Choose 1–10 product URLs.');
  const rows = [];
  for (const url of new Set(urls.map(publicUrl))) {
    try {
      const data = await extract(url, {
        formats: ['text'],
        extract: {
          title: 'h1',
          price: '.price_color',
          availability: '.availability',
        },
      });
      const fields = data.extract;
      if (
        !fields ||
        typeof fields.title !== 'string' ||
        !fields.title.trim() ||
        typeof fields.price !== 'string' ||
        !/^£\d+\.\d{2}$/.test(fields.price.trim())
      )
        throw new Error(
          'Expected Books to Scrape fields missing. Adapt selectors for another site.',
        );
      rows.push({
        url,
        success: true,
        title: fields.title.trim(),
        priceText: fields.price.trim(),
        currency: 'GBP',
        availability: fields.availability,
        collectedAt: new Date().toISOString(),
      });
    } catch (error) {
      rows.push({ url, success: false, error: error.message });
      if (error instanceof AccountError) break;
    }
  }
  return rows;
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  try {
    if (!process.argv[2])
      throw new Error('Usage: node product-prices.mjs urls.json');
    const rows = await productPrices(
      JSON.parse(await readFile(process.argv[2], 'utf8')),
    );
    console.log(JSON.stringify(rows, null, 2));
    if (rows.some((row) => !row.success)) process.exitCode = 1;
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
