# SEO Rank Watch — Kurulum

Her iki projede de aynı adımlar. Tek fark: `watchwords.json` içeriği ve `siteUrl`.

## 1. Dosyaları yerleştir

Proje kökünde şu yapı oluşacak:

```
<proje>/
├── .claude/skills/seo-rank-watch/
│   ├── SKILL.md
│   └── scripts/fetch_gsc_ranks.mjs
└── data/seo/
    ├── watchwords.json          ← ilgili projenin dosyasını buraya kopyala, adını watchwords.json yap
    ├── rank-history.json        ← []
    └── improvement-log.json     ← []
```

**mileagelogmaker** için `watchwords.mileagelogmaker.json` → `data/seo/watchwords.json`
**coloringpagemaker** için `watchwords.coloringpagemaker.json` → `data/seo/watchwords.json`

## 2. Paketi kur

```bash
npm install googleapis
```

## 3. Google Search Console API erişimi

Bir kez yapılır, iki projede aynı servis hesabı kullanılabilir.

**a) Google Cloud projesi**
1. https://console.cloud.google.com → yeni proje oluştur (veya mevcut birini seç)
2. APIs & Services → Library → **Google Search Console API** → Enable

**b) Servis hesabı**
1. APIs & Services → Credentials → Create Credentials → **Service account**
2. İsim ver, Create → rol atamadan Done
3. Oluşan hesaba tıkla → **Keys** → Add Key → Create new key → **JSON** → indir
4. İnen dosyayı proje köküne `.gsc-credentials.json` adıyla koy

**c) Search Console'da yetkilendir**
1. Servis hesabının e-postasını kopyala (`...@....iam.gserviceaccount.com`)
2. https://search.google.com/search-console → ilgili property → Settings → **Users and permissions**
3. Add user → servis hesabı e-postası → yetki: **Full** (veya Restricted yeterli)
4. Her iki site için ayrı ayrı yap

## 4. Gizli dosyayı git'ten uzak tut

`.gitignore`'a ekle:

```
.gsc-credentials.json
```

Bu adımı atlama — servis hesabı anahtarı repoya girerse iptal edip yeniden üretmen gerekir.

## 5. Test

```bash
node .claude/skills/seo-rank-watch/scripts/fetch_gsc_ranks.mjs --repo .
```

Sıralama tablosu geliyorsa kurulum tamam.

## Kullanım

```bash
# 28 günlük ölçüm + geçmişe kaydet
node .claude/skills/seo-rank-watch/scripts/fetch_gsc_ranks.mjs --repo . --append

# 7 günlük (iyileştirme etkisini incelerken)
node .claude/skills/seo-rank-watch/scripts/fetch_gsc_ranks.mjs --repo . --days 7

# makine okunur
node .claude/skills/seo-rank-watch/scripts/fetch_gsc_ranks.mjs --repo . --json
```

Claude Code içinde "SEO kontrol" veya "rank izle" dediğinde skill otomatik devreye girer
ve SKILL.md'deki döngüyü uygular.

## Çıktıdaki işaretler

| İşaret | Anlamı |
|---|---|
| `+4.8 ↑` | Sıralama iyileşti (küçük sayı = üst sıra) |
| `-3.7 ↓` | Sıralama düştü |
| `—` | Bu pencerede gösterim yok |
| `⚠` | Kelime, hedeflenenden **farklı** bir sayfada ranklıyor — kanibalizasyon sinyali |

`⚠` görürsen ya hedef sayfayı `watchwords.json`'da düzelt ya da iki sayfanın niyet
çakışmasını çöz.

## Notlar

- GSC verisi 2-3 gün gecikmeli gelir; script bitiş tarihini otomatik 3 gün geriye alır
- Aynı gün + aynı pencere için ikinci kez `--append` yapılırsa mükerrer kayıt eklenmez
- `siteUrl` formatı: URL-prefix property için `https://www.site.com/`, domain property
  için `sc-domain:site.com`
