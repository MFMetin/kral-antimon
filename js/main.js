/* ============================================================================
   ANA KURULUM — giriş ekranı, başlık animasyonu, kart içeriği, sosyal ikonlar
   ========================================================================== */

(function () {
  'use strict';

  const $ = (sel) => document.querySelector(sel);

  /* ------------------------------------------------------------- ikonlar */
  const ICONS = {
    discord:
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<path fill="currentColor" d="M12 3.2c-2.3 0-4.5.4-6.6 1.2C3.3 8 2.2 12 2.4 16.6c1.5 1.1 3.2 1.9 5 2.4l1.1-1.8a10 10 0 0 1-1.7-.9l.4-.3a11.4 11.4 0 0 0 9.6 0l.4.3a10 10 0 0 1-1.7.9l1.1 1.8c1.8-.5 3.5-1.3 5-2.4.2-4.6-.9-8.6-3-12.2A18 18 0 0 0 12 3.2Z"/>' +
      '<ellipse cx="9" cy="13" rx="1.5" ry="1.8" fill="var(--hole)"/>' +
      '<ellipse cx="15" cy="13" rx="1.5" ry="1.8" fill="var(--hole)"/></svg>',

    twitch:
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<path fill="currentColor" d="M4.3 3 3 6.4v11.9h4.1V21h2.3l2.3-2.7h3.4L21 13.2V3H4.3Zm14.4 9.4-2.6 2.9h-3.8l-2.3 2.6v-2.6H6.6V4.7h12.1v7.7Z"/>' +
      '<path fill="currentColor" d="M15.7 7.2h1.7v4.5h-1.7zM11.3 7.2H13v4.5h-1.7z"/></svg>',

    youtube:
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M21.6 7.2a2.6 2.6 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4a2.6 2.6 0 0 0-1.8 1.8A27 27 0 0 0 2 12a27 27 0 0 0 .4 4.8 2.6 2.6 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.8A27 27 0 0 0 22 12a27 27 0 0 0-.4-4.8ZM10.2 15V9l5.2 3-5.2 3Z"/></svg>',

    steam:
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<path fill="currentColor" d="M12 2a10 10 0 0 0-10 9.5l5.2 2.2a2.9 2.9 0 0 1 1.7-.5l2.5-3.6v-.1a3.9 3.9 0 1 1 3.9 3.9h-.1l-3.5 2.5a2.8 2.8 0 0 1-5.5.8l-3.7-1.5A10 10 0 1 0 12 2Z"/>' +
      '<path fill="currentColor" d="m5.6 17.9 1.2.5a1.6 1.6 0 1 0 1.2-2.9l-1.3-.5a2.1 2.1 0 0 1 2.8 1.1 2.1 2.1 0 0 1-3.9 1.8Z"/>' +
      '<path fill="currentColor" d="M18 10.3a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0Zm-4.4 0a1.9 1.9 0 1 1 3.8 0 1.9 1.9 0 0 1-3.8 0Z"/></svg>',

    instagram:
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M7.5 2.5h9a5 5 0 0 1 5 5v9a5 5 0 0 1-5 5h-9a5 5 0 0 1-5-5v-9a5 5 0 0 1 5-5Zm0 2a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h9a3 3 0 0 0 3-3v-9a3 3 0 0 0-3-3h-9ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/>' +
      '<circle cx="17.3" cy="6.7" r="1.2" fill="currentColor"/></svg>',

    x:
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<path fill="currentColor" d="M17.5 3h3.1l-6.8 7.8L21.8 21h-6.3l-4.9-6.4L4.9 21H1.8l7.3-8.3L1.7 3h6.4l4.4 5.9L17.5 3Zm-1.1 16.1h1.7L7.7 4.8H5.9l10.5 14.3Z"/></svg>',

    tiktok:
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<path fill="currentColor" d="M16.3 2h-3v13a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.4a5.7 5.7 0 1 0 4.8 5.6V8.6a6.6 6.6 0 0 0 3.9 1.3V6.8a3.7 3.7 0 0 1-3.9-3.6V2Z"/></svg>',

    spotify:
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<path fill="currentColor" d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm4.6 14.4a.8.8 0 0 1-1.1.3c-3-1.8-6.7-2.2-11.1-1.2a.8.8 0 1 1-.3-1.5c4.8-1.1 8.9-.6 12.2 1.4.4.2.5.7.3 1Zm1.2-2.8a1 1 0 0 1-1.3.3c-3.4-2.1-8.5-2.7-12.5-1.5a1 1 0 0 1-.6-1.9c4.6-1.4 10.2-.7 14.1 1.7.5.3.6.9.3 1.4Zm.1-2.9C14.1 8.3 7.9 8.1 4.4 9.2a1.2 1.2 0 1 1-.7-2.3C7.7 5.7 14.5 5.9 18.9 8.5a1.2 1.2 0 0 1-1.2 2.1Z"/></svg>',

    github:
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<path fill="currentColor" d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.3-3.4-1.3-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.7.4-1.1.6-1.4-2.2-.2-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.4 9.4 0 0 1 5 0c2-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.8-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2Z"/></svg>',

    opgg:
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<rect x="2" y="4.5" width="20" height="15" rx="4.5" fill="currentColor"/>' +
      '<text x="12" y="15.4" text-anchor="middle" font-size="8.5" font-weight="700" fill="var(--hole)" font-family="Inter, Segoe UI, sans-serif">OP</text></svg>',

    leagueofgraphs:
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<rect x="2" y="4.5" width="20" height="15" rx="4.5" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
      '<path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M5.6 15.2 9 11.4l2.7 2.3 3.1-4.2 2.6 2.4"/>' +
      '<circle cx="14.8" cy="9.5" r="1.1" fill="currentColor"/></svg>',

    link:
      '<svg viewBox="0 0 24 24" aria-hidden="true">' +
      '<path fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" d="M10.5 13.5a4 4 0 0 0 5.7 0l2.6-2.6a4 4 0 0 0-5.7-5.7l-1.3 1.3M13.5 10.5a4 4 0 0 0-5.7 0l-2.6 2.6a4 4 0 0 0 5.7 5.7l1.3-1.3"/></svg>',
  };

  /* --------------------------------------------------------------- başlık */
  function renderTitle() {
    const text = (CONFIG.title || '').toString();
    document.title = CONFIG.pageTitle || text || 'Profil';
    $('#title-sr').textContent = text;

    const box = $('#letters');
    box.innerHTML = '';

    // Harfler tek tek animasyonlu, ama satır sonu SADECE kelime aralarında
    // olabilsin diye her kelime kendi nowrap kutusunda toplanıyor.
    const words = text.split(' ');
    let i = 0;

    words.forEach((word, wi) => {
      const wrap = document.createElement('span');
      wrap.className = 'word';

      for (const ch of word) {
        const s = document.createElement('span');
        s.className = 'ch';
        s.textContent = ch;
        s.style.setProperty('--d', (i * 0.06).toFixed(2) + 's');
        s.style.setProperty('--w', (i * 0.11).toFixed(2) + 's');
        wrap.appendChild(s);
        i++;
      }
      box.appendChild(wrap);

      if (wi < words.length - 1) {
        const sp = document.createElement('span');
        sp.className = 'sp';
        sp.innerHTML = '&nbsp;';
        box.appendChild(sp);
        i++;
      }
    });
  }

  /* ------------------------------------------------------------- lol nick */
  function renderRiotId() {
    const box = $('#riot-id');
    const nick = (CONFIG.riotId || '').toString().trim();

    if (!nick) { box.hidden = true; return; }

    box.hidden = false;
    $('#riot-name').textContent = nick;
    $('#riot-hint').textContent = 'kopyalandı';
    box.setAttribute('aria-label', nick + ' — kopyalamak için tıkla');
    box.title = 'Kopyala';

    let timer = 0;

    function flash() {
      $('#riot-live').textContent = nick + ' kopyalandı';
      box.classList.add('copied');
      clearTimeout(timer);
      timer = setTimeout(() => {
        box.classList.remove('copied');
        $('#riot-live').textContent = '';
      }, 1600);
    }

    // Eski tarayıcılar / http sayfalar için yedek yöntem
    function legacyCopy(text) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0';
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      ta.remove();
      return ok;
    }

    box.addEventListener('click', () => {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(nick).then(flash, () => {
          if (legacyCopy(nick)) flash();
        });
      } else if (legacyCopy(nick)) {
        flash();
      }
    });
  }

  /* --------------------------------------------------------------- avatar */
  function renderAvatar() {
    const img = $('#avatar');
    const fb = $('#avatar-fallback');
    const src = CONFIG.avatar;

    if (!src) return;                    // taç kalsın

    img.addEventListener('load', () => {
      img.hidden = false;
      fb.style.display = 'none';
    });
    img.addEventListener('error', () => {
      img.hidden = true;                 // dosya yok — taç göster
    });
    img.src = src;
    img.alt = (CONFIG.title || '') + ' profile picture';
  }

  /* -------------------------------------------------------- kart bilgileri */
  function renderStats() {
    const s = CONFIG.stats || {};
    const list = $('#stats');
    const rows = [
      ['rank', 'Rank', s.rank],
      ['mains', 'Main', Array.isArray(s.mains) ? s.mains.join(' · ') : s.mains],
      ['kda', 'KDA', s.kda],
      ['server', 'Server', s.server],
    ];

    list.innerHTML = '';
    let shown = 0;

    for (const [id, key, val] of rows) {
      if (!val) continue;
      const li = document.createElement('li');
      li.dataset.key = id;
      const k = document.createElement('span');
      const v = document.createElement('span');
      k.className = 'k';
      k.textContent = key;
      v.className = 'v';
      v.textContent = val;
      li.append(k, v);
      list.appendChild(li);
      shown++;
    }

    list.hidden = shown === 0;
  }

  function renderSocials() {
    const nav = $('#socials');
    const items = Array.isArray(CONFIG.socials) ? CONFIG.socials : [];
    nav.innerHTML = '';

    items.forEach((it, i) => {
      if (!it || !it.url) return;
      const a = document.createElement('a');
      a.className = 'social';
      a.href = it.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.dataset.name = it.name || 'Link';
      a.setAttribute('aria-label', it.name || 'Link');
      a.style.setProperty('--d', (0.55 + i * 0.07).toFixed(2) + 's');
      a.innerHTML = ICONS[it.icon] || ICONS.link;
      nav.appendChild(a);
    });

    nav.hidden = nav.children.length === 0;
  }

  /* ------------------------------------------------------------- 3B eğilme */
  function setupTilt() {
    if (CONFIG.cardTilt === false) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const card = $('#card');
    let frame = 0;

    card.addEventListener('pointermove', (e) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const r = card.getBoundingClientRect();
        const dx = (e.clientX - r.left) / r.width - 0.5;
        const dy = (e.clientY - r.top) / r.height - 0.5;
        card.style.setProperty('--rx', (-dy * 7).toFixed(2) + 'deg');
        card.style.setProperty('--ry', (dx * 9).toFixed(2) + 'deg');
      });
    });

    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  }

  /* ------------------------------------------------------------ giriş ekranı */
  function setupEnter() {
    const overlay = $('#enter');
    const site = $('#site');
    let done = false;

    function enter() {
      if (done) return;
      done = true;

      document.body.classList.add('entered');
      overlay.classList.add('gone');
      site.removeAttribute('aria-hidden');

      // overlay tamamen kaybolunca DOM dışına al
      setTimeout(() => { overlay.hidden = true; }, 900);

      // müzik SADECE burada, kullanıcı etkileşimi içinde başlatılabilir
      if (window.player && CONFIG.autoplayOnEnter !== false) window.player.play();

      BG.boost(11);   // girişte ok yağmuru patlaması
    }

    overlay.addEventListener('click', enter);
    overlay.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        enter();
      }
    });
    overlay.focus({ preventScroll: true });
  }

  /* ------------------------------------------------------------------ init */
  function init() {
    if (typeof CONFIG !== 'object') {
      console.error('[kral-antimon] js/config.js yüklenemedi.');
      return;
    }

    if (CONFIG.lolCursor !== false) document.body.classList.add('lol-cursor');

    // Kart saydamlığı (fareli cihazlarda; hover'da tam opak olur)
    if (CONFIG.cardOpacity != null) {
      const o = Math.max(0.2, Math.min(1, Number(CONFIG.cardOpacity) || 1));
      document.documentElement.style.setProperty('--card-fade', String(o));
    }

    renderTitle();
    renderRiotId();
    renderAvatar();
    $('#tagline').textContent = CONFIG.tagline || '';
    $('#tagline').hidden = !CONFIG.tagline;
    renderStats();
    renderSocials();
    setupTilt();

    window.player = new Player(CONFIG.playlist, {
      defaultVolume: CONFIG.defaultVolume,
      shuffle: CONFIG.shuffle,
      showTrackName: CONFIG.showTrackName,
    });

    setupEnter();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
