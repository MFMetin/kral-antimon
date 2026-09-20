/* ============================================================================
   KRAL ANTIMON — AYAR DOSYASI
   ----------------------------------------------------------------------------
   Siteyi kişiselleştirmek için SADECE bu dosyayı düzenlemen yeterli.
   Değişikliği kaydet, tarayıcıda sayfayı yenile (Ctrl+F5). Hepsi bu.

   ÖNEMLİ — değişiklik görünmüyorsa:
   Tarayıcılar css/js dosyalarını önbelleğe alır (GitHub Pages 10 dakika).
   index.html içindeki "?v=15" sayılarını 16, 17, 18... diye artırırsan herkes
   yeni sürümü anında görür.
   ========================================================================== */

const CONFIG = {

  /* --- Büyük başlıkta yazacak isim --------------------------------------- */
  title: "Kral Antimon",

  /* --- Başlığın altındaki LoL nicki --------------------------------------
     Başlığın hemen altında altın harflerle görünür; üzerine tıklayınca
     panoya kopyalanır. "" (boş) yaparsan satır hiç görünmez.            */
  riotId: "Antimon#tilt",

  /* --- Başlığın altındaki kısa yazı -------------------------------------- */
  tagline: "ADC main · bot lane sovereign",

  /* --- Tarayıcı sekmesinde görünecek yazı -------------------------------- */
  pageTitle: "Kral Antimon",

  /* --- Profil resmi ------------------------------------------------------
     Resmini assets/img/ klasörüne at ve yolunu buraya yaz.
     Dosya yoksa otomatik olarak altın taç simgesi gösterilir.            */
  avatar: "assets/img/avatar.png",

  /* --- Oyuncu kartındaki bilgiler ----------------------------------------
     İstemediğin satırı "" (boş) yaparsan o satır hiç görünmez.
     mains: boş dizi [] yaparsan gizlenir.                                */
  stats: {
    rank:   "Master",
    mains:  ["Ezreal", "Lucian", "Caitlyn"],
    kda:    "",       // boş = KDA rozeti hiç görünmez
    server: "",     // boş = Server rozeti görünmez
  },

  /* --- Sosyal linkler -----------------------------------------------------
     Kullanabileceğin icon değerleri:
       discord · twitch · youtube · steam · instagram · x · tiktok · spotify
       opgg · leagueofgraphs · github · link
     İstemediğin satırın başına // koyarsan o ikon görünmez.
     Yeni satır eklemek için mevcut birini kopyalaman yeterli.            */
  socials: [
    // Discord ID'ni değiştirmen gerekirse: bir yazı kanalına \@kullanıcıadın
    // yazıp gönder; mesaj <@123456789> şeklinde görünür, aradaki sayı ID'ndir.
    // Sunucu daveti de kullanabilirsin: url: "https://discord.gg/KOD"
    { name: "Discord",          url: "https://discord.com/users/251999600318218240",        icon: "discord" },
    { name: "League of Graphs", url: "https://www.leagueofgraphs.com/summoner/tr/Antimon-tilt", icon: "leagueofgraphs" },
    { name: "Steam",            url: "https://steamcommunity.com/profiles/76561198201475499/", icon: "steam" },
    { name: "Spotify",          url: "https://open.spotify.com/user/thearthquake",             icon: "spotify" },
  ],

  /* --- Çalma listesi ------------------------------------------------------
     1) Şarkı dosyalarını assets/music/ klasörüne at (.mp3 / .ogg / .m4a)
     2) Aşağıdaki satırların başındaki // işaretlerini sil ve dosya
        adlarını kendi dosyalarınla değiştir.
     Liste boş kalırsa müzik çalar otomatik olarak gizlenir, site
     yine de sorunsuz çalışır.                                           */
  playlist: [
    { title: "Track 1", artist: "", src: "assets/music/track1.mp3" },
    // { title: "İkinci şarkı",    artist: "Sanatçı", src: "assets/music/2.mp3" },
    // { title: "Üçüncü şarkı",    artist: "Sanatçı", src: "assets/music/3.mp3" },
  ],

  /* --- Müzik ayarları ---------------------------------------------------- */
  autoplayOnEnter: true,   // giriş ekranına tıklayınca müzik başlasın mı
  shuffle:         false,  // çalma listesi karışık çalsın mı
  defaultVolume:   18,     // 0-100 arası. Kullanıcının seçimi hatırlanır.
  showTrackName:   false,  // çalarda şarkı adı yazsın mı

  /* --- Canlı rank ---------------------------------------------------------
     Rank verisi GitHub Actions tarafından assets/rank.json dosyasına yazılır
     (bkz. .github/workflows/rank.yml). Dosya yoksa yukarıdaki elle yazılmış
     stats değerleri gösterilir; dosya gelince otomatik onların yerini alır. */
  rank: {
    enabled:    true,
    file:       "assets/rank.json",
    showFlex:   true,   // Flex kuyruğunu da göster
    showChamps: true,   // "son maçlarda en çok" bölümü
    showMastery: true,  // "en yüksek ustalık" bölümü
    showRecent: false,  // "LAST 20 GAMES ... KDA" satırı
    showUpdated: false, // "rank updated: ..." satırı
  },

  /* --- Şampiyon arka planı -------------------------------------------------
     Şampiyon kartına tıklayınca arka plan o şampiyonun splash art'ına döner.
     Görseller Riot'un Data Dragon CDN'inden çekilir, repoda dosya tutulmaz. */
  champBackground: {
    enabled:   true,
    clickable: "both",   // "both" = her iki bölüm | "mastery" = sadece ustalık
    kenBurns:  true,     // yavaş zoom/kaydırma efekti
    parallax:  true,     // fareyle hafif kayma
    remember:  true,     // seçimi tarayıcıda hatırla
    slideshow:     true, // şampiyonun skinleri arasında slayt gösterisi
    slideInterval: 3000, // skinler arası süre (ms)
    maxSkins:      0,    // 0 = tüm skinler, 8 yazarsan ilk 8 skin
  },

  /* --- Görsel ayarlar ---------------------------------------------------- */
  arrowDensity:  1.0,   // arka plandaki ok yağmurunun sıklığı (0.5 az, 2 çok)
  dustDensity:   1.0,   // altın toz yoğunluğu (0.5 az, 2 çok)
  cardTilt:      true,  // fareyle karta 3B eğilme efekti
  cardOpacity:   0.75,  // kartın normal saydamlığı; üzerine gelince 1 olur
                        // (1 = efekt kapalı, dokunmatik cihazlarda hep 1)
  lolCursor:     true,  // LoL'un klasik altın el imleci
};
