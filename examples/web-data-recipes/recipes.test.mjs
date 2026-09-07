import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { snapshot, compare, track } from './pricing-tracker.mjs';
import { exportDocs } from './docs-to-markdown.mjs';
import { productPrices } from './product-prices.mjs';
import { scrape, AccountError } from './client.mjs';
test('baseline, unchanged and changed content; reject a mismatched or corrupt baseline', () => {
  const a = snapshot('https://example.com/pricing', '# Plan\n$10');
  assert.equal(compare(null, a).status, 'baseline_created');
  assert.equal(
    compare(a, snapshot(a.url, '# Plan\r\n$10\n')).status,
    'unchanged',
  );
  assert.equal(
    compare(a, snapshot(a.url, '# Plan\n$20')).status,
    'content_changed',
  );
  assert.throws(() => compare(a, snapshot('https://example.org', '# Plan')));
  assert.throws(() => compare({ ...a, markdown: 'corrupt' }, a));
});
test('failed extraction preserves baseline; successful change reports removed and added lines', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'fr-tracker-'));
  try {
    const file = join(dir, 'test.state.json');
    await track('https://example.com', file, async () => ({ markdown: '$10' }));
    const baseline = await readFile(file, 'utf8');
    await assert.rejects(
      track('https://example.com', file, async () => {
        throw new Error('blocked');
      }),
    );
    assert.equal(await readFile(file, 'utf8'), baseline);
    const result = await track('https://example.com', file, async () => ({
      markdown: '$20',
    }));
    assert.deepEqual(result.removedLines, ['$10']);
    assert.deepEqual(result.addedLines, ['$20']);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
test('docs export deduplicates and records partial failures without pretending completion', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'fr-docs-'));
  try {
    const target = join(dir, 'export');
    await assert.rejects(
      exportDocs(
        ['https://example.com', 'https://example.com', 'https://example.org'],
        target,
        async (url) => ({ markdown: url.includes('.org') ? '' : '# Example' }),
      ),
    );
    const rows = JSON.parse(await readFile(join(target, 'manifest.json')));
    assert.equal(rows.length, 2);
    assert.equal(rows[0].success, true);
    assert.equal(rows[1].success, false);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
test('product results retain missing prices as failures and stop on account errors', async () => {
  const rows = await productPrices(['https://example.com'], async () => ({
    extract: { title: 'Book', price: '' },
  }));
  assert.equal(rows[0].success, false);
  let calls = 0;
  await productPrices(
    ['https://example.com', 'https://example.org'],
    async () => {
      calls++;
      throw new AccountError('No credits');
    },
  );
  assert.equal(calls, 1);
});
test('API adapter keeps credentials on fixed origin, rejects warnings and never follows redirects', async () => {
  process.env.FETCHRELAY_API_KEY = 'fr_test';
  await assert.rejects(
    scrape('https://example.com', {}, async (url, init) => {
      assert.equal(url, 'https://fetchrelay.com/api/scrape');
      assert.equal(init.redirect, 'error');
      return Response.json({
        success: true,
        data: { markdown: '# Partial' },
        diagnostics: { warnings: ['partial'] },
      });
    }),
    /warnings/,
  );
  await assert.rejects(
    scrape(
      'https://example.com',
      {},
      async () => new Response('', { status: 429 }),
    ),
    AccountError,
  );
});
