// Tests of the Paddle checkout (run: npm test). No network for the Worker: peak-pay is a fake fetch.
// 1. lib/pro.js takes a Paddle Pro key: checked with the Worker (POST /v1/status, our Origin), kept in lower case, cached like a
//    Gumroad key; 404/409/410 are a no; a network error, a 5xx or a 429 keeps a key verified before and never unlocks a new one.
// 2. /activate-pro takes a Paddle key like a Gumroad key and keeps it in the gim_lic cookie.
// 3. The switch (lib/paddle.js): off, no page mentions peak-pay or paddle beyond the resellers sentence of the legal pages and the
//    pricing section, and no policy header is sent; on (GIM_PADDLE=1, tests only), the pages load gim-pay.js, the Activate Pro page
//    offers the e-mail box above the key box, and the words next to the Get Pro button name Paddle.com as the seller of record.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const net = require('node:net');
const path = require('node:path');
const { spawn } = require('node:child_process');
const express = require('express');
const cookieParser = require('cookie-parser');
const paddle = require('../lib/paddle');
const pro = require('../lib/pro');

const T = pro._test;
const ROOT = path.join(__dirname, '..');
const KEY = 'pp-s-' + 'a1b2c3d4e5f6g7h8i9j0k1l2m3' + '-' + '0123456789abcdef01234567';
const keyN = n => 'pp-s-' + String(n).padStart(26, 'k') + '-' + '0123456789abcdef01234567';
const realFetch = globalThis.fetch;
const calls = [];
let answer = () => ({ status: 200, body: { ok: true, plan: 'monthly' } });

// The Worker (and Gumroad) answer from `answer`; every other address (a server under test) is the real fetch.
globalThis.fetch = async (url, init = {}) => {
  const u = String(url);
  if (u.startsWith(paddle.WORKER) || u.startsWith('https://api.gumroad.com/')) {
    calls.push({ url: u, init });
    const a = answer(u, init);
    if (a === 'throw') throw new TypeError('fetch failed');
    return new Response(JSON.stringify(a.body || {}), { status: a.status, headers: { 'Content-Type': 'application/json' } });
  }
  return realFetch(url, init);
};
test.after(() => { globalThis.fetch = realFetch; });

const freePort = () => new Promise((resolve, reject) => {
  const s = net.createServer();
  s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => resolve(port)); });
  s.on('error', reject);
});
// server.js on a free port, with the given environment; resolves { base, stop }.
async function startServer(env) {
  const port = await freePort();
  const child = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(port), VERCEL_ENV: '', GIM_PADDLE: '', ...env }, stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('server did not start')), 20000);
    child.stdout.on('data', d => { if (String(d).includes('running on')) { clearTimeout(t); resolve(); } });
    child.on('exit', c => reject(new Error('server exited ' + c)));
  });
  return { base: 'http://127.0.0.1:' + port, stop: () => child.kill() };
}
const pageOf = base => async (p, headers) => { const r = await realFetch(base + p, { redirect: 'manual', headers }); return { status: r.status, body: await r.text(), headers: r.headers }; };

// -- 1. lib/pro.js ---------------------------------------------------------------------------------------------------------------
test('a Paddle key is checked with peak-pay, with our Origin, as the invoicemaker product, and kept in lower case', async () => {
  calls.length = 0;
  answer = () => ({ status: 200, body: { ok: true, plan: 'monthly' } });
  assert.equal(T.cleanKey(KEY.toUpperCase()), KEY);
  assert.deepEqual(await T.verifyKey(KEY), { ok: true });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, paddle.WORKER + '/v1/status');
  assert.equal(calls[0].init.method, 'POST');
  assert.equal(calls[0].init.headers.Origin, 'https://getinvoicemaker.com');
  assert.deepEqual(JSON.parse(calls[0].init.body), { key: KEY, product: 'invoicemaker' });
  // a page request: cached after the first answer, like a Gumroad key
  const req = () => ({ cookies: { gim_lic: KEY } });
  assert.equal(await pro.isProRequest(req()), true);
  const n = calls.length;
  assert.equal(await pro.isProRequest(req()), true);
  assert.equal(calls.length, n, 'answered from the cache');
});

