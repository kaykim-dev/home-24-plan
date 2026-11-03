import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
RectAreaLightUniformsLib.init();
import { buildHouse, LABELS, CEIL_ONLY, OUTSIDE, LIGHT_PLAN, audit, preloadReal } from './house.js?v=50';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { CONCEPTS, VIEWS, VIEW_ORDER } from './concepts.js?v=36';

const wrap = document.getElementById('viewer');
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.AgXToneMapping; renderer.toneMappingExposure = 0.88; // 11/3: 사진 렌더와 같은 AgX
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
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const gtao = new GTAOPass(scene, camera, 800, 600);
gtao.updateGtaoMaterial({ radius: 0.35, distanceExponent: 1.5, thickness: 1.2, scale: 1.0, samples: 16, distanceFallOff: 1.0 });
gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 16 });
gtao.blendIntensity = 0.9;
composer.addPass(gtao);
composer.addPass(new OutputPass());
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; controls.dampingFactor = 0.08; controls.maxDistance = 40;
controls.addEventListener('change', () => { needs = true; });

// 라벨
const labelObjs = [];
function addLabels(group, V = {}) {
  const win = (V.living || '').startsWith('diningWin');
  const L = win ? LABELS.filter(l => l[0] !== '식탁' && l[0] !== '거실·놀이').concat([['창가 식탁', 1525, 9500], ['거실', 1100, 7100]]) : LABELS;
  for (const [t, x, y] of L) {
    const d = document.createElement('div'); d.className = 'lbl'; d.textContent = t;
    const o = new CSS2DObject(d); o.position.set(x / 1000, 2.45, y / 1000); group.add(o); labelObjs.push(o);
  }
}

let needs = true, current = null, curView = 'overview', tween = null;
function resize() {
  const w = wrap.clientWidth, h = wrap.clientHeight;
  renderer.setSize(w, h); composer.setSize(w, h); labelR.setSize(w, h); camera.aspect = w / h;
  setFov(); needs = true;
}
window.addEventListener('resize', resize);
wrap.addEventListener('wheel', e => { if (!pano) return; e.preventDefault(); camera.fov = Math.max(35, Math.min(95, camera.fov + e.deltaY * 0.03)); camera.updateProjectionMatrix(); needs = true; }, { passive: false });

