/* ============================================================================
   MÜZİK ÇALAR — çalma listesi, ileri/geri, ses hafızası
   Çalma listesi boşsa arayüz gizlenir ve site sorunsuz çalışmaya devam eder.
   ========================================================================== */

class Player {
  constructor(tracks, opts) {
    this.tracks = Array.isArray(tracks) ? tracks.slice() : [];
    this.opts = opts || {};
    this.index = 0;
    this.playing = false;

    this.el = {
      bar:    document.getElementById('player'),
      audio:  document.getElementById('audio'),
      prev:   document.getElementById('prev'),
      next:   document.getElementById('next'),
      toggle: document.getElementById('toggle'),
      mute:   document.getElementById('mute'),
      vol:    document.getElementById('volume'),
      name:   document.getElementById('track-name'),
      track:  document.getElementById('track'),
    };

    if (!this.tracks.length) {
      this.el.bar.hidden = true;
      return;                                  // çalar hiç kurulmaz
    }

    if (this.opts.shuffle) this._shuffle();

    this.el.bar.hidden = false;
    this._restoreVolume();
    this._bind();
    this.load(0, false);
  }

  /* ------------------------------------------------------------ yardımcı */
  _shuffle() {
    for (let i = this.tracks.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.tracks[i], this.tracks[j]] = [this.tracks[j], this.tracks[i]];
    }
  }

  _store(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* gizli sekme */ }
  }

  _read(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  _restoreVolume() {
    const saved = parseInt(this._read('ka_volume'), 10);
    const def = this.opts.defaultVolume == null ? 45 : this.opts.defaultVolume;
    const v = Number.isFinite(saved) ? saved : def;
    const muted = this._read('ka_muted') === '1';

    this.el.vol.value = v;
    this.el.audio.volume = Math.max(0, Math.min(1, v / 100));
    this.el.audio.muted = muted;
    this._paintVolume();
    this._paintMute();
  }

  _paintVolume() {
    // slider dolgusunu değere göre boya
    this.el.vol.style.setProperty('--fill', this.el.vol.value + '%');
  }

  _paintMute() {
    const m = this.el.audio.muted || this.el.audio.volume === 0;
    this.el.bar.classList.toggle('is-muted', m);
    this.el.mute.setAttribute('aria-label', m ? 'Unmute' : 'Mute');
  }

  _paintPlay() {
    this.el.bar.classList.toggle('is-playing', this.playing);
    this.el.toggle.setAttribute('aria-label', this.playing ? 'Pause' : 'Play');
  }

  /* ------------------------------------------------------------- olaylar */
  _bind() {
    const a = this.el.audio;

    this.el.toggle.addEventListener('click', () => this.toggle());
    this.el.next.addEventListener('click', () => this.next(true));
    this.el.prev.addEventListener('click', () => this.prev());

    this.el.mute.addEventListener('click', () => {
      a.muted = !a.muted;
      this._store('ka_muted', a.muted ? '1' : '0');
      this._paintMute();
    });

    this.el.vol.addEventListener('input', () => {
      const v = parseInt(this.el.vol.value, 10) || 0;
      a.volume = Math.max(0, Math.min(1, v / 100));
      if (v > 0 && a.muted) { a.muted = false; this._store('ka_muted', '0'); }
      this._store('ka_volume', String(v));
      this._paintVolume();
      this._paintMute();
    });

    a.addEventListener('ended', () => this.next(true));
    a.addEventListener('play',  () => { this.playing = true;  this._paintPlay(); });
    a.addEventListener('pause', () => { this.playing = false; this._paintPlay(); });

    a.addEventListener('error', () => {
      const t = this.tracks[this.index];
      console.warn('[player] Could not load file:', t && t.src);
      this.el.name.textContent = 'file not found';
      this.el.bar.classList.add('has-error');
    });

    // boşluk tuşu ile oynat/duraklat (yazı alanında değilken)
    document.addEventListener('keydown', (e) => {
      if (e.code !== 'Space') return;
      const tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) return;
      if (!document.body.classList.contains('entered')) return;
      e.preventDefault();
      this.toggle();
    });
  }

  /* ------------------------------------------------------------ kontrol */
  load(i, autoplay) {
    if (!this.tracks.length) return;
    this.index = ((i % this.tracks.length) + this.tracks.length) % this.tracks.length;

    const t = this.tracks[this.index];
    const label = t.artist ? t.artist + ' — ' + t.title : (t.title || 'Track ' + (this.index + 1));

    this.el.bar.classList.remove('has-error');
    this.el.audio.src = t.src;
    this.el.name.textContent = label;
    this.el.track.title = label;

    // uzun isim kayan yazı olsun
    this.el.name.classList.toggle('marquee', label.length > 26);

    if (autoplay) this.play();
  }

  play() {
    if (!this.tracks.length) return;
    const p = this.el.audio.play();
    if (p && typeof p.catch === 'function') {
      p.catch(() => {
        // tarayıcı engelledi ya da dosya yok — sessizce duraklatılmış kal
        this.playing = false;
        this._paintPlay();
      });
    }
  }

  pause() { this.el.audio.pause(); }

  toggle() { this.playing ? this.pause() : this.play(); }

  next(autoplay) { this.load(this.index + 1, autoplay !== false); }

  prev() {
    // 3 saniyeden sonra "geri" = parçayı başa sar
    if (this.el.audio.currentTime > 3) { this.el.audio.currentTime = 0; return; }
    this.load(this.index - 1, true);
  }
}
