/* ============================================================================
   ŞAMPİYON ARKA PLANI
   Şampiyon kartına tıklanınca arka plana o şampiyonun splash art'ı gelir.
   Görseller Riot'un Data Dragon CDN'inden çekilir, repoda dosya tutulmaz.
   ========================================================================== */

const ChampBG = (function () {
  'use strict';

  const SPLASH = 'https://ddragon.leagueoflegends.com/cdn/img/champion/splash/';
  const STORE_KEY = 'ka_champ_bg';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  let host = null;
  let layers = [];          // iki katman, çapraz geçiş için dönüşümlü kullanılır
  let front = 0;            // şu an görünen katmanın indeksi
  let activeId = null;
  let activeName = '';
  let resetBtn = null;
  const listeners = [];

  // skin slayt gösterisi
  let timer = 0;
  let skins = [];           // aktif şampiyonun skin numaraları
  let skinIdx = 0;
  const skinCache = Object.create(null);
  let ddVersion = null;

  const cfg = () =>
    (typeof CONFIG === 'object' && CONFIG && CONFIG.champBackground) || {};

  const splashUrl = (id, num) =>
    SPLASH + encodeURIComponent(id) + '_' + (num || 0) + '.jpg';

  /* ------------------------------------------------------------- depolama */
  function store(v) {
    if (cfg().remember === false) return;
    try {
      if (v) localStorage.setItem(STORE_KEY, v);
      else localStorage.removeItem(STORE_KEY);
    } catch (e) { /* gizli sekme / engelli depolama */ }
  }

  function read() {
    if (cfg().remember === false) return null;
    try { return localStorage.getItem(STORE_KEY); } catch (e) { return null; }
  }

  /* ------------------------------------------------------------ paralaks */
  function setupParallax() {
    if (!fine || reduceMotion || cfg().parallax === false) return;

    let frame = 0;
    window.addEventListener('pointermove', (e) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const x = (e.clientX / window.innerWidth - 0.5) * -18;
        const y = (e.clientY / window.innerHeight - 0.5) * -12;
        host.style.setProperty('--cb-x', x.toFixed(1) + 'px');
        host.style.setProperty('--cb-y', y.toFixed(1) + 'px');
      });
    }, { passive: true });
  }

  /* -------------------------------------------------------------- butonu */
  function paintResetButton() {
    if (!resetBtn) return;
    if (activeId) {
      resetBtn.hidden = false;
      resetBtn.querySelector('.cr-name').textContent = activeName || activeId;
      resetBtn.setAttribute('aria-label', 'Clear ' + (activeName || activeId) + ' background');
    } else {
      resetBtn.hidden = true;
    }
  }

  function notify() {
    for (const fn of listeners) {
      try { fn(activeId); } catch (e) { /* dinleyici patlarsa akışı durdurma */ }
    }
  }

  /* --------------------------------------------------------- skin listesi */
  function setVersion(v) { if (v) ddVersion = v; }

  async function version() {
    if (ddVersion) return ddVersion;
    try {
      const r = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
      const j = await r.json();
      ddVersion = Array.isArray(j) ? j[0] : null;
    } catch (e) { /* ağ yok — sadece temel splash kullanılır */ }
    return ddVersion;
  }

  /**
   * Şampiyonun skin numaraları. Data Dragon chroma'ları da skin gibi listeler
   * (Ezreal'de 77 giriş, gerçekte 22 skin) — parantezli varyant adları elenir.
   */
  async function loadSkins(id) {
    if (skinCache[id]) return skinCache[id];

    const v = await version();
    if (!v) return [0];

    try {
      const r = await fetch('https://ddragon.leagueoflegends.com/cdn/' + v +
                            '/data/en_US/champion/' + encodeURIComponent(id) + '.json');
      if (!r.ok) return [0];
      const j = await r.json();
      const champ = j.data[Object.keys(j.data)[0]];

      let nums = (champ.skins || [])
        .filter((s) => !/\(.+\)/.test(s.name || ''))   // chroma / varyant ele
        .map((s) => s.num);

      if (!nums.length) nums = [0];

      const max = Number(cfg().maxSkins) || 0;
      if (max > 0) nums = nums.slice(0, max);

      skinCache[id] = nums;
      return nums;
    } catch (e) {
      return [0];
    }
  }

  /* ----------------------------------------------------------- gösterim */
  /** Görseli önden yükler, yüklenince katmanları takas eder. */
  function show(url) {
    return new Promise((resolve) => {
      const img = new Image();
      img.addEventListener('load', () => {
        const next = 1 - front;
        layers[next].style.backgroundImage = 'url("' + url + '")';
        layers[next].classList.add('is-on');
        layers[front].classList.remove('is-on');
        front = next;
        resolve(true);
      });
      img.addEventListener('error', () => resolve(false));
      img.src = url;
    });
  }

  function stopCycle() {
    clearTimeout(timer);
    timer = 0;
  }

  function schedule() {
    stopCycle();
    if (!activeId || skins.length < 2) return;
    if (cfg().slideshow === false) return;
    const wait = Number(cfg().slideInterval) || 5000;
    timer = setTimeout(async () => {
      const id = activeId;
      await advance();
      if (activeId === id) schedule();          // arada değişmediyse devam
    }, wait);
  }

  /** Sıradaki skine geç. Görsel 404 verirse o skini listeden atıp devam eder. */
  async function advance() {
    if (!activeId || !skins.length) return;
    const id = activeId;

    for (let tries = 0; tries < skins.length + 1; tries++) {
      skinIdx = (skinIdx + 1) % skins.length;
      const ok = await show(splashUrl(id, skins[skinIdx]));
      if (activeId !== id) return;              // kullanıcı bu arada değiştirdi
      if (ok) return;

      skins.splice(skinIdx, 1);                 // bozuk skini listeden çıkar
      skinIdx--;
      if (!skins.length) return;
    }
  }

  /* ---------------------------------------------------------------- API */
  async function set(id, name) {
    if (!host || !id) return;
    if (cfg().enabled === false) return;
    if (id === activeId) { clear(); return; }      // aynı karta tekrar tıklama = kapat

    stopCycle();

    const ok = await show(splashUrl(id, 0));
    if (!ok) {
      console.warn('[champbg] splash yüklenemedi:', id);
      return;                                      // hiçbir şey değiştirme
    }

    activeId = id;
    activeName = name || id;
    document.body.classList.add('has-champ-bg');
    store(id);
    paintResetButton();
    notify();

    // Skin listesi arka planda gelsin, temel splash zaten görünüyor
    skins = await loadSkins(id);
    if (activeId !== id) return;
    skinIdx = Math.max(0, skins.indexOf(0));
    schedule();
  }

  function clear() {
    if (!host) return;
    stopCycle();
    skins = [];
    skinIdx = 0;
    layers[front].classList.remove('is-on');
    activeId = null;
    activeName = '';
    document.body.classList.remove('has-champ-bg');
    store(null);
    paintResetButton();
    notify();
  }

  function current() { return activeId; }

  /** Kart işaretlemesi için: seçim değişince çağrılır. */
  function onChange(fn) { if (typeof fn === 'function') listeners.push(fn); }

  /** rank.js kartları bastıktan sonra, hatırlanan seçimi geri yükler. */
  function restore(knownChampions) {
    const saved = read();
    if (!saved) return;
    // Sadece kartta gerçekten bulunan bir şampiyonu geri yükle
    if (Array.isArray(knownChampions) && knownChampions.length) {
      const hit = knownChampions.find((c) => c && c.id === saved);
      if (!hit) { store(null); return; }
      set(hit.id, hit.name);
      return;
    }
    set(saved, saved);
  }

  function init() {
    host = document.getElementById('champ-bg');
    if (!host) return;

    layers = Array.prototype.slice.call(host.querySelectorAll('.cb-layer'));
    if (layers.length < 2) return;

    if (reduceMotion || cfg().kenBurns === false) host.classList.add('no-motion');

    resetBtn = document.getElementById('champ-reset');
    if (resetBtn) resetBtn.addEventListener('click', clear);

    // Sekme arka plandayken boşuna görsel indirme
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopCycle();
      else if (activeId) schedule();
    });

    setupParallax();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { set, clear, current, onChange, restore, splashUrl, setVersion };
})();
