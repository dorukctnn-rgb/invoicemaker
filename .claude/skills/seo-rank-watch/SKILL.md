---
name: seo-rank-watch
description: Google arama sıralamasını sürekli iyileştirir. Ölç → 1. sıraya en yakın tek kelimeyi seç → arama niyetini incele → iyileştir → 7 gün gözlemle → gerçek ölçümle yargıla. Kullanıcı "SEO kontrol", "sıralama", "rank izle" dediğinde veya haftalık SEO turu istediğinde kullan.
---

# SEO Rank Watch

Hedef sitenin Google sıralamasını döngüsel olarak iyileştirir. Amaç: 1. sıraya çıkma
potansiyeli olan anahtar kelimeyi bul, arama ihtiyacına yanıt veren bir iyileştirme yap,
7 gün gözlemle. 1. sıraya çıkana kadar tekrarla.

## Veri dosyaları

| Dosya | İçerik |
|---|---|
| `data/seo/watchwords.json` | Site adresi + anahtar kelime / hedef sayfa / öncelik |
| `data/seo/rank-history.json` | Sıralama geçmişi. **Yalnızca ekleme yapılır** |
| `data/seo/improvement-log.json` | İyileştirme geçmişi / durum / sonraki inceleme tarihi |

### Durumlar

- `active` — iyileştirme adayı
- `observing` — iyileştirme sonrası 7 günlük gözlem aşaması
- `achieved` — 1. sıra başarıldı, yalnızca izlenir

## İş akışı

### 1. Sıralamayı ölç

Temel kaynak Google Search Console:

```bash
node .claude/skills/seo-rank-watch/scripts/fetch_gsc_ranks.mjs --repo . --append
```

GSC'nin ortalama sıralama, gösterim ve tıklama verisini al, önceki ölçümden değişimi
kontrol et.

GSC kullanılamıyorsa veya o günkü anlık sıralamayı görmek istiyorsan `WebSearch` kullan.
WebSearch sıralaması **tahminidir**; çakışma olursa GSC doğru kabul edilir.

`rank: null` + gösterim 0, sayfanın indekslenmediği anlamına **gelmez**. Gerekirse
`WebSearch` ile doğrula.

### 2. 7 günü dolan iyileştirmeleri incele

`nextReviewDate <= bugün` olan kelimeleri kontrol et. Etkiyi ölçerken 28 gün ortalaması
değil **7 günlük** veri kullan:

```bash
node .claude/skills/seo-rank-watch/scripts/fetch_gsc_ranks.mjs --repo . --days 7
```

Yargı:

- 1. sıra → `achieved`
- İyileştirme yapıldı ama 1. sıraya ulaşılmadı → `active`
- Etki yok → `active`, bir sonraki turda **farklı bir yöntem** dene

Sonucu `improvement-log.json`'a kaydet.

### 3. Bugün iyileştirilecek TEK kelimeyi seç

`observing` ve `achieved` olanları hariç tut. Şu sırayla, **yalnızca 1 kelime**:

1. 2-10. sıra + gösterim var → 1. sıraya en yakın olanı önceliklendir
2. 11-20. sıra + gösterim çok
3. İyileştirme yapıldı ama 1. sıraya ulaşılmadı / etki yok
4. Yüksek öncelikli `rank: null`
5. GSC'de görünen, henüz kaydedilmemiş umut verici sorgular

Aday yoksa sıralama raporuyla bitir. **Zorlama hedef oluşturma.**

### 4. Arama ihtiyacını analiz et

İyileştirmeden **önce mutlaka**:

- "Kim, neyi öğrenmek için arıyor" → 1-2 cümleyle tanımla
- `WebSearch` ile mevcut ilk 1-3 sayfayı incele
- Üst sayfalarla hedef sayfayı karşılaştır
- Eksik bilgiyi **boşluk** olarak belirle

SEO için metin şişirme. Arama kullanıcısının istediği bilgiyi ekle.

### 5. Tek kelimeyi iyileştir

Boşluğa göre yalnızca gerekeni uygula:

- title / description / intro / SSS iyileştirmesi
- eksik içeriğin eklenmesi
- makale ↔ bölgesel sayfa ↔ detay sayfası iç linkleri
- eksik gerçek verinin eklenmesi

İç linkler SEO için değil, kullanıcının "sırada ne bilmek/yapmak isteyeceği"ne yönlendirir.

`noindex` değişikliği veya büyük sayfa yapısı değişikliğini **kendiliğinden uygulama** —
öner ve onay al.

### 6. Kaydet ve 7 gün bekle

`improvement-log.json`'a ekle:

```json
{
  "keyword": "...",
  "targetPath": "/...",
  "status": "observing",
  "nextReviewDate": "YYYY-MM-DD",
  "actions": [{
    "date": "YYYY-MM-DD",
    "rankAtAction": 4.2,
    "needs": "arama ihtiyacı",
    "done": "yapılan iyileştirme"
  }]
}
```

`data/seo/*.json` değişikliklerini Git'e commit et.

`observing` kelimeleri `nextReviewDate`'e kadar **kesinlikle** yeniden iyileştirme.

## Rapor

Sonunda kısa rapor ver:

- Önceki döneme göre büyük yükselen / düşen kelimeler
- Bu turdaki etki yargısı
- Bugün seçilen kelime ve seçim nedeni
- Tahmin edilen arama ihtiyacı
- Yapılan iyileştirme
- `observing` aşamasındaki kelimeler ve `nextReviewDate`'leri

Sıralama iyileşmesini tahminle kesinleştirme. Ne değiştirdiğini raporla; etkiyi bir
sonraki gerçek ölçümde yargıla.

## Koruma kuralları

- Google SERP'i özel script'le kazıma. Yalnızca GSC veya WebSearch
- Bir turda **1** anahtar kelime
- `observing` için 7 günlük soğuma süresini katı uygula
- `rank-history.json`'un geçmiş verisini yeniden yazma, yalnızca ekle
- Kimlik doğrulama anahtarı veya gizli bilgiyi çıktılama/commit etme
- `noindex` veya büyük yapı değişikliğini onaysız uygulama
- İyileştirme etkisini kesinleştirme
- İyileştirme hedefi yoksa hiçbir şey yapma
