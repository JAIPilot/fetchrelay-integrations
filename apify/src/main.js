import { Actor } from 'apify';
import { extract, validateInput } from './extract.js';
await Actor.main(async () => {
  const { urls, key, mode } = validateInput(await Actor.getInput());
  let succeeded = 0;
  for (const url of urls) {
    const row = await extract(url, key, mode);
    await Actor.pushData(row);
    if (row.success) succeeded++;
  }
  await Actor.setValue('OUTPUT', { total: urls.length, succeeded, failed: urls.length - succeeded });
  if (!succeeded) throw new Error('No pages were extracted. See the dataset for per-page outcomes.');
});
