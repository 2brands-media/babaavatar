// Developed by 2Brands Media GmbH
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const { createServer } = require('node:http');
const { createHash } = require('node:crypto');
const { mkdtemp, readFile, rm } = require('node:fs/promises');
const { join } = require('node:path');
const { tmpdir } = require('node:os');
const test = require('node:test');
const builderRequire = createRequire(require.resolve('electron-builder/package.json'));
const { download } = builderRequire('app-builder-lib/out/binDownload');
test('real builder verifies maintained downloader checksums', async () => {
  const temp = await mkdtemp(join(tmpdir(), 'babaavatar-builder-test-'));
  const previousCache = process.env.ELECTRON_BUILDER_CACHE;
  process.env.ELECTRON_BUILDER_CACHE = temp;
  const bytes = Buffer.from('isolated non-executable download fixture');
  const checksum = createHash('sha256').update(bytes).digest('hex');
  const server = createServer((_request, response) => response.end(bytes));
  try {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const url = `http://127.0.0.1:${server.address().port}/fixture.bin`;
    const output = join(temp, 'correct.bin');
    await download(url, output, checksum);
    assert.deepEqual(await readFile(output), bytes);
    await assert.rejects(download(url + '?tampered=1', join(temp, 'invalid.bin'), '0'.repeat(64)));
  } finally {
    await new Promise(resolve => server.close(resolve));
    if (previousCache === undefined) delete process.env.ELECTRON_BUILDER_CACHE;
    else process.env.ELECTRON_BUILDER_CACHE = previousCache;
    await rm(temp, { recursive: true, force: true });
  }
});
