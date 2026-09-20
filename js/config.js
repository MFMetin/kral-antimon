/* ============================================================================
   KRAL ANTIMON — AYAR DOSYASI
   ----------------------------------------------------------------------------
   Siteyi kişiselleştirmek için SADECE bu dosyayı düzenlemen yeterli.
   Değişikliği kaydet, tarayıcıda sayfayı yenile (Ctrl+F5). Hepsi bu.
   ========================================================================== */

const CONFIG = {

  /* --- Büyük başlıkta yazacak isim --------------------------------------- */
  title: "Kral Antimon",

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
    server: "TR",
  },

  /* --- Sosyal linkler -----------------------------------------------------
     Kullanabileceğin icon değerleri:
       discord · twitch · youtube · steam · instagram · x · tiktok
       spotify · opgg · github · link
     İstemediğin satırın başına // koyarsan o ikon görünmez.
     Yeni satır eklemek için mevcut birini kopyalaman yeterli.            */
  socials: [
    { name: "Discord",  url: "https://discord.com/users/KULLANICI_ID",  icon: "discord"  },
    { name: "Twitch",   url: "https://twitch.tv/KULLANICI_ADI",         icon: "twitch"   },
    { name: "YouTube",  url: "https://youtube.com/@KULLANICI_ADI",      icon: "youtube"  },
    { name: "op.gg",    url: "https://op.gg/summoners/tr/Antimon-tilt", icon: "opgg"    },
    { name: "Steam",    url: "https://steamcommunity.com/id/KULLANICI", icon: "steam"    },
    { name: "Instagram",url: "https://instagram.com/KULLANICI_ADI",     icon: "instagram"},
  ],

  /* --- Çalma listesi ------------------------------------------------------
     1) Şarkı dosyalarını assets/music/ klasörüne at (.mp3 / .ogg / .m4a)
     2) Aşağıdaki satırların başındaki // işaretlerini sil ve dosya
        adlarını kendi dosyalarınla değiştir.
     Liste boş kalırsa müzik çalar otomatik olarak gizlenir, site
     yine de sorunsuz çalışır.                                           */
  playlist: [
    { title: "Sugar", artist: "Zubi", src: "assets/music/zubi-sugar.mp3" },
    // { title: "İkinci şarkı",    artist: "Sanatçı", src: "assets/music/2.mp3" },
    // { title: "Üçüncü şarkı",    artist: "Sanatçı", src: "assets/music/3.mp3" },
  ],

  /* --- Müzik ayarları ---------------------------------------------------- */
  autoplayOnEnter: true,   // giriş ekranına tıklayınca müzik başlasın mı
  shuffle:         false,  // çalma listesi karışık çalsın mı
  defaultVolume:   18,     // 0-100 arası. Kullanıcının seçimi hatırlanır.

  /* --- Canlı rank ---------------------------------------------------------
     Rank verisi GitHub Actions tarafından assets/rank.json dosyasına yazılır
     (bkz. .github/workflows/rank.yml). Dosya yoksa yukarıdaki elle yazılmış
     stats değerleri gösterilir; dosya gelince otomatik onların yerini alır. */
  rank: {
    enabled:    true,
    file:       "assets/rank.json",
    showFlex:   true,   // Flex kuyruğunu da göster
    showChamps: true,   // en çok oynanan şampiyonlar bölümü
    showRecent: false,  // "LAST 20 GAMES ... KDA" satırı
  },

  /* --- Görsel ayarlar ---------------------------------------------------- */
  arrowDensity:  1.0,   // arka plandaki ok yağmurunun sıklığı (0.5 az, 2 çok)
  dustDensity:   1.0,   // altın toz yoğunluğu (0.5 az, 2 çok)
  cardTilt:      true,  // fareyle karta 3B eğilme efekti
};
