/* ============================================================================
   Riot API -> assets/rank.json
   ----------------------------------------------------------------------------
   GitHub Actions içinde çalışır. API anahtarı repo secret'ından gelir,
   hiçbir zaman istemciye (tarayıcıya) gitmez.

   Gerekli ortam değişkenleri:
     RIOT_API_KEY   (secret)  RGAPI-...
     RIOT_ID                  "Antimon#EUW"   (oyun adı # tag)
     PLATFORM                 euw1 | eun1 | tr1 | na1 ...
     REGION                   europe | americas | asia | sea
     MATCH_COUNT              son kaç ranked maç incelensin (varsayılan 20)
   ========================================================================== */

import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const KEY = process.env.RIOT_API_KEY;
const RIOT_ID = process.env.RIOT_ID || '';
const PLATFORM = (process.env.PLATFORM || 'euw1').toLowerCase();
const REGION = (process.env.REGION || 'europe').toLowerCase();
const MATCH_COUNT = Math.min(Number(process.env.MATCH_COUNT || 20) || 20, 50);
const OUT = resolve(process.cwd(), 'assets/rank.json');

const QUEUE_SOLO = 420;

/** Ölümcül hata: uçuşan istekleri process.exit ile kesmemek için fırlatılır. */
class Fatal extends Error {}
function fail(msg) {
  throw new Fatal(msg);
}


/* --------------------------------------------------------------- istekler */
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Riot API çağrısı. 429'da Retry-After'a uyar, 404'te null döner.
 * Zorunlu olmayan uçlar için throwOn404=false bırakılır ki tek bir eksik
 * veri tüm çalışmayı düşürmesin.
 */
async function api(url, { tries = 3, required = false } = {}) {
  for (let i = 0; i < tries; i++) {
    const res = await fetch(url, { headers: { 'X-Riot-Token': KEY } });

    if (res.status === 429) {
      const wait = Number(res.headers.get('retry-after') || 5);
      console.warn(`429 rate limit, ${wait}s bekleniyor...`);
      await sleep((wait + 1) * 1000);
      continue;
    }

    if (res.status === 404) return null;

    if (res.status === 401 || res.status === 403) {
      fail(`API anahtarı reddedildi (${res.status}). Development key 24 saatte bir expire olur; ` +
           'kalıcı site için Personal API Key başvurusu gerekir.');
    }

    if (!res.ok) {
      if (i === tries - 1) {
        const msg = `${res.status} ${res.statusText} — ${url.replace(KEY, '***')}`;
        if (required) fail(msg);
        console.warn('atlanıyor: ' + msg);
        return null;
      }
      await sleep(1500);
      continue;
    }

    return res.json();
  }
  return null;
}