test('a Paddle key the Worker refuses is a no: 404 unknown, 409 another product, 410 refunded or ended; everything else is "cannot tell"', async () => {
  for (const [n, status] of [[1, 404], [2, 409], [3, 410]]) {
    answer = () => ({ status, body: { error: 'x' } });
    const r = await T.verifyKey(keyN(n));
    assert.equal(r.ok, false, String(status));
    assert.ok(!r.transient, String(status));
    assert.ok(r.message && !/gumroad/i.test(r.message), 'the message does not send a Paddle buyer to Gumroad');
  }
  for (const [n, a] of [[10, { status: 503 }], [11, { status: 502 }], [12, { status: 429 }], [13, 'throw'], [14, { status: 200, body: {} }], [15, { status: 403 }]]) {
    answer = () => a;
    const r = await T.verifyKey(keyN(n));
    assert.equal(r.ok, false, JSON.stringify(a));
    assert.equal(r.transient, true, JSON.stringify(a));
  }
});

test('peak-pay down: a new key is never unlocked, a key verified before keeps working, an explicit no locks it out', async (t) => {
  let now = Date.now();
  t.mock.method(Date, 'now', () => now);
  const req = k => ({ cookies: { gim_lic: k } });
  const k = keyN(20);
  answer = () => ({ status: 200, body: { ok: true, plan: 'monthly' } });
  assert.equal(await pro.isProRequest(req(k)), true);
  now += 7 * 60 * 60 * 1000;                       // the cached yes has run out
  for (const a of [{ status: 503 }, { status: 429 }, 'throw']) {
    answer = () => a;
    assert.equal(await pro.isProRequest(req(k)), true, 'kept through ' + JSON.stringify(a));
    now += 7 * 60 * 60 * 1000;
  }
  assert.equal(await pro.isProRequest(req(keyN(21))), false, 'a key never seen is not unlocked by an outage');
  answer = () => ({ status: 410, body: { error: 'ended' } });
  assert.equal(await pro.isProRequest(req(k)), false);
  answer = () => ({ status: 503 });
  now += 16 * 60 * 1000;
  assert.equal(await pro.isProRequest(req(k)), false, 'an ended subscription is not brought back by an outage');
});

test('Gumroad keys work as before (Gumroad API, never the Worker); a cut Paddle key never reaches the Worker', async () => {
  calls.length = 0;
  answer = u => (u.startsWith('https://api.gumroad.com/') ? { status: 200, body: { success: true, purchase: {} } } : { status: 500 });
  const r = await T.verifyKey('ABCD1234-EF567890-12AB34CD-56EF78AB');
  assert.deepEqual(r, { ok: true, email: undefined });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.gumroad.com/v2/licenses/verify');
  calls.length = 0;
  answer = () => ({ status: 200, body: { success: false } });
  await T.verifyKey(KEY.slice(0, -3));
  assert.ok(calls.every(c => !c.url.startsWith(paddle.WORKER)), 'a cut key is not a Paddle key');
});

