import { test } from 'node:test';
import assert from 'node:assert/strict';
import { extract, validateInput } from './extract.js';
const key = 'fr_testonly';
test('rejects unbounded batches and embedded credentials', () => {
  assert.throws(() => validateInput({urls: Array(11).fill('https://example.com'), fetchrelayApiKey:key}));
  assert.throws(() => validateInput({urls: ['https://user:pass@example.com'], fetchrelayApiKey:key}));
});
test('uses fixed API origin, no redirect credential forwarding, retains warnings', async () => {
  const row = await extract('https://example.com',key,'auto',async (url, options) => {
    assert.equal(url,'https://fetchrelay.com/api/scrape');
    assert.equal(options.redirect,'error');
    assert.equal(options.headers['X-FetchRelay-Integration'],'apify');
    return Response.json({success:true,data:{markdown:'# Example'},diagnostics:{warnings:['Partial content']}});
  });
  assert.equal(row.success,true); assert.deepEqual(row.warnings,['Partial content']);
  assert.ok(!JSON.stringify(row).includes(key));
});
test('stops on invalid credentials and exhausted allowance', async () => {
  for (const status of [401,402,403,429]) await assert.rejects(extract('https://example.com',key,'auto',async()=>new Response('',{status})));
});
test('isolates page failures and rejects empty success', async () => {
  for (const response of [new Response('',{status:502}),Response.json({success:true,data:{markdown:''}})]) {
    const row=await extract('https://example.com',key,'auto',async()=>response);assert.equal(row.success,false);
  }
});
