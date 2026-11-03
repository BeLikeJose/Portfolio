// Hyper-realistic 3D mousetrap (Three.js). The pixel cursor is the bait.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const BOARD = { w: 1.9, h: 0.36, l: 4.4 };
const TOP = BOARD.h;                    // y of the board's top face
const AXIS = { y: TOP + 0.09, z: 0.2 }; // spring / hammer axis
const SET_ANGLE = -Math.PI + 0.07;      // hammer cocked over the upper half
const HAND = [
  '     11          ', '    1221         ', '    1221         ', '    1221         ', '    1221         ',
  '    122111       ', '    1221221111   ', '    12212212211  ', ' 11 122122122121 ', '1221122222222221 ',
  '1222122222222221 ', ' 122222222222221 ', '  12222222222221 ', '  1222222222221  ', '   122222222221  ',
  '   12222222221   ', '    122222221    ', '    122222221    ', '    111111111    '];

function rng(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }

function woodTextures() {
  const W = 512, H = 1200, r = rng(11);
  const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, '#cfccc6'); g.addColorStop(.45, '#dddad5'); g.addColorStop(1, '#ccc8c1');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  // long growth rings running along the board
  for (let i = 0; i < 170; i++) {
    const x0 = r() * W, amp = 3 + r() * 14, f = .002 + r() * .006, ph = r() * 6.28, dark = r() * .97;
    x.strokeStyle = dark > .8 ? `rgba(92,86,78,${.16 + r() * .22})` : `rgba(110,104,96,${.04 + r() * .1})`;
    x.lineWidth = dark > .82 ? 1.5 + r() * 3.5 : .5 + r() * 1.6;
    x.beginPath();
    for (let y = -10; y <= H + 10; y += 8) { const xx = x0 + Math.sin(y * f + ph) * amp + Math.sin(y * .03 + ph) * 1.2; y < 0 ? x.moveTo(xx, y) : x.lineTo(xx, y); }
    x.stroke();
  }
  // a knot, with rings bending around it
  const kx = W * .7, ky = H * .2;
  for (let k = 0; k < 14; k++) { x.strokeStyle = `rgba(95,88,80,${.22 - k * .014})`; x.lineWidth = 2; x.beginPath(); x.ellipse(kx, ky, 6 + k * 5, 14 + k * 11, 0, 0, 7); x.stroke(); }
  x.fillStyle = 'rgba(85,78,70,.35)'; x.beginPath(); x.ellipse(kx, ky, 7, 13, 0, 0, 7); x.fill();
  // fine fibres + pores
  const img = x.getImageData(0, 0, W, H), d = img.data;
  for (let y = 0; y < H; y++) { const row = (r() - .5) * 10; for (let xx = 0; xx < W; xx++) { const i = (y * W + xx) * 4, n = (r() - .5) * 14 + row * .4; d[i] += n * .7; d[i + 1] += n * .7; d[i + 2] += n * .7; } }
  x.putImageData(img, 0, 0);
  const map = new THREE.CanvasTexture(c); map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 8;
  const bump = new THREE.CanvasTexture(c); bump.anisotropy = 8;
  return { map, bump };
}

function handTexture() {
  const s = 32, c = document.createElement('canvas'); c.width = 17 * s; c.height = 19 * s; const x = c.getContext('2d');
  HAND.forEach((row, y) => [...row].forEach((ch, xx) => { if (ch === ' ') return; x.fillStyle = ch === '1' ? '#111' : '#f7f7f4'; x.fillRect(xx * s, y * s, s, s); }));
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; t.minFilter = THREE.LinearMipMapLinearFilter; return t;
}

