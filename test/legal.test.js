// The public pages a payment provider's website review reads: terms, privacy and refund policy, the pricing section and the footer.
// Starts server.js on a free port and fetches the pages. Run: npm test
const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const net = require('node:net');
const path = require('node:path');

function freePort() {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => resolve(port)); });
    s.on('error', reject);
  });
}

let child, base;
const text = {};

test.before(async () => {
  const port = await freePort();
  base = 'http://127.0.0.1:' + port;
  child = spawn(process.execPath, ['server.js'], { cwd: path.join(__dirname, '..'), env: { ...process.env, PORT: String(port), VERCEL_ENV: '' }, stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('server did not start')), 20000);
    child.stdout.on('data', d => { if (String(d).includes('running on')) { clearTimeout(t); resolve(); } });
    child.on('exit', c => reject(new Error('server exited ' + c)));
  });
  for (const p of ['/', '/terms', '/privacy', '/refund', '/sitemap.xml', '/llms.txt']) {
    const r = await fetch(base + p);
    text[p] = { status: r.status, body: await r.text() };
  }
});
test.after(() => { if (child) child.kill(); });

const plain = s => s.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ');

test('terms, privacy and refund policy answer 200', () => {
  for (const p of ['/terms', '/privacy', '/refund']) assert.equal(text[p].status, 200, p);
});

test('refund policy: business name, contact, 14 days, price, cancelling, Paddle.com as Merchant of Record', () => {
  const t = plain(text['/refund'].body);
  for (const need of ['Refund policy', 'Peak Apps Studio', 'info@peakappsstudio.com', '14 days', '$9', 'a month', 'cancel', 'Paddle.com', 'Merchant of Record', 'sales tax/VAT'])
    assert.ok(t.includes(need), 'refund page lacks: ' + need);
});

test('terms and privacy name the resellers and link the refund policy', () => {
  for (const p of ['/terms', '/privacy']) {
    const t = plain(text[p].body);
    assert.ok(t.includes('Paddle.com') || t.includes('Paddle'), p + ' does not name Paddle');
    assert.ok(t.includes('Peak Apps Studio'), p + ' lacks the business name');
    assert.ok(text[p].body.includes('href="/refund"'), p + ' does not link /refund');
  }
  assert.ok(plain(text['/terms'].body).includes('Merchant of Record'));
});

test('home page: the pricing section shows the product and price, and the footer links the three policies and the contact address', () => {
  const html = text['/'].body;
  const t = plain(html);
  assert.ok(html.includes('id="pricing"'));
  assert.ok(/\$9/.test(t) && /per month/.test(t), 'price and period');
  assert.ok(t.includes('Paddle.com') && t.includes('Merchant of Record'), 'reseller wording in the pricing section');
  for (const href of ['/privacy', '/terms', '/refund', 'mailto:info@peakappsstudio.com']) assert.ok(html.includes('href="' + href + '"'), 'footer lacks ' + href);
});

test('the refund page is in the sitemap and llms.txt', () => {
  assert.ok(text['/sitemap.xml'].body.includes('<loc>https://getinvoicemaker.com/refund</loc>'));
  assert.ok(text['/llms.txt'].body.includes('https://getinvoicemaker.com/refund'));
});

test('no generative-tool wording on the pages a payment review reads', () => {
  const bad = /\bAI\b|artificial intelligence|generative|ChatGPT|OpenAI|machine learning|\bLLM\b/i;
  for (const p of ['/', '/terms', '/privacy', '/refund']) assert.ok(!bad.test(plain(text[p].body)), p + ' mentions an AI term');
});
