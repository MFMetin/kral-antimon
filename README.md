# 👑 Kral Antimon

guns.lol tarzı tek sayfalık oyuncu profil sitesi.
Arka planda altın ok yağmuru, ortada görkemli **Kral Antimon** başlığı, tıkla-gir
ekranı ve çalma listeli müzik çalar.

Build adımı yok, kütüphane yok — saf HTML + CSS + JavaScript.

---

## Siteyi açmak

En kolayı yerel bir sunucu ile açmak (ses ve canvas `file://` üzerinde bazı
tarayıcılarda kısıtlanır):

```bash
cd kral-antimon
npx serve .
```

Sonra tarayıcıda `http://localhost:3000` adresine git.
Alternatif: `python -m http.server 8000` → `http://localhost:8000`

---

## Kişiselleştirme

Her şey tek dosyada: **`js/config.js`**. Başka hiçbir dosyaya dokunmana gerek yok.

| Ne | Nerede |
|---|---|
| Başlıktaki isim | `title` |
| Alt yazı | `tagline` |
| Profil resmi | `avatar` (dosyayı `assets/img/` içine at) |
| Rank / main / KDA / sunucu | `stats` |
| Sosyal linkler | `socials` |
| Şarkılar | `playlist` |
| Ok / toz yoğunluğu | `arrowDensity`, `dustDensity` |

### Profil resmi
`assets/img/` klasörüne `avatar.png` olarak at. Dosya yoksa otomatik olarak
altın taç simgesi gösterilir — site yine çalışır.

### Müzik ekleme
1. `.mp3` dosyalarını `assets/music/` klasörüne at.
2. `js/config.js` içindeki `playlist` satırlarının başındaki `//` işaretlerini sil
   ve dosya adlarını kendi dosyalarınla değiştir:

```js
playlist: [
  { title: "Şarkı adı", artist: "Sanatçı", src: "assets/music/1.mp3" },
],
```

Liste boş kalırsa müzik çalar kendini gizler, site sorunsuz açılır.

> **Neden tıkla-gir ekranı var?** Tarayıcılar kullanıcı bir şeye tıklamadan ses
> başlatılmasına izin vermez. Giriş ekranına tıklandığı anda müzik başlar —
> guns.lol da aynı şeyi yapıyor.

### Sosyal ikonlar
`icon` alanına şunlardan birini yazabilirsin:
`discord` · `twitch` · `youtube` · `steam` · `instagram` · `x` · `tiktok` ·
`spotify` · `opgg` · `github` · `link`

Listede olmayan bir site için `link` yaz, zincir ikonu görünür.

### Renk paleti
`css/style.css` dosyasının en üstündeki `:root` bloğundaki `--gold-*`
değerlerini değiştir. Örneğin buz mavisi bir tema için:

```css
--gold-1: #eaf6ff;  --gold-2: #8fd4ff;
--gold-3: #3a9ad9;  --gold-4: #1b4c79;
```

Arka plandaki ok ve toz renkleri `js/canvas.js` içindeki `rgba(...)`
değerlerinde duruyor.

---

## Canlı rank (Riot API)

Rank, LP, galibiyet oranı, son maçların KDA'sı ve en çok oynanan şampiyonlar
Riot API'den otomatik çekilebilir. Veri `assets/rank.json` dosyasına yazılır;
dosya yoksa `config.js` içindeki elle yazılmış değerler gösterilir.

### Neden doğrudan tarayıcıdan çekilmiyor?

İki sebep: Riot API **CORS başlığı göndermiyor** (tarayıcıdan `fetch`
edilemiyor) ve API anahtarı `js/` içine konursa **herkese açık hale gelir**.
Bu yüzden veriyi GitHub Actions çekip statik bir JSON olarak repoya yazıyor:

```
GitHub Actions (30 dk'da bir)
   ├─ Riot API      (anahtar: repo secret, asla yayınlanmaz)
   └─ assets/rank.json  →  commit
                            └─ Site: fetch('assets/rank.json')
```

### Kurulum

**1. API anahtarı al**

