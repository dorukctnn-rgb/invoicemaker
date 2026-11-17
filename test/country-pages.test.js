// The German and New Zealand country pages (17 Nov 2026): each is its own deep page, not a currency copy of the generator.
// Starts server.js on a free port and fetches the pages. Run: npm test
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { spawn } = require('node:child_process');
const net = require('node:net');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');
const ORIGIN = 'https://getinvoicemaker.com';
const PAGES = ['/free-invoice-generator-germany', '/free-invoice-generator-new-zealand'];
const TEMPLATES = {
  '/free-invoice-generator-germany': ['german-invoice-template-rechnung'],
  '/free-invoice-generator-new-zealand': ['nz-tax-invoice-template']
};

function freePort() {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.listen(0, '127.0.0.1', () => { const { port } = s.address(); s.close(() => resolve(port)); });
    s.on('error', reject);
  });
}

let child, base;
const get = {};
const plain = s => s.replace(/<script[\s\S]*?<\/script>/g, ' ').replace(/<style[\s\S]*?<\/style>/g, ' ').replace(/<[^>]+>/g, ' ')
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d))).replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
const hrefs = html => new Set([...html.matchAll(/<a\b[^>]*href="([^"#]+)"/gi)].map(m => m[1]));

test.before(async () => {
  const port = await freePort();
  base = 'http://127.0.0.1:' + port;
  child = spawn(process.execPath, ['server.js'], { cwd: ROOT, env: { ...process.env, PORT: String(port), VERCEL_ENV: '' }, stdio: ['ignore', 'pipe', 'inherit'] });
  await new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('server did not start')), 20000);
    child.stdout.on('data', d => { if (String(d).includes('running on')) { clearTimeout(t); resolve(); } });
    child.on('exit', c => reject(new Error('server exited ' + c)));
  });
  const paths = [...PAGES, '/', '/sitemap.xml', '/llms.txt', '/free-invoice-generator-netherlands', '/free-invoice-generator-australia', '/free-invoice-generator-uk',
    '/blog/how-to-invoice-international-clients', '/blog/invoice-number-format', '/blog/what-is-vat-invoice', '/how-to-calculate-vat-on-invoice', '/blog'];
  for (const p of paths) {
    const r = await fetch(base + p);
    get[p] = { status: r.status, body: await r.text() };
  }
});
test.after(() => { if (child) child.kill(); });

test('both pages answer 200 with the right canonical, one H1, three or more H2 and a sized title and description', () => {
  for (const p of PAGES) {
    const { status, body } = get[p];
    assert.equal(status, 200, p);
    assert.ok(body.includes('<link rel="canonical" href="' + ORIGIN + p + '">'), p + ' canonical');
    assert.equal((body.match(/<h1[\s>]/gi) || []).length, 1, p + ' h1');
    assert.ok((body.match(/<h2[\s>]/gi) || []).length >= 3, p + ' h2');
    const title = body.match(/<title>([^<]*)<\/title>/)[1];
    const desc = body.match(/<meta name="description" content="([^"]*)"/)[1];
    assert.ok(title.length >= 25 && title.length <= 60, p + ' title length ' + title.length);
    assert.ok(desc.length >= 70 && desc.length <= 155, p + ' description length ' + desc.length);
    assert.ok(!/www\.getinvoicemaker/.test(body), p + ' uses www');
  }
});

test('each page has 700+ words of its own text and the keyword in the first 100 words', () => {
  const lede = { '/free-invoice-generator-germany': /german invoice template/i, '/free-invoice-generator-new-zealand': /new zealand invoice template/i };
  for (const p of PAGES) {
    const t = plain(get[p].body.slice(get[p].body.indexOf('<h1')));
    assert.ok(t.split(' ').length > 700, p + ' is thin');
    assert.ok(lede[p].test(t.split(' ').slice(0, 100).join(' ')), p + ' lacks the keyword in the first 100 words');
  }
});

