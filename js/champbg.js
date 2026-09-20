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

  const cfg = () =>
    (typeof CONFIG === 'object' && CONFIG && CONFIG.champBackground) || {};

  const splashUrl = (id) => SPLASH + encodeURIComponent(id) + '_0.jpg';

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

  /* ---------------------------------------------------------------- API */
  function set(id, name) {
    if (!host || !id) return;
    if (cfg().enabled === false) return;
    if (id === activeId) { clear(); return; }      // aynı karta tekrar tıklama = kapat

    const url = splashUrl(id);
    const img = new Image();

    img.addEventListener('load', () => {
      const next = 1 - front;
      layers[next].style.backgroundImage = 'url("' + url + '")';
      layers[next].classList.add('is-on');
      layers[front].classList.remove('is-on');
      front = next;

      activeId = id;
      activeName = name || id;
      document.body.classList.add('has-champ-bg');
      store(id);
      paintResetButton();
      notify();
    });

    // Görsel yoksa hiçbir şey değiştirme, sessizce geç
    img.addEventListener('error', () => {
      console.warn('[champbg] splash yüklenemedi:', id);
    });

    img.src = url;
  }

  function clear() {
    if (!host) return;
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

    setupParallax();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return { set, clear, current, onChange, restore, splashUrl };
})();