async function json(url) {
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

/* ------------------------------------------------------------ Data Dragon */
async function loadChampionMap() {
  const versions = await json('https://ddragon.leagueoflegends.com/api/versions.json');
  const version = Array.isArray(versions) && versions[0] ? versions[0] : null;
  if (!version) return { version: null, byKey: new Map() };

  const data = await json(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`);

  const byKey = new Map();
  if (data && data.data) {
    for (const c of Object.values(data.data)) {
      byKey.set(Number(c.key), { id: c.id, name: c.name });
    }
  }
  return { version, byKey };
}

const iconUrl = (version, id) =>
  version && id ? `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${id}.png` : null;

/* ------------------------------------------------------------------ yardım */
function entryToQueue(e) {
  const wins = e.wins || 0;
  const losses = e.losses || 0;
  const total = wins + losses;
  return {
    tier: e.tier || null,
    division: e.rank || null,
    lp: e.leaguePoints == null ? null : e.leaguePoints,
    wins,
    losses,
    winrate: total ? Math.round((wins / total) * 100) : null,
    hotStreak: !!e.hotStreak,
  };
}

function kdaOf(k, d, a) {
  return Number(((k + a) / Math.max(1, d)).toFixed(2));
}

/* -------------------------------------------------------------------- akış */
async function main() {
  if (!KEY) fail('RIOT_API_KEY tanımlı değil.');
  if (!RIOT_ID.includes('#')) {
    fail('RIOT_ID "OyunAdi#TAG" biçiminde olmalı. Gelen: ' + JSON.stringify(RIOT_ID));
  }
  const [gameName, tagLine] = RIOT_ID.split('#');

  const out = {
    updatedAt: new Date().toISOString(),
    riotId: RIOT_ID,
    platform: PLATFORM,
    queues: {},
    recent: null,
    champions: [],
    mastery: [],
  };

  // 1) Riot ID -> PUUID
  const account = await api(
    `https://${REGION}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/` +
    `${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
    { required: true }
  );
  if (!account || !account.puuid) fail(`Riot ID bulunamadı: ${RIOT_ID} (REGION=${REGION})`);

  const puuid = account.puuid;
  out.riotId = `${account.gameName}#${account.tagLine}`;
  console.log('PUUID alındı:', out.riotId);

  const { version, byKey } = await loadChampionMap();
  out.ddragonVersion = version;

  // 2) Rank girdileri (solo + flex)
  const entries = await api(
    `https://${PLATFORM}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`
  );
  for (const e of entries || []) {
    if (e.queueType === 'RANKED_SOLO_5x5') out.queues.solo = entryToQueue(e);
    if (e.queueType === 'RANKED_FLEX_SR') out.queues.flex = entryToQueue(e);
  }
  console.log('Rank girdileri:', Object.keys(out.queues).join(', ') || 'yok (unranked)');

  // 3) Şampiyon ustalığı (en çok oynanan 3)
  const mastery = await api(
    `https://${PLATFORM}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/` +
    `by-puuid/${puuid}/top?count=3`
  );
  for (const m of mastery || []) {
    const champ = byKey.get(Number(m.championId));
    out.mastery.push({
      id: champ ? champ.id : null,
      name: champ ? champ.name : `#${m.championId}`,
      points: m.championPoints || 0,
      level: m.championLevel || 0,
      icon: iconUrl(version, champ && champ.id),
    });
  }

  // 4) Son ranked maçlar -> gerçek KDA + son dönem en çok oynananlar
  const ids = await api(
    `https://${REGION}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids` +
    `?queue=${QUEUE_SOLO}&start=0&count=${MATCH_COUNT}`
  );

  if (Array.isArray(ids) && ids.length) {
    let k = 0, d = 0, a = 0, wins = 0, seen = 0;
    const perChamp = new Map();

    for (const id of ids) {
      const match = await api(`https://${REGION}.api.riotgames.com/lol/match/v5/matches/${id}`);
      if (!match || !match.info) continue;

      const me = (match.info.participants || []).find((p) => p.puuid === puuid);
      if (!me) continue;

      seen++;
      k += me.kills || 0;
      d += me.deaths || 0;
      a += me.assists || 0;
      if (me.win) wins++;

      const key = me.championName || `#${me.championId}`;
      const row = perChamp.get(key) || { games: 0, wins: 0, k: 0, d: 0, a: 0, championId: me.championId };
      row.games++;
      if (me.win) row.wins++;
      row.k += me.kills || 0;
      row.d += me.deaths || 0;
      row.a += me.assists || 0;
      perChamp.set(key, row);

      await sleep(120); // rate limit'e nazik davran
    }

    if (seen) {
      out.recent = {
        games: seen,
        wins,
        losses: seen - wins,
        winrate: Math.round((wins / seen) * 100),
        kills: Number((k / seen).toFixed(1)),
        deaths: Number((d / seen).toFixed(1)),
        assists: Number((a / seen).toFixed(1)),
        kda: kdaOf(k, d, a),
        queue: 'Ranked Solo/Duo',
      };

      out.champions = [...perChamp.entries()]
        .sort((x, y) => y[1].games - x[1].games || y[1].wins - x[1].wins)
        .slice(0, 3)
        .map(([name, r]) => {
          const champ = byKey.get(Number(r.championId));
          return {
            id: champ ? champ.id : name,
            name: champ ? champ.name : name,
            games: r.games,
            wins: r.wins,
            winrate: Math.round((r.wins / r.games) * 100),
            kda: kdaOf(r.k, r.d, r.a),
            icon: iconUrl(version, champ ? champ.id : name),
          };
        });
    }
    console.log(`Maç analizi: ${seen}/${ids.length} maç okundu.`);
  } else {
    console.log('Son ranked maç bulunamadı.');
  }

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log('Yazıldı:', OUT);
}

main().catch((e) => {
  console.error('HATA: ' + (e instanceof Fatal ? e.message : (e && e.stack) || String(e)));
  process.exitCode = 1;
});
