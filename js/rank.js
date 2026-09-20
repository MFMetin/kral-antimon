/* ============================================================================
   CANLI RANK — assets/rank.json dosyasını okur ve karta basar.
   Dosya yoksa (henüz Action çalışmadıysa) hiçbir şey yapmaz; js/config.js
   içindeki elle yazılmış rozetler olduğu gibi kalır.
   ========================================================================== */

(function () {
  'use strict';

  /* Tier adları ve rozet renkleri (koyu -> açık) */
  const TIERS = {
    IRON:        { label: 'Iron',        c1: '#5a4d44', c2: '#9c8d80' },
    BRONZE:      { label: 'Bronze',      c1: '#7a4526', c2: '#c98a5b' },
    SILVER:      { label: 'Silver',      c1: '#6b7a85', c2: '#c8d5de' },
    GOLD:        { label: 'Gold',        c1: '#b8862b', c2: '#f7e29a' },
    PLATINUM:    { label: 'Platinum',    c1: '#2b7f74', c2: '#8fe0d3' },
    EMERALD:     { label: 'Emerald',     c1: '#1f7d45', c2: '#7fe0a2' },
    DIAMOND:     { label: 'Diamond',     c1: '#3a63b8', c2: '#a9c8ff' },
    MASTER:      { label: 'Master',      c1: '#6e35b5', c2: '#d2a7ff' },
    GRANDMASTER: { label: 'Grandmaster', c1: '#a32a1f', c2: '#ff8f7f' },
    CHALLENGER:  { label: 'Challenger',  c1: '#2f7fae', c2: '#ffe9a8' },
  };

  const QUEUE_LABEL = { solo: 'Solo/Duo', flex: 'Flex' };

  // Not: config.js'teki `const CONFIG` window'a yazılmaz (classic script'te
  // const/let global objeye eklenmez), bu yüzden window.CONFIG değil doğrudan
  // CONFIG bağlamına typeof ile bakılıyor.
  const cfg = () => (typeof CONFIG === 'object' && CONFIG && CONFIG.rank) || {};

  /* ------------------------------------------------------------------ rozet */
  /* Riot'un resmi mini rank amblemleri (assets/ranked/*.svg).
     Dosya bulunamazsa elle çizilmiş kalkana düşer. */
  const EMBLEM_DIR = 'assets/ranked/';

  function emblem(tier) {
    const key = (tier || 'unranked').toLowerCase();
    const img = document.createElement('img');
    img.className = 'emblem';
    img.alt = '';
    img.loading = 'lazy';
    img.addEventListener('error', () => {
      const span = document.createElement('span');
      span.className = 'emblem emblem-fallback';
      span.innerHTML = fallbackShield(tier);
      img.replaceWith(span);
    });
    img.src = EMBLEM_DIR + key + '.svg';
    return img;
  }

  function fallbackShield(tier) {
    const t = TIERS[tier] || { c1: '#4a433a', c2: '#9b9286' };
    const uid = 'g' + Math.random().toString(36).slice(2, 8);
    return (
      '<svg viewBox="0 0 48 54" aria-hidden="true">' +
        '<defs><linearGradient id="' + uid + '" x1="0" y1="0" x2="0" y2="1">' +
          '<stop offset="0" stop-color="' + t.c2 + '"/>' +
          '<stop offset="1" stop-color="' + t.c1 + '"/>' +
        '</linearGradient></defs>' +
        '<path d="M24 2 44 10v16c0 14-10 22-20 26C14 48 4 40 4 26V10Z" ' +
              'fill="url(#' + uid + ')" opacity=".22"/>' +
        '<path d="M24 2 44 10v16c0 14-10 22-20 26C14 48 4 40 4 26V10Z" ' +
              'fill="none" stroke="url(#' + uid + ')" stroke-width="2.5"/>' +
      '</svg>'
    );
  }

  function tierText(q) {
    if (!q || !q.tier) return 'Unranked';
    const t = TIERS[q.tier];
    const name = t ? t.label : q.tier;
    const apex = q.tier === 'MASTER' || q.tier === 'GRANDMASTER' || q.tier === 'CHALLENGER';
    return apex || !q.division ? name : name + ' ' + q.division;
  }

  /* ------------------------------------------------------------ kuyruk satırı */
  function queueRow(key, q) {
    const row = document.createElement('div');
    row.className = 'q-row';
    row.dataset.tier = q.tier || 'UNRANKED';

    const badge = document.createElement('div');
    badge.className = 'q-emblem';
    badge.appendChild(emblem(q.tier));

    const info = document.createElement('div');
    info.className = 'q-info';

    const name = document.createElement('span');
    name.className = 'q-name';
    name.textContent = QUEUE_LABEL[key] || key;

    const tier = document.createElement('span');
    tier.className = 'q-tier';
    tier.textContent = tierText(q);
    if (q.lp != null && q.tier) {
      const lp = document.createElement('b');
      lp.textContent = q.lp + ' LP';
      tier.append(' ', lp);
    }

    const wl = document.createElement('span');
    wl.className = 'q-wl';
    if (q.wins + q.losses > 0) {
      wl.textContent = q.wins + 'W ' + q.losses + 'L · ' + q.winrate + '%';
      if (q.winrate >= 55) wl.classList.add('good');
      else if (q.winrate < 45) wl.classList.add('bad');
    } else {
      wl.textContent = 'no games';
    }

    info.append(name, tier, wl);
    row.append(badge, info);
    return row;
  }

  /* ------------------------------------------------------------- şampiyonlar */
  function champRow(list, title) {
    const box = document.createElement('div');
    box.className = 'champs';

    const h = document.createElement('span');
    h.className = 'champs-title';
    h.textContent = title;
    box.appendChild(h);

    const grid = document.createElement('div');
    grid.className = 'champs-grid';

    for (const c of list) {
      const item = document.createElement('div');
      item.className = 'champ';

      const pic = document.createElement('div');
      pic.className = 'champ-pic';
      if (c.icon) {
        const img = document.createElement('img');
        img.loading = 'lazy';
        img.alt = '';
        img.addEventListener('error', () => { img.remove(); pic.textContent = (c.name || '?')[0]; });
        img.src = c.icon;
        pic.appendChild(img);
      } else {
        pic.textContent = (c.name || '?')[0];
      }

      const nm = document.createElement('span');
      nm.className = 'champ-name';
      nm.textContent = c.name;

      const sub = document.createElement('span');
      sub.className = 'champ-sub';
      if (c.games != null) {
        sub.textContent = c.games + ' games · ' + c.winrate + '%';
        item.title = c.name + ' — ' + c.games + ' games, ' + c.winrate + '% win rate, ' + c.kda + ' KDA';
      } else if (c.points != null) {
        const pts = Math.round(c.points / 1000) + 'K';
        sub.textContent = c.level ? 'Lv ' + c.level + ' · ' + pts : pts + ' mastery';
        item.title = c.name + ' — mastery level ' + (c.level || '?') + ', ' +
                     c.points.toLocaleString('en-US') + ' points';
      }

      item.append(pic, nm, sub);
      grid.appendChild(item);
    }

    box.appendChild(grid);
    return box;
  }

  /* -------------------------------------------------------------------- akış */
  function render(data) {
    const host = document.getElementById('rank');
    if (!host) return;
    host.innerHTML = '';

    const queues = data.queues || {};
    const showFlex = cfg().showFlex !== false;

    if (queues.solo) host.appendChild(queueRow('solo', queues.solo));
    if (showFlex && queues.flex) host.appendChild(queueRow('flex', queues.flex));

    // Son maçlardan gerçek KDA (config.rank.showRecent ile kapatılabilir)
    if (cfg().showRecent !== false && data.recent && data.recent.games) {
      const r = data.recent;
      const line = document.createElement('div');
      line.className = 'recent';
      line.innerHTML =
        '<span class="k">last ' + r.games + ' games</span>' +
        '<span class="v">' + r.kda + ' KDA</span>' +
        '<span class="d">' + r.kills + ' / ' + r.deaths + ' / ' + r.assists + '</span>';
      host.appendChild(line);
    }

    // Son maçlarda en çok oynananlar
    if (cfg().showChamps !== false && data.champions && data.champions.length) {
      host.appendChild(champRow(data.champions, 'Most played recently'));
    }

    // En yüksek ustalık — son maç verisi yoksa tek başına da gösterilir
    if (cfg().showMastery !== false && data.mastery && data.mastery.length) {
      host.appendChild(champRow(data.mastery, 'Highest mastery'));
    }

    // Canlı veriyle çakışan elle yazılmış rozetleri kaldır
    const stats = document.getElementById('stats');
    if (stats) {
      const drop = ['rank'];
      if (data.champions && data.champions.length || data.mastery && data.mastery.length) drop.push('mains');
      if (data.recent && data.recent.games) drop.push('kda');
      drop.forEach((k) => {
        const el = stats.querySelector('[data-key="' + k + '"]');
        if (el) el.remove();
      });
      stats.hidden = stats.children.length === 0;
    }

    // Güncelleme zamanı
    if (data.updatedAt) {
      const t = document.getElementById('rank-updated');
      if (t) {
        const d = new Date(data.updatedAt);
        t.textContent = 'rank updated: ' + d.toLocaleString('en-GB', {
          day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
        });
        t.hidden = false;
      }
    }

    host.hidden = host.children.length === 0;
  }

  async function load() {
    if (cfg().enabled === false) return;
    const url = cfg().file || 'assets/rank.json';

    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) return;                     // dosya henüz yok — sessizce geç
      const data = await res.json();
      if (!data || !data.queues) return;
      render(data);
    } catch (e) {
      console.warn('[rank] could not load:', e.message);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
