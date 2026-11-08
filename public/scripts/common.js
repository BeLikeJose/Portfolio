/* Shared interactions: flash, toast, smooth scroll, reveal, counters, tabs, dial. Native cursor everywhere. */
(function () {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  window.$ = $; window.$$ = $$;

  /* ---------- base styles for shared components ---------- */
  const css = `
  .cur{position:fixed;left:0;top:0;width:16px;height:16px;margin:-8px 0 0 -8px;border-radius:50%;background:#fff;mix-blend-mode:difference;pointer-events:none;z-index:99999;transition:width .25s,height .25s,margin .25s}
  .cur.big{width:54px;height:54px;margin:-27px 0 0 -27px}
  .cur.down{width:10px;height:10px;margin:-5px 0 0 -5px}
  .trap-wrap{position:relative;width:100%;height:100%;display:flex;align-items:center;justify-content:center}
  .trap{height:100%;width:auto;overflow:visible;filter:drop-shadow(18px 22px 18px rgba(0,0,0,.28));transform:translateX(140%) rotate(8deg);transition:transform 1.3s cubic-bezier(.16,1,.3,1)}
  .trap.in{transform:none}
  .trap #bail{transform-box:view-box;transform-origin:150px 300px;transition:transform .11s cubic-bezier(.8,0,1,.6)}
  .trap.set #bail{transform:scaleY(-1)}
  .trap #bar{transform-box:view-box;transform-origin:150px 44px;transition:transform .18s ease-out}
  .trap.snapped #bar{transform:rotate(9deg)}
  .trap.jolt{animation:jolt .4s}
  @keyframes jolt{15%{transform:translate(-9px,6px) rotate(-2deg)}35%{transform:translate(7px,-4px) rotate(1.4deg)}55%{transform:translate(-4px,2px) rotate(-.6deg)}100%{transform:none}}
  .flash{position:fixed;inset:0;background:#fff;opacity:0;pointer-events:none;z-index:9000;transition:opacity .5s}
  .flash.on{opacity:.9;transition:none}
  .trap-label{position:absolute;white-space:nowrap;transition:opacity .3s}
  .trap.snapped~.trap-label{opacity:0}
  .trap-msg{position:absolute;opacity:0;transform:translateY(14px);transition:.5s;pointer-events:none}
  .trap-msg.on{opacity:1;transform:none;pointer-events:auto}
  .dial{width:100%;height:auto;touch-action:none;user-select:none;overflow:visible}
  .dial .hole{transition:filter .2s}
  .dial .hole:hover{filter:brightness(1.08)}
  [data-r]{opacity:0;transform:translateY(40px);transition:opacity 1s cubic-bezier(.16,1,.3,1),transform 1s cubic-bezier(.16,1,.3,1)}
  [data-r].vis{opacity:1;transform:none}
  .view[hidden]{display:none}
  .curtain{position:fixed;inset:0;z-index:9500;transform:translateY(100%);pointer-events:none}
  .curtain.go{animation:curtain 1.1s cubic-bezier(.76,0,.24,1)}
  @keyframes curtain{0%{transform:translateY(100%)}45%,55%{transform:translateY(0)}100%{transform:translateY(-100%)}}
  .toast{position:fixed;left:50%;bottom:36px;transform:translate(-50%,30px);opacity:0;z-index:9600;transition:.4s;pointer-events:none}
  .toast.on{opacity:1;transform:translate(-50%,0)}
  .intro{position:fixed;inset:0;z-index:99990;display:flex;align-items:center;justify-content:center;transition:transform 1s cubic-bezier(.76,0,.24,1)}
  .intro.out{transform:translateY(-100%)}
  .tc-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#e22;margin-right:6px;animation:blink 1s steps(2) infinite}
  @keyframes blink{50%{opacity:0}}
  .marquee{overflow:hidden;white-space:nowrap}
  .marquee>div{display:inline-flex;animation:mq 28s linear infinite}
  @keyframes mq{to{transform:translateX(-50%)}}
  `;
  const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------- helpers ---------- */
  const flash = document.createElement('div'); flash.className = 'flash'; document.body.appendChild(flash);
  window.doFlash = () => { flash.classList.add('on'); requestAnimationFrame(() => requestAnimationFrame(() => flash.classList.remove('on'))); };
  const toast = document.createElement('div'); toast.className = 'toast'; document.body.appendChild(toast);
  window.showToast = (t) => { toast.textContent = t; toast.classList.add('on'); clearTimeout(toast._t); toast._t = setTimeout(() => toast.classList.remove('on'), 2600); };

  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  window.smoothTo = (target, dur = 1400) => new Promise(res => {
    const y0 = scrollY;
    const y1 = typeof target === 'number' ? target : (typeof target === 'string' ? $(target) : target).getBoundingClientRect().top + scrollY - (window.SCROLL_OFFSET || 0);
    const t0 = performance.now();
    (function f(now) { const t = Math.min(1, (now - t0) / dur); scrollTo(0, y0 + (y1 - y0) * ease(t)); t < 1 ? requestAnimationFrame(f) : res(); })(t0);
  });

  /* reveal on scroll */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target); } }), { threshold: .12 });
  const observeAll = () => $$('[data-r]:not(.vis)').forEach(el => io.observe(el));

  /* counters */
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, to = +el.dataset.count, pad = el.dataset.pad || 0, t0 = performance.now();
    (function f(n) { const t = Math.min(1, (n - t0) / 1600); el.textContent = String(Math.round(to * ease(t))).padStart(pad, '0') + (el.dataset.suffix || ''); if (t < 1) requestAnimationFrame(f); })(t0);
  }), { threshold: .4 });

  /* timecodes */
  const t0 = performance.now();
  (function tc() {
    const s = (performance.now() - t0) / 1000;
    $$('.tc').forEach((el, i) => { const x = s + i * 13.7; const f = Math.floor((x % 1) * 24), ss = Math.floor(x) % 60, mm = Math.floor(x / 60) % 60; el.textContent = `00:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}:${String(f).padStart(2, '0')}`; });
    requestAnimationFrame(tc);
  })();

  /* tabs */
  window.setTab = (group, name) => {
    const g = typeof group === 'string' ? $(group) : group;
    $$('[data-tab]', g).forEach(b => b.classList.toggle('on', b.dataset.tab === name));
    $$('[data-panel]', g).forEach(p => { const on = p.dataset.panel === name; p.classList.toggle('on', on); });
  };
  document.addEventListener('click', e => { const b = e.target.closest('[data-tab]'); if (b) setTab(b.closest('[data-tabs]'), b.dataset.tab); });

  /* views (home / admin / propuesta) */
  const curtain = document.createElement('div'); curtain.className = 'curtain'; document.body.appendChild(curtain);
  window.go = (view) => new Promise(res => {
    curtain.classList.remove('go'); void curtain.offsetWidth; curtain.classList.add('go');
    setTimeout(() => {
      $$('.view').forEach(v => v.hidden = v.dataset.view !== view);
      scrollTo(0, 0); observeAll(); $$('[data-count]').forEach(el => { el.textContent = '0'; cio.observe(el); });
      document.body.dataset.view = view;
    }, 520);
    setTimeout(res, 1150);
  });
  document.addEventListener('click', e => { const a = e.target.closest('[data-go]'); if (a) { e.preventDefault(); go(a.dataset.go); } });
  document.addEventListener('click', e => { const a = e.target.closest('a[href^="#"]'); if (a && a.getAttribute('href').length > 1 && $(a.getAttribute('href'))) { e.preventDefault(); smoothTo(a.getAttribute('href')); } });

  /* copy-link buttons & calendly mock */
  document.addEventListener('click', e => {
    const c = e.target.closest('[data-copy]'); if (c) { showToast('link copiado — ' + c.dataset.copy); c.textContent = 'copiado'; setTimeout(() => c.textContent = 'copiar link', 2000); }
    const s = e.target.closest('.slot'); if (s) { $$('.slot').forEach(x => x.classList.remove('on')); s.classList.add('on'); const cf = $('.cal-confirm'); if (cf) { cf.querySelector('b').textContent = s.dataset.when; cf.classList.add('on'); } }
    const d = e.target.closest('.cal-day'); if (d && !d.classList.contains('off')) { $$('.cal-day').forEach(x => x.classList.remove('on')); d.classList.add('on'); }
  });

  /* ---------- pixel hand ---------- */
  const HAND = [
    '     11          ',
    '    1221         ',
    '    1221         ',
    '    1221         ',
    '    1221         ',
    '    122111       ',
    '    1221221111   ',
    '    12212212211  ',
    ' 11 122122122121 ',
    '1221122222222221 ',
    '1222122222222221 ',
    ' 122222222222221 ',
    '  12222222222221 ',
    '  1222222222221  ',
    '   122222222221  ',
    '   12222222221   ',
    '    122222221    ',
    '    122222221    ',
    '    111111111    '];
  window.handRects = (ink = '#000', fill = '#fff') => HAND.map((row, y) => [...row].map((c, x) => c === '1' ? `<rect x="${x}" y="${y}" width="1.04" height="1.04" fill="${ink}"/>` : c === '2' ? `<rect x="${x}" y="${y}" width="1.04" height="1.04" fill="${fill}"/>` : '').join('')).join('');

  /* ---------- mousetrap ---------- */
  window.buildTrap = (host, o = {}) => {
    let grain = '';
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 46; i++) {
      const x = 58 + rnd() * 184, w = rnd() * 6 - 3; let d = `M${x} 22`;
      for (let y = 60; y <= 500; y += 40) d += ` Q${x + w + rnd() * 4 - 2} ${y - 20} ${x + w * Math.sin(y / 90)} ${y}`;
      grain += `<path d="${d}" stroke="#2a2016" stroke-opacity="${.05 + rnd() * .14}" stroke-width="${.4 + rnd() * 1.4}" fill="none"/>`;
    }
    let coils = '';
    for (let i = 0; i < 15; i++) coils += `<ellipse cx="${92 + i * 8.4}" cy="300" rx="4.2" ry="12" fill="none" stroke="url(#metal)" stroke-width="3.2"/>`;
    const wood = o.wood || ['#c9c2b6', '#ddd7cc', '#bfb8ac'];
    host.innerHTML = `
    <div class="trap-wrap">
      <svg class="trap set" viewBox="0 0 300 520" aria-label="trampa de ratón interactiva">
        <defs>
          <linearGradient id="wood" x1="0" x2="1"><stop offset="0" stop-color="${wood[0]}"/><stop offset=".5" stop-color="${wood[1]}"/><stop offset="1" stop-color="${wood[2]}"/></linearGradient>
          <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7f7f5"/><stop offset=".35" stop-color="#8d8d8a"/><stop offset=".6" stop-color="#e8e8e4"/><stop offset="1" stop-color="#6f6f6c"/></linearGradient>
        </defs>
        <rect x="55" y="20" width="190" height="480" rx="3" fill="url(#wood)"/>
        <g clip-path="inset(0)">${grain}</g>
        <rect x="55" y="20" width="190" height="480" rx="3" fill="none" stroke="#000" stroke-opacity=".12"/>
        <line x1="52" y1="300" x2="248" y2="300" stroke="url(#metal)" stroke-width="3.5"/>
        <path d="M232 300 L262 420" stroke="url(#metal)" stroke-width="3" fill="none" stroke-linecap="round"/>
        <rect x="126" y="318" width="48" height="22" rx="2" fill="url(#metal)" stroke="#555" stroke-width=".6"/>
        <path d="M140 318 q10 -14 20 0" stroke="url(#metal)" stroke-width="3" fill="none"/>
        <g class="hand" transform="translate(98 328) scale(6)">${handRects()}</g>
        ${coils}
        <g id="bail"><path d="M58 300 L58 446 L242 446 L242 300" stroke="url(#metal)" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>
        <g id="bar"><path d="M150 44 q-10 -16 6 -20 q12 0 4 14" stroke="url(#metal)" stroke-width="3" fill="none"/><line x1="150" y1="44" x2="150" y2="324" stroke="url(#metal)" stroke-width="3.4" stroke-linecap="round"/></g>
      </svg>
      <div class="trap-label">${o.label || 'no toques aquí'}</div>
      <div class="trap-msg"><div class="msg-txt"></div>${o.reset ? `<button class="trap-reset">${o.reset}</button>` : ''}</div>
    </div>`;
    const svg = $('.trap', host), msg = $('.trap-msg', host), txt = $('.msg-txt', host);
    setTimeout(() => svg.classList.add('in'), o.delay ?? 600);
    let typing;
    const snap = () => {
      if (svg.classList.contains('snapped')) return;
      svg.classList.remove('set'); svg.classList.add('snapped');
      setTimeout(() => { svg.classList.add('jolt'); doFlash(); }, 90);
      setTimeout(() => svg.classList.remove('jolt'), 520);
      setTimeout(() => {
        msg.classList.add('on'); const full = o.msg || ''; let i = 0; clearInterval(typing);
        typing = setInterval(() => { i++; txt.innerHTML = full.slice(0, i).replace(/\n/g, '<br>') + '<span style="opacity:.5">▍</span>'; if (i >= full.length) { clearInterval(typing); txt.innerHTML = full.replace(/\n/g, '<br>'); } }, 24);
      }, 650);
    };
    svg.addEventListener('click', snap);
    const r = $('.trap-reset', host);
    if (r) r.addEventListener('click', () => { msg.classList.remove('on'); svg.classList.remove('snapped'); setTimeout(() => svg.classList.add('set'), 50); });
    return { snap };
  };

  /* ---------- rotary dial ---------- */
  window.buildDial = (host, o = {}) => {
    const C = 300, R = 226, HR = 46;
    const ang = d => -30 - 30 * ((d + 9) % 10); // digit 1 at 2 o'clock, 0 near 4 o'clock
    const maxRot = d => 49 + 30 * ((d + 9) % 10);
    let brush = '', seed = 3; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < 140; i++) { const r = 150 + rnd() * 140, a0 = rnd() * 360, a1 = a0 + 20 + rnd() * 60; const p = a => [C + r * Math.cos(a * Math.PI / 180), C + r * Math.sin(a * Math.PI / 180)]; const [x0, y0] = p(a0), [x1, y1] = p(a1); brush += `<path d="M${x0} ${y0} A${r} ${r} 0 0 1 ${x1} ${y1}" stroke="${rnd() > .5 ? '#fff' : '#000'}" stroke-opacity="${.04 + rnd() * .1}" stroke-width="${.5 + rnd()}" fill="none"/>`; }
    let holes = '';
    for (let d = 0; d < 10; d++) {
      const a = ang(d) * Math.PI / 180, x = C + R * Math.cos(a), y = C + R * Math.sin(a);
      holes += `<g class="hole" data-d="${d}"><circle cx="${x}" cy="${y}" r="${HR + 5}" fill="url(#rim)"/><circle cx="${x}" cy="${y}" r="${HR}" fill="${o.holeFill || '#e9e6df'}"/><circle cx="${x}" cy="${y}" r="${HR}" fill="url(#holeShade)"/><text x="${x}" y="${y + 19}" text-anchor="middle" font-size="54" font-weight="700" font-family="${o.numFont || 'Archivo, Inter, sans-serif'}" fill="#111">${d}</text></g>`;
    }
    const sa = 33 * Math.PI / 180;
    host.innerHTML = `
    <svg class="dial" viewBox="0 0 600 600">
      <defs>
        <linearGradient id="dm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d9d6ce"/><stop offset=".3" stop-color="#8b877e"/><stop offset=".55" stop-color="#efece5"/><stop offset=".8" stop-color="#7c786f"/><stop offset="1" stop-color="#cfcbc2"/></linearGradient>
        <linearGradient id="dm2" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ece9e2"/><stop offset=".4" stop-color="#9a968d"/><stop offset=".7" stop-color="#e2ded6"/><stop offset="1" stop-color="#85817a"/></linearGradient>
        <linearGradient id="rim" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#8a867e"/><stop offset="1" stop-color="#f2efe8"/></linearGradient>
        <radialGradient id="holeShade" cx=".45" cy=".4" r=".6"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".28"/></radialGradient>
        <filter id="ds"><feDropShadow dx="0" dy="10" stdDeviation="12" flood-opacity=".5"/></filter>
      </defs>
      <circle cx="${C}" cy="${C}" r="296" fill="url(#dm)" filter="url(#ds)"/>
      <g id="wheel">
        <circle cx="${C}" cy="${C}" r="282" fill="url(#dm2)"/>
        ${brush}
        ${holes}
      </g>
      <circle cx="${C}" cy="${C}" r="150" fill="url(#rim)"/>
      <circle cx="${C}" cy="${C}" r="141" fill="${o.centerFill || '#ece9e2'}"/>
      <circle cx="${C}" cy="${C}" r="128" fill="none" stroke="#000" stroke-opacity=".12"/>
      <foreignObject x="${C - 120}" y="${C - 100}" width="240" height="200"><div xmlns="http://www.w3.org/1999/xhtml" class="dial-center">${o.center || ''}</div></foreignObject>
      <path d="M${C + 250 * Math.cos(sa)} ${C + 250 * Math.sin(sa)} L${C + 318 * Math.cos(sa + .05)} ${C + 318 * Math.sin(sa + .05)} L${C + 300 * Math.cos(sa - .13)} ${C + 300 * Math.sin(sa - .13)} Z" fill="url(#rim)" stroke="#555" stroke-width="1"/>
    </svg>`;
    const svg = $('svg', host), wheel = $('#wheel', svg), center = $('.dial-center', svg);
    let rot = 0, drag = null, anim, busy = false;
    const setRot = r => { rot = r; wheel.setAttribute('transform', `rotate(${r} ${C} ${C})`); };
    const pAng = e => { const b = svg.getBoundingClientRect(); return Math.atan2(e.clientY - (b.top + b.height / 2), e.clientX - (b.left + b.width / 2)) * 180 / Math.PI; };
    // sounds: ratchet ticks on the way back, a soft thunk at the finger stop
    const ac = () => (window.__ac ||= new (window.AudioContext || window.webkitAudioContext)());
    const click = (f = 2600, v = .07, d = .018) => { try { const A = ac(), t = A.currentTime, o2 = A.createOscillator(), g = A.createGain(); o2.type = 'square'; o2.frequency.value = f; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.0001, t + d); o2.connect(g).connect(A.destination); o2.start(t); o2.stop(t + d + .01); } catch (e) {} };
    const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    const back = () => {                     // the wheel returns by itself, one tick per number
      const r0 = rot, t0 = performance.now(), dur = Math.max(250, r0 / 260 * 1000); let step = Math.floor(r0 / 30);
      (function f(n) {
        const t = Math.min(1, (n - t0) / dur); setRot(r0 * (1 - t));
        const s2 = Math.floor(rot / 30); if (s2 < step) { step = s2; click(); }
        if (t < 1) anim = requestAnimationFrame(f); else busy = false;
      })(t0);
    };
    const finish = (d, from) => {             // spin to the finger stop, connect, return
      busy = true; cancelAnimationFrame(anim);
      const max = maxRot(d), r0 = from, t0 = performance.now(), dur = 180 + (max - r0) * 2.4;
      (function f(n) {
        const t = Math.min(1, (n - t0) / dur); setRot(r0 + (max - r0) * ease(t));
        if (t < 1) anim = requestAnimationFrame(f);
        else { click(140, .25, .12); o.onDial && o.onDial(d, center); setTimeout(back, 260); }
      })(t0);
    };
    const dial = d => { if (busy) return; o.onStart && o.onStart(d); finish(d, rot); };
    svg.addEventListener('pointerdown', e => {
      const h = e.target.closest('.hole'); if (!h || busy) return; e.preventDefault(); cancelAnimationFrame(anim);
      drag = { d: +h.dataset.d, last: pAng(e), max: maxRot(+h.dataset.d), moved: 0 }; svg.setPointerCapture(e.pointerId);
      o.onStart && o.onStart(drag.d);
    });
    svg.addEventListener('pointermove', e => {
      if (!drag) return; const a = pAng(e); let dl = a - drag.last; if (dl > 180) dl -= 360; if (dl < -180) dl += 360; drag.last = a;
      drag.moved += Math.abs(dl);
      setRot(Math.max(0, Math.min(drag.max, rot + dl)));
    });
    const release = () => {
      if (!drag) return; const { d, max, moved } = drag; drag = null;
      if (moved < 8 || rot >= max * .6) finish(d, rot);   // a tap dials by itself; a drag past 60% completes
      else { busy = true; back(); }
    };
    svg.addEventListener('pointerup', release); svg.addEventListener('pointercancel', release);
    window.__dialGeom = d => { const b = svg.getBoundingClientRect(), s = b.width / 600; return { cx: b.left + b.width / 2, cy: b.top + b.height / 2, r: R * s, a: ang(d) + rot, max: maxRot(d) }; };
    return { center, dial };
  };

  /* boot */
  addEventListener('load', () => {
    observeAll(); $$('[data-count]').forEach(el => { el.textContent = '0'; cio.observe(el); });
    const intro = $('.intro');
    if (intro) { if (/intro/.test(location.search)) setTimeout(() => intro.classList.add('out'), 2300); else intro.remove(); }
    const h = location.hash.slice(1); if (['admin', 'propuesta'].includes(h)) { $$('.view').forEach(v => v.hidden = v.dataset.view !== h); }
  });
})();

/* videos lejos de la pantalla: se descargan solo cuando la sección se acerca */
(function () {
  const vids = document.querySelectorAll('video[data-lazy-video]');
  if (!vids.length) return;
  const go = (v) => { v.preload = 'auto'; try { v.load(); } catch (e) {} };
  if (!('IntersectionObserver' in window)) { vids.forEach(go); return; }
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { go(e.target); io.unobserve(e.target); } }), { rootMargin: '900px 0px' });
  vids.forEach((v) => io.observe(v));
})();