const tube = (curve, r, mat, seg = 200) => { const m = new THREE.Mesh(new THREE.TubeGeometry(curve, seg, r, 10, false), mat); m.castShadow = true; m.receiveShadow = true; return m; };
const path = pts => { const p = new THREE.CurvePath(); for (let i = 0; i < pts.length - 1; i++) p.add(new THREE.LineCurve3(pts[i], pts[i + 1])); return p; };
const V = (x, y, z) => new THREE.Vector3(x, y, z);
function roundedU(w, len, dip, r) { // U-shaped wire, open end at the pivot (z=0)
  const p = new THREE.CurvePath(), h = w / 2;
  p.add(new THREE.LineCurve3(V(-h, 0, 0), V(-h, -dip, len - r)));
  p.add(new THREE.QuadraticBezierCurve3(V(-h, -dip, len - r), V(-h, -dip, len), V(-h + r, -dip, len)));
  p.add(new THREE.LineCurve3(V(-h + r, -dip, len), V(h - r, -dip, len)));
  p.add(new THREE.QuadraticBezierCurve3(V(h - r, -dip, len), V(h, -dip, len), V(h, -dip, len - r)));
  p.add(new THREE.LineCurve3(V(h, -dip, len - r), V(h, 0, 0)));
  return p;
}

function snapSound() {
  try {
    const A = window.__trapAudio || (window.__trapAudio = new (window.AudioContext || window.webkitAudioContext)());
    const t = A.currentTime, out = A.createGain(); out.gain.value = .9; out.connect(A.destination);
    const len = A.sampleRate * .09, buf = A.createBuffer(1, len, A.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 6);
    const n = A.createBufferSource(); n.buffer = buf; const bp = A.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2600; bp.Q.value = .8;
    n.connect(bp).connect(out); n.start(t);
    const o = A.createOscillator(), og = A.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(48, t + .16);
    og.gain.setValueAtTime(.9, t); og.gain.exponentialRampToValueAtTime(.001, t + .2); o.connect(og).connect(out); o.start(t); o.stop(t + .22);
    const m = A.createOscillator(), mg = A.createGain(); m.type = 'triangle'; m.frequency.value = 3400; mg.gain.setValueAtTime(.12, t + .01); mg.gain.exponentialRampToValueAtTime(.001, t + .35);
    m.connect(mg).connect(out); m.start(t + .01); m.stop(t + .36); // spring ring
  } catch (e) { /* audio is optional */ }
}