[developer.riotgames.com](https://developer.riotgames.com) → giriş yap.

> ⚠️ Sayfadaki **Development key 24 saatte bir expire olur** — kalıcı bir site
> için işe yaramaz. "Register Product" → **Personal API Key** başvurusu yap
> (ücretsiz, süresiz, onay ~10 iş günü). Development key ile sadece test et.

**2. Anahtarı repoya secret olarak ekle**

Repo → Settings → Secrets and variables → Actions → **New repository secret**
Ad: `RIOT_API_KEY` · Değer: `RGAPI-...`

> Anahtarı asla dosyaya yazma, commit'leme, kimseye gönderme.

**3. Kendi bilgilerini gir**

`.github/workflows/rank.yml` içindeki `env` bloğu:

```yaml
RIOT_ID: 'Antimon#tilt'  # oyun içi Riot ID'n — tag'i doğru yaz
PLATFORM: 'euw1'         # eun1 / tr1 / na1 ...
REGION:  'europe'        # americas / asia / sea
MATCH_COUNT: '20'        # KDA için kaç maç incelensin
```

Riot ID'ni oyunda profilinin üstünde `İsim #TAG` şeklinde görürsün.
`PLATFORM` / `REGION` eşleşmesi:

| Sunucu | PLATFORM | REGION |
|---|---|---|
| EUW | `euw1` | `europe` |
| EUNE | `eun1` | `europe` |
| Türkiye | `tr1` | `europe` |
| NA | `na1` | `americas` |
| KR | `kr` | `asia` |

**4. Çalıştır**

Repo → Actions → "Rank güncelle" → **Run workflow**. İlk çalıştırmadan sonra
`assets/rank.json` commit'lenir ve site rankı göstermeye başlar.
Sonrasında 30 dakikada bir kendiliğinden güncellenir.

### Yerelde denemek

`assets/rank.example.json` dosyasını `assets/rank.json` olarak kopyalarsan
bölümün nasıl göründüğünü API'siz görebilirsin (içindeki veriler örnektir).

### Ne çekiliyor?

| Veri | Kaynak |
|---|---|
| Riot ID → PUUID | `account-v1/accounts/by-riot-id` |
| Solo/Duo + Flex rank, LP, G/M, winrate | `league-v4/entries/by-puuid` |
| En yüksek ustalık (yedek) | `champion-mastery-v4/.../top` |
| Son 20 ranked maç → gerçek KDA, en çok oynananlar | `match-v5` |
| Şampiyon isimleri + ikonları | Data Dragon (anahtar gerekmez) |

Çalışma başına ~26 istek — Personal key limitlerinin çok altında.
`config.js` → `rank` bloğundan Flex satırını veya şampiyon bölümünü
kapatabilirsin.

---

## GitHub Pages'e yayınlama

```bash
cd kral-antimon
git init
git add .
git commit -m "Kral Antimon profil sitesi"
```

Sonra GitHub'da boş bir repo aç ve:

```bash
git remote add origin https://github.com/KULLANICI_ADIN/kral-antimon.git
git branch -M main
git push -u origin main
```

`gh` CLI kuruluysa tek satırda:

```bash
gh repo create kral-antimon --public --source=. --push
```

Ardından repo sayfasında **Settings → Pages → Source: `main` / `(root)` → Save**.
Birkaç dakika içinde site şurada yayında olur:

```
https://KULLANICI_ADIN.github.io/kral-antimon
```

### Kendi alan adını bağlamak
1. Proje kökünde `CNAME` adında bir dosya oluştur, içine sadece alan adını yaz
   (örn. `antimon.dev`).
2. Alan adı sağlayıcında bir `CNAME` kaydı ekle: `KULLANICI_ADIN.github.io`
3. Settings → Pages bölümünde alan adını gir ve "Enforce HTTPS" seçeneğini işaretle.

---

## Klasör yapısı

```
kral-antimon/
├─ index.html          sayfa iskeleti
├─ css/style.css       tüm görünüm, animasyonlar, renk paleti
├─ js/config.js        ← senin düzenleyeceğin tek dosya
├─ js/canvas.js        arka plan: altın ok yağmuru + toz
├─ js/audio.js         müzik çalar (playlist, ses hafızası)
├─ js/main.js          giriş ekranı, başlık animasyonu, kart içeriği
└─ assets/
   ├─ img/             avatar.png, favicon.svg
   └─ music/           .mp3 dosyaların
```

---

## Erişilebilirlik ve performans notları

- Sekme arka plana alınınca canvas animasyonu durur (pil/CPU tasarrufu).
- İşletim sisteminde "hareketi azalt" açıksa animasyonlar kapanır.
- Parçacık sayısı ekran boyutuna göre ölçeklenir; telefonda otomatik azalır.
- Giriş ekranı klavyeyle de açılır (Enter / Boşluk). Girdikten sonra boşluk
  tuşu müziği oynatır/duraklatır.
- Ses seviyesi ve sessiz durumu tarayıcıda hatırlanır.

---

## Telif notu

Riot Games'in "Legal Jibber Jabber" politikası ticari olmayan hayran
projelerine izin verir, ama şampiyon görselleri/videoları kullanacaksan bu
kuralları okumanda fayda var. Müzik tarafında, herkese açık bir sitede telifli
şarkı yayınlamak risklidir — telifsiz (royalty-free) parçalar ya da kendi
kaydın daha güvenli.

Bu şablondaki tüm görseller (taç, ikonlar, arka plan efekti) sıfırdan
çizilmiştir, herhangi bir marka varlığı kopyalanmamıştır.