function setFov() { const port = wrap.clientWidth < wrap.clientHeight; camera.fov = (curView.startsWith('overview') ? 45 : 58) * (port ? 1.3 : 1); camera.updateProjectionMatrix(); }
function goView(key, instant = false) {
  if (pano && !key.startsWith('__')) { scene.remove(pano.mesh); pano = null; scene.children.forEach(o => { if (o.isGroup) o.visible = true; }); labelR.domElement.style.display = ''; controls.minPolarAngle = 0; controls.enablePan = true; controls.rotateSpeed = 1; document.querySelectorAll('#panobar button[data-p]').forEach(b => b.classList.remove('on')); document.getElementById('panoExit').style.display = 'none'; }
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
    const g = buildHouse(scene, c.T, c.V); addLabels(g, c.V); curRoot = g; applyLightMode(g); addDecor(g);
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
    <div class="sep"><b>안방·서재 분리 / 붙박이장</b> ${c.sep || ''}</div>
    <p class="ref">참고 사례: ${c.ref}</p>
    <p class="quick">이 컨셉 핵심 장면 → ${c.views.map(v => `<button data-v="${v}">${VIEWS[v][0]}</button>`).join(' ')}</p>`;
  el.querySelectorAll('.quick button').forEach(b => b.onclick = () => { goView(b.dataset.v); wrap.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
}

// ---------- 사진처럼 둘러보기: 360° 실사 사진(Blender Cycles) (11/3 케이: 렌더 탭 말고 3D 안에서) ----------
// [키, 이름, x, y, 첫 시선 방향(world x,z)]
const PANOS = [['panoLiving', '거실·식탁', 1300, 7900, [0, 1]], ['panoKitchen', '주방', 3300, 1900, [0, -1]], ['panoMaster', '안방', 4400, 9200, [0, -1]], ['panoStudy', '서재', 4300, 9750, [0, 1]],
  ['panoKids1', '아이방 1', 850, 3450, [0, -1]], ['panoKids2', '아이방 2', 5350, 3500, [0, -1]], ['panoBath', '욕실', 5350, 4950, [1, 0]], ['panoEntry', '현관', 700, 5000, [-1, 0]]];
let pano = null; const texLoader = new THREE.TextureLoader(); const panoTex = {};
function panoMode() { return (lightMode === 'night' || lightMode === 'nightAll') ? 'night' : 'day'; }
function panoTexture(key) {
  const k = key + '_' + panoMode();
  if (!panoTex[k]) { panoTex[k] = texLoader.load(`img/pano/${k}.jpg?v=2`, () => { needs = true; document.getElementById('panoInfo').textContent = ''; }); panoTex[k].colorSpace = THREE.SRGBColorSpace; }
  return panoTex[k];
}
function enterPano(key) {
  const P = PANOS.find(p => p[0] === key); if (!P) return;
  if (!pano && lightMode === 'day') setLightMode('night'); // 360 사진은 저녁 간접등이 기본(낮 버튼으로 바꿀 수 있음)
  if (!pano) {
    const geo = new THREE.SphereGeometry(5, 64, 32); geo.scale(-1, 1, 1);
    const mat = new THREE.MeshBasicMaterial({ toneMapped: false });
    const pm = new THREE.Mesh(geo, mat); pm.rotation.y = -Math.PI / 2; // 사진 북쪽을 집 북쪽에 맞춤
    pano = { mesh: pm, prev: { p: camera.position.clone(), t: controls.target.clone(), view: curView } };
    scene.add(pano.mesh);
  }
  pano.key = key; document.getElementById('panoInfo').textContent = '사진 불러오는 중…';
  pano.mesh.material.map = panoTexture(key); pano.mesh.material.needsUpdate = true;
  const c = new THREE.Vector3(P[2] / 1000, 1.4, P[3] / 1000); pano.mesh.position.copy(c);
  scene.children.forEach(o => { if (o !== pano.mesh && o.isGroup) o.visible = false; });
  labelR.domElement.style.display = 'none';
  tween = null; const dv = P[4] || [0, -1]; camera.position.copy(c).add(new THREE.Vector3(-dv[0] * 0.01, 0, -dv[1] * 0.01)); controls.target.copy(c);
  controls.minDistance = 0.01; controls.maxDistance = 0.01; controls.maxPolarAngle = Math.PI * 0.85; controls.minPolarAngle = Math.PI * 0.15; controls.enablePan = false; controls.rotateSpeed = -0.35;
  camera.fov = 75; camera.updateProjectionMatrix();
  document.querySelectorAll('#panobar button[data-p]').forEach(b => b.classList.toggle('on', b.dataset.p === key));
  document.getElementById('panoExit').style.display = ''; needs = true;
}
function exitPano() {
  if (!pano) return; scene.remove(pano.mesh); const prev = pano.prev; pano = null;
  scene.children.forEach(o => { if (o.isGroup) o.visible = true; }); labelR.domElement.style.display = '';
  controls.minPolarAngle = 0; controls.enablePan = true; controls.rotateSpeed = 1;
  document.querySelectorAll('#panobar button[data-p]').forEach(b => b.classList.remove('on'));
  document.getElementById('panoExit').style.display = 'none'; document.getElementById('panoInfo').textContent = '';
  goView(prev.view || 'overview');
}
document.querySelectorAll('#panobar button[data-p]').forEach(b => b.onclick = () => { enterPano(b.dataset.p); wrap.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
document.getElementById('panoExit').onclick = exitPano;

// ---------- 실사 소품(Poly Haven CC0 3D 모델, 사진 렌더와 같은 자리) ----------
const DECOR = [ // 11/3 케이: 라탄 바구니·바닥 큰 화분 등 정신 사나운 소품 뺌. 책장 위(높이 1,150) 작은 화분·화병, 안방 협탁 화병만
  ['potted_plant_04', 2850, 6250, 1150, 260, 0], ['ceramic_vase_03', 2850, 7600, 1150, 220, 0], ['ceramic_vase_04', 3510, 7090, 520, 230, 0],
];
const gltfCache = {}; const gl = new GLTFLoader();
function loadModel(name) {
  if (!gltfCache[name]) gltfCache[name] = new Promise(res => gl.load(`img/models/${name}/${name}.gltf`, g => {
    let root = g.scene; const kids = root.children.filter(c => c.isObject3D);
    if (kids.length > 1) { // 여러 개 묶음 모델이면 가장 큰 것 하나만
      let best = null, bh = -1; for (const k of kids) { const b = new THREE.Box3().setFromObject(k); const h = b.max.y - b.min.y; if (h > bh) { bh = h; best = k; } }
      root = new THREE.Group(); root.add(best.clone(true));
    }
    root.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; o.userData.skip = true; } });
    res(root);
  }, undefined, () => res(null)));
  return gltfCache[name];
}
async function addDecor(root) {
  for (const [name, x, y, z, h, rot] of DECOR) {
    const m = await loadModel(name); if (!m || !root.parent) continue;
    const o = m.clone(true); const b = new THREE.Box3().setFromObject(o); const s = (h / 1000) / Math.max(0.001, b.max.y - b.min.y);
    const cx = (b.min.x + b.max.x) / 2, cz = (b.min.z + b.max.z) / 2;
    const w = new THREE.Group(); o.position.set(-cx, -b.min.y, -cz); w.add(o); w.scale.setScalar(s); w.rotation.y = rot; w.position.set(x / 1000, z / 1000, y / 1000);
    w.userData.skip = true; root.add(w); needs = true;
  }
}

// ---------- 조명 보기 (11/2 케이: 천장 조명이 잘 보이게) ----------
let lightMode = 'day'; let planGroup = null, nightGroup = null; const winLights = [];
const LCOL = { cove: '#ff8a1f', room: null, toe: '#ffb347', rail: '#2b2b2b', down: '#ffffff', wall: '#d94f9a', fan: '#3b7dd8', pend: '#f2c230' };
function planMesh(geo, col, x, y, z = 2.34) { const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: col, toneMapped: false, depthTest: false, transparent: true, opacity: .95 })); m.position.set(x, z, y); m.renderOrder = 999; return m; }
function buildPlan(root) {
  const g = new THREE.Group(); g.renderOrder = 999;
  const flat = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 11.1), new THREE.MeshBasicMaterial({ color: '#1b1d22', transparent: true, opacity: .55, depthTest: false })); flat.rotation.x = -Math.PI / 2; flat.position.set(3.31, 2.33, 5.25); flat.renderOrder = 998; g.add(flat);
  for (const L of LIGHT_PLAN) {
    if (L.k === 'room') continue;
    if (L.x1 !== undefined) {
      const w = Math.max(Math.abs(L.x2 - L.x1), L.k === 'rail' ? 70 : 55) / 1000, d = Math.max(Math.abs(L.y2 - L.y1), L.k === 'rail' ? 70 : 55) / 1000;
      const m = planMesh(new THREE.BoxGeometry(w, 0.004, d), LCOL[L.k], (L.x1 + L.x2) / 2000, (L.y1 + L.y2) / 2000); g.add(m);
      if (L.k === 'rail') { const along = Math.abs(L.x2 - L.x1) > Math.abs(L.y2 - L.y1); for (let i = 0; i < (L.n || 3); i++) { const tt = (i + 0.5) / (L.n || 3); const x = along ? L.x1 + (L.x2 - L.x1) * tt : (L.x1 + L.x2) / 2, y = along ? (L.y1 + L.y2) / 2 : L.y1 + (L.y2 - L.y1) * tt; g.add(planMesh(new THREE.CircleGeometry(0.06, 20).rotateX(-Math.PI / 2), '#fff3d6', x / 1000, y / 1000, 2.345)); } }
    } else if (L.k === 'fan') { g.add(planMesh(new THREE.RingGeometry(0.47, 0.53, 48).rotateX(-Math.PI / 2), LCOL.fan, L.x / 1000, L.y / 1000)); g.add(planMesh(new THREE.CircleGeometry(0.11, 24).rotateX(-Math.PI / 2), LCOL.fan, L.x / 1000, L.y / 1000)); }
    else { const r = L.k === 'down' ? 0.075 : 0.1; g.add(planMesh(new THREE.CircleGeometry(r + 0.02, 24).rotateX(-Math.PI / 2), '#111', L.x / 1000, L.y / 1000, 2.338)); g.add(planMesh(new THREE.CircleGeometry(r, 24).rotateX(-Math.PI / 2), LCOL[L.k], L.x / 1000, L.y / 1000)); }
  }
  root.add(g); return g;
}
function buildNight(root, all) {
  const g = new THREE.Group();
  for (const L of LIGHT_PLAN) {
    if (L.k === 'room') { const area = (L.x2 - L.x1) * (L.y2 - L.y1) / 1e6; const lt = new THREE.PointLight('#ffad5c', 0.9 + area * 0.45, 2.2 + Math.sqrt(area) * 1.6, 1.6); lt.position.set((L.x1 + L.x2) / 2000, 2.15, (L.y1 + L.y2) / 2000); g.add(lt); }
    else if (all && (L.k === 'down' || L.k === 'pend')) { const lt = new THREE.PointLight('#ffd6a0', 1.4, 3.5, 2); lt.position.set(L.x / 1000, 2.1, L.y / 1000); g.add(lt); }
    else if (all && L.k === 'rail') { const lt = new THREE.PointLight('#ffd6a0', 2.4, 4, 2); lt.position.set((L.x1 + L.x2) / 2000, 2.1, (L.y1 + L.y2) / 2000); g.add(lt); }
  }
  root.add(g); return g;
}
function applyLightMode(root) {
  const night = lightMode === 'night' || lightMode === 'nightAll';
  winLights.length = 0; root.traverse(o => { if (o.isRectAreaLight) { if (o.userData.base === undefined) o.userData.base = o.intensity; winLights.push(o); } });
  winLights.forEach(o => o.intensity = night ? 0 : o.userData.base);
  hemi.intensity = night ? 0.06 : 0.75; sun.intensity = night ? 0 : 2.6; scene.environmentIntensity = night ? 0.03 : 0.3;
  renderer.toneMappingExposure = night ? 1.15 : 0.88;
  root.traverse(o => { if (o.isPointLight && !o.userData.night) { if (o.userData.base === undefined) o.userData.base = o.intensity; o.intensity = night ? o.userData.base * (lightMode === 'nightAll' ? 1.2 : 0.35) : o.userData.base; } });
  if (nightGroup) { nightGroup.parent && nightGroup.parent.remove(nightGroup); nightGroup = null; }
  if (night) { nightGroup = buildNight(root, lightMode === 'nightAll'); nightGroup.traverse(o => o.userData.night = true); }
  if (planGroup) { planGroup.parent && planGroup.parent.remove(planGroup); planGroup = null; }
  if (lightMode === 'plan') planGroup = buildPlan(root);
  document.getElementById('legend').style.display = lightMode === 'plan' ? 'block' : 'none';
  document.querySelectorAll('#lightbar button').forEach(b => b.classList.toggle('on', b.dataset.m === lightMode));
  needs = true; if (pano) { pano.mesh.material.map = panoTexture(pano.key); pano.mesh.material.needsUpdate = true; }
}
let curRoot = null;
function setLightMode(m) {
  lightMode = m; curRoot = scene.children.find(c => c.isGroup && c.children.length > 50) || curRoot;
  if (curRoot) applyLightMode(curRoot);
  if (m === 'plan') goView('lightPlan');
}
document.querySelectorAll('#lightbar button').forEach(b => b.onclick = () => setLightMode(b.dataset.m));

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
  labelObjs.forEach(o => o.visible = over); CEIL_ONLY.forEach(o => o.visible = camera.position.y < 2.25); OUTSIDE.forEach(o => o.visible = camera.position.y < 3 && lightMode !== 'night' && lightMode !== 'nightAll');
  scene.background.set(lightMode === 'night' || lightMode === 'nightAll' ? '#10141c' : over ? '#eef0f1' : '#dfe8ee');
  if (pano) { renderer.render(scene, camera); return; }
  composer.render(); labelR.render(scene, camera);
}

resize();
const start = Math.max(0, CONCEPTS.findIndex(c => location.hash === '#c' + c.id));
const qv = new URLSearchParams(location.search).get('v');
await preloadReal(); setConcept(start); goView(qv && VIEWS[qv] ? qv : 'overview', true);
requestAnimationFrame(loop);
window.__ao = gtao; window.__audit = audit; window.__concepts = CONCEPTS; window.__views = VIEWS; window.__goView = goView; window.__setConcept = setConcept; window.__setLightMode = setLightMode; window.__scene = scene; window.__camera = camera; window.__lightPlan = LIGHT_PLAN; window.__ceil = CEIL_ONLY; window.__outside = OUTSIDE;