test('JSON-LD parses, has Article and BreadcrumbList, and the FAQ matches the visible questions and answers', () => {
  for (const p of PAGES) {
    const blocks = [...get[p].body.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => JSON.parse(m[1]));
    const graph = blocks.flatMap(b => b['@graph'] || [b]);
    const types = graph.map(g => g['@type']);
    for (const need of ['Article', 'BreadcrumbList', 'FAQPage', 'WebApplication']) assert.ok(types.includes(need), p + ' lacks ' + need);
    const faq = graph.find(g => g['@type'] === 'FAQPage');
    assert.ok(faq.mainEntity.length >= 6, p + ' faq entries');
    const visible = plain(get[p].body);
    for (const q of faq.mainEntity) {
      assert.ok(visible.includes(q.name), p + ' question not visible: ' + q.name);
      assert.ok(visible.includes(q.acceptedAnswer.text), p + ' answer not visible: ' + q.name);
    }
  }
});

test('no AI wording and no emoji on the two pages', () => {
  for (const p of PAGES) {
    const t = plain(get[p].body);
    assert.ok(!/\bAI\b|artificial intelligence/i.test(t), p + ' mentions AI');
    assert.ok(!/\p{Extended_Pictographic}/u.test(t.replace(/[©®™]/g, '')), p + ' has an emoji');
  }
});

test('each page carries a Sources block with official links and the check date', () => {
  const hosts = { '/free-invoice-generator-germany': 'https://www.gesetze-im-internet.de/ustg_1980/__14.html', '/free-invoice-generator-new-zealand': 'https://www.ird.govt.nz/gst/tax-invoices-for-gst/how-tax-invoices-for-gst-work' };
  for (const p of PAGES) {
    const { body } = get[p];
    assert.ok(body.includes('<h2>Sources</h2>'), p + ' sources block');
    assert.ok(body.includes('href="' + hosts[p] + '"'), p + ' official link');
    assert.ok(plain(body).includes('last checked 17 November 2026'), p + ' check date');
    assert.ok(/not tax advice/i.test(plain(body)), p + ' disclaimer');
  }
});

test('the generator on each page starts from the country preset', () => {
  const de = get['/free-invoice-generator-germany'].body;
  assert.ok(/<option value="EUR" selected>/.test(de), 'DE currency');
  assert.ok(/id="tax1Rate"[^>]*value="19"/.test(de), 'DE rate');
  assert.ok(de.includes('value="Umsatzsteuer / VAT"'), 'DE tax name');
  assert.ok(de.includes('<option value="de-en" selected>Deutsch + English</option>'), 'DE language');
  const nz = get['/free-invoice-generator-new-zealand'].body;
  assert.ok(/<option value="NZD" selected>/.test(nz), 'NZ currency');
  assert.ok(/id="tax1Rate"[^>]*value="15"/.test(nz), 'NZ rate');
  assert.ok(nz.includes('value="GST"'), 'NZ tax name');
  assert.ok(nz.includes('<option value="en-tax" selected>'), 'NZ heading');
  // The Dutch page and the home page keep their own language lists.
  assert.ok(get['/free-invoice-generator-netherlands'].body.includes('<option value="nl-en" selected>Nederlands + English</option>'));
  assert.ok(/<option value="en" selected>English<\/option>\s*<option value="nl">Nederlands<\/option>/.test(get['/'].body));
});

test('the PDF endpoint prints the German and New Zealand headings', async () => {
  for (const [lang, currency] of [['de-en', 'EUR'], ['de', 'EUR'], ['en-tax', 'NZD']]) {
    const r = await fetch(base + '/api/pdf', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lang, currency, invoiceNumber: 'T-1', senderName: 'A', clientName: 'B', items: [{ description: 'Work', qty: 2, rate: 50 }], taxes: [{ label: 'Tax', rate: 19 }] })
    });
    assert.equal(r.status, 200, lang);
    assert.equal(r.headers.get('content-type'), 'application/pdf');
    assert.equal(Buffer.from(await r.arrayBuffer()).subarray(0, 4).toString(), '%PDF');
  }
});

