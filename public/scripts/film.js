/* Procedural "film stills" used as stand-ins for real photos/videos in the mockup.
   <div class="film" data-scene="park" data-seed="3" data-video></div> */
(function () {
  const rng = seed => { let s = (seed * 9301 + 49297) % 233280 || 1; return () => (s = (s * 16807) % 2147483647) / 2147483647; };
  const blur = (ctx, b, fn) => { ctx.save(); ctx.filter = `blur(${b}px)`; fn(); ctx.restore(); };
  const circle = (ctx, x, y, r, c) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); };
  const lin = (ctx, x0, y0, x1, y1, stops) => { const g = ctx.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; };
  const rad = (ctx, x, y, r0, r1, stops) => { const g = ctx.createRadialGradient(x, y, r0, x, y, r1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; };
  function person(ctx, cx, base, h, color, b = 2, lit) {
    blur(ctx, b, () => {
      const hr = h * .1; ctx.fillStyle = color;
      ctx.beginPath(); ctx.ellipse(cx, base - h + hr, hr * .82, hr, 0, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx - hr * .5, base - h + hr * 1.8);
      ctx.quadraticCurveTo(cx - h * .3, base - h + hr * 2.4, cx - h * .31, base - h * .5);
      ctx.lineTo(cx - h * .27, base + 10); ctx.lineTo(cx + h * .27, base + 10); ctx.lineTo(cx + h * .31, base - h * .5);
      ctx.quadraticCurveTo(cx + h * .3, base - h + hr * 2.4, cx + hr * .5, base - h + hr * 1.8); ctx.closePath(); ctx.fill();
      if (lit) { ctx.fillStyle = lit; ctx.beginPath(); ctx.ellipse(cx + hr * .25, base - h + hr * 1.05, hr * .5, hr * .72, 0, 0, 7); ctx.fill(); }
    });
  }
  const S = {
    bokeh(ctx, w, h, r) {
      ctx.fillStyle = lin(ctx, 0, 0, w, h, [[0, '#14110d'], [1, '#050404']]); ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 26; i++) { const x = r() * w, y = r() * h * .8, rr = 8 + r() * w * .05; blur(ctx, 3 + r() * 10, () => { ctx.globalAlpha = .25 + r() * .6; circle(ctx, x, y, rr, r() > .3 ? '#f0b866' : '#f6e7c8'); }); }
      blur(ctx, 6, () => { ctx.globalAlpha = .95; circle(ctx, w * .5, h * .25, w * .07, '#f3c27a'); });
      blur(ctx, 14, () => { ctx.fillStyle = '#2a1d14'; ctx.beginPath(); ctx.ellipse(w * .48, h * .85, w * .2, h * .35, -.3, 0, 7); ctx.fill(); });
      blur(ctx, 4, () => { ctx.fillStyle = '#9a7559'; ctx.beginPath(); ctx.ellipse(w * .47, h * .6, w * .06, h * .2, -.15, 0, 7); ctx.fill(); ctx.fillStyle = '#c7c7c2'; ctx.fillRect(w * .5, h * .38, w * .025, h * .18); });
    },
    park(ctx, w, h, r) {
      ctx.fillStyle = lin(ctx, 0, 0, 0, h, [[0, '#0c120d'], [.55, '#1a2318'], [.7, '#0a0b09'], [1, '#2a1410']]); ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 70; i++) blur(ctx, 6 + r() * 14, () => { ctx.globalAlpha = .25 + r() * .4; circle(ctx, r() * w, r() * h * .55, 10 + r() * w * .08, ['#3d4d2c', '#26331f', '#56653b', '#141c12'][i % 4]); });
      ctx.globalAlpha = 1; ctx.fillStyle = lin(ctx, 0, h * .72, 0, h, [[0, '#4a1f17'], [1, '#6b2c1f']]); ctx.fillRect(0, h * .74, w, h * .26);
      ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 1; for (let x = 0; x < w; x += 7) { ctx.beginPath(); ctx.moveTo(x, h * .62); ctx.lineTo(x, h * .8); ctx.stroke(); } for (let y = h * .62; y < h * .8; y += 7) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }
      blur(ctx, 1.5, () => { ctx.fillStyle = '#d9d6cc'; ctx.fillRect(0, h * .615, w, h * .012); });
      person(ctx, w * .48, h * 1.05, h * .78, '#151513', 3, 'rgba(196,160,130,.14)');
    },
    window(ctx, w, h, r) {
      ctx.fillStyle = lin(ctx, 0, 0, w, h, [[0, '#8f7e69'], [1, '#2b241d']]); ctx.fillRect(0, 0, w, h);
      blur(ctx, 18, () => { ctx.fillStyle = 'rgba(255,236,205,.75)'; ctx.beginPath(); ctx.moveTo(w * .12, h * .1); ctx.lineTo(w * .5, h * .18); ctx.lineTo(w * .62, h * .95); ctx.lineTo(w * .2, h * .9); ctx.fill(); });
      blur(ctx, 8, () => { ctx.fillStyle = 'rgba(60,45,32,.55)'; ctx.fillRect(w * .32, h * .1, w * .03, h * .9); ctx.fillRect(w * .1, h * .5, w * .55, h * .025); });
      person(ctx, w * .74, h * 1.02, h * .8, '#1f1913', 5, 'rgba(230,190,150,.1)');
    },
    street(ctx, w, h, r) {
      ctx.fillStyle = lin(ctx, 0, 0, 0, h, [[0, '#07080b'], [.65, '#101219'], [1, '#05060a']]); ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 18; i++) { const x = r() * w; blur(ctx, 10, () => { ctx.globalAlpha = .4 + r() * .5; ctx.fillStyle = r() > .5 ? '#f2a95a' : '#e9e2d0'; ctx.fillRect(x, h * (.1 + r() * .3), 4 + r() * 18, h * (.08 + r() * .2)); ctx.globalAlpha *= .4; ctx.fillRect(x, h * .7, 6 + r() * 14, h * .3); }); }
      person(ctx, w * .35, h * .98, h * .5, '#020203', 2);
    },
    lamp(ctx, w, h, r) {
      ctx.fillStyle = '#060504'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = rad(ctx, w * .1, h * .4, 0, w * .8, [[0, 'rgba(240,170,90,.85)'], [.35, 'rgba(120,70,30,.35)'], [1, 'rgba(0,0,0,0)']]); ctx.fillRect(0, 0, w, h);
      person(ctx, w * .58, h * 1.04, h * .85, '#0c0806', 4, 'rgba(220,150,90,.12)');
    },
    sky(ctx, w, h, r) {
      ctx.fillStyle = lin(ctx, 0, 0, 0, h, [[0, '#b9bdbd'], [.55, '#8f9692'], [1, '#2e3a2a']]); ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 30; i++) blur(ctx, 10, () => { ctx.globalAlpha = .5; circle(ctx, r() * w, h * (.7 + r() * .3), 20 + r() * 60, ['#3f5235', '#58694a', '#7c8577'][i % 3]); });
      ctx.globalAlpha = 1; ctx.fillStyle = '#1b1c1a'; ctx.fillRect(0, h * .78, w, h * .02); for (let x = 0; x < w; x += w / 14) ctx.fillRect(x, h * .78, 3, h * .22);
      person(ctx, w * .3, h * 1.04, h * .62, '#202220', 2, 'rgba(210,180,160,.1)');
    },
    studio(ctx, w, h, r) {
      ctx.fillStyle = rad(ctx, w * .45, h * .35, 0, w * .9, [[0, '#9b9893'], [1, '#2b2a28']]); ctx.fillRect(0, 0, w, h);
      person(ctx, w * .5, h * 1.02, h * .85, '#121110', 1.5, null);
    },
    flash(ctx, w, h, r) {
      ctx.fillStyle = rad(ctx, w * .45, h * .4, 0, w * .8, [[0, '#ecebe6'], [.6, '#bdbab2'], [1, '#55534e']]); ctx.fillRect(0, 0, w, h);
      person(ctx, w * .62, h * 1.02, h * .9, 'rgba(20,18,16,.55)', 1.2);
      person(ctx, w * .45, h * 1.02, h * .9, '#0d0c0b', .8);
      blur(ctx, 2, () => { ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.ellipse(w * .45 + h * .03, h * .2, h * .012, h * .03, 0, 0, 7); ctx.fill(); });
    },
    sofa(ctx, w, h, r) {
      ctx.fillStyle = lin(ctx, 0, 0, 0, h, [[0, '#b9ad9c'], [.62, '#8a7d6c'], [.63, '#4a3f33'], [1, '#2e271f']]); ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = rad(ctx, w * .85, h * .15, 0, w * .7, [[0, 'rgba(255,225,180,.55)'], [1, 'rgba(255,225,180,0)']]); ctx.fillRect(0, 0, w, h);
      blur(ctx, 5, () => { ctx.fillStyle = '#d9cfc0'; ctx.beginPath(); ctx.roundRect(w * .08, h * .42, w * .84, h * .3, 26); ctx.fill(); ctx.fillStyle = '#cbbfae'; ctx.beginPath(); ctx.roundRect(w * .1, h * .6, w * .8, h * .22, 18); ctx.fill(); });
      person(ctx, w * .4, h * .78, h * .5, '#181512', 3);
      blur(ctx, 6, () => { ctx.fillStyle = 'rgba(30,24,18,.6)'; ctx.fillRect(w * .05, h * .85, w * .9, h * .15); });
    },
    hands(ctx, w, h, r) {
      ctx.fillStyle = lin(ctx, 0, 0, w, h, [[0, '#d6d3cc'], [1, '#8d8a84']]); ctx.fillRect(0, 0, w, h);
      blur(ctx, 3, () => { ctx.fillStyle = '#3b3a37'; ctx.beginPath(); ctx.roundRect(w * .15, h * .45, w * .7, h * .38, 10); ctx.fill(); });
      blur(ctx, 5, () => { ctx.fillStyle = '#b48c72'; ctx.beginPath(); ctx.ellipse(w * .35, h * .48, w * .12, h * .09, .3, 0, 7); ctx.fill(); ctx.beginPath(); ctx.ellipse(w * .65, h * .5, w * .12, h * .09, -.3, 0, 7); ctx.fill(); });
    }
  };
  function grade(ctx, w, h, r, tone) {
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = rad(ctx, w / 2, h / 2, Math.min(w, h) * .3, Math.max(w, h) * .75, [[0, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.55)']]); ctx.fillRect(0, 0, w, h);
    if (tone === 'warm') { ctx.fillStyle = 'rgba(120,70,20,.12)'; ctx.fillRect(0, 0, w, h); }
    if (r() > .5) { ctx.fillStyle = rad(ctx, w * (r() > .5 ? 0 : 1), h * r(), 0, w * .5, [[0, 'rgba(255,120,40,.22)'], [1, 'rgba(255,120,40,0)']]); ctx.fillRect(0, 0, w, h); }
    const img = ctx.getImageData(0, 0, w, h), d = img.data;
    for (let i = 0; i < d.length; i += 4) { const n = (Math.random() - .5) * 34; d[i] += n; d[i + 1] += n; d[i + 2] += n; }
    ctx.putImageData(img, 0, 0);
  }
  function render(el) {
    const scene = el.dataset.scene || 'studio', seed = +(el.dataset.seed || 1);
    const b = el.getBoundingClientRect(); if (b.width < 4 || b.height < 4) return;
    const sc = Math.min(1, 1100 / b.width), w = Math.round(b.width * sc * 1.12), h = Math.round(b.height * sc * 1.12);
    let c = el.querySelector('canvas.f'); if (!c) { c = document.createElement('canvas'); c.className = 'f'; el.prepend(c); }
    c.width = w; c.height = h; const ctx = c.getContext('2d'); const r = rng(seed);
    (S[scene] || S.studio)(ctx, w, h, r); grade(ctx, w, h, r, el.dataset.tone);
    el.dataset.done = 1;
  }
  const css = `
  .film{position:relative;overflow:hidden;background:#111}
  .film canvas.f{position:absolute;left:-6%;top:-6%;width:112%;height:112%;display:block}
  .film[data-tone=bw] canvas.f{filter:grayscale(1) contrast(1.12)}
  .film[data-video] canvas.f{animation:kb 14s ease-in-out infinite alternate,weave .18s steps(2) infinite}
  .film:nth-child(2n)[data-video] canvas.f{animation-direction:alternate-reverse}
  @keyframes kb{from{transform:scale(1) translate(0,0)}to{transform:scale(1.09) translate(-2.5%,1.5%)}}
  @keyframes weave{50%{translate:0 1px}}
  .film:after{content:"";position:absolute;inset:-50%;background:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.95' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='.9'/></svg>");opacity:.22;mix-blend-mode:overlay;pointer-events:none;animation:grain .5s steps(5) infinite;z-index:1}
  @keyframes grain{0%{transform:translate(0,0)}20%{transform:translate(-7%,4%)}40%{transform:translate(5%,-6%)}60%{transform:translate(-3%,8%)}80%{transform:translate(8%,2%)}}
  .film[data-video]:before{content:"";position:absolute;inset:0;background:#fff;opacity:0;z-index:1;animation:flick 3.7s steps(1) infinite;pointer-events:none}
  @keyframes flick{0%,41%,44%,100%{opacity:0}42%{opacity:.04}43%{opacity:.02}}
  .film>*:not(canvas){position:absolute;z-index:2}
  `;
  const st = document.createElement('style'); st.textContent = css; document.head.prepend(st);
  const go = () => document.querySelectorAll('.film').forEach(el => { if (!el.dataset.done) { try { render(el); } catch (e) { console.warn(e); } } });
  window.renderFilms = () => { document.querySelectorAll('.film').forEach(el => delete el.dataset.done); go(); };
  addEventListener('load', go);
  const mo = new MutationObserver(() => requestAnimationFrame(go)); addEventListener('load', () => mo.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['hidden'] }));
})();