// -- 2. /activate-pro ------------------------------------------------------------------------------------------------------------
test('/activate-pro takes a Paddle key, keeps it in lower case in the cookie; a no is 400, an outage 503 without a cookie', async () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  pro.register(app);
  const server = await new Promise(resolve => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); });
  const base = 'http://127.0.0.1:' + server.address().port;
  const post = (key, extra = {}) => realFetch(base + '/activate-pro', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Forwarded-Proto': 'https', ...extra }, body: JSON.stringify({ license_key: key }) });
  try {
    answer = () => ({ status: 200, body: { ok: true, plan: 'monthly' } });
    const k = keyN(30);
    const r = await post(k.toUpperCase());
    assert.equal(r.status, 200);
    assert.deepEqual(await r.json(), { success: true });
    const cookie = r.headers.getSetCookie().find(c => c.startsWith('gim_lic='));
    assert.ok(cookie && cookie.startsWith('gim_lic=' + k + ';'), 'the key is kept in lower case');
    assert.match(cookie, /HttpOnly/);
    assert.match(cookie, /Secure/);
    answer = () => ({ status: 404, body: { error: 'not_found' } });
    const no = await post(keyN(31), { 'X-Forwarded-For': '10.0.0.2' });
    assert.equal(no.status, 400);
    answer = () => ({ status: 503 });
    const down = await post(keyN(32), { 'X-Forwarded-For': '10.0.0.3' });
    assert.equal(down.status, 503);
    assert.ok(!down.headers.getSetCookie().some(c => c.startsWith('gim_lic=')), 'no cookie while the Worker is down');
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});

// -- 3. the switch ---------------------------------------------------------------------------------------------------------------
const PAGES = ['/', '/activate', '/terms', '/privacy', '/refund', '/blog', '/rent-receipt-generator', '/free-invoice-generator-uk', '/invoice-template-freelancer', '/ontario-hst-calculator', '/late-payment-interest-calculator', '/no-such-page'];
// the legal pages and the pricing section name both resellers; the privacy page also lists Paddle in its table
const RESELLERS = /Paddle\.com and Gumroad/g;

test('switch off: no page loads or mentions peak-pay, and Paddle appears only in the resellers wording; no policy header is sent', { skip: paddle.PADDLE_CHECKOUT && 'the switch is on' }, async () => {
  assert.equal(paddle.enabled(), false);
  const s = await startServer({});
  try {
    const get = pageOf(s.base);
    for (const p of PAGES) {
      const { body, headers } = await get(p);
      assert.equal(headers.get('content-security-policy'), null, p + ' sends no policy header, as before');
      assert.ok(!/peak-pay|gim-pay|peakpay|cdn\.paddle\.com|data-buy-pro|ppRestore|ppManage/i.test(body), p + ' loads or mentions peak-pay');
      if (p !== '/privacy') assert.ok(!/paddle/i.test(body.replace(RESELLERS, '').replace(/Paddle\.com is the Merchant of Record/g, '')), p + ' mentions paddle beyond the resellers wording');
    }
    const home = (await get('/')).body;
    assert.match(home, /Paid through Gumroad|our online resellers Paddle\.com and Gumroad/);
    assert.ok(home.includes('After paying, paste the license key from your receipt'), 'the Gumroad activation words stay');
  } finally { s.stop(); }
});