export function createTrap(container, opts = {}) {
  const size = () => [container.clientWidth, container.clientHeight];
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: !!opts.capture });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(...size());
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .98;
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
  scene.environmentIntensity = .5;

  // flat, top-down view: the trap photographed on the table
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, .1, 50);
  camera.up.set(0, 0, -1); camera.position.set(0, 12, 0); camera.lookAt(0, 0, 0);

  const sun = new THREE.DirectionalLight(0xffffff, 2.6);
  sun.position.set(-2.2, 9, -2.6); sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048); sun.shadow.radius = 14; sun.shadow.blurSamples = 24; sun.shadow.bias = -.0004;
  Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 1, far: 25 });
  scene.add(sun);
  scene.add(new THREE.HemisphereLight(0xffffff, 0xd9d9d6, .55));

  const catcher = new THREE.Mesh(new THREE.PlaneGeometry(30, 30), new THREE.ShadowMaterial({ opacity: .3 }));
  catcher.rotation.x = -Math.PI / 2; catcher.receiveShadow = true; scene.add(catcher);

  const trap = new THREE.Group(); scene.add(trap);
  const metal = new THREE.MeshStandardMaterial({ color: 0xc2c2be, metalness: 1, roughness: .3 });
  const zinc = new THREE.MeshStandardMaterial({ color: 0x9c9b95, metalness: .9, roughness: .46 });

  // board
  const wood = woodTextures();
  const woodMat = new THREE.MeshStandardMaterial({ map: wood.map, bumpMap: wood.bump, bumpScale: 1.6, roughness: .8 });
  const board = new THREE.Mesh(new RoundedBoxGeometry(BOARD.w, BOARD.h, BOARD.l, 4, .035), woodMat);
  board.position.y = BOARD.h / 2; board.castShadow = board.receiveShadow = true; trap.add(board);

  // axle, staples, spring
  trap.add(tube(path([V(-.86, AXIS.y, AXIS.z), V(.86, AXIS.y, AXIS.z)]), .014, zinc, 4));
  for (const sx of [-.74, .74]) {
    const st = new THREE.CatmullRomCurve3([V(sx, TOP - .02, AXIS.z - .07), V(sx, AXIS.y + .03, AXIS.z - .05), V(sx, AXIS.y + .045, AXIS.z), V(sx, AXIS.y + .03, AXIS.z + .05), V(sx, TOP - .02, AXIS.z + .07)]);
    trap.add(tube(st, .016, zinc, 30));
  }
  // two springs, like a real Victor trap
  const coilR = .085, turns = 8;
  class Helix extends THREE.Curve {
    constructor(x0, x1) { super(); this.x0 = x0; this.x1 = x1; }
    getPoint(t, o = new THREE.Vector3()) { const a = t * turns * Math.PI * 2; return o.set(this.x0 + (this.x1 - this.x0) * t, AXIS.y + Math.sin(a) * coilR, AXIS.z + Math.cos(a) * coilR); }
  }
  trap.add(tube(new Helix(-.66, -.1), .018, metal, 500));
  trap.add(tube(new Helix(.1, .66), .018, metal, 500));
  trap.add(tube(path([V(-.66, AXIS.y - coilR, AXIS.z), V(-.72, TOP + .02, AXIS.z + .8)]), .017, metal, 8));
  trap.add(tube(path([V(.66, AXIS.y - coilR, AXIS.z), V(.72, TOP + .02, AXIS.z + .8)]), .017, metal, 8));

  // trigger pedal + bait (the pixel cursor, printed on card)
  const pedal = new THREE.Group(); pedal.position.set(0, TOP + .02, .82); trap.add(pedal);
  const plate = new THREE.Mesh(new RoundedBoxGeometry(.46, .025, .58, 2, .01), zinc); plate.castShadow = plate.receiveShadow = true; pedal.add(plate);
  const tab = new THREE.Mesh(new THREE.BoxGeometry(.16, .14, .02), zinc); tab.position.set(0, .07, -.27); tab.castShadow = true; pedal.add(tab);
  const handMat = new THREE.MeshStandardMaterial({ map: handTexture(), alphaTest: .5, roughness: .95, side: THREE.DoubleSide });
  const hand = new THREE.Mesh(new THREE.PlaneGeometry(.92, 1.03), handMat);
  hand.rotation.x = -Math.PI / 2; hand.rotation.z = .06; hand.position.set(.04, TOP + .045, 1.55); hand.castShadow = true; hand.receiveShadow = true;
  hand.customDepthMaterial = new THREE.MeshDepthMaterial({ map: handMat.map, alphaTest: .5 });
  trap.add(hand);

  // hammer (bail)
  const hammer = new THREE.Group(); hammer.position.set(0, AXIS.y, AXIS.z); trap.add(hammer);
  hammer.add(tube(roundedU(1.66, 1.78, .06, .09), .027, metal, 260));
  // lock bar
  const bar = new THREE.Group(); bar.position.set(0, TOP + .05, -1.95); trap.add(bar);
  bar.add(tube(new THREE.CatmullRomCurve3([V(0, 0, 0), V(.05, .06, .04), V(0, .1, .06), V(-.05, .06, .04), V(0, .02, .02), V(0, .17, .3), V(0, .2, 2.62), V(0, .16, 2.7)]), .02, metal, 160));
  const eye = new THREE.Mesh(new THREE.TorusGeometry(.05, .016, 8, 20), zinc); eye.rotation.y = Math.PI / 2; eye.position.set(0, TOP + .06, -1.95); eye.castShadow = true; trap.add(eye);

  // state
  const S = { set: true, angle: SET_ANGLE, barX: 0, barY: 0, anim: null, intro: 0, px: 0, py: 0 };
  const applyPose = () => { hammer.rotation.x = S.angle; bar.rotation.set(S.barX, S.barY, 0); };
  applyPose();

  const resize = () => {
    const [w, h] = size(); renderer.setSize(w, h);
    const a = w / h, halfH = Math.max(opts.frame || 2.55, 1.2 / a), halfW = halfH * a;   // keep the whole trap in frame
    Object.assign(camera, { left: -halfW, right: halfW, top: halfH, bottom: -halfH }); camera.updateProjectionMatrix();
  };
  new ResizeObserver(resize).observe(container); resize();

  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const hit = e => { const b = renderer.domElement.getBoundingClientRect(); ndc.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1); ray.setFromCamera(ndc, camera); return ray.intersectObject(trap, true).length > 0; };
  renderer.domElement.addEventListener('pointermove', e => { const b = renderer.domElement.getBoundingClientRect(); S.px = (e.clientX - b.left) / b.width - .5; S.py = (e.clientY - b.top) / b.height - .5; container.classList.toggle('hot', hit(e)); renderer.domElement.style.cursor = hit(e) ? 'pointer' : ''; });
  renderer.domElement.addEventListener('pointerleave', () => { S.px = S.py = 0; container.classList.remove('hot'); });
  renderer.domElement.addEventListener('click', e => { if (hit(e)) snap(); });

  function snap() {
    if (!S.set) return; S.set = false; S.anim = { type: 'snap', t0: performance.now() };
    snapSound(); opts.onSnap && opts.onSnap();
  }
  function reset() { if (S.set || (S.anim && S.anim.type === 'snap' && performance.now() - S.anim.t0 < 900)) return; S.anim = { type: 'reset', t0: performance.now(), a0: S.angle }; }

  const easeIn = t => t * t * t, easeOut = t => 1 - Math.pow(1 - t, 3);
  const t0 = performance.now();
  function frame(now) {
    // set down on the table on load
    const ti = Math.min(1, (now - t0 - (opts.delay || 0)) / 900);
    const k = ti <= 0 ? 0 : easeOut(ti);
    const hover = container.classList.contains('hot') && S.set ? 1 : 0;
    S.lift = (S.lift || 0) + (hover - (S.lift || 0)) * .15;
    trap.scale.setScalar(1 + (1 - k) * .18 + S.lift * .02);
    trap.rotation.y = -.06 + (1 - k) * .25;
    let jump = 0, shake = 0;
    if (S.anim) {
      const t = now - S.anim.t0;
      if (S.anim.type === 'snap') {
        const fall = 75;                                                     // the hammer whips round in ~75ms
        if (t < fall) S.angle = SET_ANGLE * (1 - easeIn(t / fall));
        else { const u = (t - fall) / 1000; S.angle = -.32 * Math.exp(-u * 16) * Math.abs(Math.sin(u * 42)); }   // bounces on the board
        const bt = Math.min(1, t / 160); S.barX = -.55 * Math.sin(bt * Math.PI) ; S.barY = .3 * easeOut(bt);  // lock bar flies off
        pedal.rotation.x = -.12 * Math.exp(-t / 120);
        const j = (t - 40) / 1000; jump = j > 0 ? .22 * Math.exp(-j * 9) * Math.abs(Math.sin(j * 26)) : 0;
        shake = t < 400 ? (1 - t / 400) : 0;
        if (t > 1400) S.anim = null;
      } else {
        const u = Math.min(1, t / 900), e = easeOut(u);
        S.angle = S.anim.a0 + (SET_ANGLE - S.anim.a0) * e; S.barX = 0; S.barY = .3 * (1 - e);
        if (u >= 1) { S.anim = null; S.set = true; S.barY = 0; }
      }
      applyPose();
    }
    trap.position.y = jump;
    trap.rotation.y += shake * Math.sin(now * .09) * .035;          // small jolt on the table
    trap.position.x = shake * Math.sin(now * .13) * .05;
    renderer.render(scene, camera);
    if (visible) requestAnimationFrame(frame); else running = false;
  }
  // only draw while the trap is on screen
  let visible = true, running = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !running) { running = true; requestAnimationFrame(frame); } }).observe(container);
  requestAnimationFrame(frame);
  return { snap, reset, renderer };
}
