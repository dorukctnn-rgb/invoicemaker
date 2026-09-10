#!/usr/bin/env node
/**
 * fetch_gsc_ranks.mjs
 *
 * Google Search Console'dan izlenen anahtar kelimelerin ortalama sıralama,
 * gösterim ve tıklama verisini çeker.
 *
 * Kullanım:
 *   node fetch_gsc_ranks.mjs --repo .            # 28 günlük, sadece göster
 *   node fetch_gsc_ranks.mjs --repo . --append   # ölç + rank-history.json'a ekle
 *   node fetch_gsc_ranks.mjs --repo . --days 7   # 7 günlük (etki incelemesi için)
 *   node fetch_gsc_ranks.mjs --repo . --json     # makine okunur çıktı
 *
 * Kimlik doğrulama (biri yeterli):
 *   GSC_CREDENTIALS=/yol/service-account.json   (ortam değişkeni)
 *   <repo>/.gsc-credentials.json                (dosya — .gitignore'a ekle!)
 *
 * Kurulum için SETUP.md'ye bak.
 */

import fs from 'node:fs';
import path from 'node:path';

// ---------- argümanlar ----------
function parseArgs(argv) {
  const args = { repo: '.', days: 28, append: false, json: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--repo') args.repo = argv[++i];
    else if (a === '--days') args.days = Number(argv[++i]);
    else if (a === '--append') args.append = true;
    else if (a === '--json') args.json = true;
    else if (a === '--help' || a === '-h') args.help = true;
  }
  return args;
}

const args = parseArgs(process.argv);

if (args.help) {
  console.log(fs.readFileSync(new URL(import.meta.url), 'utf8').split('*/')[0]);
  process.exit(0);
}

if (!Number.isFinite(args.days) || args.days < 1) {
  console.error('HATA: --days pozitif bir sayı olmalı');
  process.exit(1);
}

const repo = path.resolve(args.repo);
const seoDir = path.join(repo, 'data', 'seo');
const watchPath = path.join(seoDir, 'watchwords.json');
const historyPath = path.join(seoDir, 'rank-history.json');

// ---------- watchwords ----------
if (!fs.existsSync(watchPath)) {
  console.error(`HATA: ${watchPath} bulunamadı.`);
  process.exit(1);
}

const watch = JSON.parse(fs.readFileSync(watchPath, 'utf8'));
const siteUrl = watch.siteUrl;
const keywords = watch.keywords || [];

if (!siteUrl) {
  console.error('HATA: watchwords.json içinde "siteUrl" yok.');
  console.error('  URL-prefix property için: "https://www.example.com/"');
  console.error('  Domain property için:     "sc-domain:example.com"');
  process.exit(1);
}

// ---------- kimlik doğrulama ----------
function findCredentials() {
  const envPath = process.env.GSC_CREDENTIALS;
  if (envPath && fs.existsSync(envPath)) return envPath;
  const local = path.join(repo, '.gsc-credentials.json');
  if (fs.existsSync(local)) return local;
  return null;
}

const credPath = findCredentials();
if (!credPath) {
  console.error('HATA: GSC kimlik bilgisi bulunamadı.');
  console.error('  GSC_CREDENTIALS ortam değişkenini ayarla veya');
  console.error(`  ${path.join(repo, '.gsc-credentials.json')} dosyasını oluştur.`);
  console.error('  Kurulum adımları için SETUP.md');
  process.exit(1);
}

let google;
try {
  ({ google } = await import('googleapis'));
} catch {
  console.error('HATA: "googleapis" paketi kurulu değil.');
  console.error('  npm install googleapis');
  process.exit(1);
}

const auth = new google.auth.GoogleAuth({
  keyFile: credPath,
  scopes: ['https://www.googleapis.com/auth/webmasters.readonly']
});

const searchconsole = google.searchconsole({ version: 'v1', auth });

// ---------- tarih aralığı ----------
// GSC verisi ~2-3 gün gecikmeli gelir, bitişi 3 gün geriye alıyoruz.
const LAG_DAYS = 3;
const end = new Date(Date.now() - LAG_DAYS * 86400000);
const start = new Date(end.getTime() - (args.days - 1) * 86400000);
const iso = (d) => d.toISOString().split('T')[0];