test('switch on (tests only): Get Pro opens Paddle, the e-mail box sits above the key box, the words name Paddle.com', async () => {
  const s = await startServer({ GIM_PADDLE: '1' });
  try {
    const get = pageOf(s.base);
    for (const p of PAGES.filter(x => x !== '/no-such-page')) {
      const { body } = await get(p);
      // the pages that have the shared footer load it (the home page has the only Get Pro button; pages with a footer of their own only link to it)
      const loads = (body.match(/<script src="\/gim-pay\.js\?v=\d+" data-pro="0" defer><\/script>/g) || []).length;
      assert.ok(loads <= 1, p + ' loads gim-pay.js more than once');
      if (['/', '/activate', '/terms', '/privacy', '/refund'].includes(p)) assert.equal(loads, 1, p + ' loads gim-pay.js');
      for (const m of body.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) assert.doesNotThrow(() => JSON.parse(m[1]), p + ' JSON-LD parses');
      assert.ok(!/\bAI\b/.test(body.replace(/<script[\s\S]*?<\/script>/g, '')), p + ' says AI');
    }
    const home = (await get('/')).body;
    assert.match(home, /<a class="btn" href="https:\/\/dorukctn\.gumroad\.com\/l\/invoicemaker-pro" rel="noopener" data-buy-pro>Get Pro: \$9\/month<\/a>/, 'the button keeps the Gumroad address as its fallback');
    assert.match(home, /Paddle\.com is the seller of record, the Merchant of Record/);
    assert.match(home, /Pro turns on in this browser right after you pay/);
    assert.ok(!/After paying, paste the license key/.test(home), 'the Gumroad activation words are gone from the pricing section');
    assert.match(home, /"url":"https:\/\/getinvoicemaker\.com\/#pricing"/);
    const act = (await get('/activate')).body;
    const restore = act.indexOf('id="ppRestore"'), keyBox = act.indexOf('id="key"');
    assert.ok(restore > 0 && keyBox > restore, 'the e-mail box comes before the key box');
    assert.match(act, /Bought Pro already\?<\/strong> We can e-mail your Pro link/);
    assert.match(act, /Bought Pro on Gumroad\? Paste the license key/);
    assert.ok(!act.includes('Checking with Gumroad'), 'the key check names no service');
    const terms = (await get('/terms')).body;
    assert.match(terms, /After you pay, Pro turns on in your browser/);
    assert.match(terms, /Paddle\.com and Gumroad\. They are the Merchant of Record/);
    const privacy = (await get('/privacy')).body;
    assert.match(privacy, /A purchase made with Paddle needs no key from you/);
    assert.match(privacy, /<td>Cloudflare<\/td>/);
    // Paddle's script may load, its partner's tracking script may not
    const { headers } = await get('/');
    const csp = headers.get('content-security-policy') || '';
    assert.match(csp, /script-src 'self' 'unsafe-inline' https:\/\/cdn\.paddle\.com/);
    assert.ok(!/profitwell/.test(csp));
    for (const f of ['/gim-pay.js', '/assets/peak-pay.js', '/assets/peak-pay.css']) assert.equal((await get(f)).status, 200, f);
  } finally { s.stop(); }
});

test('the switch is one constant, and GIM_PADDLE never turns it on in production', () => {
  const src = fs.readFileSync(path.join(ROOT, 'lib', 'paddle.js'), 'utf8');
  assert.equal((src.match(/^const PADDLE_CHECKOUT = (true|false);$/gm) || []).length, 1);
  if (paddle.PADDLE_CHECKOUT) return;
  process.env.GIM_PADDLE = '1';
  process.env.VERCEL_ENV = 'production';
  try { assert.equal(paddle.enabled(), false); } finally { delete process.env.GIM_PADDLE; delete process.env.VERCEL_ENV; }
});

test('the browser files: peak-pay.js is the peak-tools copy (refund address and the plan wording changed); gim-pay.js opens the monthly plan and sends keys to /activate-pro', () => {
  const pp = fs.readFileSync(path.join(ROOT, 'public', 'assets', 'peak-pay.js'), 'utf8');
  assert.match(pp, /var WORKER = 'https:\/\/peak-pay\.railer-iot\.workers\.dev';/);
  assert.match(pp, /var REFUND = '\/refund';/);
  assert.match(pp, /esc\(o\.terms \|\| w\.once\)/);
  const g = fs.readFileSync(path.join(ROOT, 'public', 'gim-pay.js'), 'utf8');
  assert.match(g, /var PRODUCT = 'invoicemaker';/);
  assert.match(g, /var PLAN = 'monthly';/);
  assert.match(g, /product: PRODUCT, plan: PLAN, lang: 'en', page: location\.origin \+ '\/', terms: 'Billed monthly, cancel anytime'/);
  assert.match(g, /fetch\('\/activate-pro'/);
  assert.match(g, /history\.replaceState/);
  assert.match(g, /P\.restore\(email, PRODUCT, 'en', location\.origin \+ '\/'\)/);
  assert.match(g, /P\.portal\(kept\.toLowerCase\(\)\)/);
  // no mention of "pro" plans that do not exist and no AI wording
  assert.ok(!/\bAI\b/.test(g + pp.replace(/Adobe/g, '')));
});
