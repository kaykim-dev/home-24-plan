import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { buildHouse, LABELS, CEIL_ONLY, audit } from './house.js?v=3';
import { CONCEPTS, VIEWS, VIEW_ORDER } from './concepts.js?v=3';

const wrap = document.getElementById('viewer');
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.92;
renderer.outputColorSpace = THREE.SRGBColorSpace;
wrap.appendChild(renderer.domElement);
const labelR = new CSS2DRenderer(); labelR.domElement.className = 'labels'; wrap.appendChild(labelR.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color('#eef0f1');
const pm = new THREE.PMREMGenerator(renderer);
scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.3;

const hemi = new THREE.HemisphereLight('#ffffff', '#b9ae9e', 0.75); scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff1dc', 2.6);
sun.position.set(-3.5, 12, 15); sun.target.position.set(3.3, 0, 5.3); scene.add(sun, sun.target);
sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096);
Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 9, bottom: -9, near: 1, far: 40 });
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; sun.shadow.radius = 3;

const camera = new THREE.PerspectiveCamera(45, 1, 0.05, 200);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.dampingFactor = 0.08; controls.maxDistance = 40;
controls.addEventListener('change', () => { needs = true; });

// 라벨
const labelObjs = [];
function addLabels(group) {
  for (const [t, x, y] of LABELS) {
    const d = document.createElement('div'); d.className = 'lbl'; d.textContent = t;
    const o = new CSS2DObject(d); o.position.set(x / 1000, 2.45, y / 1000); group.add(o); labelObjs.push(o);
  }
}

let needs = true, current = null, curView = 'overview', tween = null;
function resize() {
  const w = wrap.clientWidth, h = wrap.clientHeight;
  renderer.setSize(w, h); labelR.setSize(w, h); camera.aspect = w / h;
  setFov(); needs = true;
}
window.addEventListener('resize', resize);

function setFov() { const port = wrap.clientWidth < wrap.clientHeight; camera.fov = (curView.startsWith('overview') ? 45 : 58) * (port ? 1.3 : 1); camera.updateProjectionMatrix(); }
function goView(key, instant = false) {
  curView = key; setFov(); const [, p, t] = VIEWS[key];
  document.querySelectorAll('#views button').forEach(b => b.classList.toggle('on', b.dataset.v === key));
  const isOver = key.startsWith('overview');
  const to = { p: new THREE.Vector3(...p), t: new THREE.Vector3(...t) };
  if (isOver && wrap.clientWidth < wrap.clientHeight) to.p.multiplyScalar(1.0).add(new THREE.Vector3(0, 4, 3));
  controls.maxPolarAngle = isOver ? Math.PI / 2.15 : Math.PI * 0.62;
  controls.minDistance = isOver ? 4 : 0.3;
  if (instant) { camera.position.copy(to.p); controls.target.copy(to.t); controls.update(); needs = true; return; }
  tween = { from: { p: camera.position.clone(), t: controls.target.clone() }, to, t0: performance.now(), dur: 900 };
}

function setConcept(i) {
  const c = CONCEPTS[i]; current = c;
  document.querySelectorAll('#chips button').forEach((b, k) => b.classList.toggle('on', k === i));
  document.getElementById('loading').style.display = 'flex';
  setTimeout(() => {
    labelObjs.forEach(o => o.element.remove()); labelObjs.length = 0;
    const g = buildHouse(scene, c.T, c.V); addLabels(g);
    renderInfo(c); needs = true;
    document.getElementById('loading').style.display = 'none';
    history.replaceState(null, '', '#c' + c.id);
  }, 30);
}

function renderInfo(c) {
  const el = document.getElementById('info');
  el.innerHTML = `
    <h2>컨셉 ${c.id} · ${c.name}</h2><p class="tag">${c.tag}</p>
    <div class="pal">${c.pal.map(([h, n]) => `<div><i style="background:${h}"></i><span>${n}</span></div>`).join('')}</div>
    <div class="cols"><div><h3>인테리어 포인트</h3><ul>${c.inter.map(x => `<li>${x}</li>`).join('')}</ul></div>
    <div><h3>공간 활용</h3><ul>${c.eff.map(x => `<li>${x}</li>`).join('')}</ul></div></div>
    <p class="ref">참고 사례: ${c.ref}</p>
    <p class="quick">이 컨셉 핵심 장면 → ${c.views.map(v => `<button data-v="${v}">${VIEWS[v][0]}</button>`).join(' ')}</p>`;
  el.querySelectorAll('.quick button').forEach(b => b.onclick = () => { goView(b.dataset.v); wrap.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
}

// UI
const chips = document.getElementById('chips');
CONCEPTS.forEach((c, i) => { const b = document.createElement('button'); b.innerHTML = `<b>${c.id}</b> ${c.name}`; b.onclick = () => setConcept(i); chips.appendChild(b); });
const vbar = document.getElementById('views');
VIEW_ORDER.forEach(k => { const b = document.createElement('button'); b.textContent = VIEWS[k][0]; b.dataset.v = k; b.onclick = () => goView(k); vbar.appendChild(b); });

function loop(now) {
  requestAnimationFrame(loop);
  if (tween) {
    let a = Math.min(1, (now - tween.t0) / tween.dur); const e = a < .5 ? 2 * a * a : 1 - Math.pow(-2 * a + 2, 2) / 2;
    camera.position.lerpVectors(tween.from.p, tween.to.p, e); controls.target.lerpVectors(tween.from.t, tween.to.t, e);
    if (a >= 1) tween = null; needs = true;
  }
  controls.update();
  if (!needs) return; needs = false;
  const over = camera.position.y > 5;
  labelObjs.forEach(o => o.visible = over); CEIL_ONLY.forEach(o => o.visible = camera.position.y < 2.25);
  renderer.render(scene, camera); labelR.render(scene, camera);
}

resize();
const start = Math.max(0, CONCEPTS.findIndex(c => location.hash === '#c' + c.id));
const qv = new URLSearchParams(location.search).get('v');
setConcept(start); goView(qv && VIEWS[qv] ? qv : 'overview', true);
requestAnimationFrame(loop);
window.__audit = audit; window.__concepts = CONCEPTS; window.__views = VIEWS; window.__goView = goView; window.__setConcept = setConcept;
