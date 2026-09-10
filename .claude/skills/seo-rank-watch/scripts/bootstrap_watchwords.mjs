#!/usr/bin/env node
/**
 * bootstrap_watchwords.mjs
 *
 * Bir sitenin GSC verisinden başlangıç watchwords.json'unu otomatik üretir.
 * Anahtar kelimeleri tahmin etmez — Google'da zaten gösterim alan gerçek
 * sorguları alır ve her birini en çok gösterim aldığı sayfayla eşler.
 *
 * Kullanım:
 *   node bootstrap_watchwords.mjs --repo . --site "https://www.example.com/"
 *   node bootstrap_watchwords.mjs --repo . --site "sc-domain:example.com" --days 90
 *   node bootstrap_watchwords.mjs --repo . --site "..." --max 40 --force
 *
 * Kimlik doğrulama: fetch_gsc_ranks.mjs ile aynı
 *   GSC_CREDENTIALS ortam değişkeni veya <repo>/.gsc-credentials.json
 */

import fs from 'node:fs';
import path from 'node:path';

function parseArgs(argv) {
  const a = { repo: '.', days: 90, max: 30, minImpressions: 3, maxPosition: 60, force: false };
  for (let i = 2; i < argv.length; i++) {
    const k = argv[i];
    if (k === '--repo') a.repo = argv[++i];
    else if (k === '--site') a.site = argv[++i];
    else if (k === '--days') a.days = Number(argv[++i]);
    else if (k === '--max') a.max = Number(argv[++i]);
    else if (k === '--min-impressions') a.minImpressions = Number(argv[++i]);
    else if (k === '--max-position') a.maxPosition = Number(argv[++i]);
    else if (k === '--force') a.force = true;
  }
  return a;
}

const args = parseArgs(process.argv);
const repo = path.resolve(args.repo);
const seoDir = path.join(repo, 'data', 'seo');
const outPath = path.join(seoDir, 'watchwords.json');

if (!args.site) {
  console.error('HATA: --site gerekli.');
  console.error('  Örnek: --site "https://www.example.com/"');
  console.error('     ya da --site "sc-domain:example.com"');
  process.exit(1);
}

if (fs.existsSync(outPath) && !args.force) {
  console.error(`HATA: ${outPath} zaten var. Üzerine yazmak için --force ekle.`);
  process.exit(1);
}

// kimlik
const credPath =
  (process.env.GSC_CREDENTIALS && fs.existsSync(process.env.GSC_CREDENTIALS) && process.env.GSC_CREDENTIALS) ||
  (fs.existsSync(path.join(repo, '.gsc-credentials.json')) && path.join(repo, '.gsc-credentials.json')) ||
  null;

if (!credPath) {
  console.error('HATA: GSC kimlik bilgisi bulunamadı (.gsc-credentials.json).');
  process.exit(1);
}

let google;
try {
  ({ google } = await import('googleapis'));
} catch {
  console.error('HATA: "googleapis" kurulu değil → npm install googleapis --save-dev');
  process.exit(1);
}

const auth = new google.auth.GoogleAuth({
  keyFile: credPath,
  scopes: ['https://www.googleapis.com/auth/webmasters.readonly']
});
const searchconsole = google.searchconsole({ version: 'v1', auth });

const LAG_DAYS = 3;
const end = new Date(Date.now() - LAG_DAYS * 86400000);
const start = new Date(end.getTime() - (args.days - 1) * 86400000);
const iso = (d) => d.toISOString().split('T')[0];

let rows = [];
try {
  const res = await searchconsole.searchanalytics.query({
    siteUrl: args.site,
    requestBody: {
      startDate: iso(start),
      endDate: iso(end),
      dimensions: ['query', 'page'],
      rowLimit: 5000
    }
  });
  rows = res.data.rows || [];
} catch (e) {
  const msg = e?.errors?.[0]?.message || e.message;
  console.error(`HATA: ${args.site} → ${msg}`);
  if (String(msg).toLowerCase().includes('permission')) {
    console.error('  Servis hesabını bu property\'ye kullanıcı olarak ekledin mi?');
  }
  process.exit(1);
}

function pathOf(url) {
  try { return new URL(url).pathname.replace(/\/$/, '') || '/'; }
  catch { return url; }
}

// sorgu başına en çok gösterim alan sayfa
const byQuery = new Map();
for (const r of rows) {
  const q = String(r.keys[0]).trim().toLowerCase();
  const cur = byQuery.get(q);
  if (!cur || r.impressions > cur.impressions) {
    byQuery.set(q, { impressions: r.impressions, clicks: r.clicks, position: r.position, page: pathOf(r.keys[1]) });
  }
}

const candidates = [...byQuery.entries()]
  .filter(([, v]) => v.impressions >= args.minImpressions && v.position <= args.maxPosition)
  .sort((a, b) => {
    // 1. sıraya yakınlık önce, eşitlikte gösterim
    if (a[1].position !== b[1].position) return a[1].position - b[1].position;
    return b[1].impressions - a[1].impressions;
  })
  .slice(0, args.max);

const keywords = candidates.map(([q, v]) => ({
  keyword: q,
  targetPath: v.page,
  priority: v.position <= 10 ? 'high' : v.position <= 20 ? 'medium' : 'low',
  _seed: { rank: Number(v.position.toFixed(2)), impressions: v.impressions, clicks: v.clicks }
}));

fs.mkdirSync(seoDir, { recursive: true });
fs.writeFileSync(outPath, JSON.stringify({ siteUrl: args.site, keywords }, null, 2) + '\n');

for (const f of ['rank-history.json', 'improvement-log.json']) {
  const p = path.join(seoDir, f);
  if (!fs.existsSync(p)) fs.writeFileSync(p, '[]\n');
}

console.log(`\n${args.site}`);
console.log(`${iso(start)} → ${iso(end)} · ${rows.length} satır · ${byQuery.size} benzersiz sorgu`);
console.log('─'.repeat(78));
if (!keywords.length) {
  console.log('Kritere uyan sorgu yok. Site yeni olabilir veya henüz gösterim almıyor.');
  console.log(`Eşikleri gevşetmeyi dene: --min-impressions 1 --max-position 100`);
} else {
  for (const k of keywords.slice(0, 15)) {
    console.log(`${String(k._seed.rank).padStart(6)}  ${String(k._seed.impressions).padStart(6)} gös.  ${k.keyword.slice(0, 38).padEnd(38)} ${k.targetPath}`);
  }
  if (keywords.length > 15) console.log(`… ve ${keywords.length - 15} tane daha`);
}
console.log('─'.repeat(78));
console.log(`✓ ${outPath} yazıldı (${keywords.length} kelime)`);
console.log('  _seed alanları ilk ölçüm anlık görüntüsüdür, silebilirsin.\n');