test('every template file linked from the two pages answers 200 and is the right kind of file', async () => {
  for (const p of PAGES) {
    const links = [...get[p].body.matchAll(/href="(\/templates\/[^"]+)"/g)].map(m => m[1]);
    assert.equal(links.length, 3, p + ' links three files');
    for (const l of links) {
      const r = await fetch(base + l);
      assert.equal(r.status, 200, l);
      const buf = Buffer.from(await r.arrayBuffer());
      assert.ok(buf.length > 5000, l + ' is too small');
      assert.equal(buf.subarray(0, l.endsWith('.pdf') ? 4 : 2).toString(), l.endsWith('.pdf') ? '%PDF' : 'PK', l + ' file signature');
    }
    for (const name of TEMPLATES[p]) assert.ok(links.includes('/templates/' + name + '.docx') && links.includes('/templates/' + name + '.xlsx') && links.includes('/templates/' + name + '.pdf'), p + ' template names');
  }
});

test('the pages link the generator, the three guides and the sibling country pages', () => {
  const need = ['/', '/blog/how-to-invoice-international-clients', '/blog/invoice-number-format', '/blog/what-is-vat-invoice', '/free-invoice-generator-netherlands'];
  for (const p of PAGES) {
    const h = hrefs(get[p].body);
    for (const n of need) assert.ok(h.has(n), p + ' lacks a link to ' + n);
    assert.ok([...h].filter(x => x.startsWith('/free-invoice-generator-') && x !== p).length >= 4, p + ' links too few country pages');
  }
  assert.ok(hrefs(get['/free-invoice-generator-germany'].body).has('/free-invoice-generator-new-zealand'));
  assert.ok(hrefs(get['/free-invoice-generator-new-zealand'].body).has('/free-invoice-generator-germany'));
  assert.ok(hrefs(get['/free-invoice-generator-new-zealand'].body).has('/free-invoice-generator-australia'));
});

test('the sitemap lists both pages with lastmod 2026-11-17 and llms.txt names them', () => {
  for (const p of PAGES) {
    assert.ok(get['/sitemap.xml'].body.includes('<loc>' + ORIGIN + p + '</loc><lastmod>2026-11-17</lastmod>'), p + ' in sitemap');
    assert.ok(get['/llms.txt'].body.includes(ORIGIN + p), p + ' in llms.txt');
  }
});

test('existing pages link to the new ones', () => {
  const de = '/free-invoice-generator-germany', nz = '/free-invoice-generator-new-zealand';
  const has = (page, link) => assert.ok(hrefs(get[page].body).has(link), page + ' lacks ' + link);
  for (const page of ['/blog/how-to-invoice-international-clients', '/blog/invoice-number-format', '/blog/what-is-vat-invoice', '/how-to-calculate-vat-on-invoice']) { has(page, de); has(page, nz); }
  has('/free-invoice-generator-netherlands', de);
  has('/free-invoice-generator-australia', nz);
  has('/free-invoice-generator-uk', de);
  // the home page country list, its guides list and the footer, and the blog index
  has('/', de); has('/', nz); has('/blog', de); has('/blog', nz);
  assert.ok(get['/'].body.includes('Germany (EUR)') && get['/'].body.includes('New Zealand (NZD)'), 'home hub chips');
  assert.equal((get['/'].body.match(/href="\/free-invoice-generator-germany"/g) || []).length >= 3, true, 'home: chip, guide and footer');
});

test('Germany is no longer retired; every other retired URL still redirects', async () => {
  const src = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
  const block = src.slice(src.indexOf('const RETIRED_PAGES = {'), src.indexOf('};', src.indexOf('const RETIRED_PAGES = {')));
  const entries = [...block.matchAll(/^\s*'(\/[^']+)': '([^']+)',?\s*$/gm)].map(m => [m[1], m[2]]);
  assert.ok(entries.length >= 20, 'found the retired list');
  assert.ok(!entries.some(([from]) => from === '/free-invoice-generator-germany'), 'Germany still listed as retired');
  const r = await fetch(base + '/free-invoice-generator-germany', { redirect: 'manual' });
  assert.equal(r.status, 200);
  for (const [from, to] of entries) {
    const res = await fetch(base + from, { redirect: 'manual' });
    assert.equal(res.status, 301, from);
    assert.equal(res.headers.get('location'), to, from);
  }
  for (const need of ['/free-invoice-generator-france', '/free-invoice-generator-usa', '/free-invoice-generator-singapore', '/invoice-template-lawyer'])
    assert.ok(entries.some(([from]) => from === need), need + ' should stay retired');
});