// ---------- veriyi çek ----------
let rows = [];
try {
  const res = await searchconsole.searchanalytics.query({
    siteUrl,
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
  console.error(`HATA: GSC sorgusu başarısız — ${msg}`);
  if (String(msg).toLowerCase().includes('permission')) {
    console.error('  Servis hesabı e-postasını Search Console\'da kullanıcı olarak eklediğinden emin ol.');
  }
  process.exit(1);
}

// ---------- eşleştir ----------
const norm = (s) => String(s || '').trim().toLowerCase();

function pathOf(url) {
  try { return new URL(url).pathname.replace(/\/$/, '') || '/'; }
  catch { return url; }
}

// Aynı kelime birden fazla sayfada görünebilir; en çok gösterim alanı esas al.
const byQuery = new Map();
for (const r of rows) {
  const q = norm(r.keys[0]);
  const prev = byQuery.get(q);
  if (!prev || r.impressions > prev.impressions) {
    byQuery.set(q, {
      impressions: r.impressions,
      clicks: r.clicks,
      position: r.position,
      page: pathOf(r.keys[1])
    });
  }
}

const measuredAt = new Date().toISOString().split('T')[0];
const results = keywords.map((k) => {
  const hit = byQuery.get(norm(k.keyword));
  return {
    keyword: k.keyword,
    targetPath: k.targetPath,
    priority: k.priority || 'medium',
    rank: hit ? Number(hit.position.toFixed(2)) : null,
    impressions: hit ? hit.impressions : 0,
    clicks: hit ? hit.clicks : 0,
    actualPage: hit ? hit.page : null
  };
});

// ---------- önceki ölçümle karşılaştır ----------
let history = [];
if (fs.existsSync(historyPath)) {
  try { history = JSON.parse(fs.readFileSync(historyPath, 'utf8')); } catch { history = []; }
}
const previous = Array.isArray(history) && history.length ? history[history.length - 1] : null;
const prevMap = new Map((previous?.results || []).map((r) => [norm(r.keyword), r]));

for (const r of results) {
  const p = prevMap.get(norm(r.keyword));
  r.previousRank = p ? p.rank : null;
  if (r.rank != null && p && p.rank != null) {
    // Sıralamada küçülme = iyileşme
    r.change = Number((p.rank - r.rank).toFixed(2));
  } else {
    r.change = null;
  }
}

// ---------- kaydedilmemiş umut verici sorgular ----------
const tracked = new Set(keywords.map((k) => norm(k.keyword)));
const untracked = [...byQuery.entries()]
  .filter(([q, v]) => !tracked.has(q) && v.position <= 20 && v.impressions >= 5)
  .sort((a, b) => a[1].position - b[1].position)
  .slice(0, 15)
  .map(([q, v]) => ({
    keyword: q,
    rank: Number(v.position.toFixed(2)),
    impressions: v.impressions,
    clicks: v.clicks,
    page: v.page
  }));

const snapshot = {
  measuredAt,
  source: 'gsc',
  windowDays: args.days,
  dateRange: { start: iso(start), end: iso(end) },
  siteUrl,
  results
};

// ---------- çıktı ----------
if (args.json) {
  console.log(JSON.stringify({ snapshot, untracked }, null, 2));
} else {
  const arrow = (c) => (c == null ? '  —  ' : c > 0 ? `+${c.toFixed(1)} ↑` : c < 0 ? `${c.toFixed(1)} ↓` : ' 0.0 =');
  const pad = (s, n) => String(s).padEnd(n).slice(0, n);
  const lpad = (s, n) => String(s).padStart(n);

  console.log(`\nGSC  ${siteUrl}`);
  console.log(`${iso(start)} → ${iso(end)}  (${args.days} gün)`);
  console.log('─'.repeat(88));
  console.log(`${pad('ANAHTAR KELİME', 34)} ${lpad('SIRA', 6)} ${lpad('DEĞİŞİM', 9)} ${lpad('GÖS.', 7)} ${lpad('TIK', 5)}  SAYFA`);
  console.log('─'.repeat(88));

  const sorted = [...results].sort((a, b) => {
    if (a.rank == null && b.rank == null) return 0;
    if (a.rank == null) return 1;
    if (b.rank == null) return -1;
    return a.rank - b.rank;
  });

  for (const r of sorted) {
    const mismatch = r.actualPage && r.targetPath && pathOf(r.targetPath) !== r.actualPage ? ' ⚠' : '';
    console.log(
      `${pad(r.keyword, 34)} ${lpad(r.rank ?? '—', 6)} ${lpad(arrow(r.change), 9)} ${lpad(r.impressions, 7)} ${lpad(r.clicks, 5)}  ${r.actualPage ?? '—'}${mismatch}`
    );
  }

  console.log('─'.repeat(88));
  const ranked = results.filter((r) => r.rank != null);
  const top10 = ranked.filter((r) => r.rank <= 10).length;
  console.log(
    `${ranked.length}/${results.length} kelime ranklı · ilk 10'da ${top10} · ` +
    `toplam ${results.reduce((s, r) => s + r.impressions, 0)} gösterim, ` +
    `${results.reduce((s, r) => s + r.clicks, 0)} tıklama`
  );
  console.log('⚠ = kelime hedeflenenden farklı bir sayfada ranklıyor');

  if (untracked.length) {
    console.log(`\nİZLENMEYEN UMUT VERİCİ SORGULAR (ilk 20, ≥5 gösterim)`);
    console.log('─'.repeat(88));
    for (const u of untracked) {
      console.log(`${pad(u.keyword, 34)} ${lpad(u.rank, 6)} ${lpad('', 9)} ${lpad(u.impressions, 7)} ${lpad(u.clicks, 5)}  ${u.page}`);
    }
  }
  console.log('');
}

// ---------- geçmişe ekle ----------
if (args.append) {
  if (!Array.isArray(history)) history = [];
  // Aynı gün + aynı pencere için mükerrer kayıt ekleme
  const dup = history.some((h) => h.measuredAt === measuredAt && h.windowDays === args.days);
  if (dup) {
    console.error(`NOT: ${measuredAt} (${args.days} gün) için kayıt zaten var, eklenmedi.`);
  } else {
    history.push(snapshot);
    fs.mkdirSync(seoDir, { recursive: true });
    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2) + '\n');
    console.error(`✓ rank-history.json güncellendi (${history.length} kayıt)`);
  }
}
