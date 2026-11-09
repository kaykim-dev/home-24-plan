// 풍납동 24평 실시간 3D 모델 (단위: mm, 평면 x=왼→오, y=위(북,주방)→아래(남,거실 창), z=높이)
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const CEIL = 2300;
const S = 0.001;
let root;
export const CEIL_ONLY = [];
export const LIGHT_PLAN = []; // 조명 보기용 목록 {k, x1,y1,x2,y2 | x,y}
export const WALLS = [];
const CUR_SEGS = [];
const CUR_LAYOUT = { win: false, sofa: false, dresser: false };
// 11/5 케이: 아이방 배치안 여러 개(침대·서랍장을 실제로 옮겨 보기). 서랍장(1000×500×1120)은 모든 안에 무조건 들어감
export const KIDS = { k1: 'A', k2: 'A', jm: 'A' };
export const KIDS_PLANS = {
  jm: {
    A: ['양개 여닫이(지금 안)', '문 2짝(각 약 64cm)이 가운데서 갈라져 거실·복도 쪽으로 열려요. 둘 다 열면 1.29m로 짐 옮기기 좋고 대칭이라 예뻐요. 평소엔 한 짝만 쓰게 되는데 64cm라 장바구니·유모차 들고는 좁아요. 가운데 맞닿는 틈이 하나 더 있어서 바람·냄새 막는 건 B보다 조금 약해요.'],
    B: ['외여닫이 1짝 + 양옆 고정 (추천)', '넓은 문 1짝(약 90cm)이 거실·복도 쪽으로 열리고, 양옆 좁은 고정 간살판이 신발장·분리수거장 앞선에 맞춰져요. 한 번에 넓게 다니고, 현관 쪽 문 멈춤 턱 + 위 걸쇠 하나로 아이가 밀고 못 나가요. 틈이 적어 단열·냄새 차단이 가장 좋아요. 대신 복도 쪽 약 90cm 반경을 문이 써요.'],
    C: ['원슬라이딩(미닫이 1짝)', '문 1짝을 옆 고정판 위로 겹쳐 밀어 열어요. 공간을 안 먹지만 옆에 밀어 넣을 벽이 없어 열린 통로가 약 65cm로 좁아요. 아이가 옆으로 밀면 열려서 걸쇠가 꼭 있어야 하고, 레일 쪽 손 끼임에 주의해야 해요.'],
    D: ['3연동 슬라이딩', '3짝이 겹치며 한쪽으로 열려 통로 약 85~90cm. 우리 단지 같은 평면 사례에서 가장 많이 한 방식이고 문 열리는 공간이 필요 없어요. 문짝 사이 틈이 많아 단열·냄새 차단은 약하고, 아이가 밀면 열려서 걸쇠·손 끼임 방지가 필요해요.'],
  },
  k1: {
    A: ['지금 안', '서랍장 창 쪽(서쪽 벽), 붙박이장 문 쪽(1.38m), 침대 동쪽. 서랍 앞 42cm, 붙박이장 앞 32cm. 침대가 창고 샷시를 다 막아서 창고(보일러실)는 침대를 넘어 다녀야 해요.'],
    B: ['침대 문 쪽 구석 + 창 앞 비움', '침대를 서쪽 벽 문 쪽 구석으로, 붙박이장은 창 쪽 서쪽(0.76m, 문 2짝), 서랍장은 창 쪽 동쪽 구석. 서랍 앞 42cm(침대와 안 겹침), 창 앞이 비어서 창고 드나들기 편하고 놀 자리가 생겨요. 문에서 들어오는 길 92cm. 붙박이장은 1.38m → 0.76m로 짧아져요.'],
    C: ['침대 창 쪽 서쪽 벽, 붙박이장 없음', '침대를 서쪽 벽 창 쪽으로, 서랍장은 동쪽 벽 가운데. 서랍 앞 42cm, 창고 가는 길 42cm, 문 쪽 서남 구석(약 1.25×0.77m)이 비어요. 붙박이장이 없어서 옷은 서랍장과 창고 선반에 둬요.'],
    D: ['지금 안에서 서랍장·붙박이장 자리 바꿈', '침대는 그대로, 붙박이장을 창 쪽(1.46m)으로, 서랍장을 문 쪽 서쪽 벽으로. 서랍 앞 42cm, 붙박이장 앞 32cm. 창고는 지금처럼 침대가 막아요.'],
  },
  k2: {
    A: ['지금 안', '붙박이장 서쪽 벽, 침대 동쪽 벽, 서랍장 남쪽 벽. 서랍 앞이 16cm라 서랍이 거의 안 열려요.'],
    B: ['침대를 창 쪽으로 올림', '붙박이장은 그대로 두고 침대를 창고 샷시 쪽 끝까지 올림. 서랍 앞 41cm로 열려요. 대신 창고 가는 길이 붙박이장과 침대 사이 27cm라 사람이 못 지나가요(침대 넘어서 창고).'],
    C: ['침대를 붙박이장 자리로, 붙박이장 없음', '침대를 붙박이장 자리(서쪽, 창 쪽 끝까지)로, 서랍장은 남쪽 벽 그대로. 서랍 앞 41cm, 침대 동쪽으로 창고까지 49cm 길이 생겨요. 방문이 열릴 때 문 끝이 지나가야 해서 침대를 서쪽 벽에서 23cm 띄워요(벽에 딱 붙이면 문이 침대에 걸려 안 열려요). 붙박이장이 빠져서 옷은 서랍장과 창고 선반에 둬요.'],
    D: ['침대 가로로 돌림, 붙박이장 없음', '침대를 90도 돌려 방 가운데 가로로, 서랍장은 남쪽 벽 그대로. 서랍 앞 43cm, 창 앞에 48cm 띠가 생겨요. 그런데 침대(1.7m)가 방 폭(1.92m)을 거의 다 막아서 문 쪽에서 창 앞으로 가는 틈이 22cm뿐이에요. 창고는 침대를 넘어 다녀야 해요.'],
  },
};
const KZ = {};
let tagNext = null;
const matCache = new Map();

// ---------- textures ----------
// ---------- 실사 질감(Poly Haven CC0 사진) 오버레이 (11/3 케이: 3D도 사진처럼) ----------
export const REAL = {};
export async function preloadReal(base = 'img/tex/') {
  const load = src => new Promise(res => { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => res(im); im.onerror = () => res(null); im.src = src; });
  for (const k of ['oak', 'linen', 'floor']) {
    const im = await load(base + k + '.jpg?v=1'); if (!im) continue;
    const c = document.createElement('canvas'); c.width = c.height = 512; const g = c.getContext('2d'); g.drawImage(im, 0, 0, 512, 512);
    const d = g.getImageData(0, 0, 512, 512), a = d.data; let sum = 0;
    for (let i = 0; i < a.length; i += 4) { const l = 0.3 * a[i] + 0.59 * a[i + 1] + 0.11 * a[i + 2]; a[i] = l; sum += l; }
    const mean = sum / (a.length / 4), k2 = k === 'linen' ? 2.2 : k === 'floor' ? 2.0 : 2.0;
    for (let i = 0; i < a.length; i += 4) { const v = Math.max(0, Math.min(255, 128 + (a[i] - mean) * k2)); a[i] = a[i + 1] = a[i + 2] = v; a[i + 3] = 255; }
    g.putImageData(d, 0, 0); REAL[k] = c;
  }
}
function realOverlay(g, key, W, H, alpha = 0.85, rot = false) {
  const c = REAL[key]; if (!c) return false;
  g.save(); g.globalCompositeOperation = 'overlay'; g.globalAlpha = alpha;
  if (rot) { g.translate(W / 2, H / 2); g.rotate(Math.PI / 2); g.translate(-W / 2, -H / 2); }
  for (let y = 0; y < H; y += 512) for (let x = 0; x < W; x += 512) g.drawImage(c, x, y);
  g.restore(); return true;
}
function canvasTex(w, h, draw, repeat = 1) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8; t.repeat.set(repeat, repeat);
  return t;
}
function rnd(seed) { let s = seed; return () => (s = (s * 16807) % 2147483647) / 2147483647; }
const rgb = (c, d = 0) => `rgb(${Math.max(0, Math.min(255, c[0] + d))},${Math.max(0, Math.min(255, c[1] + d))},${Math.max(0, Math.min(255, c[2] + d))})`;

// 2m x 2m 바닥 마루
function woodFloorTex(col, plank = 190) {
  return canvasTex(1024, 1024, (g, W, H) => {
    const r = rnd(7); const pw = Math.round(plank / 2000 * W);
    for (let x = 0; x < W; x += pw) {
      let y = -Math.floor(r() * 500);
      while (y < H) {
        const L = 300 + Math.floor(r() * 450); const v = Math.floor((r() - 0.5) * 22);
        g.fillStyle = rgb(col, v); g.fillRect(x, y, pw, L);
        for (let k = 0; k < 7; k++) { // grain
          g.strokeStyle = `rgba(80,50,20,${0.04 + r() * 0.06})`; g.lineWidth = 1;
          g.beginPath(); const gx = x + r() * pw; g.moveTo(gx, y); g.bezierCurveTo(gx + (r() - .5) * 8, y + L / 3, gx + (r() - .5) * 8, y + 2 * L / 3, gx + (r() - .5) * 6, y + L); g.stroke();
        }
        g.fillStyle = 'rgba(60,40,20,0.35)'; g.fillRect(x, y, pw, 1.5);
        y += L;
      }
      g.fillStyle = 'rgba(60,40,20,0.35)'; g.fillRect(x, 0, 1.5, H);
    }
    realOverlay(g, 'floor', W, H, 0.8, true);
  });
}
function tileTex(col, size, grout = 3) { // 1200mm square canvas
  return canvasTex(1024, 1024, (g, W) => {
    const r = rnd(11); const n = Math.round(1200 / size); const s = W / n;
    g.fillStyle = rgb(col, -18); g.fillRect(0, 0, W, W);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      g.fillStyle = rgb(col, Math.floor((r() - .5) * 8)); g.fillRect(i * s + grout / 2, j * s + grout / 2, s - grout, s - grout);
      for (let k = 0; k < 30; k++) { g.fillStyle = `rgba(255,255,255,${r() * 0.05})`; g.fillRect(i * s + r() * s, j * s + r() * s, 20 + r() * 40, 2); }
    }
  });
}
function terrazzoTex(col) {
  return canvasTex(1024, 1024, (g, W) => {
    const r = rnd(5); g.fillStyle = rgb(col); g.fillRect(0, 0, W, W);
    const chips = [[230, 228, 222], [170, 168, 160], [120, 118, 112], [200, 190, 175], [90, 95, 100]];
    for (let i = 0; i < 2600; i++) { const c = chips[Math.floor(r() * chips.length)]; g.fillStyle = rgb(c); g.beginPath(); const x = r() * W, y = r() * W, s = 1.5 + r() * 6; g.ellipse(x, y, s, s * (0.5 + r() * 0.6), r() * 3, 0, 7); g.fill(); }
    g.strokeStyle = 'rgba(0,0,0,0.25)'; g.lineWidth = 2; for (let i = 0; i <= 2; i++) { g.beginPath(); g.moveTo(i * W / 2, 0); g.lineTo(i * W / 2, W); g.moveTo(0, i * W / 2); g.lineTo(W, i * W / 2); g.stroke(); }
  });
}
function grainTex(col) {
  return canvasTex(512, 512, (g, W, H) => {
    const r = rnd(3); g.fillStyle = rgb(col); g.fillRect(0, 0, W, H);
    if (realOverlay(g, 'oak', W, H, 0.9, true)) return;
    for (let k = 0; k < 140; k++) { g.strokeStyle = `rgba(70,40,15,${0.03 + r() * 0.07})`; g.lineWidth = 0.6 + r() * 1.6; g.beginPath(); const y = r() * H; g.moveTo(0, y); g.bezierCurveTo(W / 3, y + (r() - .5) * 18, 2 * W / 3, y + (r() - .5) * 18, W, y + (r() - .5) * 10); g.stroke(); }
  });
}
function grainVTex(col) {
  const t = grainTex(col); t.center.set(0.5, 0.5); t.rotation = Math.PI / 2; return t;
}
function herringboneTex(col) { // 2m x 2m
  return canvasTex(1024, 1024, (g, W) => {
    const r = rnd(13); g.fillStyle = rgb(col, -25); g.fillRect(0, 0, W, W);
    const L = 90, w = 18; // px (약 600 x 120mm)
    for (let row = -2; row < 16; row++) for (let col2 = -2; col2 < 16; col2++) {
      for (const k of [0, 1]) {
        const x = col2 * 2 * w * 2 + (k ? w * 2 : 0) + row * w * 2, y = row * L / 1.2 + (k ? 0 : L / 2.4);
        g.save(); g.translate(x % (W + 200) - 100, y % (W + 200) - 100); g.rotate(k ? Math.PI / 4 : -Math.PI / 4);
        const v = Math.floor((r() - 0.5) * 26); g.fillStyle = rgb(col, v); g.fillRect(0, 0, L, w - 1.5);
        for (let q = 0; q < 3; q++) { g.strokeStyle = `rgba(70,40,15,${0.05 + r() * 0.06})`; g.beginPath(); const yy = r() * w; g.moveTo(0, yy); g.lineTo(L, yy + (r() - .5) * 3); g.stroke(); }
        g.restore();
      }
    }
  });
}
function paintTex(col) {
  return canvasTex(256, 256, (g, W) => { const r = rnd(21); g.fillStyle = rgb(col); g.fillRect(0, 0, W, W); for (let i = 0; i < 2500; i++) { g.fillStyle = `rgba(${r() > .5 ? '255,255,255' : '0,0,0'},${r() * 0.025})`; g.fillRect(r() * W, r() * W, 2, 2); } }, 6);
}
function marbleTex(col) {
  return canvasTex(512, 512, (g, W) => { g.fillStyle = rgb(col); g.fillRect(0, 0, W, W); const r = rnd(77);
    for (let k = 0; k < 14; k++) { g.strokeStyle = `rgba(120,115,110,${0.08 + r() * 0.18})`; g.lineWidth = 0.6 + r() * 2.2; g.beginPath(); let x = r() * W, y = 0; g.moveTo(x, y); while (y < W) { x += (r() - .5) * 60; y += 20 + r() * 40; g.lineTo(x, y); } g.stroke(); } }, 1);
}
function caneTex(col) {
  return canvasTex(256, 256, (g, W) => {
    g.fillStyle = rgb(col, -70); g.fillRect(0, 0, W, W); const s = 16;
    for (let y = 0; y < W; y += s) for (let x = 0; x < W; x += s) { g.strokeStyle = rgb(col); g.lineWidth = 3; g.beginPath(); g.arc(x + s / 2, y + s / 2, s / 2.6, 0, 7); g.stroke(); g.beginPath(); g.moveTo(x, y + s / 2); g.lineTo(x + s, y + s / 2); g.moveTo(x + s / 2, y); g.lineTo(x + s / 2, y + s); g.stroke(); }
  }, 4);
}
function fabricTex(col) {
  return canvasTex(256, 256, (g, W, H) => {
    const r = rnd(9); g.fillStyle = rgb(col); g.fillRect(0, 0, W, H);
    if (realOverlay(g, 'linen', W, H, 0.55)) return;
    for (let i = 0; i < W; i += 2) { g.fillStyle = `rgba(0,0,0,${0.02 + r() * 0.03})`; g.fillRect(i, 0, 1, H); g.fillStyle = `rgba(255,255,255,${r() * 0.03})`; g.fillRect(0, i, W, 1); }
  }, 4);
}
function rattanTex(col) {
  return canvasTex(256, 256, (g, W) => {
    g.fillStyle = rgb(col); g.fillRect(0, 0, W, W);
    g.strokeStyle = rgb(col, -45); g.lineWidth = 2;
    for (let i = -W; i < W * 2; i += 14) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + W, W); g.stroke(); g.beginPath(); g.moveTo(i, W); g.lineTo(i + W, 0); g.stroke(); }
  }, 3);
}

// ---------- materials ----------
function hex2rgb(h) { h = h.replace('#', ''); return [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16)); }
function M(color, o = {}) {
  const key = color + JSON.stringify(o);
  if (matCache.has(key)) return matCache.get(key);
  const p = { color: new THREE.Color(color), roughness: o.rough ?? 0.8, metalness: o.metal ?? 0 };
  if (o.tex === 'grain') { p.map = grainTex(hex2rgb(color)); p.color = new THREE.Color('#ffffff'); }
  if (o.tex === 'fabric') { p.map = fabricTex(hex2rgb(color)); p.color = new THREE.Color('#ffffff'); }
  if (o.tex === 'grainV') { p.map = grainVTex(hex2rgb(color)); p.color = new THREE.Color('#ffffff'); }
  if (o.tex === 'paint') { p.map = paintTex(hex2rgb(color)); p.color = new THREE.Color('#ffffff'); }
  if (o.tex === 'marble') { p.map = marbleTex(hex2rgb(color)); p.color = new THREE.Color('#ffffff'); }
  if (o.tex === 'cane') { p.map = caneTex(hex2rgb(color)); p.color = new THREE.Color('#ffffff'); p.transparent = false; }
  if (o.tex === 'rattan') { p.map = rattanTex(hex2rgb(color)); p.color = new THREE.Color('#ffffff'); }
  if (o.opacity !== undefined) { p.transparent = true; p.opacity = o.opacity; p.depthWrite = o.opacity > 0.6; }
  if (o.emissive) { p.emissive = new THREE.Color(o.emissive); p.emissiveIntensity = o.ei ?? 1; }
  if (o.side) p.side = THREE.DoubleSide;
  const m = new THREE.MeshStandardMaterial(p); m.name = key; // 렌더(Blender)에서 재질 종류 판별용
  matCache.set(key, m); return m;
}
const darker = (h, f = 0.8) => '#' + hex2rgb(h).map(v => Math.round(v * f).toString(16).padStart(2, '0')).join('');
const mixc = (a, b, t) => { const A = hex2rgb(a), Bc = hex2rgb(b); return '#' + A.map((v, i) => Math.round(v * (1 - t) + Bc[i] * t).toString(16).padStart(2, '0')).join(''); };

const METAL = () => M('#c9cdd1', { rough: 0.3, metal: 0.9 });
const BLACKMETAL = () => M('#2a2a2a', { rough: 0.45, metal: 0.6 });
const GLASS = () => M('#dfeef5', { rough: 0.05, opacity: 0.18 });
const WHITEPORC = () => M('#fbfbf9', { rough: 0.15 });

// ---------- primitives ----------
function geomBox(w, h, d, r) {
  if (r > 0) { r = Math.min(r, w / 2 - 0.5, h / 2 - 0.5, d / 2 - 0.5); if (r > 1) return new RoundedBoxGeometry(w * S, h * S, d * S, 3, r * S); }
  return new THREE.BoxGeometry(w * S, h * S, d * S);
}
function addMesh(geo, mat, parent, shadow = true) { const m = new THREE.Mesh(geo, mat); m.castShadow = shadow; m.receiveShadow = true; (parent || root).add(m); return m; }
// 축 정렬 박스 (평면 좌표)
function B(x1, y1, x2, y2, z0, z1, mat, r = 0, parent) {
  if (x2 <= x1 || y2 <= y1 || z1 <= z0) return null;
  const m = addMesh(geomBox(x2 - x1, z1 - z0, y2 - y1, r), mat, parent);
  m.position.set((x1 + x2) / 2 * S, (z0 + z1) / 2 * S, (y1 + y2) / 2 * S); return m;
}
function cyl(cx, cy, z0, z1, r1, r2, mat, seg = 24, parent) {
  const m = addMesh(new THREE.CylinderGeometry(r2 * S, r1 * S, (z1 - z0) * S, seg), mat, parent);
  m.position.set(cx * S, (z0 + z1) / 2 * S, cy * S); return m;
}
// 가구 그룹: 로컬 좌표에서 만들고 (cx,cy) 중심, 앞면 방향 facing(S=+y,N,E,W)
function grp(cx, cy, facing = 'S', z = 0) {
  const g = new THREE.Group(); g.position.set(cx * S, z * S, cy * S);
  g.rotation.y = { S: 0, E: Math.PI / 2, N: Math.PI, W: -Math.PI / 2 }[facing] ?? 0;
  root.add(g); return g;
}

// ---------- furniture ----------
// 장: 로컬 폭 W, 깊이 D, 앞면 +y. doors 수 또는 drawers 높이 배열
function cabinet(g, W, D, z0, H, o = {}) {
  const col = o.color || '#f4f3f0'; const toe = o.toe ?? (z0 === 0 ? 100 : 0);
  const body = M(darker(col, 0.92), { rough: 0.6 }); const door = M(col, { rough: o.gloss ? 0.25 : (o.wood ? 0.5 : 0.55), tex: o.cane ? 'cane' : (o.wood ? 'grainV' : undefined) });
  B(-W / 2, -D / 2, W / 2, D / 2 - 19, z0 + toe, z0 + H, body, 0, g);
  if (toe) B(-W / 2 + 5, -D / 2, W / 2 - 5, D / 2 - 70, z0, z0 + toe, M(darker(col, 0.55)), 0, g);
  const fz0 = z0 + toe;
  const rows = o.drawers ? o.drawers : [H - toe];
  let zz = fz0;
  const n = o.doors ?? Math.max(1, Math.round(W / 500));
  for (const rh of rows) {
    const isDrawer = !!o.drawers;
    const cols = isDrawer ? (o.drawerCols || 1) : n; const w = W / cols;
    for (let i = 0; i < cols; i++) {
      const x = -W / 2 + i * w;
      const isMir = !isDrawer && o.mirror && o.mirror.includes(i);
      if (o.sliding && !isDrawer) { // 미닫이: 앞·뒤 두 레일에 번갈아, 살짝 겹침, 세로 손잡이 홈
        const back = i % 2 ? 26 : 0, ov = 20;
        B(x - (i ? ov : 0), D / 2 - 19 - back, x + w + (i < cols - 1 ? ov : 0), D / 2 - back, zz + 1.5, zz + rh - 1.5, door, 2, g);
        const gx = i % 2 ? x + 40 : x + w - 52; B(gx, D / 2 - back, gx + 12, D / 2 - back + 1, zz + 700, zz + rh - 700 > zz + 900 ? zz + rh - 700 : zz + 1300, M('#3a3a3a'), 0, g);
        if (isMir) B(x + 60, D / 2 - back, x + w - 60, D / 2 - back + 6, zz + 120, zz + rh - 120, M('#dfe6e9', { rough: 0.04, metal: 0.3 }), 2, g);
        continue;
      }
      B(x + 1.5, D / 2 - 19, x + w - 1.5, D / 2, zz + 1.5, zz + rh - 1.5, door, 2, g);
      if (isMir) { B(x + 40, D / 2, x + w - 40, D / 2 + 6, zz + 120, zz + rh - 120, M('#dfe6e9', { rough: 0.04, metal: 0.3 }), 2, g); }
      if (o.handle === 'bar' || o.handle === 'brass') {
        const m = o.handle === 'brass' ? M('#b8955a', { rough: 0.3, metal: 0.9 }) : BLACKMETAL();
        if (isDrawer) B(x + w / 2 - 80, D / 2, x + w / 2 + 80, D / 2 + 22, zz + rh - 60, zz + rh - 48, m, 4, g);
        else { const hx = (i % 2 === 0) ? x + w - 45 : x + 33; const hz = z0 > 800 ? zz + 60 : (H > 1500 ? z0 + 1000 : zz + rh - 200); B(hx, D / 2, hx + 12, D / 2 + 22, hz, hz + 180, m, 4, g); }
      } else if (o.handle === 'groove') {
        B(x + 1.5, D / 2 - 6, x + w - 1.5, D / 2 + 0.5, zz + rh - 26, zz + rh - 14, M('#3a3a3a'), 0, g);
      }
    }
    zz += rh;
  }
}
function countertop(x1, y1, x2, y2, z, col) { return B(x1, y1, x2, y2, z, z + 30, M(col, { rough: 0.25 }), 3); }

function sofaBanquette(T) { // ㄱ자 붙박이 소파: 가로(전실 벽 앞) 0~1050, 세로(왼쪽 벽) 6550~8350
  const base = M(T.base, { rough: 0.7 }), seat = M(T.seat, { tex: 'fabric', rough: 0.95 }), back = M(T.back, { tex: 'fabric', rough: 0.95 });
  const plinth = M(darker(T.base, 0.6)); const AX = 1050, BY = 8350;
  B(20, 6040, AX - 20, 6500, 0, 80, plinth); B(0, 6000, AX, 6550, 80, 330, base, 6);
  B(0, 6550, 550, BY, 80, 330, base, 6); B(20, 6550, 510, BY - 20, 0, 80, plinth);
  for (const [a, b] of [[30, 520], [560, AX - 30]]) B(a, 6548, b, 6552, 300, 312, M('#555'), 0);
  for (const [a, b] of [[6580, 7430], [7470, BY - 30]]) B(548, a, 552, b, 300, 312, M('#555'), 0);
  for (const [a, b] of [[170, 610], [620, AX - 5]]) B(a, 6150, b, 6545, 330, 435, seat, 45);
  for (const [a, b] of [[6555, 7140], [7150, 7740], [7750, BY - 5]]) B(160, a, 545, b, 330, 435, seat, 45);
  B(5, 6150, 165, 6545, 330, 435, seat, 45);
  for (const [a, b] of [[210, 610], [620, AX - 45]]) { const m = B(a, 6060, b, 6215, 440, 860, back, 60); m.rotation.x = -0.12; }
  for (const [a, b] of [[6230, 7140], [7150, 7740], [7750, BY - 10]]) { const m = B(55, a, 210, b, 440, 860, back, 60); m.rotation.z = 0.12; }
  B(55, 6060, 205, 6215, 440, 860, back, 50);
  const acc = M(T.acc, { tex: 'fabric', rough: 0.95 }), acc2 = M(mixc(T.acc, '#ffffff', 0.5), { tex: 'fabric' });
  let p = B(230, 6180, 600, 6320, 435, 800, acc, 90); p.rotation.x = -0.25; p.rotation.y = 0.15;
  p = B(180, 7850, 320, 8250, 435, 800, acc2, 90); p.rotation.z = 0.25; p.rotation.y = -0.1;
}
function table(x1, y1, x2, y2, T, h = 740, legInset = 80) {
  B(x1, y1, x2, y2, h - 32, h, T.stone ? M(T.table, { rough: 0.25 }) : M(T.table, { tex: 'grain', rough: 0.45 }), 6);
  const leg = T.metalLeg ? M(T.leg, { rough: 0.4, metal: 0.6 }) : M(T.leg, { tex: 'grain', rough: 0.5 });
  for (const [x, y] of [[x1 + legInset, y1 + legInset], [x2 - legInset, y1 + legInset], [x1 + legInset, y2 - legInset], [x2 - legInset, y2 - legInset]]) cyl(x, y, 0, h - 32, 17, 25, leg, 16);
  B(x1 + legInset, y1 + legInset - 10, x2 - legInset, y1 + legInset + 10, h - 110, h - 32, leg, 3);
  B(x1 + legInset, y2 - legInset - 10, x2 - legInset, y2 - legInset + 10, h - 110, h - 32, leg, 3);
}
function chair(cx, cy, facing, T, style = 'wood') {
  const g = grp(cx, cy, facing);
  const wood = T.metalLeg ? M(T.leg, { rough: 0.4, metal: 0.6 }) : (style === 'paint' ? M(T.chair, { rough: 0.45 }) : M(T.leg, { tex: 'grain', rough: 0.5 }));
  const seatM = style === 'fabric' ? M(T.chair, { tex: 'fabric', rough: 0.95 }) : style === 'paint' ? M(T.chair, { rough: 0.45 }) : M(T.chair, { tex: style === 'rattan' ? 'rattan' : 'grain', rough: 0.55 });
  // 앞(+y) 쪽을 바라보고 앉음 → 등받이 -y
  for (const [x, y, sx, sy] of [[-185, 175, -1, 1], [185, 175, 1, 1], [-185, -175, -1, -1], [185, -175, 1, -1]]) {
    const l = addMesh(new THREE.CylinderGeometry(0.013, 0.016, 0.44, 12), wood, g); l.position.set(x * S, 0.22, y * S); l.rotation.z = -sx * 0.04; l.rotation.x = sy * 0.04;
  }
  B(-215, -205, 215, 210, 440, 470, seatM, 14, g);
  if (style === 'fabric') B(-205, -195, 205, 200, 465, 500, seatM, 20, g);
  for (const x of [-190, 190]) { const p = addMesh(new THREE.CylinderGeometry(0.012, 0.012, 0.36, 10), wood, g); p.position.set(x * S, 0.65, -0.19); p.rotation.x = -0.12; }
  const rail = B(-215, -230, 215, -205, 700, 820, style === 'fabric' ? seatM : wood, 10, g); rail.rotation.x = -0.12;
  if (style !== 'fabric') B(-190, -210, 190, -200, 560, 590, wood, 4, g);
  return g;
}
function pendant(cx, cy, zBottom, col = '#e9e2d5', style = 'dome') {
  LIGHT_PLAN.push({ k: 'pend', x: cx, y: cy });
  CEIL_ONLY.push(cyl(cx, cy, zBottom + 150, CEIL, 2.5, 2.5, M('#333'), 6));
  CEIL_ONLY.push(cyl(cx, cy, CEIL - 10, CEIL, 45, 45, M('#eeeeee'), 20));
  const mat = M(col, { rough: 0.5, side: true });
  let shade;
  if (style === 'dome') { shade = addMesh(new THREE.SphereGeometry(0.2, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat); shade.position.set(cx * S, (zBottom + 10) * S, cy * S); shade.scale.y = 0.75; }
  else { shade = addMesh(new THREE.CylinderGeometry(0.06, 0.18, 0.2, 32, 1, true), mat); shade.position.set(cx * S, (zBottom + 100) * S, cy * S); }
  const bulb = addMesh(new THREE.SphereGeometry(0.04, 16, 8), M('#fff6e0', { emissive: '#ffe8b8', ei: 2.5 }), null, false); bulb.position.set(cx * S, (zBottom + 30) * S, cy * S);
  const L = new THREE.PointLight('#ffe2b0', 2.2, 4.5, 2); L.position.set(cx * S, (zBottom - 40) * S, cy * S); root.add(L);
}
function coveRoom(x1, y1, x2, y2) { // 방 천장 둘레 전체 간접등(우물천장/등박스 라인)
  LIGHT_PLAN.push({ k: 'room', x1, y1, x2, y2 });
  const w = 30; cove(x1, y1, x2, y1 + w); cove(x1, y2 - w, x2, y2); cove(x1, y1 + w, x1 + w, y2 - w); cove(x2 - w, y1 + w, x2, y2 - w);
}
function toeLight(x1, y1, x2, y2) { // 붙박이장·하부장 아래 띄움 간접등
  LIGHT_PLAN.push({ k: 'toe', x1, y1, x2, y2 });
  B(x1, y1, x2, y2, 12, 20, M('#ffdcaa', { emissive: '#ffc884', ei: 2.4 })).userData.wall = true;
}
function sconce(x, y, z, nx, ny) { // 벽등: 브라스 받침 + 오팔 유리 갓, (nx,ny)=벽에서 나오는 방향
  const br = M('#b8955a', { metal: .9, rough: .3 }), op = M('#ffe9cc', { emissive: '#ffcf8f', ei: 1.4, rough: .3 });
  LIGHT_PLAN.push({ k: 'wall', x: x + nx * 70, y: y + ny * 70 });
  const bx = x - nx * 6, by = y - ny * 6;
  B(bx - (ny ? 45 : 6), by - (nx ? 45 : 6), bx + (ny ? 45 : 6), by + (nx ? 45 : 6), z - 90, z + 90, br, 4).userData.wall = true;
  const gx = x + nx * 70, gy = y + ny * 70;
  B(x - (ny ? 8 : 0) + Math.min(0, nx * 70), y - (nx ? 8 : 0) + Math.min(0, ny * 70), x + (ny ? 8 : 0) + Math.max(0, nx * 70), y + (nx ? 8 : 0) + Math.max(0, ny * 70), z - 8, z + 8, br, 3).userData.wall = true;
  const g = addMesh(new THREE.SphereGeometry(0.075, 24, 16), op, null, false); g.position.set(gx * S, z * S, gy * S); g.userData.wall = true;
  const L = new THREE.PointLight('#ffcf8f', 0.5, 2.5, 2); L.position.set(gx * S, z * S, gy * S); root.add(L);
}
function ceilingFan(cx, cy) { // 거실 실링팬(밀착형, 날개 3, 아래 LED)
  LIGHT_PLAN.push({ k: 'fan', x: cx, y: cy });
  const bm = M('#f4f2ee', { rough: .5 }), wm = M('#c9a77c', { tex: 'grain', rough: .5 });
  cyl(cx, cy, CEIL - 60, CEIL, 75, 75, bm, 24).userData.wall = true;
  cyl(cx, cy, CEIL - 230, CEIL - 60, 115, 95, bm, 32).userData.wall = true;
  cyl(cx, cy, CEIL - 240, CEIL - 230, 90, 90, M('#ffe7c2', { emissive: '#ffd49a', ei: 1.8 }), 32).userData.wall = true;
  for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3 + 0.4; const m = addMesh(new THREE.BoxGeometry(0.5, 0.008, 0.13), wm); m.position.set((cx + Math.cos(a) * 360) * S, (CEIL - 175) * S, (cy + Math.sin(a) * 360) * S); m.rotation.y = -a; m.userData.wall = true; }
}
function magRail(x1, y1, x2, y2, n) { // 11/2 아내 레퍼런스: 마그네틱 레일(천장 매입) + 스팟 n개
  LIGHT_PLAN.push({ k: 'rail', x1, y1, x2, y2, n });
  const rm = M('#1f1f1f', { rough: 0.5 }); const r = B(x1, y1, x2, y2, CEIL - 8, CEIL, rm); r.userData.wall = true; CEIL_ONLY.push(r);
  const along = (x2 - x1) > (y2 - y1);
  for (let i = 0; i < n; i++) { const t = (i + 0.5) / n; const cx = along ? x1 + (x2 - x1) * t : (x1 + x2) / 2, cy = along ? (y1 + y2) / 2 : y1 + (y2 - y1) * t;
    const sp = cyl(cx, cy, CEIL - 95, CEIL - 8, 22, 22, M('#1f1f1f', { rough: .4 }), 16); sp.userData.wall = true;
    const g = cyl(cx, cy, CEIL - 97, CEIL - 95, 18, 18, M('#fff6e0', { emissive: '#ffe8c0', ei: 2 }), 16); g.userData.wall = true; }
}
function downlight(cx, cy) { // 11/2: 방은 2인치 안티글레어(작게)
  LIGHT_PLAN.push({ k: 'down', x: cx, y: cy });
  const d = addMesh(new THREE.CylinderGeometry(0.027, 0.027, 0.006, 20), M('#ffffff', { emissive: '#fff4dc', ei: 1.6 }), null, false); d.position.set(cx * S, (CEIL - 4) * S, cy * S); CEIL_ONLY.push(d);
}
function lamp(cx, cy, z, col = '#efe7d8') {
  cyl(cx, cy, z, z + 20, 70, 70, M('#3a3a3a', { rough: 0.4, metal: .4 }));
  cyl(cx, cy, z + 20, z + 330, 7, 7, M('#3a3a3a', { rough: 0.4, metal: .4 }));
  cyl(cx, cy, z + 280, z + 460, 140, 100, M(col, { rough: 0.9, side: true, emissive: '#ffdca0', ei: 0.25 }), 24);
}
function floorLamp(cx, cy, col = '#efe7d8') {
  cyl(cx, cy, 0, 25, 150, 150, M('#2c2c2c', { metal: .5, rough: .4 }));
  cyl(cx, cy, 25, 1450, 9, 9, M('#2c2c2c', { metal: .5, rough: .4 }));
  cyl(cx, cy, 1300, 1600, 230, 170, M(col, { rough: 0.95, side: true, emissive: '#ffd9a0', ei: 0.3 }), 32);
  const L = new THREE.PointLight('#ffd9a0', 1.2, 3.5, 2); L.position.set(cx * S, 1.4, cy * S); root.add(L);
}
function plant(cx, cy, size = 1, z = 0, potCol = '#d8cfc2') {
  cyl(cx, cy, z, z + 330 * size, 120 * size, 150 * size, M(potCol, { rough: 0.85 }), 24);
  cyl(cx, cy, z + 300 * size, z + 320 * size, 140 * size, 140 * size, M('#4a3b2c'), 24);
  const leaf = M('#5f7d4a', { rough: 0.7, side: true }), leaf2 = M('#76955c', { rough: 0.7, side: true });
  const r = rnd(Math.floor(cx + cy));
  cyl(cx, cy, z + 300 * size, z + 1000 * size, 10, 14, M('#6b5a44'), 8);
  for (let i = 0; i < 22; i++) {
    const a = r() * Math.PI * 2, h = z + (550 + r() * 650) * size, rr = (60 + r() * 230) * size;
    const m = addMesh(new THREE.SphereGeometry(0.11 * size, 10, 6), r() > .5 ? leaf : leaf2);
    m.scale.set(1, 0.18, 0.7); m.position.set((cx + Math.cos(a) * rr) * S, h * S, (cy + Math.sin(a) * rr) * S);
    m.rotation.set((r() - .5) * 0.9, a, (r() - .5) * 0.9);
  }
}
function rug(x1, y1, x2, y2, col, round = false) {
  const m = M(col, { tex: 'fabric', rough: 1 });
  if (round) { const c = cyl((x1 + x2) / 2, (y1 + y2) / 2, 1, 12, (x2 - x1) / 2, (x2 - x1) / 2, m, 48); c.castShadow = false; return; }
  const b = B(x1, y1, x2, y2, 1, 12, m, 5); b.castShadow = false;
}
function curtain(x1, x2, y, z0, z1, col, opa = 0.93) {
  const W = (x2 - x1), folds = Math.max(4, Math.round(W / 110));
  const geo = new THREE.PlaneGeometry(W * S, (z1 - z0) * S, folds * 8, 1);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) { const x = pos.getX(i); pos.setZ(i, Math.sin((x / (W * S)) * folds * Math.PI * 2) * 0.035); }
  geo.computeVertexNormals();
  const m = addMesh(geo, M(col, { rough: 1, side: true, opacity: opa }));
  m.position.set((x1 + x2) / 2 * S, (z0 + z1) / 2 * S, y * S);
}
function curtainX(x, y1, y2, z0, z1, col) { // 벽이 x 방향일 때 (y 방향으로 펼침)
  const W = (y2 - y1), folds = Math.max(4, Math.round(W / 110));
  const geo = new THREE.PlaneGeometry(W * S, (z1 - z0) * S, folds * 8, 1);
  const pos = geo.attributes.position; for (let i = 0; i < pos.count; i++) { const xx = pos.getX(i); pos.setZ(i, Math.sin((xx / (W * S)) * folds * Math.PI * 2) * 0.035); }
  geo.computeVertexNormals();
  const m = addMesh(geo, M(col, { rough: 1, side: true, opacity: 0.93 })); m.rotation.y = Math.PI / 2;
  m.position.set(x * S, (z0 + z1) / 2 * S, (y1 + y2) / 2 * S);
}
function romanShade(x1, x2, y, zTop, zBottom, col) { // 접히는 로만 쉐이드 (창틀 안)
  const m = M(col, { tex: 'fabric', rough: 1 });
  B(x1, y - 20, x2, y + 20, zTop - 60, zTop, M(darker(col, .9)), 5).userData.wall = true;
  B(x1 + 10, y - 8, x2 - 10, y + 8, zBottom, zTop - 60, m, 2).userData.wall = true;
  for (let z = zBottom; z < zBottom + 400; z += 100) B(x1 + 5, y - 30, x2 - 5, y + 18, z, z + 70, m, 30).userData.wall = true;
}
function bed(cx, cy, W, L, facing, T, o = {}) { // 로컬: 머리 -y, 발 +y. facing = 발이 향하는 방향
  const g = grp(cx, cy, facing);
  const x1 = -W / 2, x2 = W / 2, y1 = -L / 2, y2 = L / 2;
  const frame = M(o.frame || T.head, { tex: o.woodFrame ? 'grain' : 'fabric', rough: 0.9 });
  B(x1, y1, x2, y2, 60, 300, frame, 25, g);
  B(x1 + 40, y1 + 40, x2 - 40, y2 - 40, 0, 60, M('#2a2a2a'), 0, g);
  const hh = o.headH ?? 1050;
  if (o.channel) { const n = Math.round(W / 180); const w = (W + 40) / n; for (let i = 0; i < n; i++) B(x1 - 20 + i * w + 4, y1 - 90, x1 - 20 + (i + 1) * w - 4, y1, 280, hh, frame, 40, g); B(x1 - 20, y1 - 100, x2 + 20, y1 - 60, 0, 300, frame, 10, g); }
  else B(x1 - 20, y1 - 90, x2 + 20, y1, 0, hh, frame, 40, g);
  B(x1 + 25, y1 + 15, x2 - 25, y2 - 25, 300, 520, M('#fbfaf6', { tex: 'fabric', rough: 1 }), 60, g);
  const yd = y1 + L * 0.33;
  B(x1 + 5, yd, x2 - 5, y2 - 5, 300, 560, M(T.duvet, { tex: 'fabric', rough: 1 }), 70, g);
  B(x1 + 15, yd - 60, x2 - 15, yd + 80, 545, 585, M(mixc(T.duvet, '#ffffff', 0.4), { tex: 'fabric' }), 25, g);
  B(x1 - 10, y2 - 520, x2 + 10, y2 - 160, 300, 575, M(T.acc, { tex: 'fabric', rough: 1 }), 30, g);
  const np = o.pillows || 2, pw = (W - 120) / np;
  for (let i = 0; i < np; i++) { const p = B(x1 + 60 + i * pw + 15, y1 + 40, x1 + 60 + (i + 1) * pw - 15, y1 + 400, 515, 660, M('#ffffff', { tex: 'fabric' }), 70, g); p.rotation.x = -0.35; }
  if (np >= 2) { const p = B(-220, y1 + 260, 220, y1 + 380, 540, 820, M(T.acc, { tex: 'fabric' }), 60, g); p.rotation.x = -0.3; }
  return g;
}
function nightstand(cx, cy, T, lampOn = true) {
  B(cx - 225, cy - 200, cx + 225, cy + 200, 60, 500, M(T.desk, { tex: 'grain', rough: 0.55 }), 8);
  B(cx - 205, cy + 200, cx + 205, cy + 203, 300, 312, M('#4a4a4a'));
  for (const [dx, dy] of [[-190, -170], [190, -170], [-190, 170], [190, 170]]) cyl(cx + dx, cy + dy, 0, 60, 12, 12, M('#3a3a3a'), 8);
  if (lampOn) lamp(cx + 40, cy - 30, 500);
}
// 11/3 케이: 안방 붙박이장(IKEA PAX식). 겉에서 보이는 서랍(아래) + 여닫이 문(위, 두 짝으로 나눠 문 열리는 폭 약 30cm) + 속 행거
// axis 'x': 북쪽 벽 장(앞면 +y), axis 'y': 동쪽 벽 장(앞면 -x). secs = [[a,b,kind]] kind: jacketDrawer(위 걸이 100cm + 아래 서랍) | longDrawer(위 코트 160cm + 아래 서랍) | double(2단 걸이) | mirror(전신 거울 문 + 선반)
function closet(axis, a0, a1, back, front, secs, T, col, wood) {
  const body = M(col, { tex: wood ? 'grainV' : undefined, rough: .5 }), inner = M(mixc(col, '#f4f1ea', .5), { rough: .6 }), door = M(col, { tex: wood ? 'grainV' : undefined, rough: .45 });
  const dir = front > back ? 1 : -1, fIn = front - dir * 20;
  const R = (u1, u2, v1, v2, z1, z2, m, r = 0) => axis === 'x' ? B(u1, Math.min(v1, v2), u2, Math.max(v1, v2), z1, z2, m, r) : B(Math.min(v1, v2), u1, Math.max(v1, v2), u2, z1, z2, m, r);
  R(a0, a1, back, back + dir * 18, 0, CEIL, inner).userData.wall = true; R(a0, a1, back, fIn, CEIL - 20, CEIL, body).userData.wall = true; R(a0, a1, back, fIn, 0, 100, M(darker(col, .8))).userData.wall = true;
  R(a0, a0 + 18, back, fIn, 0, CEIL, body).userData.wall = true; R(a1 - 18, a1, back, fIn, 0, CEIL, body).userData.wall = true;
  const rail = M('#b9bcbf', { metal: .8, rough: .3 }), cloth = ['#3d4450', '#8a7a68', '#d9d2c5', '#5b6b5e', '#a79a8a', '#2f2f33', '#c8b9a4'], dk = M('#3a3a3a');
  const hang = (u1, u2, zr, len, k0) => { R(u1 + 20, u2 - 20, back + dir * 270, back + dir * 290, zr, zr + 20, rail).userData.skip = true; let k = k0; for (let u = u1 + 50; u < u2 - 60; u += 70, k++) R(u, u + 45, back + dir * 60, back + dir * 500, zr - len, zr - 20, M(cloth[k % 7], { tex: 'fabric', rough: 1 }), 8).userData.skip = true; };
  const shelf = (u1, u2, z) => R(u1 + 18, u2 - 18, back, fIn, z, z + 18, inner).userData.skip = true;
  // 겉 서랍(앞판이 장 앞면과 같은 면) + 손잡이 홈
  const drawers = (u1, u2, z1, z2, n) => { const h = (z2 - z1) / n; for (let i = 0; i < n; i++) { R(u1 + 2, u2 - 2, front - dir * 20, front, z1 + i * h + 2, z1 + (i + 1) * h - 2, door, 2).userData.skip = true; R(u1 + 40, u2 - 40, front, front + dir * 2, z1 + (i + 1) * h - 30, z1 + (i + 1) * h - 20, dk).userData.skip = true; } shelf(u1, u2, z2); };
  // 여닫이 문(두 짝, 또는 한 짝) — 장 속 보기에서 숨김
  const doors = (u1, u2, z1, z2, n, mir = false) => { const w = (u2 - u1) / n; for (let i = 0; i < n; i++) { const x1 = u1 + i * w; const d = R(x1 + 2, x1 + w - 2, front - dir * 20, front, z1 + 2, z2 - 2, door, 2); d.userData.cabDoor = true; d.userData.door = true;
      const hx = (n === 2 ? (i ? x1 + 30 : x1 + w - 42) : x1 + w - 42); const hz = z1 > 300 ? z1 + 40 : 1000; const h = R(hx, hx + 12, front, front + dir * 2, hz, hz + 300, dk); h.userData.cabDoor = true; h.userData.door = true;
      if (mir) { const mm = R(x1 + 50, x1 + w - 50, front, front + dir * 6, z1 + 120, z2 - 120, M('#dfe6e9', { rough: 0.04, metal: 0.3 }), 2); mm.userData.cabDoor = true; mm.userData.door = true; } } };
  secs.forEach(([u1, u2, kind], i) => {
    if (i > 0) R(u1 - 9, u1 + 9, back, fIn, 100, CEIL - 20, body).userData.wall = true;
    if (kind === 'jacketDrawer') { drawers(u1, u2, 100, 1100, 4); hang(u1, u2, 2210, 1000, i * 3); doors(u1, u2, 1100, CEIL - 20, 2); }
    else if (kind === 'longDrawer') { drawers(u1, u2, 100, 560, 2); hang(u1, u2, 2210, 1600, i * 3); doors(u1, u2, 560, CEIL - 20, 2); }
    else if (kind === 'double') { shelf(u1, u2, 1140); hang(u1, u2, 2210, 950, i * 3); hang(u1, u2, 1100, 900, i * 3 + 2); doors(u1, u2, 100, CEIL - 20, 2); }
    else { for (let z = 100; z < CEIL - 200; z += 360) shelf(u1, u2, z); doors(u1, u2, 100, CEIL - 20, 1, true); }
  });
}
function wardrobe(x1, y1, x2, y2, facing, T, o = {}) {
  const W = facing === 'N' || facing === 'S' ? x2 - x1 : y2 - y1, D = facing === 'N' || facing === 'S' ? y2 - y1 : x2 - x1;
  const g = grp((x1 + x2) / 2, (y1 + y2) / 2, facing);
  cabinet(g, W, D, o.z0 ?? 0, o.H ?? CEIL, { color: o.color || T.tall, doors: o.doors, handle: o.handle || 'bar', toe: o.toe, drawers: o.drawers, drawerCols: o.drawerCols, wood: o.wood, gloss: o.gloss, mirror: o.mirror, sliding: o.sliding });
  return g;
}
function desk(x1, y1, x2, y2, T, chairFacing = 'N') {
  B(x1, y1, x2, y2, 710, 740, M(T.desk, { tex: 'grain', rough: 0.5 }), 5);
  const leg = M('#3b3b3b', { metal: 0.5, rough: 0.4 });
  for (const x of [x1 + 30, x2 - 50]) { B(x, y1 + 30, x + 20, y2 - 30, 0, 20, leg); B(x, (y1 + y2) / 2 - 10, x + 20, (y1 + y2) / 2 + 10, 0, 710, leg); }
}
function officeChair(cx, cy, facing, col) {
  const g = grp(cx, cy, facing);
  const m = M(col, { tex: 'fabric', rough: 0.95 }), k = M('#2b2b2b', { rough: 0.5, metal: .3 });
  for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; const s = addMesh(new THREE.BoxGeometry(0.26, 0.02, 0.03), k, g); s.position.set(Math.cos(a) * 0.12, 0.06, Math.sin(a) * 0.12); s.rotation.y = -a; const w = addMesh(new THREE.SphereGeometry(0.022, 8, 6), k, g); w.position.set(Math.cos(a) * 0.24, 0.022, Math.sin(a) * 0.24); }
  const p = addMesh(new THREE.CylinderGeometry(0.02, 0.02, 0.38, 10), k, g); p.position.y = 0.26;
  B(-230, -220, 230, 220, 440, 510, m, 30, g);
  const bk = B(-210, -260, 210, -200, 560, 960, m, 40, g); bk.rotation.x = -0.15;
  return g;
}
function teepee(cx, cy, size, col) {
  const h = 1500 * size, r = 600 * size;
  const c = addMesh(new THREE.ConeGeometry(r * S, h * S, 4, 1, true, Math.PI / 4), M(col, { tex: 'fabric', rough: 1, side: true }));
  c.position.set(cx * S, h / 2 * S, cy * S);
  for (let i = 0; i < 4; i++) { const a = Math.PI / 4 + i * Math.PI / 2; const p = addMesh(new THREE.CylinderGeometry(0.012, 0.012, h * 1.25 * S, 6), M('#b89a72', { tex: 'grain' })); p.position.set((cx + Math.cos(a) * r * 0.45) * S, h * 0.55 * S, (cy + Math.sin(a) * r * 0.45) * S); p.lookAt(new THREE.Vector3(cx * S, h * 1.2 * S, cy * S)); p.rotateX(Math.PI / 2); }
  B(cx - r * 0.8, cy - r * 0.8, cx + r * 0.8, cy + r * 0.8, 0, 50, M('#f3ece0', { tex: 'fabric' }), 25);
}
function toyShelf(x1, y1, x2, y2, facing, T, cols = 3, rows = 2, H = 620) {
  const W = facing === 'N' || facing === 'S' ? x2 - x1 : y2 - y1, D = facing === 'N' || facing === 'S' ? y2 - y1 : x2 - x1;
  const g = grp((x1 + x2) / 2, (y1 + y2) / 2, facing);
  const wood = M(T.desk, { tex: 'grain', rough: 0.55 });
  B(-W / 2, -D / 2, W / 2, D / 2, 0, 18, wood, 0, g); B(-W / 2, -D / 2, W / 2, D / 2, H - 18, H, wood, 3, g);
  B(-W / 2, -D / 2, W / 2, -D / 2 + 8, 0, H, wood, 0, g);
  for (let i = 0; i <= cols; i++) { const x = -W / 2 + i * (W - 18) / cols; B(x, -D / 2, x + 18, D / 2, 0, H, wood, 0, g); }
  for (let j = 1; j < rows; j++) { const z = j * H / rows; B(-W / 2, -D / 2, W / 2, D / 2, z - 9, z + 9, wood, 0, g); }
  const bins = ['#e9c9b4', '#cfe0d6', '#f2e2b0', '#d8d0e6', '#c9d9e6', '#f0d0d0'];
  const cw = (W - 18) / cols, rh = H / rows;
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    if ((i + j) % 3 === 2) { // 책
      for (let k = 0; k < 6; k++) B(-W / 2 + i * cw + 40 + k * 32, -D / 2 + 40, -W / 2 + i * cw + 66 + k * 32, D / 2 - 40, j * rh + 12, j * rh + rh * (0.6 + (k % 3) * 0.1), M(bins[(k + 2) % 6]), 2, g);
    } else B(-W / 2 + i * cw + 30, -D / 2 + 20, -W / 2 + (i + 1) * cw - 12, D / 2 - 5, j * rh + 12, j * rh + rh - 30, M(bins[(i * 2 + j) % 6], { tex: 'fabric' }), 25, g);
  }
}
function playMat(x1, y1, x2, y2, col) {
  const n = Math.max(2, Math.round((x2 - x1) / 600)); const w = (x2 - x1) / n;
  for (let i = 0; i < n; i++) { const b = B(x1 + i * w + 2, y1, x1 + (i + 1) * w - 2, y2, 0, 40, M(i % 2 ? col : mixc(col, '#ffffff', 0.25), { rough: 0.9 }), 15); b.castShadow = false; }
}
function toys(cx, cy) {
  const cols = ['#f2b8a0', '#f6dc8a', '#9ccfc0', '#b9b2e0'];
  B(cx - 120, cy - 120, cx + 120, cy + 120, 40, 200, M(cols[0]), 30);
  B(cx + 160, cy - 60, cx + 280, cy + 60, 40, 160, M(cols[1]), 20);
  const ball = addMesh(new THREE.SphereGeometry(0.09, 20, 14), M(cols[2], { rough: 0.5 })); ball.position.set((cx - 250) * S, 0.13, (cy + 150) * S);
  // 흔들목마 대신 라이드온 장난감
  B(cx + 50, cy + 220, cx + 430, cy + 380, 120, 300, M(cols[3], { rough: 0.5 }), 60);
  for (const dx of [90, 390]) { const w = addMesh(new THREE.CylinderGeometry(0.06, 0.06, 0.04, 20), M('#444')); w.rotation.x = Math.PI / 2; w.position.set((cx + dx) * S, 0.1, (cy + 200) * S); const w2 = w.clone(); w2.position.z = (cy + 400) * S; root.add(w2); }
}
function books(x, y, z, n, dir = 'x') {
  const cols = ['#7a8b99', '#c9b49a', '#9a6f5a', '#e6dccb', '#5f6f63', '#b7a3c4'];
  for (let i = 0; i < n; i++) { const t = 25 + (i % 3) * 8, h = 200 + (i % 4) * 25; if (dir === 'x') B(x + i * 36, y, x + i * 36 + t, y + 160, z, z + h, M(cols[i % 6], { rough: 0.7 }), 3); else B(x, y + i * 36, x + 160, y + i * 36 + t, z, z + h, M(cols[i % 6], { rough: 0.7 }), 3); }
}
// 문짝(열린 상태), 문틀
function doorLeaf(x1, y1, x2, y2, col, side = 0) { // side: 손잡이 방향(-1/+1, 0=양쪽). 벽에 붙은 쪽엔 손잡이 없음
  B(x1, y1, x2, y2, 0, 2080, M(col, { rough: 0.5 }), 3).userData.door = true;
  const m = METAL(); const along = (x2 - x1) > (y2 - y1);
  const lo = side > 0 ? 0 : 50, hi = side < 0 ? 0 : 50;
  if (along) { const hx = x2 - 80; B(hx, y1 - lo, hx + 20, y2 + hi, 980, 1000, m, 5).userData.door = true; }
  else { const hy = y2 - 80; B(x1 - lo, hy, x2 + hi, hy + 20, 980, 1000, m, 5).userData.door = true; }
}
function casing(x1, y1, x2, y2, col) { // 11/2 아내 레퍼런스: 무몰딩(문선 없음). 벽과 같은 면, 문 위에 얇은 그림자 줄눈만
  const m = M('#9a958d', { rough: 0.8 }); const t = 6;
  if ((x2 - x1) > (y2 - y1)) { for (const yy of [y1 - 2, y2]) B(x1, yy, x2, yy + 2, 2100, 2100 + t, m).userData.wall = true; }
  else { for (const xx of [x1 - 2, x2]) B(xx, y1, xx + 2, y2, 2100, 2100 + t, m).userData.wall = true; }
}
function windowSet(x1, x2, yWall, sill, top, frameCol = '#f4f4f2', panes = 2, depth = 60) {
  const fm = M(frameCol, { rough: 0.4 }); const n0 = root.children.length;
  B(x1, yWall - 70, x2, yWall - 10, sill - 30, sill, fm); B(x1, yWall - 70, x2, yWall - 10, top, top + 30, fm);
  B(x1, yWall - 70, x1 + 50, yWall - 10, sill, top, fm); B(x2 - 50, yWall - 70, x2, yWall - 10, sill, top, fm);
  for (let i = 1; i < panes; i++) { const x = x1 + (x2 - x1) * i / panes; B(x - 25, yWall - 75, x + 25, yWall - 5, sill, top, fm); }
  const g = B(x1 + 50, yWall - 45, x2 - 50, yWall - 35, sill, top, GLASS()); g.castShadow = false;
  // 창턱(안쪽)
  B(x1 - 20, yWall - 20, x2 + 20, yWall + (depth > 0 ? depth : 0), sill - 30, sill, M('#f2f0ea', { rough: 0.3 }));
  for (let i = n0; i < root.children.length; i++) root.children[i].userData.wall = true;
}

// ---------- floor ----------
function floorZone(x1, y1, x2, y2, tex, rough = 0.6, rep = 2000, name = 'FLOOR') {
  const t = tex.clone(); t.needsUpdate = true; t.repeat.set((x2 - x1) / rep, (y2 - y1) / rep); t.offset.set(x1 / rep, y1 / rep);
  const m = new THREE.MeshStandardMaterial({ map: t, roughness: rough });
  const p = addMesh(new THREE.PlaneGeometry((x2 - x1) * S, (y2 - y1) * S), m, null, false);
  p.rotation.x = -Math.PI / 2; p.position.set((x1 + x2) / 2 * S, 0.001, (y1 + y2) / 2 * S); p.name = name; m.name = name;
}

// ---------- house ----------
export const LABELS = [
  ['거실·놀이', 1500, 9800], ['주방', 3300, 2000], ['안방', 4600, 7300], ['아이방 1', 900, 2700], ['아이방 2', 5800, 2400], ['욕실', 5350, 4950], ['전실', 620, 5100], ['식탁', 1050, 7500], ['세탁 부스', 6000, 10000], ['안방 확장', 4000, 10000], ['아기 책장', 2900, 7600], ['화장대', 6300, 7850]
];
const SKY = [];
export const OUTSIDE = SKY;

function skyline() { // 창밖 풍경 (원통 안쪽 면)
  const tex = canvasTex(2048, 512, (g, W, H) => {
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#bcd3e6'); gr.addColorStop(0.55, '#e3ecf2'); gr.addColorStop(1, '#eef0ee'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    const r = rnd(31);
    for (let layer = 0; layer < 2; layer++) {
      let x = 0; while (x < W) { const bw = 60 + r() * 140, bh = (layer ? 140 : 90) + r() * (layer ? 160 : 90); const c = layer ? [214, 214, 210] : [228, 230, 230];
        g.fillStyle = rgb(c, Math.floor((r() - .5) * 14)); g.fillRect(x, H * 0.72 - bh, bw, bh + 200);
        g.fillStyle = 'rgba(120,135,150,0.25)'; for (let yy = H * 0.72 - bh + 12; yy < H * 0.72 - 6; yy += 14) for (let xx = x + 8; xx < x + bw - 8; xx += 16) g.fillRect(xx, yy, 8, 6);
        x += bw + 10 + r() * 40; }
    }
    g.fillStyle = '#9fb08e'; for (let x = 0; x < W; x += 6) { const h = 30 + r() * 40; g.beginPath(); g.ellipse(x, H * 0.74, 14, h / 2, 0, 0, 7); g.fill(); }
    g.fillStyle = '#c9ccc8'; g.fillRect(0, H * 0.76, W, H);
  });
  tex.repeat.set(2, 1);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(28, 28, 18, 48, 1, true), new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, toneMapped: false }));
  m.position.set(3.3, 6, 5.3); root.add(m); SKY.push(m);
  const ground = new THREE.Mesh(new THREE.CircleGeometry(28, 48), new THREE.MeshBasicMaterial({ color: '#c9ccc8', toneMapped: false })); ground.rotation.x = -Math.PI / 2; ground.position.set(3.3, -3, 5.3); root.add(ground); SKY.push(ground);
}
function windowLight(x, y, z, w, h, rotY, intensity = 4) { // rotY=PI: 북쪽 창(남쪽으로 비춤), 0: 남쪽 창(북쪽으로)
  const L = new THREE.RectAreaLight('#fff6ea', intensity, w * S, h * S); L.position.set(x * S, z * S, y * S); L.lookAt(x * S, z * S, (y + (rotY ? 1000 : -1000)) * S); root.add(L);
}
function cove(x1, y1, x2, y2) { // 천장 간접조명 띠 (11/2 케이: 2700K 주황빛, 밝게)
  const m = M('#ffdcaa', { emissive: '#ffc884', ei: 2.6 });
  LIGHT_PLAN.push({ k: 'cove', x1, y1, x2, y2 });
  B(x1, y1, x2, y2, CEIL - 120, CEIL - 100, m).userData.wall = true;
}
function nsBox(x1, y1, x2, y2, T, lampOn = true, wood = true) { // 협탁 (절대좌표)
  B(x1, y1, x2, y2, 60, 520, M(T.desk, { tex: wood ? 'grain' : undefined, rough: 0.5 }), 8);
  const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2;
  for (const [dx, dy] of [[x1 + 25, y1 + 25], [x2 - 25, y1 + 25], [x1 + 25, y2 - 25], [x2 - 25, y2 - 25]]) cyl(dx, dy, 0, 60, 12, 12, M('#3a3a3a'), 8);
  if (lampOn) lamp(cx, cy, 520, T.lampc || '#efe7d8');
}
function dishRack(x1, y1, x2, y2, z) { // 2단 대형 식기건조대
  const mt = M('#d7dadc', { rough: 0.25, metal: 0.85 });
  B(x1, y1, x2, y2, z, z + 22, M('#5b5f63', { rough: 0.4 }), 6); // 물받이
  for (const [x, y] of [[x1 + 15, y1 + 15], [x2 - 15, y1 + 15], [x1 + 15, y2 - 15], [x2 - 15, y2 - 15]]) cyl(x, y, z + 22, z + 520, 7, 7, mt, 10);
  for (const zz of [z + 60, z + 330]) { // 바구니 철망
    B(x1 + 10, y1 + 10, x2 - 10, y2 - 10, zz, zz + 8, mt, 3);
    for (let i = 0; i <= 8; i++) { const x = x1 + 10 + i * (x2 - x1 - 20) / 8; B(x - 2, y1 + 10, x + 2, y2 - 10, zz + 8, zz + 60, mt); }
    B(x1 + 10, y1 + 10, x2 - 10, y1 + 14, zz + 8, zz + 70, mt); B(x1 + 10, y2 - 14, x2 - 10, y2 - 10, zz + 8, zz + 70, mt);
  }
  // 아래칸 접시
  for (let i = 0; i < 7; i++) { const p = addMesh(new THREE.CylinderGeometry(0.12, 0.12, 0.012, 32), M(['#ffffff', '#f1ede6', '#e7e2da'][i % 3], { rough: 0.2 })); p.rotation.z = Math.PI / 2; p.rotation.y = 0.1; p.position.set((x1 + 60 + i * 45) * S, (z + 200) * S, ((y1 + y2) / 2) * S); }
  // 위칸 컵·그릇
  for (let i = 0; i < 3; i++) cyl(x1 + 90 + i * 120, y1 + 120, z + 338, z + 440, 38, 32, M(['#ffffff', '#d9cbb5', '#9fb2bf'][i], { rough: .25 }));
  for (let i = 0; i < 2; i++) cyl(x1 + 120 + i * 180, y2 - 120, z + 338, z + 400, 85, 60, M('#f4f1ea', { rough: .2 }), 28);
  cyl(x2 - 60, y2 - 60, z + 22, z + 180, 45, 45, mt, 16); for (let i = 0; i < 4; i++) cyl(x2 - 75 + (i % 2) * 25, y2 - 70 + (i > 1 ? 20 : 0), z + 150, z + 260, 5, 5, M(['#c9a77c', '#333', '#c9cdd1', '#c9a77c'][i]), 6);
}
function kidsBookshelf(x1, y1, x2, y2, H, T) { // 긴 아기 책장·장난감장 (앞면 서쪽 -x, 벽 x2)
  const g = grp((x1 + x2) / 2, (y1 + y2) / 2, 'W'); const L = y2 - y1, D = x2 - x1;
  const wood = M(T.shelf || T.tall, { tex: T.shelfWood ? 'grainV' : undefined, rough: 0.5 });
  const lx = (v) => -L / 2 + v; // 로컬 x (벽을 따라)
  B(-L / 2, -D / 2, L / 2, D / 2, 0, 60, M(darker(T.shelf || T.tall, .8)), 0, g);
  B(-L / 2, -D / 2, L / 2, -D / 2 + 12, 60, H, wood, 0, g); // 뒤판
  B(-L / 2, -D / 2, L / 2, D / 2, H - 22, H, wood, 4, g); // 상판
  const n = Math.round(L / 790), mw = L / n;
  const coverCols = ['#e8a87c', '#87b6c9', '#f2d16b', '#9cc5a1', '#d98d8d', '#b9a6d6', '#f4f0e6', '#6f8fb8'];
  const binCols = ['#e7d8c6', '#cfdcd2', '#efe0b8', '#d9d2e3', '#d6e2ea'];
  for (let i = 0; i <= n; i++) B(lx(i * mw) - 9, -D / 2, lx(i * mw) + 9, D / 2, 60, H - 22, wood, 0, g);
  for (let i = 0; i < n; i++) {
    const a = lx(i * mw) + 9, b = lx((i + 1) * mw) - 9;
    if (i % 2 === 0) { // 앞보기 전면 책장(경사 선반 4단)
      for (let k = 0; k < 4; k++) {
        const z = 120 + k * 330;
        const sh = B(a, -D / 2 + 30, b, D / 2 - 20, z, z + 15, wood, 2, g); sh.rotation.x = 0.0;
        B(a, D / 2 - 40, b, D / 2 - 20, z + 15, z + 70, wood, 2, g); // 턱
        let x = a + 15; let j = 0;
        while (x < b - 140) { const bw = 150 + ((i * 7 + k * 3 + j) % 4) * 25, bh = 180 + ((i + k + j) % 3) * 30;
          const bk = B(x, D / 2 - 70, Math.min(x + bw, b - 10), D / 2 - 45, z + 15, z + 15 + bh, M(coverCols[(i * 3 + k * 5 + j) % 8], { rough: 0.55 }), 3, g); bk.rotation.x = -0.12;
          x += bw + 10; j++; }
      }
    } else { // 바구니 칸 (3단 x 2열)
      for (let k = 1; k < 3; k++) B(a, -D / 2 + 12, b, D / 2, 60 + k * (H - 82) / 3 - 9, 60 + k * (H - 82) / 3 + 9, wood, 0, g);
      const cw = (b - a) / 2, rh = (H - 82) / 3;
      for (let k = 0; k < 3; k++) for (let c = 0; c < 2; c++) {
        const zz = 60 + k * rh + 12;
        if (false) { // 11/3 케이: 칸 속 장난감 뺌, 전부 수납 바구니
          B(a + c * cw + 60, -D / 2 + 60, a + c * cw + 220, D / 2 - 60, zz, zz + 150, M(coverCols[(k + c) % 8], { rough: .5 }), 30, g);
          const s2 = addMesh(new THREE.SphereGeometry(0.06, 16, 12), M(coverCols[(k + c + 3) % 8], { rough: .4 }), g); s2.position.set((a + c * cw + 290) * S, (zz + 60) * S, 0);
        } else B(a + c * cw + 15, -D / 2 + 30, a + (c + 1) * cw - 15, D / 2 - 5, zz, zz + rh - 50, M(binCols[(i + k * 2 + c) % 5], { tex: 'fabric' }), 25, g);
      }
    }
  }
  // 위: 액자·화분·인형
  for (let i = 0; i < n; i += 2) { B(lx(i * mw + 100), -D / 2 + 30, lx(i * mw + 360), -D / 2 + 50, H, H + 300, M('#f4f1ea'), 4, g); B(lx(i * mw + 130), -D / 2 + 50, lx(i * mw + 330), -D / 2 + 53, H + 30, H + 270, M(['#c9d6c4', '#e8d3c0', '#cfd9e3'][i % 3])); }
  // 11/3: 책장 위 곰 인형 뺌
  return g;
}
function floorSofa(T) { // 좌식 라운지 소파 (거실 확장부)
  const base = M(darker(T.seat, .8), { tex: 'fabric' }), seat = M(T.seat, { tex: 'fabric', rough: 1 }), back = M(T.back, { tex: 'fabric', rough: 1 });
  B(470, 9750, 2580, 10430, 0, 120, base, 30);
  for (let i = 0; i < 3; i++) B(490 + i * 700, 9760, 1180 + i * 700, 10200, 120, 260, seat, 50);
  for (let i = 0; i < 3; i++) { const b = B(510 + i * 700, 10200, 1160 + i * 700, 10420, 140, 560, back, 70); b.rotation.x = 0.18; }
  for (const x of [540, 2120]) { const p = B(x, 9800, x + 380, 9950, 260, 600, M(T.acc, { tex: 'fabric' }), 70); p.rotation.y = x < 1000 ? 0.4 : -0.4; }
  cyl(1650, 9420, 0, 330, 300, 320, M(T.table, { tex: T.stone ? undefined : 'grain', rough: T.stone ? .3 : .45 }), 48);
  cyl(1560, 9400, 330, 420, 50, 45, M('#efe9de', { rough: .3 })); books(1650, 9370, 330, 3);
  rug(450, 8900, 2600, 9800, T.rug || '#e8e0d4');
}
function floorLounge(T) { // 좌식 쿠션 + 라탄 라운지체어 (리조트)
  rug(100, 9000, 2150, 10300, T.rug || '#e6dccb', false);
  for (const [x, y, c] of [[450, 9550, T.acc], [700, 10050, T.seat]]) { cyl(x, y, 0, 180, 300, 300, M(c, { tex: 'fabric' }), 32); cyl(x, y, 180, 200, 290, 270, M(mixc(c, '#ffffff', .2), { tex: 'fabric' }), 32); }
  cyl(1150, 9600, 0, 330, 250, 270, M('#c9a77c', { tex: 'rattan' }), 32); cyl(1150, 9600, 330, 355, 280, 280, M(T.table, { tex: 'grain' }), 40);
  // 라탄 라운지체어
  const g = grp(1820, 10020, 'N');
  B(-330, -300, 330, 320, 120, 360, M('#c9a77c', { tex: 'rattan' }), 40, g); B(-300, -280, 300, 300, 360, 430, M('#efe6d6', { tex: 'fabric' }), 40, g);
  const bk = B(-330, 220, 330, 330, 360, 900, M('#c9a77c', { tex: 'rattan' }), 40, g); bk.rotation.x = 0.25;
  for (const x of [-330, 300]) B(x, -300, x + 30, 320, 120, 600, M('#c9a77c', { tex: 'rattan' }), 10, g);
  for (const [x, y] of [[-300, -270], [270, -270], [-300, 290], [270, 290]]) B(x, y, x + 30, y + 30, 0, 120, M('#8a6a48'), 4, g);
  plant(2350, 9400, 0.4, 0, '#c9a77c'); plant(560, 9250, 0.5, 0, '#e8e1d4');
}
function kidsWardrobe(x1, y1, x2, y2, facing, T) { // 아이 붙박이장: 위 장 + 가운데 옷걸이 문 + 아래 열린 칸(바구니)
  const W = facing === 'N' || facing === 'S' ? x2 - x1 : y2 - y1, D = facing === 'N' || facing === 'S' ? y2 - y1 : x2 - x1;
  const g = grp((x1 + x2) / 2, (y1 + y2) / 2, facing);
  const col = T.kidCab || T.tall;
  cabinet(g, W, D, 0, CEIL, { color: col, doors: Math.max(2, Math.round(W / 700)), handle: 'none', wood: !!T.kidWood, sliding: true });
  // 아래 열린 칸 하나 (아이 손 닿는 높이)
  const cw = Math.min(600, W / 3);
  B(W / 2 - cw, D / 2 - 20, W / 2, D / 2 + 1, 100, 520, M(darker(col, .85)), 0, g);
  for (let i = 0; i < 2; i++) B(W / 2 - cw + 20 + i * (cw / 2), D / 2 - 330, W / 2 - cw + (i + 1) * (cw / 2) - 10, D / 2 - 30, 110, 420, M(['#e7d8c6', '#cfdcd2', '#efe0b8'][i], { tex: 'fabric' }), 25, g);
}
function bumperBed(cx, cy, col = '#e9d8bd', rot = false) { // 11/4 케이 확인: 비비엔다 특대형 범퍼침대 풀세트(크림 베이지). 외경 1,200×1,700×350, 바닥 매트 5cm, 범퍼 두께 10cm 4개. rot=true면 가로(동서 1,700)로 눕힘, 머리 서쪽
  const g = grp(cx, cy, rot ? 'E' : 'S');
  const x1 = -600, x2 = 600, y1 = -850, y2 = 850;
  const fab = M(col, { tex: 'fabric', rough: 1 }), seam = M(darker(col, .9), { tex: 'fabric', rough: 1 });
  B(x1 + 100, y1 + 100, x2 - 100, y2 - 100, 0, 50, M('#f7f4ee', { tex: 'fabric', rough: 1 }), 20, g); // 바닥 매트 1,000×1,500×50
  for (const x of [x1, x2 - 100]) { B(x, y1, x + 100, y2, 0, 350, fab, 48, g); B(x + 2, y1 + 20, x + 98, y2 - 20, 345, 352, seam, 4, g).userData.skip = true; } // 긴 범퍼
  for (const y of [y1, y2 - 100]) { B(x1 + 100, y, x2 - 100, y + 100, 0, 350, fab, 48, g); } // 짧은 범퍼
  B(-220, y1 + 140, 220, y1 + 420, 50, 130, M('#ffffff', { tex: 'fabric' }), 40, g).userData.skip = true; // 베개
  B(x1 + 140, -100, x2 - 140, y2 - 140, 50, 90, M(mixc(col, '#c9d6e3', .35), { tex: 'fabric' }), 30, g).userData.skip = true; // 이불
  return g;
}
function kidBed(cx, cy, T, style) { // 1000x2000, 머리 북쪽
  if (style === 'floor') { // 몬테소리 하우스 바닥 침대
    const w = M(T.kidFrame || T.desk, { tex: 'grain', rough: .5 }); const x1 = cx - 520, x2 = cx + 520, y1 = cy - 1025, y2 = cy + 1025;
    B(x1, y1, x2, y2, 0, 120, w, 10);
    B(x1 + 30, y1 + 30, x2 - 30, y2 - 30, 120, 300, M('#fbfaf6', { tex: 'fabric' }), 50);
    B(x1 + 30, y1 + 650, x2 - 30, y2 - 30, 280, 330, M(T.duvet, { tex: 'fabric' }), 50); B(x1 + 150, y1 + 60, x2 - 150, y1 + 420, 290, 410, M('#ffffff', { tex: 'fabric' }), 60);
    for (const y of [y1, y2 - 40]) { for (const x of [x1, x2 - 40]) B(x, y, x + 40, y + 40, 120, 1300, w, 6);
      for (const sgn of [1, -1]) { const r = B(cx - 330, y, cx + 330, y + 40, 1480, 1520, w, 6); r.position.x = (cx + sgn * -265) * S; r.rotation.z = sgn * 0.62; } }
    B(cx - 20, y1, cx + 20, y2, 1660, 1700, w, 6);
    B(x1, y1 + 40, x1 + 40, y2 - 40, 300, 340, w, 6); // 낮은 난간
    // 가랜드 조명
    for (let i = 0; i < 9; i++) { const b = addMesh(new THREE.SphereGeometry(0.018, 8, 6), M('#fff2cf', { emissive: '#ffe3a0', ei: 2 })); b.position.set((x1 + 10) * S, (1250 - Math.sin(i / 8 * Math.PI) * 120) * S, (y1 + 200 + i * 200) * S); }
  } else {
    bed(cx, cy, 1000, 2050, 'S', T, { pillows: 1, frame: T.kidFrame || T.desk, woodFrame: true, headH: 850 });
    // 가드 레일 (방 쪽)
    const w = M(T.kidFrame || T.desk, { tex: 'grain' }); const xr = cx + 500;
    const side = -1; const xr2 = cx + side * 500; // 방 쪽(서쪽, 붙박이장 쪽)에 가드
    for (let i = 0; i < 2; i++) B(xr2 - 18, cy - 1000, xr2 + 18, cy - 100, 560 + i * 140, 600 + i * 140, w, 8).userData.skip = true;
    B(xr2 - 18, cy - 1000, xr2 + 18, cy - 960, 300, 740, w, 6).userData.skip = true; B(xr2 - 18, cy - 140, xr2 + 18, cy - 100, 300, 740, w, 6).userData.skip = true;
  }
}
function readingNook(x1, y1, x2, y2, T) { // 창가 쿠션 벤치 + 책 (앞면 남쪽)
  const g = grp((x1 + x2) / 2, (y1 + y2) / 2, 'S'); cabinet(g, x2 - x1, y2 - y1, 0, 400, { color: T.kidCab || T.tall, doors: 2, handle: 'groove', toe: 40, wood: !!T.kidWood });
  B(x1, y1, x2, y2, 400, 470, M(T.acc, { tex: 'fabric' }), 30);
  for (let i = 0; i < 3; i++) { const p = B(x1 + 60 + i * 330, y1 + 10, x1 + 360 + i * 330, y1 + 140, 470, 820, M([T.duvet, T.seat, T.back][i], { tex: 'fabric' }), 70); p.rotation.x = -0.2; }
}

export function buildHouse(scene, T, V) {
  if (root) { scene.remove(root); root.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }
  root = new THREE.Group(); scene.add(root); CEIL_ONLY.length = 0; LIGHT_PLAN.length = 0; WALLS.length = 0; SKY.length = 0;
  const wallM = M(T.wall, { rough: 0.92, tex: 'paint' }); const capM = M('#4d4b47', { rough: 0.9 });
  const wallMats = [wallM, wallM, capM, wallM, wallM, wallM];
  const partM = M(T.part, { rough: 0.9, tex: 'paint' }); const partMats = [partM, partM, capM, partM, partM, partM];
  const wall = (x1, y1, x2, y2, z0 = 0, z1 = CEIL, mats = wallMats) => { const m = addMesh(new THREE.BoxGeometry((x2 - x1) * S, (z1 - z0) * S, (y2 - y1) * S), z1 >= CEIL ? mats : mats[0]); m.position.set((x1 + x2) / 2 * S, (z0 + z1) / 2 * S, (y1 + y2) / 2 * S); m.userData.wall = true; WALLS.push([x1, y1, x2, y2, z0, z1]); return m; };
  skyline();

  // 바닥
  const fc = T.floorc;
  const floorTex = T.floor === 'tile' ? tileTex(fc, 600, 3) : T.floor === 'herring' ? herringboneTex(fc) : woodFloorTex(fc, T.plank || 190);
  const rep = T.floor === 'tile' ? 1200 : 2000;
  for (const z of [[0, 4170, 3066, 10500], [2340, 263, 4455, 4170], [2340, 3961, 4250, 5724], [3066, 5724, 6622, 10500], [0, 1417, 2117, 3965], [4704, 1348, 6622, 3961]])
    floorZone(...z, floorTex, T.floor === 'tile' ? 0.35 : 0.5, rep);
  floorZone(4474, 4119, 6258, 5724, tileTex([228, 231, 232], 300, 3), 0.3, 1200, 'TILE');
  floorZone(0, 4170, 1250, 6000, T.entryTex === 'terrazzo' ? terrazzoTex(T.entry) : tileTex(T.entry, 600, 3), 0.35, 1200, 'TILE');
  floorZone(0, 263, 832, 1417, tileTex([214, 214, 212], 300, 3), 0.5, 1200, 'TILE');
  floorZone(932, 263, 2117, 1417, tileTex([214, 214, 212], 300, 3), 0.5, 1200, 'TILE'); // 11/3 케이: 발코니2 확장 취소 → 창고(타일 바닥)
  floorZone(5022, 263, 6622, 1348, tileTex([214, 214, 212], 300, 3), 0.5, 1200, 'TILE'); // 11/3 케이: 발코니3도 확장 취소 → 창고
  floorZone(5622, 9540, 6622, 10500, tileTex([226, 232, 234], 300, 3), 0.4, 1200, 'TILE'); floorZone(5572, 9540, 5622, 10500, tileTex([226, 232, 234], 300, 3), 0.4, 1200, 'TILE');

  // 내부 벽 (천장까지)
  for (const w of [[832, 263, 932, 420], [832, 1000, 932, 1417], [0, 1417, 932, 1500], [2117, 263, 2340, 3965], [0, 3965, 1250, 4170], [2040, 3965, 2340, 4170], [4455, 263, 4704, 1348], [4455, 1348, 4704, 3030], [4455, 3880, 4704, 3961], [4250, 3961, 6622, 4119], [4704, 263, 5022, 1348], [4250, 3961, 4474, 4975], [4250, 5650, 4474, 5724], [6258, 4119, 6622, 5724], [3066, 5724, 3264, 5951], [4211, 5724, 6622, 5951], [3066, 5724, 3264, 9317], [2900, 9200, 3264, 9540], [5672, 9317, 6622, 9540]]) wall(...w);
  for (const [x1, y1, x2, y2] of [[1250, 3965, 2040, 4170], [4455, 3030, 4704, 3880], [4250, 4975, 4474, 5650], [3264, 5724, 4211, 5951], [-220, 4560, 0, 5400]]) wall(x1, y1, x2, y2, 2100, CEIL);
  // 뒤쪽 외벽 + 창 (주방 창은 싱크 위로 줄임: 건조대 위·오른쪽 상부장 자리)
  wall(-220, -220, 980, 263); wall(2070, -220, 2900, 263); wall(3820, -220, 5100, 263); wall(6500, -220, 6842, 263);
  for (const [x1, x2, sill] of [[980, 2070, 900], [2900, 3820, 1100], [5100, 6500, 900]]) { wall(x1, -220, x2, 263, 0, sill); wall(x1, -220, x2, 263, 2100, CEIL); windowSet(x1, x2, 263, sill, 2100, '#f4f4f2', 2, x1 === 2900 ? 0 : 60); }
  windowLight(1525, 300, 1500, 1000, 1100, Math.PI, 1.6); windowLight(5800, 300, 1500, 1300, 1100, Math.PI, 1.6); windowLight(3360, 300, 1600, 860, 950, Math.PI, 1.3);
  // 좌우 외벽
  wall(-220, 0, 0, 4560); wall(-220, 5400, 0, 10650); wall(6622, 0, 6842, 10650);
  // 현관문
  B(-200, 4580, -150, 5380, 0, 2080, M(T.entryDoor || '#3d3d3d', { rough: 0.5 }), 4);
  B(-150, 5280, -110, 5300, 950, 1150, METAL(), 4);
  // 앞쪽 통창: 거실 0~2600 (오른쪽 끝은 벽 + 거실 키큰장), 안방 3176~5900
  wall(-220, 10500, 0, 10650); wall(2600, 10500, 3176, 10650); wall(5900, 10500, 6842, 10650);
  for (const [x1, x2, mids] of [[0, 2600, [1300]], [3176, 5900, [4540]]]) {
    wall(x1, 10500, x2, 10650, 0, 450); wall(x1, 10500, x2, 10650, 2150, CEIL);
    const fm = M('#f4f4f2', { rough: 0.4 });
    for (const x of [x1, x2 - 50]) B(x, 10520, x + 50, 10600, 450, 2150, fm);
    for (const x of mids) B(x - 25, 10520, x + 25, 10600, 450, 2150, fm);
    B(x1, 10520, x2, 10600, 430, 460, fm); B(x1, 10520, x2, 10600, 2120, 2150, fm);
    const g = B(x1, 10555, x2, 10565, 450, 2150, GLASS()); g.castShadow = false;
    B(x1 - 10, 10440, x2 + 10, 10520, 420, 450, M('#f2f0ea', { rough: 0.3 }));
  }
  for (const c of root.children) if (c.isMesh && c.position.z > 10.4) c.userData.wall = true;
  windowLight(1300, 10380, 1300, 2500, 1600, 0, 2.0); windowLight(4540, 10380, 1300, 2600, 1600, 0, 1.8);
  // 하리(상부 보)
  if (V.arch) archHari(0, 2900, 9255, 9330, T.wall); else B(0, 9255, 2900, 9330, 1980, CEIL, wallM);
  B(3264, 9317, 5672, 9540, 1980, CEIL, wallM);
  B(932, 1417, 2117, 1500, 1980, CEIL, wallM);
  { // 11/3 케이: 아이방1 ↔ 발코니2(창고) 사이에 새 샤시(2짝 미닫이, 반투명 유리: 빛은 들고 창고 안은 안 보임). 보일러실은 창고 쪽 기존 문 그대로
    const fr = M('#f4f4f2', { rough: .4 }), gm = M('#eef2f2', { rough: 0.6, opacity: 0.55 });
    B(932, 1417, 2117, 1500, 1960, 1980, fr).userData.wall = true; B(932, 1417, 2117, 1500, 0, 20, fr).userData.wall = true;
    B(932, 1417, 982, 1500, 20, 1960, fr).userData.wall = true; B(2067, 1417, 2117, 1500, 20, 1960, fr).userData.wall = true;
    for (const [a, b, y] of [[982, 1560, 1440], [1500, 2067, 1470]]) { B(a, y - 12, b, y + 12, 20, 1960, gm).userData.wall = true; B(a, y - 15, a + 40, y + 15, 20, 1960, fr).userData.wall = true; B(b - 40, y - 15, b, y + 15, 20, 1960, fr).userData.wall = true; }
  }
  { // 창고 선반(동쪽 벽, 깊이 400, 5단) — 세제 리필·생활용품·캠핑 등. 보일러실 문 열림 자리(서쪽) 비움
    const sm = M('#e9e6e0', { rough: .5 }), pm = M('#9a958d', { metal: .5, rough: .4 });
    for (const [x, y] of [[1722, 300], [2097, 300], [1722, 1380], [2097, 1380]]) B(x, y, x + 15, y + 15, 0, 1900, pm).userData.wall = true;
    for (let z = 150; z <= 1900; z += 350) B(1722, 300, 2112, 1395, z, z + 20, sm).userData.wall = true;
    const bc = ['#e8e1d4', '#c9b49a', '#9fb2bf', '#f4f1ea'];
    for (let z = 170, k = 0; z < 1800; z += 350) for (let y = 360; y < 1300; y += 300, k++) B(1760, y, 2070, y + 240, z, z + 220, M(bc[k % 4], { rough: .6 }), 10).userData.skip = true;
  } B(5022, 1150, 6622, 1348, 1980, CEIL, wallM);
  { // 11/3 케이: 아이방2 ↔ 발코니3(창고) 사이 새 샷시(2짝 미닫이, 반투명) + 창고 선반(동쪽 벽 깊이 400, 5단)
    const fr = M('#f4f4f2', { rough: .4 }), gm = M('#eef2f2', { rough: 0.6, opacity: 0.55 });
    B(5022, 1150, 6622, 1348, 1960, 1980, fr).userData.wall = true; B(5022, 1150, 6622, 1348, 0, 20, fr).userData.wall = true;
    B(5022, 1150, 5072, 1348, 20, 1960, fr).userData.wall = true; B(6572, 1150, 6622, 1348, 20, 1960, fr).userData.wall = true;
    for (const [a, b, y] of [[5072, 5860, 1230], [5780, 6572, 1262]]) { B(a, y - 12, b, y + 12, 20, 1960, gm).userData.wall = true; B(a, y - 15, a + 40, y + 15, 20, 1960, fr).userData.wall = true; B(b - 40, y - 15, b, y + 15, 20, 1960, fr).userData.wall = true; }
    const sm = M('#e9e6e0', { rough: .5 }), pm = M('#9a958d', { metal: .5, rough: .4 });
    for (const [x, y] of [[6207, 300], [6592, 300], [6207, 1120], [6592, 1120]]) B(x, y, x + 15, y + 15, 0, 1900, pm).userData.wall = true;
    for (let z = 150; z <= 1900; z += 350) B(6207, 300, 6607, 1135, z, z + 20, sm).userData.wall = true;
    const bc = ['#e8e1d4', '#c9b49a', '#9fb2bf', '#f4f1ea'];
    for (let z = 170, k = 0; z < 1800; z += 350) for (let y = 340; y < 1060; y += 260, k++) B(6245, y, 6560, y + 210, z, z + 220, M(bc[k % 4], { rough: .6 }), 10).userData.skip = true;
  }
  for (const c of root.children) if (c.isMesh && c.position.y > 1.9) c.userData.wall = true;
  // 거실/안방 확장부 새 벽
  wall(3066, 9540, 3176, 10500);
  // 세탁 부스: 11/9 양개 여닫이 2짝(각 약 44cm, 서재 쪽으로 열림), 옆 수납 없음
  // 11/3 케이: 부스를 50cm 내밀던 벽 → 10cm만(세탁기 깊이 약 87cm + 문 여유). 앞면 x5572, 내력벽 면(x5672)에서 10cm. 서재가 40cm 넓어짐
  wall(5572, 9480, 5672, 9540); B(5572, 9540, 5622, 10500, 2050, CEIL, wallM).userData.wall = true;
  { const pm = M('#f6f5f2', { rough: 0.6 }); /* 11/2 아내 레퍼런스: 세탁실 문짝은 무광 화이트(어두우면 답답) */ const pan = (ax, ay, bx, by) => { const L = Math.hypot(bx - ax, by - ay); const m = addMesh(new THREE.BoxGeometry(22 * S, 2030 * S, L * S), pm); m.position.set((ax + bx) / 2 * S, 1.03, (ay + by) / 2 * S); m.rotation.y = Math.atan2(bx - ax, by - ay); m.userData.door = true; };
    // 11/5 케이: 폴딩도어 → 일반 여닫이 문 1짝, 경첩은 창 쪽(y10490), 서재 쪽으로 열림. 문 폭 700(활짝 열면 끝이 x4872 → 책상 끝 x4836과 안 부딪힘)
    //   문 왼쪽(안방 쪽) y9548~9770은 틈새장 앞판이 부스 앞면과 같은 면으로 마감(문 대신 이 판을 당겨 틈새장을 뺌)
    // 11/9 실장님 스케치업: 문 1짝(약 77cm)이면 서재 책상에 걸려 다 안 열리고 세탁기 옆 틈은 67mm뿐 → 케이 안: 양개 여닫이 2짝(각 약 44cm), 옆 수납 없음
    for (const [hy, dir, a] of [[9576, 1, 0.55], [10464, -1, 0.55]]) { const L = 442, hx = 5590;
      const m = addMesh(new THREE.BoxGeometry(36 * S, 2030 * S, L * S), pm);
      m.position.set((hx - Math.sin(a) * L / 2) * S, 1.03, (hy + dir * Math.cos(a) * L / 2) * S); m.rotation.y = dir > 0 ? -a : Math.PI + a; m.userData.door = true;
      const kx = hx - Math.sin(a) * (L - 50) - 25 * Math.cos(a), ky = hy + dir * Math.cos(a) * (L - 50) + dir * 0;
      const k = addMesh(new THREE.BoxGeometry(18 * S, 160 * S, 18 * S), M('#c9a272', { rough: .5 })); k.position.set(kx * S, 1.0, ky * S); k.userData.door = true; }
    for (const [y1, y2] of [[9540, 9576], [10464, 10500]]) B(5572, y1, 5622, y2, 0, 2040, M('#b9b9b9', { metal: .6, rough: .3 })).userData.wall = true; // 문틀 36mm
    B(5572, 9540, 5622, 10500, 2040, 2050, M('#b9b9b9', { metal: .6, rough: .3 })).userData.wall = true; }
  // 전실 벽 + 중문
  // 11/9 케이·아내: 중문은 유리 대신 간살(세로 살) + 양개형(가운데서 양쪽으로 열림). 살 뒤는 안 깨지는 반투명 폴리카보네이트판
  // 11/9 케이: 분리수거장 니치(1,100~1,400) 뒤 벽을 유리로 → 현관에서 거실이 보이게(고정 강화유리, 아이 손 안 닿는 높이)
  wall(1200, 4170, 1250, 4400, 0, CEIL, partMats); wall(1200, 5750, 1250, 6000, 0, CEIL, partMats); wall(1200, 4400, 1250, 5750, 2100, CEIL, partMats);
  wall(0, 5950, 1250, 6000, 0, 1110, partMats); wall(0, 5950, 1250, 6000, 1390, CEIL, partMats); wall(0, 5950, 18, 6000, 1110, 1390, partMats); wall(1132, 5950, 1250, 6000, 1110, 1390, partMats);
  { const gm = GLASS(); const g = B(18, 5968, 1132, 5982, 1110, 1390, gm); g.castShadow = false; g.userData.wall = true;
    const fm = M(T.niche || T.tall, { tex: 'grainV', rough: .5 }); B(18, 5950, 1132, 6000, 1100, 1110, fm).userData.wall = true; B(18, 5950, 1132, 6000, 1390, 1400, fm).userData.wall = true; }
  // 11/9 케이: 중문 시안 A~D(아이방 배치처럼 버튼). 모두 우드 간살 + 살 뒤 반투명 폴리카보네이트(유리 없음), 아이가 밀고 나가지 않게 거는 장치
  { const fr = M(T.entryCab || T.tall || '#c9a272', { rough: 0.5, tex: 'grainV' }); const pc = M('#f3f1ea', { rough: 0.75, opacity: 0.62 }); const hm = T.khandle === 'brass' ? M('#b8955a', { metal: .8, rough: .3 }) : BLACKMETAL();
    const JM = KIDS.jm || 'A';
    B(1190, 4400, 1250, 4430, 0, 2100, fr); B(1190, 5720, 1250, 5750, 0, 2100, fr); B(1190, 4400, 1250, 5750, 2070, 2100, fr); // 문틀
    const panel = (g, y0, y1, ox = 0, isDoor = true) => { // 간살 판(로컬: 두께 x, 폭 y0~y1)
      const part = (a, b, z0, z1, m) => { const o = B(ox - 20, a, ox + 20, b, z0, z1, m, 0, g); if (o) o.userData[isDoor ? 'door' : 'wall'] = true; return o; };
      const W = y1 - y0; part(y0, y0 + 55, 10, 2065, fr); part(y1 - 55, y1, 10, 2065, fr); part(y0, y1, 10, 110, fr); part(y0, y1, 1975, 2065, fr); part(y0, y1, 960, 1010, fr);
      const pn = part(y0 + 55, y1 - 55, 110, 1975, pc); if (pn) { pn.castShadow = false; pn.scale.x = 0.15; }
      const n = Math.max(2, Math.round((W - 110) / 45)), sw = 22, gap = (W - 110 - n * sw) / (n + 1);
      for (let i = 0; i < n; i++) { const a = y0 + 55 + gap + i * (sw + gap); const o = part(a, a + sw, 110, 1975, fr); if (o) o.scale.x = 0.8; }
    };
    const G0 = () => { const g = new THREE.Group(); g.position.set(1225 * S, 0, 0); root.add(g); return g; };
    const swing = (hy, LW, dir, open) => { // 경첩 hy, 거실·복도(+x) 쪽으로만 열림(현관 쪽 문 멈춤 턱)
      const g = new THREE.Group(); g.position.set(1225 * S, 0, hy * S); g.rotation.y = dir * open; root.add(g);
      const y0 = dir > 0 ? 0 : -LW, y1 = dir > 0 ? LW : 0; panel(g, y0, y1);
      const hy2 = dir > 0 ? y1 - 90 : y0 + 90; for (const sx of [-1, 1]) B(sx * 34 - 6, hy2 - 8, sx * 34 + 6, hy2 + 8, 750, 1350, hm, 3, g).userData.door = true;
      const lb = dir > 0 ? [y1 - 150, y1 - 4] : [y0 + 4, y0 + 50]; B(20, lb[0], 30, lb[1], 1700, 1760, hm, 2, g).userData.door = true; // 위 슬라이드 걸쇠
      return g; };
    const Z = USE_ZONES; for (const k of Object.keys(Z)) if (k.startsWith('중문')) delete Z[k];
    if (JM === 'A') { // 양개 여닫이 643×2
      const g = swing(4432, 643, 1, 0.45); B(20, 603, 28, 623, 10, 160, hm, 2, g).userData.door = true; swing(5718, 643, -1, 0.45);
      Z['중문 양개 문 열리는 자리'] = [1250, 4430, 1900, 5720];
    } else if (JM === 'B') { // 외여닫이 약 900 + 양옆 고정 간살(신발장·분리수거장 앞판 선)
      panel(G0(), 4430, 4560, 0, false); panel(G0(), 5460, 5720, 0, false); swing(4562, 896, 1, 0.5);
      Z['중문 여닫이 문 열리는 자리'] = [1250, 4562, 2160, 5460];
    } else if (JM === 'C') { // 원슬라이딩: 옆에 밀어 넣을 벽이 없어 고정 판 위로 겹쳐 열림
      panel(G0(), 5060, 5720, 0, false); { const g = G0(); panel(g, 4432, 5100, 44); B(18, 5040, 30, 5056, 700, 1400, hm, 3, g).userData.door = true; B(64, 5060, 74, 5098, 1700, 1760, hm, 2, g).userData.door = true; }
      B(1240, 4400, 1290, 5750, 2075, 2100, fr).userData.wall = true; Z['중문 앞 복도'] = [1300, 4430, 1800, 5720];
    } else { // D 3연동: 3짝이 겹치며 한쪽으로 열림
      [[4432, 4900], [4870, 5320], [5290, 5720]].forEach(([a, b], i) => { const g = G0(); panel(g, a, b, -28 + i * 30); if (i === 0) { B(-6, 4840, 6, 4856, 700, 1400, hm, 3, g).userData.door = true; B(-6, 4800, 4, 4900, 1700, 1760, hm, 2, g).userData.door = true; } });
      B(1180, 4400, 1260, 5750, 2075, 2100, fr).userData.wall = true; Z['중문 앞 복도'] = [1270, 4430, 1800, 5720];
    }
  }
  // 문짝 + 문틀
  const doorCol = T.doorCol || '#f3f1ec';
  // 보일러실 문: 11/3 발코니2를 창고로 남겨 원래처럼 창고(발코니) 쪽에서 드나듦. 폭 약 580
  B(832, 420, 932, 1000, 2080, CEIL, wallM).userData.wall = true; casing(832, 420, 932, 1000, doorCol);
  doorLeaf(932, 420, 1512, 460, doorCol, 1);
  { const bm = M('#f2f2f0', { rough: .4 }); B(80, 330, 480, 630, 1150, 1850, bm, 8); cyl(280, 480, 1850, CEIL, 50, 50, M('#c9ced2', { metal: .6, rough: .3 })); B(120, 360, 440, 600, 1100, 1150, M('#9aa0a4', { metal: .5 })); }
  doorLeaf(2077, 3290, 2117, 3965, doorCol, -1); doorLeaf(4704, 3840, 5380, 3880, doorCol); doorLeaf(4474, 5640, 5100, 5680, doorCol); doorLeaf(3264, 5951, 3304, 6750, doorCol, 1);
  casing(1250, 3965, 2040, 4170, doorCol); casing(4455, 3030, 4704, 3880, doorCol); casing(4250, 4975, 4474, 5650, doorCol); casing(3264, 5724, 4211, 5951, doorCol);
  // 걸레받이: 11/2 아내 레퍼런스(3cm 걸레받이 후회 → 마이너스 걸레받이). 벽 안으로 들어간 얇은 그림자 줄
  const base = M('#7d786f', { rough: 0.7 });
  const nb = root.children.length;
  for (const [x1, y1, x2, y2] of [[0, 6000, 3, 9255], [3063, 5951, 3066, 6000], [3264, 5951, 3267, 6800], [12, 10497, 2900, 10500]]) B(x1, y1, x2, y2, 0, 12, base);
  for (let i = nb; i < root.children.length; i++) root.children[i].userData.wall = true;

  // 천장 (아래에서만 보임) + 조명
  const ceil = addMesh(new THREE.PlaneGeometry(6.622, 10.5), M('#fbfaf7', { rough: 1 }), null, false); ceil.rotation.x = Math.PI / 2; ceil.position.set(3.311, CEIL * S - 0.001, 5.25);
  // 11/2 아내 레퍼런스: 거실·주방은 마그네틱 레일, 방·현관·복도는 2인치 매입등 최소 개수
  magRail(400, 9780, 2600, 9805, 4); magRail(2390, 6300, 2415, 8700, 3); magRail(3290, 700, 3315, 3800, 4);
  for (const [x, y] of [[620, 5000], [3600, 4700], [3800, 9900], [4700, 7300], [4700, 8400]]) downlight(x, y);
  cove(0, 10440, 2900, 10460); // 거실 커튼박스 간접등(전 컨셉)
  for (const [x, y, i] of [[1500, 9600, 1.4], [3300, 2200, 1.4], [4700, 7700, 1.2], [1100, 2600, 1.1], [5700, 2200, 1.1], [600, 5000, 0.9], [3300, 4800, 0.9], [5300, 5000, 0.8], [5900, 10000, 0.6]]) { const L = new THREE.PointLight('#ffd9a8', i * 1.25, 5.5, 2); L.position.set(x * S, 2.1, y * S); root.add(L); }
  // 시스템 에어컨(11/2): 거실 4웨이 1대 + 안방·아이방1·아이방2 1웨이 각 1대, 주방 없음
  sysAC(1250, 6900, 650, 650, true); ceilingFan(1500, 8450); // 11/2 케이: 거실 실링팬, 에어컨은 북쪽으로 sysAC(5300, 7800, 400, 1000); sysAC(1500, 1750, 1000, 400); sysAC(5750, 1550, 900, 380);
  // 11/2 케이: 간접등을 집 전체에(스탠드가 필요 없을 만큼). 방마다 천장 둘레 간접등 + 가구 아래 간접등 + 벽등
  coveRoom(20, 6020, 3040, 9240); coveRoom(20, 9345, 2880, 10430); coveRoom(20, 4190, 1180, 5930); coveRoom(1270, 4190, 3040, 5700);
  coveRoom(2360, 3985, 4230, 5700); coveRoom(2900, 950, 3800, 3700); coveRoom(3290, 6020, 5050, 9300); coveRoom(3200, 9560, 5550, 10480);
  coveRoom(20, 1437, 2097, 3945); coveRoom(4724, 1368, 6602, 3941); coveRoom(4494, 4139, 6238, 5704); coveRoom(5642, 9560, 6602, 10480);
  toeLight(2340, 862, 3855, 872); toeLight(3846, 885, 3856, 3010); toeLight(600, 1510, 610, 3900); toeLight(5154, 1360, 5164, 3010); toeLight(5062, 6551, 5072, 9317); toeLight(4221, 6551, 6012, 6561);
  LIGHT_PLAN.push({ k: 'toe', x1: 4110, y1: 275, x2: 4125, y2: 3000 }, { k: 'toe', x1: 2830, y1: 275, x2: 2840, y2: 850 }, { k: 'toe', x1: 10, y1: 4490, x2: 1190, y2: 4520 }, { k: 'toe', x1: 30, y1: 5540, x2: 1120, y2: 5560 }); // 상부장 아래·니치
  sconce(3046, 7000, 1850, -1, 0); sconce(3046, 8700, 1850, -1, 0); // 거실 책장 위 벽등
  if (!V.headPanel) { sconce(3290, 7090, 1300, 1, 0); sconce(3290, 9130, 1300, 1, 0); } // 안방 침대 양옆 벽등(헤드월 컨셉은 이미 있음)

  // ---------- 주방 ----------
  const K = T.klow, kWood = !!T.kWood, kH = T.khandle || 'groove';
  { const g = grp((2340 + 3855) / 2, (263 + 863) / 2, 'S'); cabinet(g, 3855 - 2340, 600, 0, 870, { color: K, drawers: [290, 290, 190], drawerCols: 3, handle: kH, wood: kWood }); }
  { const g = grp((3855 + 4455) / 2, (263 + 3010) / 2, 'W'); cabinet(g, 3010 - 263, 600, 0, 870, { color: K, doors: 5, handle: kH, wood: kWood }); }
  countertop(2330, 253, 4465, 885, 870, T.ctop); countertop(3835, 885, 4465, 3025, 870, T.ctop);
  // 벽 타일 (상판~상부장)
  const spl = M(T.splash || '#f1efea', { rough: 0.18 });
  B(2340, 263, 2900, 275, 900, 1500, spl); B(3820, 263, 4455, 275, 900, 1500, spl); B(3820, 263, 4105, 275, 1500, 2140, spl); B(2900, 263, 3820, 275, 900, 1100, spl);
  B(4443, 275, 4455, 3010, 900, 1500, spl);
  // 싱크 960 (키큰장 앞면 2840과 코너 3855 사이)
  B(2880, 330, 3840, 794, 885, 902, M('#a9b0b6', { rough: 0.35, metal: 0.8 }), 6);
  B(2900, 350, 3820, 774, 880, 903, M('#8e969d', { rough: 0.4, metal: 0.7 }), 10);
  { const fx = 3360, fy = 320, fm = T.faucet === 'brass' ? M('#b8955a', { rough: .3, metal: .9 }) : METAL(); cyl(fx, fy, 900, 960, 28, 28, fm); cyl(fx, fy, 960, 1280, 13, 13, fm); const t = addMesh(new THREE.TorusGeometry(0.11, 0.013, 10, 24, Math.PI), fm); t.position.set(fx * S, 1.28, (fy + 110) * S); t.rotation.y = Math.PI / 2; cyl(fx, fy + 220, 1180, 1280, 13, 11, fm); B(fx + 40, fy - 20, fx + 50, fy + 20, 1080, 1200, fm, 3); }
  // 싱크 왼쪽: 2단 대형 건조대 (키큰장 옆 안쪽 칸)
  dishRack(2365, 300, 2845, 780, 900);
  // 상부장: 건조대 위 + 오른쪽 전부 (후드 일체형)
  { const g = grp(2590, 563, 'E'); cabinet(g, 600, 500, 1650, CEIL - 1650, { color: T.upper || T.kup, doors: 1, handle: 'none', toe: 0 }); } // 11/2: 건조대 답답함 → 1,650으로 올림(상판 위 약 75cm), 키큰장 윗장과 선 맞춤 // 건조대 위: 키큰장 폭(500)으로 벽까지, 문은 창 쪽(동쪽)으로
  // 오른쪽 상부장: 창 쪽으로 튀어나온 코너장 없이, 오른쪽 벽 깊이(350) 그대로 창벽~끝까지 일자
  { const g = grp(4280, (263 + 3010) / 2, 'W'); cabinet(g, 3010 - 263, 350, 1500, CEIL - 1500, { color: T.kup, doors: 5, handle: 'none', toe: 0, wood: !!T.kupWood }); }
  B(4105, 1930, 4440, 2510, 1480, 1500, M('#cfd2d5', { metal: .6, rough: .3 })); // 슬라이드 후드 (11/3: 인덕션 따라 이동)
  for (const [x1, y1, x2, y2] of [[4110, 275, 4125, 3000]]) B(x1, y1, x2, y2, 1490, 1496, M('#fff8e8', { emissive: '#fff1d0', ei: 1.6 })).userData.wall = true;
  B(2830, 275, 2840, 850, 1640, 1646, M('#fff8e8', { emissive: '#fff1d0', ei: 1.6 })).userData.wall = true; // 건조대 위 조명
  // 인덕션 (11/3 케이: 싱크에서 더 멀리, 오른쪽 하부장 4번째 칸 위. 2번째 칸은 식세기)
  B(3940, 1930, 4400, 2510, 900, 907, M('#111111', { rough: 0.1 }), 4);
  for (const [x, y, r] of [[4060, 2070, 95], [4260, 2070, 80], [4160, 2350, 110]]) { const t = addMesh(new THREE.TorusGeometry(r * S, 0.0015, 4, 40), M('#555')); t.rotation.x = Math.PI / 2; t.position.set(x * S, 0.909, y * S); }
  // 상판 소품
  B(3950, 2620, 4300, 2900, 900, 925, M(T.table, { tex: 'grain' }), 8); cyl(4370, 2680, 900, 1080, 45, 45, M('#e9e4da', { rough: .3 })); cyl(4370, 2800, 900, 1000, 35, 35, M('#c9b49a', { rough: .3 }));
  // 전자레인지: 11/3 케이 → 싱크 오른쪽 ㄱ자 코너 구석으로 밀어 넣음(작업대를 넓게) + 전용 콘센트
  // 11/3 케이: 문이 싱크 쪽이 아니라 인덕션 쪽(오른쪽 작업대 방향, +y)을 보게 돌림. 창 벽에 등을 대고 코너에 밀착
  B(3935, 285, 4435, 695, 900, 1190, M('#dcdfe2', { rough: 0.35, metal: .4 }), 10);
  B(3975, 695, 4305, 701, 930, 1160, M('#1d1d1d', { rough: .1 }), 3); B(4335, 695, 4405, 701, 950, 1150, M('#b9bec3', { metal: .6 }), 3);
  B(4440, 820, 4443, 900, 1250, 1320, M('#f4f4f2', { rough: .3 })).userData.skip = true;
  // 식기세척기(빌트인, 문은 하부장과 같은 면): 11/3 케이 → 한 칸 더 오른쪽 y1330~1930(인덕션 바로 앞 칸)
  B(3851, 1330, 3856, 1930, 100, 860, M(darker(K, .97), { rough: .5 }), 2).userData.skip = true; B(3849, 1360, 3852, 1900, 800, 840, M('#2b2b2b', { rough: .3 }), 3).userData.skip = true;
  // 키큰장 변형
  tallUnit(T, V.tall || 'closed');
  // 냉장고장
  { const g = grp(2690, 3255, 'E'); cabinet(g, 1829, 700, 0, 1880, { color: T.fridge, doors: 3, handle: 'none', toe: 0, gloss: !T.fridgeWood, wood: !!T.fridgeWood });
    for (const y of [2341 + 600, 2341 + 1210, 2341 + 1820]) B(3040, y - 30, 3062, y - 15, 700, 1500, T.khandle === 'brass' ? M('#b8955a', { rough: .3, metal: .9 }) : METAL(), 4);
    cabinet(grp(2690, 3255, 'E'), 1829, 700, 1880, CEIL - 1880, { color: T.upper || T.kup, doors: 3, handle: 'none', toe: 0 }); }
  // 주방 창 블라인드
  for (let i = 0; i < 12; i++) B(2920, 190, 3800, 205, 1800 + i * 20, 1805 + i * 20, M('#f6f4ef', { rough: 0.8 }));

  // ---------- 전실 ----------
  // 11/2 케이: 신발장·분리수거장 높이선 통일(300 띄움 / 아래장 300~1,100 / 니치 1,100~1,400 / 위 장 1,400~천장)
  { const g = grp(600, 4355, 'S'); const tc = T.entryCab || T.tall;
    cabinet(g, 1200, 370, 250, 850, { color: T.tall, doors: 3, handle: 'none', toe: 0, wood: true }); /* 11/4 케이: 현관 바닥 평평(단 올림 없음), 장 아래 250(최소 220) */
    cabinet(g, 1200, 370, 1400, CEIL - 1400, { color: T.upper || '#f3f1ec', doors: 3, handle: 'none', toe: 0 });
    // 11/4 케이·실장님: 현관~거실 바닥 높이 같음(보일러 라인) → 현관 단 올림 취소, 현관 바닥은 복합(대리석)타일로 신발장·분리수거장 아래까지, 중문으로만 분리
    B(0, 4170, 1200, 4540, 1385, 1400, M(darker(T.upper || '#f3f1ec', .95))); B(0, 4170, 1200, 4540, 1100, 1110, M(T.tall, { tex: 'grain' })); B(0, 4170, 18, 4540, 1110, 1385, M(T.tall, { tex: 'grainV' })); B(0, 4170, 1200, 4190, 1110, 1385, M(T.tall, { tex: 'grainV' }));
    B(10, 4500, 1190, 4520, 1375, 1380, M('#fff4dc', { emissive: '#ffe9c0', ei: 2 })); B(10, 4490, 1190, 4520, 240, 245, M('#fff4dc', { emissive: '#ffe9c0', ei: 2 }));
    cyl(300, 4380, 1110, 1290, 50, 60, M('#cdbfa8', { rough: .4 })).userData.skip = true; B(700, 4300, 900, 4420, 1110, 1130, M('#2b2b2b', { rough: .3 }), 4);
    for (let i = 0; i < 3; i++) B(150 + i * 300, 4400, 400 + i * 300, 4520, 0, 90, M(['#5a5a5a', '#e8e1d6', '#9a7b62'][i]), 30);
    // 11/2 아내 레퍼런스(현관 팬트리): 니치 왼쪽 = 아이 가방·외출용품 칸(후크 2개 + 어린이집 가방)
    for (const hx of [120, 330]) { B(hx - 8, 4180, hx + 8, 4230, 1330, 1346, METAL(), 3).userData.skip = true; }
    B(60, 4200, 220, 4300, 1120, 1320, M('#e3a35c', { rough: .6 }), 30).userData.skip = true; B(270, 4200, 400, 4290, 1150, 1320, M('#8fb3c9', { rough: .6 }), 30).userData.skip = true;
    B(430, 4175, 440, 4520, 1110, 1385, M(T.tall, { tex: 'grainV' })).userData.skip = true; }
  // 분리수거장(5분류): 종량제·플라스틱·비닐/캔유리(2단)·종이 세움칸 인출장 + 가운데 30cm 열린 칸(간접등·키 트레이) + 위 상부장(봉투·장바구니)
  { const ec = T.entryCab || T.tall, ew = !!T.entryWood; const g = grp(575, 5740, 'N');
    // 아래: 5분류 인출장(문을 당기면 통이 같이 나옴, 투입구 없음). 종량제(뚜껑 통) 300 | 플라스틱 320 | 위 비닐·아래 캔/유리 280 | 종이 세움칸 160
    { const cw = M(T.tall, { tex: 'grainV', rough: .55 }), dk = M('#3a3530', { rough: .6 });
      B(0, 5545, 1150, 5950, 300, 1100, M(darker(T.tall, .92), { tex: 'grainV' })); /* 11/2 케이: 신발장처럼 300 띄움 → 아래에 목 높은 운동화 */ B(10, 5546, 1140, 5556, 290, 298, M('#ffdcaa', { emissive: '#ffc884', ei: 2.4 })).userData.wall = true;
      for (const [x1, c] of [[60, '#f2f2f0'], [250, '#3d3d3d'], [470, '#c9b79c'], [700, '#ffffff'], [900, '#8a6a52']]) { B(x1, 5640, x1 + 150, 5900, 0, 170, M(c, { rough: .7 }), 25).userData.skip = true; }
      const fr = [[18, 318, 300, 1100], [336, 656, 300, 1100], [674, 954, 708, 1100], [674, 954, 300, 690], [972, 1132, 300, 1100]];
      for (const [x1, x2, z0, z1] of fr) { B(x1 + 2, 5527, x2 - 2, 5545, z0 + 2, z1 - 2, cw); B(x1 + 2, 5524, x2 - 2, 5528, z1 - 34, z1 - 24, dk); }
      for (const x of [0, 318, 656, 954, 1132]) B(x, 5527, x + 18, 5545, 300, 1100, M(darker(T.tall, .85), { tex: 'grainV' }));
      for (const [x1, x2] of [[20, 316], [338, 654], [676, 952], [974, 1130]]) B(x1, 5527, x2, 5545, 250, 302, cw); /* 11/3 케이: 신발 두는 높이 25cm(최소 22) 맞춤 → 앞판 50 내림, 바닥 틈 250 */
      const tags = [[168, 1060, '#6b6b6b'], [496, 1060, '#9fbf8f'], [814, 1060, '#c9c2e0'], [814, 650, '#7ea6c9'], [1052, 1060, '#e2c48b']];
      for (const [cx, z, c] of tags) B(cx - 40, 5521, cx + 40, 5525, z - 30, z, M(c, { rough: .4 }), 2).userData.skip = true; }
    cabinet(g, 1150, 420, 1400, CEIL - 1400, { color: T.upper || '#f3f1ec', doors: 3, handle: 'none', toe: 0 });
    const nm = M(T.niche || T.tall, { tex: 'grainV', rough: .5 });
    B(0, 5530, 1150, 5950, 1100, 1118, nm); /* 11/9 니치 뒤판 없음 → 거실 쪽 유리 */ B(0, 5530, 18, 5950, 1100, 1400, nm); B(1132, 5530, 1150, 5950, 1100, 1400, nm); B(0, 5530, 1150, 5950, 1382, 1400, nm);
    B(30, 5540, 1120, 5560, 1372, 1378, M('#fff4dc', { emissive: '#ffe9c0', ei: 2.2 })).userData.wall = true;
    B(150, 5700, 450, 5880, 1118, 1135, M(T.table || '#c9a272', { tex: 'grain' }), 6).userData.skip = true; // 키 트레이
    B(250, 5760, 300, 5800, 1135, 1145, METAL(), 3).userData.skip = true;
    cyl(850, 5800, 1118, 1270, 45, 55, M('#d9cfc2', { rough: .4 })).userData.skip = true;
  }
  rug(150, 4650, 1050, 5300, '#cfc6b8');

  // ---------- 거실·식탁 ----------
  // 고정(11/2 형 지시): 식탁은 모든 안에서 거실 창가, 창 쪽·왼쪽 벽 ㄱ자 붙박이 벤치. 가운데(옛 식탁 자리)는 매트 깔고 아기 놀이 공간
  const winDining = true;
  playroom(T, 8350); diningCorner(T);
  if (false) {
  sofaBanquette(T);
  table(650, 6590, 1450, 8190, T); // 1,600×800, 가로 소파 좌판 앞 4cm까지 당김
  chair(1830, 7010, 'W', T, T.chairStyle); chair(1830, 7770, 'W', T, T.chairStyle); chair(1050, 8570, 'N', T, T.chairStyle);
  pendant(1050, 7390, 1500, T.pendant || '#e9e2d5', T.pendantStyle || 'dome');
  cyl(1000, 7240, 750, 950, 45, 55, M('#e8e1d4', { rough: .3 })); for (let i = 0; i < 5; i++) { const m = addMesh(new THREE.SphereGeometry(0.05, 10, 6), M('#7f9a6b', { side: true })); m.scale.set(1, .25, .6); m.position.set((1000 + (i - 2) * 40) * S, 1.0 + (i % 2) * 0.05, (7240 + (i % 3 - 1) * 30) * S); m.rotation.z = (i - 2) * .4; }
  cyl(1100, 7690, 750, 790, 140, 110, M('#f2efe8', { rough: .3 }), 32); for (let i = 0; i < 4; i++) { const f = addMesh(new THREE.SphereGeometry(0.04, 12, 8), M(['#e8a34a', '#d6553a', '#e8c64a', '#e8a34a'][i], { rough: .5 })); f.position.set((1080 + (i % 2) * 50) * S, 0.81, (7670 + (i > 1 ? 50 : 0)) * S); }
  }
  // TV 대신 끝에서 끝까지 아기 책장·장난감장 (높이 1,500, 깊이 300)
  kidsBookshelf(2726, 6020, 3066, 9180, 1150, T); // 11/3 케이 실측: 높이 1,150, 깊이 340
  // 거실 키큰장: 창 오른쪽(아기 책장 쪽) 벽에 길게. 위 장(화이트) + 가운데 니치(간접등·콘센트) + 아래 서랍(우드)
  livingNicheCabinet(T);
  const LV = 'diningCorner'; CUR_LAYOUT.win = true; CUR_LAYOUT.sofa = true; CUR_LAYOUT.dresser = !!V.dresser;
  if (LV === 'daybed') daybed(T);
  else if (LV === 'floor') floorLounge(T);
  else if (winDining) { /* 창가 다이닝 */ }
  else cornerSofa(T);
  if (LV === 'daybed' || winDining) { romanShade(30, 1275, 10470, 2140, 1500, T.curtain); romanShade(1325, 2570, 10470, 2140, 1500, T.curtain); }
  else { curtain(0, 2600, 10400, 30, 2260, '#f7f6f2', 0.55); curtain(0, 380, 10370, 30, 2260, T.blackout || '#b9b4ad'); curtain(2220, 2600, 10370, 30, 2260, T.blackout || '#b9b4ad'); }
  if (LV === 'daybed') floorLamp(300, 8800, T.lampc || '#efe7d8');
  else if (LV === 'bench') { plant(2780, 9780, 0.7); floorLamp(300, 9800, T.lampc || '#efe7d8'); }
  else if (LV === 'play') plant(2620, 9450, 0.55);

  // ---------- 안방 ----------
  // 침대 머리 서쪽 벽(거실 벽), 발은 동쪽. 붙박이장+화장대는 동쪽 벽 전체. 방문 쪽(북서)은 비워 둠
  rug(3600, 7100, 5500, 9150, T.rug || '#ece6dc');
  if (V.headPanel) { // 호텔식 헤드 월(목재 패널 + 간접등)
    B(3264, 6880, 3300, 9310, 0, CEIL, M(T.panel || T.desk, { tex: 'grainV', rough: .45 }), 0).userData.wall = true;
    B(3300, 6900, 3312, 9300, CEIL - 130, CEIL - 110, M('#fff3dc', { emissive: '#ffe6bf', ei: 2 })).userData.wall = true;
    for (const y of [7150, 9130]) { B(3300, y - 40, 3340, y + 40, 1250, 1290, M('#b8955a', { metal: .9, rough: .3 }), 4); cyl(3370, y, 1150, 1250, 55, 70, M('#f2e8d8', { emissive: '#ffdca0', ei: .5, side: true }), 20); }
  }
  bed(4429, 8130, 1600, 2050, 'E', T, { channel: T.channel, frame: T.head });
  nsBox(3310, 6880, 3710, 7300, T, false); nsBox(3310, 8960, 3710, 9300, T, false); // 11/2: 스탠드 대신 벽등
  // 동쪽 벽: 붙박이장 + 화장대 (구성은 컨셉별 V.wd), 일부 문은 전신 거울
  const mCab = T.mCab || T.tall, mWood = !!T.mWood, mH = T.mHandle || 'groove';
  const segs = V.wd || [['wd', 5951, 7300, []], ['van', 7300, 8400], ['wd', 8400, 9317, []]]; CUR_SEGS.length = 0; CUR_SEGS.push(...segs);
  for (const sg of segs) {
    if (sg[0] === 'wd') { const L = sg[2] - sg[1], w3 = L / 3; // 11/3 케이: 화장대 오른쪽 3칸 = 재킷 2단 걸이 ×2 + 맨 오른쪽 긴 옷(150cm)+아래 서랍
      closet('y', sg[1], sg[2], 6622, 6022, [[sg[1], sg[1] + w3, 'double'], [sg[1] + w3, sg[1] + 2 * w3, 'double'], [sg[1] + 2 * w3, sg[2], 'longDrawer']], T, mCab, mWood); }
    else vanityNook(sg[1], sg[2], T, mCab, mWood, sg[0] === 'pow');
  }
  // 11/3 케이: 수납 부족 → 방문 옆(x4211)부터 동쪽 벽까지 북쪽 벽 전체 붙박이장(ㄴ자, 코너 600×600은 버림), 미닫이 4짝
  //   코너 600×600(x6022~6622)은 화장대가 앞을 막아 쓰지 못하는 막힌 칸. 쓰는 장은 x4211~6022 미닫이 3짝, 코너 바로 옆 문 1짝 = 전신 거울 문(장 겸 거울)
  closet('x', 4211, 6022, 5951, 6551, [[4211, 4815, 'jacketDrawer'], [4815, 5418, 'jacketDrawer'], [5418, 6022, 'mirror']], T, mCab, mWood); // 방문 쪽 2칸 = 위 재킷 걸이 + 아래 속옷 서랍 3단, 코너 옆 = 거울 문 + 선반
  B(6022, 5951, 6622, 6551, 0, CEIL, M(mCab, { tex: mWood ? 'grainV' : undefined, rough: .5 })).userData.wall = true; // 막힌 코너
  // 안방 확장부 = 서재: 창가 긴 책상(1.5m) + 의자 + 벽 선반, 안방과는 3짝 슬라이딩 도어로 분리
  // 11/3 케이: 보유 책상 1,400×800, 휴먼스케일 의자(뒤로 빼서 드나들 자리 650 필요, 평소 바짝 당겨 앉음)
  //   책상은 창 앞 벽에 붙임(y9680~10480, 창턱 450 < 책상 740), x3436~4836(서쪽 책장 옆). 의자 빼는 자리 y9030~9680 = 하리 아래 안방 쪽까지(문 없앴으니 OK), 침대 끝(y8930)에서 10cm
  { // 11/3 케이: 책장은 서쪽 벽(안방에서 서재를 볼 때 오른쪽) x3176~3426(책 깊이 250), 책상 쪽(동쪽)으로 열린 칸, 길이 800, 천장까지 → 세탁실 가는 길(책상 동쪽) 넓게
    const bm = M(T.desk, { tex: 'grain', rough: .5 });
    B(3176, 9680, 3196, 10480, 0, CEIL, bm); B(3176, 10460, 3426, 10480, 0, CEIL, bm); B(3176, 9680, 3426, 9700, 0, CEIL, bm); B(3176, 9680, 3426, 10480, 0, 80, M(darker(T.desk, .7)));
    const cc = ['#c9d6c4', '#e8d3c0', '#cfd9e3', '#d9cbb5', '#f2efe8', '#b8c4a8'];
    for (let z = 80, k = 0; z < CEIL - 100; z += 330) { B(3196, 9700, 3426, 10460, z, z + 20, bm).userData.wall = true;
      if (z > 80 && z < 1900) for (let y = 9740; y < 10380; y += 50, k++) B(3206, y, 3376 - (k % 3) * 15, y + 38, z + 20, z + 20 + 220 + (k % 4) * 15, M(cc[k % 6], { rough: .6 }), 2).userData.skip = true; }
  }
  desk(3436, 9680, 4836, 10480, T); officeChair(4136, 9520, 'S', T.chair).traverse(o => o.userData.skip = true); // 의자는 그 자리 자체가 빼는 공간이라 점검 제외 lamp(4700, 10350, 740, T.lampc || '#efe7d8'); books(3500, 10380, 740, 6);
  // (옛 서재 벽선반은 서쪽 책장으로 대체)
  romanShade(3200, 5540, 10470, 2140, 1500, T.curtain); // 책상을 창 앞까지 붙이려고 커튼 대신 창틀 안 로만쉐이드
  // 11/3 케이: 안방↔서재 슬라이딩 문 없앰(하리 아래 트임)
  // 세탁 부스 내부: 워시타워 + 세제장 + 벽 선반
  washTower(5740, 9790, 6612, 10476); // 11/5: 세탁기·건조기를 창 쪽으로, 안방 쪽 틈(약 21cm)에 틈새장
  { // 11/2 아내 레퍼런스: 누수 점검 가능하게 배관 점검구(세제장 옆 벽, 350×350 열리는 판)
    const am = M('#f2f1ee', { rough: .5 }); /* 11/5: 틈새장 뒤 안쪽 벽(x6610 면)으로 */ B(6610, 9560, 6622, 9760, 150, 500, am).userData.wall = true;
    B(6608, 9560, 6610, 9760, 150, 154, M('#9a958d')).userData.wall = true; B(6608, 9560, 6610, 9760, 496, 500, M('#9a958d')).userData.wall = true; }
  { // 11/6 실장님: 문 달면 문틀이 양쪽 최소 36mm씩 들어와 세탁기 쪽 실제 폭은 830~850, 세탁기(686) 옆은 약 11cm만 남음 → 틈새장 빼고 남는 틈은 판으로 막아 마감(문 옆 면 고정판), 세탁기 위 선반 유지
    const fm = M('#f6f5f2', { rough: .55 });
    // 11/9: 옆 틈 67mm라 선반·틈새장 없음(양개 문이 앞을 다 가림)
    B(5740, 9560, 6612, 10490, 2140, 2160, M(darker(T.part, .9))).userData.wall = true;
    for (let j = 0; j < 3; j++) B(5800 + j * 270, 9620, 6040 + j * 270, 10440, 2160, 2280, M('#d9c9ae', { tex: 'rattan' }), 15).userData.wall = true;
  }

  // ---------- 아이방 (11/5 케이: 배치안 A~D, 서랍장은 모든 안에) ----------
  kidsRooms(T);

  // ---------- 욕실 ----------
  bathroom(T);
  return root;
}


function vanityNook(y1, y2, T, mCab, mWood, hidden = false) { // 서서 쓰는 화장대(11/3 케이: 폭 100cm, 거울 장 오른쪽, 상판 900) + 아래 서랍 + 거울·조명 + 위 장. hidden=파우더룸
  const vm = M(mCab, { tex: mWood ? 'grainV' : undefined, rough: .5 }); const w = y2 - y1;
  B(6122, y1, 6622, y2, 2000, CEIL, vm, 3); B(6600, y1, 6622, y2, 0, 2000, vm);
  B(6022, y1, 6622, y1 + 20, 0, CEIL, vm); B(6022, y2 - 20, 6622, y2, 0, CEIL, vm);
  { const g = grp(6372, (y1 + y2) / 2, 'W'); cabinet(g, w - 40, 500, 0, 880, { color: mCab, drawers: [260, 260, 260], drawerCols: 1, handle: 'groove', toe: 100, wood: mWood }); }
  B(6112, y1 + 20, 6622, y2 - 20, 880, 910, M(T.vanityTop || T.ctop, { rough: .25 }), 4);
  B(6590, y1 + 60, 6600, y2 - 60, 1000, 1950, M('#d5dee2', { rough: 0.05, metal: 0.2 }), 6);
  B(6585, y1 + 40, 6600, y1 + 52, 1000, 1950, M('#fff3dc', { emissive: '#ffe6bf', ei: 2 })); B(6585, y2 - 52, 6600, y2 - 40, 1000, 1950, M('#fff3dc', { emissive: '#ffe6bf', ei: 2 }));
  B(6122, y1 + 20, 6622, y2 - 20, 1985, 2000, M('#fff3dc', { emissive: '#ffe6bf', ei: 1 }));
  for (let i = 0; i < 3; i++) cyl(6480 - (i % 2) * 50, y1 + 120 + i * 60, 910, 910 + 60 + i * 25, 16, 16, M(['#e8d3c0', '#2b2b2b', '#c9a77c'][i], { rough: .3 })).userData.skip = true;
  B(6420, y2 - 220, 6570, y2 - 90, 910, 925, M('#b8955a', { metal: .8, rough: .3 }), 4).userData.skip = true;
  if (hidden) { // 포켓도어 1짝: 대부분 옆 포켓으로 밀어 넣은 모습(닫으면 장과 똑같이 보임)
    const dm = M(mCab, { tex: mWood ? 'grainV' : undefined, rough: .5 });
    B(6000, y2 - 20 - w * 0.35, 6020, y2 - 20, 20, CEIL - 20, dm, 2).userData.door = true;
    B(5998, y2 - 20 - w * 0.35 + 30, 6000, y2 - 20 - w * 0.35 + 42, 900, 1500, M('#3a3a3a')).userData.door = true;
  }
}
function slidingPartition(kind, T) { // 안방↔서재 3짝 슬라이딩 도어 (하리 아래 y9320~9390), 오른쪽 x4570~5172 열어 둔 모습
  const wood = M(T.sepWood || T.desk, { tex: 'grainV', rough: .45 });
  B(3264, 9320, 5172, 9390, 1965, 1980, M('#9a9a9a', { metal: .6, rough: .3 })).userData.wall = true; B(3264, 9320, 5172, 9390, 0, 6, M('#9a9a9a', { metal: .6, rough: .3 })).userData.wall = true;
  const frameM = { glass: M('#2b2b2b', { metal: .5, rough: .4 }), fluted: M('#6b5a44', { metal: .6, rough: .35 }), wood, shoji: wood, cane: wood, slat: wood, gansal: wood }[kind] || wood;
  const panels = [[3264, 3954, 9325], [3914, 4604, 9360], [3874, 4564, 9325]]; // 3번째 짝은 2번째 뒤로 겹쳐 열린 상태
  for (const [x1, x2, y] of panels.slice(0, kind === 'shoji' ? 2 : 3)) {
    const yy = y, t = 28;
    B(x1, yy, x1 + 40, yy + t, 6, 1965, frameM); B(x2 - 40, yy, x2, yy + t, 6, 1965, frameM); B(x1, yy, x2, yy + t, 6, 60, frameM); B(x1, yy, x2, yy + t, 1925, 1965, frameM);
    if (kind === 'glass') { B(x1 + 40, yy + 12, x2 - 40, yy + 16, 60, 1925, GLASS()).castShadow = false; B(x1 + 40, yy, x2 - 40, yy + t, 960, 980, frameM); }
    else if (kind === 'fluted') { for (let k = 0; k < 14; k++) cyl(x1 + 60 + k * (x2 - x1 - 120) / 13, yy + 14, 60, 1925, 11, 11, M('#eef3f3', { rough: .3, opacity: .55 }), 8).castShadow = false; }
    else if (kind === 'wood') { B(x1 + 40, yy + 4, x2 - 40, yy + t - 4, 60, 1925, wood); for (let k = 1; k < 6; k++) B(x1 + k * (x2 - x1) / 6 - 3, yy + t - 3, x1 + k * (x2 - x1) / 6 + 3, yy + t, 60, 1925, M('#3a3026')); }
    else if (kind === 'shoji') { B(x1 + 40, yy + 12, x2 - 40, yy + 16, 60, 1925, M('#f7f2e6', { rough: 1, opacity: .8 })).castShadow = false; for (let z = 360; z < 1925; z += 300) B(x1 + 40, yy + 6, x2 - 40, yy + 22, z, z + 14, wood); for (let k = 1; k < 3; k++) { const xx = x1 + k * (x2 - x1) / 3; B(xx - 7, yy + 6, xx + 7, yy + 22, 60, 1925, wood); } }
    else if (kind === 'cane') { B(x1 + 40, yy + 10, x2 - 40, yy + 18, 60, 1925, M('#c9a77c', { tex: 'cane' })); B(x1 + 40, yy, x2 - 40, yy + t, 960, 990, wood); }
    else if (kind === 'slat') { for (let xx = x1 + 50; xx < x2 - 50; xx += 60) B(xx, yy + 2, xx + 30, yy + t - 2, 60, 1925, wood); }
    else if (kind === 'gansal') { // 간살: 18mm 세로 간살 @36mm + 뒤 모루유리, 가운데 가로 띠
      B(x1 + 40, yy + 4, x2 - 40, yy + 8, 60, 1925, M('#eef1ee', { rough: .6, opacity: .6 })).castShadow = false;
      for (let xx = x1 + 52; xx < x2 - 58; xx += 36) B(xx, yy + 10, xx + 18, yy + t, 60, 1925, wood);
      B(x1 + 40, yy + 8, x2 - 40, yy + t, 1000, 1030, wood);
    }
  }
}
function wallTile(x1, y1, x2, y2, z0, z1, col, tw = 300, th = 600) { // 욕실 벽 타일 판
  const W = Math.max(x2 - x1, y2 - y1), H = z1 - z0;
  const tex = canvasTex(512, 512, (g, S2) => { g.fillStyle = rgb(col, -22); g.fillRect(0, 0, S2, S2); const r = rnd(41); const nx = 4, ny = 2; const w = S2 / nx, h = S2 / ny;
    for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) { g.fillStyle = rgb(col, Math.floor((r() - .5) * 8)); g.fillRect(i * w + 2, j * h + 2, w - 4, h - 4); } });
  tex.repeat.set(W / (tw * 4), H / (th * 2));
  const m = addMesh(new THREE.BoxGeometry((x2 - x1) * S, H * S, (y2 - y1) * S), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.25 }));
  m.position.set((x1 + x2) / 2 * S, (z0 + z1) / 2 * S, (y1 + y2) / 2 * S); m.userData.wall = true; return m;
}

function diningCorner(T) { // 11/3 케이: 붙박이 벤치 대신 기성품 ㄱ자 다이닝 소파(옮길 수 있게) + 식탁 1,600×800 + 맞은편 의자 2
  // 소파: 창 쪽 x0~2150 × 깊이 600(y9760~10360), 왼쪽 벽 쪽 x0~600 × y9200~9760 (왼쪽 총 약 1.16m), 좌석 높이 450, 다리 120
  const body = M(darker(T.seat, .85), { tex: 'fabric', rough: 1 }), seat = M(T.seat, { tex: 'fabric', rough: .95 }), back = M(T.back, { tex: 'fabric', rough: .95 }), leg = M('#3b3a38', { rough: .4, metal: .3 });
  for (const [x, y] of [[40, 9800], [2110, 9800], [40, 10320], [2110, 10320], [40, 9240], [560, 9240], [560, 9760]]) cyl(x, y, 0, 120, 14, 12, leg, 10);
  B(0, 9760, 2150, 10360, 120, 330, body, 25); B(0, 9200, 600, 9760, 120, 330, body, 25);
  for (let i = 0; i < 3; i++) B(170 + i * 660, 9770, 820 + i * 660, 10200, 330, 450, seat, 45);
  B(10, 9210, 590, 9760, 330, 450, seat, 45);
  B(0, 10200, 2150, 10360, 120, 800, body, 30); B(0, 9200, 160, 10360, 120, 800, body, 30); // 등받이 틀
  for (let i = 0; i < 3; i++) { const b = B(180 + i * 650, 10080, 820 + i * 650, 10200, 450, 780, back, 55); b.rotation.x = 0.1; }
  { const b = B(160, 9220, 280, 9750, 450, 780, back, 55); b.rotation.z = -0.1; }
  B(2000, 9760, 2150, 10200, 330, 560, body, 30); B(0, 9200, 600, 9330, 330, 560, body, 30); // 팔걸이
  for (const [x, y, w, d, ry, c] of [[260, 9960, 380, 120, 0.2, T.acc], [1450, 9960, 380, 120, -0.15, mixc(T.acc, '#ffffff', .4)]]) { const q = B(x, y, x + w, y + d, 450, 790, M(c, { tex: 'fabric' }), 60); q.rotation.y = ry; }
  table(575, 8950, 2175, 9750, T);
  for (const x of [975, 1775]) chair(x, 8720, 'S', T, T.chairStyle);
  pendant(1375, 9350, 1500, T.pendant || '#e9e2d5', T.pendantStyle || 'dome');
  cyl(1225, 9350, 750, 950, 45, 55, M('#e8e1d4', { rough: .3 })); cyl(1525, 9350, 750, 790, 140, 110, M('#f2efe8', { rough: .3 }), 32);
}
function diningAtWindow(T, withSofa) { // 거실 확장부 창가 식탁 1,600×800 (창과 나란히)
  if (withSofa) { // 창가 긴 붙박이 소파 + 식탁 + 반대편 의자 3
    const base = M(T.base, { rough: .7 }), seat = M(T.seat, { tex: 'fabric', rough: .95 }), back = M(T.back, { tex: 'fabric', rough: .95 });
    B(20, 9980, 2130, 10430, 0, 80, M(darker(T.base, .6))); B(0, 9950, 2150, 10440, 80, 330, base, 6);
    for (let i = 0; i < 3; i++) B(15 + i * 712, 9955, 720 + i * 712, 10330, 330, 435, seat, 45);
    for (let i = 0; i < 3; i++) { const m = B(25 + i * 712, 10290, 710 + i * 712, 10430, 440, 860, back, 60); m.rotation.x = 0.12; }
    B(3, 9958, 2147, 9962, 300, 312, M('#555'));
    const p = B(150, 10150, 550, 10290, 435, 800, M(T.acc, { tex: 'fabric' }), 90); p.rotation.x = 0.25;
    table(275, 9100, 1875, 9900, T);
    for (const x of [475, 1075, 1675]) chair(x, 8850, 'S', T, T.chairStyle);
    pendant(1075, 9500, 1500, T.pendant || '#e9e2d5', T.pendantStyle || 'dome');
  } else { // 식탁 + 양쪽 의자 2+2
    table(425, 8850, 2025, 9650, T);
    for (const x of [825, 1625]) { chair(x, 8600, 'S', T, T.chairStyle); chair(x, 9900, 'N', T, T.chairStyle); }
    pendant(1225, 9250, 1500, T.pendant || '#e9e2d5', T.pendantStyle || 'dome');
  }
  const ty = withSofa ? 9500 : 9250, tx0 = withSofa ? 1075 : 1225;
  cyl(tx0 - 150, ty, 750, 950, 45, 55, M('#e8e1d4', { rough: .3 })); cyl(tx0 + 150, ty, 750, 790, 140, 110, M('#f2efe8', { rough: .3 }), 32);
}
function playroom(T, yMax) { // 11/3 케이: 장난감·매트·티피·미끄럼틀·아이 테이블은 모형에서 뺌(정신 사나움). 가운데는 비워 둠
  return;
}

function livingNicheCabinet(T) { // 11/3 케이: 기둥 옆 튀어나옴 없이 책장 앞면 선(x2726)에 맞춘 팬트리장. 기둥(y9200~9540) 앞까지 덮어 y9200~10320, 천장까지
  const wood = T.tall, white = T.upper || '#f3f1ec', X0 = 2726, Y0 = 9200, Y1 = 10320, CW = 2900;
  const body = M(white, { rough: .5 }), inner = M(mixc(white, '#e9e2d6', .35), { rough: .55 }), wd = M(wood, { tex: 'grainV', rough: .5 }), wh = M(white, { rough: .45 });
  B(X0, Y0 - 20, 3066, Y0, 0, CEIL, body); B(X0, Y1, 3066, Y1 + 20, 0, CEIL, body); // 양옆 판
  B(X0, Y0, 3066, Y1, CEIL - 20, CEIL, body); B(X0 + 20, Y0, CW, Y0 + 340, 0, 100, M(darker(white, .8))); B(X0 + 20, Y0 + 340, 3066, Y1, 0, 100, M(darker(white, .8))); // 천장판·걸레받이(기둥 피함)
  B(X0 + 60, Y0, CW, Y0 + 340, 100, CEIL - 20, inner).userData.wall = true; B(3046, Y0 + 340, 3066, Y1, 100, CEIL - 20, inner).userData.wall = true; // 안쪽 면(기둥 앞 / 벽)
  // 11/3 아내 레퍼런스(팬트리 문 뒤 수납): 모든 문 안쪽에 얕은 도어 랙(깊이 110, 철망 선반) + 안쪽 선반은 랙이 닫힐 자리만큼 뒤로(깊이 약 17cm)
  //   기둥 앞(깊이 17cm)은 안쪽 선반 없이 문 랙만, 벽 쪽(깊이 34cm)은 문 랙 + 안쪽 얕은 선반
  const SX = X0 + 20 + 130; // 랙 110 + 여유 20 뒤부터 안쪽 선반
  for (let z = 100; z < CEIL - 200; z += 340) B(SX, Y0 + 340, 3046, Y1, z, z + 18, wh).userData.skip = true;
  const cols = ['#e8dcc6', '#c9a77c', '#f2efe8', '#9fb2bf', '#d9cbb5', '#b8c4a8'];
  let k = 0; for (let z = 440; z < 2100; z += 340) for (let y = Y0 + 380; y < Y1 - 120; y += 150) { const c = M(cols[k++ % 6], { rough: .4 }); if (k % 3) cyl(2985, y, z + 18, z + 18 + 140 + (k % 2) * 50, 45, 45, c, 18).userData.skip = true; else B(2900, y - 60, 3040, y + 60, z + 18, z + 190, M('#e8e1d4', { rough: .6 }), 10).userData.skip = true; }
  const rm = M('#f2f2f0', { rough: .4, metal: .3 });
  // 랙: 축 방향 axis 'y'(닫힌 문 뒤: x 방향 깊이) / 'x'(열린 문: y 방향 깊이)
  const rack = (u1, u2, z1, z2, closed, flag) => { const ps = []; for (let z = z1 + 60; z < z2 - 80; z += 300) {
      if (closed) { ps.push(B(X0 + 22, u1 + 30, X0 + 130, u2 - 30, z, z + 8, rm, 2), B(X0 + 125, u1 + 30, X0 + 130, u2 - 30, z + 8, z + 70, rm));
        for (let y = u1 + 60, q = 0; y < u2 - 80; y += 75, q++) ps.push(cyl(X0 + 75, y + 30, z + 8, z + 8 + 120 + (q % 3) * 30, 28, 28, M(cols[(q + z / 10) % 6 | 0], { rough: .4 }), 14)); }
      else { ps.push(B(u1 + 30, Y1 - 110, u2 - 30, Y1, z, z + 8, rm, 2), B(u1 + 30, Y1 - 110, u2 - 30, Y1 - 105, z + 8, z + 70, rm));
        for (let x = u1 + 60, q = 0; x < u2 - 80; x += 75, q++) ps.push(cyl(x + 30, Y1 - 55, z + 8, z + 8 + 120 + (q % 3) * 30, 28, 28, M(cols[(q + 1) % 6], { rough: .4 }), 14)); } }
    ps.forEach(o => { o.userData.skip = true; }); };
  // 문: 아래 우드(100~820) / 위 화이트(820~천장), 2열. 위 오른쪽 문은 연 모습(문 뒤 랙이 보이게)
  const ym = (Y0 + Y1) / 2;
  for (const [a, b] of [[Y0 + 2, ym - 2], [ym + 2, Y1 - 2]]) { const d = B(X0, a, X0 + 20, b, 100, 818, wd, 2); d.userData.door = true; d.userData.cabDoor = true; rack(a, b, 100, 818, true); }
  { const d = B(X0, Y0 + 2, X0 + 20, ym - 2, 822, CEIL - 22, wh, 2); d.userData.door = true; d.userData.cabDoor = true; rack(Y0 + 2, ym - 2, 822, CEIL - 22, true); }
  B(X0 - (Y1 - ym - 4), Y1, X0, Y1 + 20, 822, CEIL - 22, wh, 2).userData.door = true; // 위 오른쪽 문은 연 모습(경첩 창 쪽)
  rack(X0 - (Y1 - ym - 4), X0, 822, CEIL - 22, false);
  { const h = B(X0 - 3, ym - 40, X0, ym + 40, 790, 830, M('#3a3a3a')); h.userData.door = true; h.userData.cabDoor = true; }
}
function cornerSofa(T) { // 창가 코너(ㄱ자) 소파: 창 쪽 0~2150, 왼쪽 벽 쪽 y9250~9760
  const base = M(darker(T.seat, .82), { tex: 'fabric' }), seat = M(T.seat, { tex: 'fabric', rough: 1 }), back = M(T.back, { tex: 'fabric', rough: 1 });
  B(0, 9760, 2150, 10360, 0, 330, base, 30); B(0, 9250, 640, 9760, 0, 330, base, 30);
  for (let i = 0; i < 3; i++) B(190 + i * 655, 9770, 835 + i * 655, 10180, 330, 450, seat, 55);
  B(10, 9260, 630, 9760, 330, 450, seat, 55);
  for (let i = 0; i < 3; i++) { const b = B(200 + i * 655, 10170, 830 + i * 655, 10350, 440, 840, back, 70); b.rotation.x = 0.12; }
  for (const [a, b2] of [[9260, 9750], [9760, 10340]]) { const b = B(10, a, 190, b2, 440, 840, back, 70); b.rotation.z = 0.12; }
  B(1990, 9760, 2150, 10360, 330, 600, base, 40); B(0, 9250, 640, 9400, 330, 600, base, 40); // 팔걸이
  for (const [x, y, c, ry] of [[300, 10050, T.acc, 0.3], [1500, 10060, mixc(T.acc, '#ffffff', .4), -0.2], [80, 9500, T.back, 0.5]]) { const p = B(x, y, x + 400, y + 140, 450, 820, M(c, { tex: 'fabric' }), 80); p.rotation.y = ry; p.rotation.x = -0.15; }
  cyl(1550, 9460, 0, 380, 290, 300, M(T.ottoman || T.back, { tex: 'fabric', rough: 1 }), 40); // 소프트 오토만(아이 안전)
  B(1420, 9390, 1680, 9540, 380, 400, M(T.table, { tex: 'grain' }), 10).userData.skip = true;
  rug(700, 8950, 2150, 9760, T.rug || '#e8e0d4');
}
function kidsRooms(T) {
  for (const k in KZ) delete KZ[k];
  const bc = T.kidBumper || '#e9d8bd'; // 11/4 확정 크림 베이지(두 방 같은 제품)
  const mirror = (x1, y1, x2, y2) => B(x1, y1, x2, y2, 1300, 1900, M('#d5dee2', { rough: .05, metal: .2 }), 4);
  // 아이방1: 방 안쪽 x0~2117, y1500~3965. 문 남쪽 벽 x1250~2040(경첩 2040, 반경 790). 창고 샷시 북쪽 x932~2117
  const p1 = KIDS.k1;
  if (p1 === 'B') { kidsWardrobe(0, 1500, 600, 2255, 'E', T); bumperBed(600, 3115, bc); dresser(1617, 1500, 2117, 2500, 'W', T); mirror(2097, 1520, 2117, 2480);
    KZ['아이방1 붙박이장 앞'] = [610, 1500, 1000, 2255]; KZ['아이방1 서랍 빼는 자리'] = [1217, 1500, 1585, 2500]; KZ['아이방1 창고 샷시 앞'] = [932, 1500, 1585, 1950]; }
  else if (p1 === 'C') { bumperBed(600, 2350, bc); dresser(1617, 2165, 2117, 3165, 'W', T); mirror(2097, 2185, 2117, 3145);
    KZ['아이방1 서랍 빼는 자리'] = [1217, 2165, 1585, 3165]; KZ['아이방1 창고 샷시 앞'] = [1210, 1500, 2117, 1900]; }
  else if (p1 === 'D') { kidsWardrobe(0, 1500, 600, 2955, 'E', T); dresser(0, 2965, 500, 3965, 'E', T); mirror(0, 2975, 20, 3955); bumperBed(1517, 2325, bc);
    KZ['아이방1 붙박이장 앞'] = [610, 1500, 910, 2955]; KZ['아이방1 서랍 빼는 자리'] = [530, 2965, 900, 3965]; }
  else { kidsWardrobe(0, 2520, 600, 3900, 'E', T); dresser(0, 1510, 500, 2510, 'E', T); mirror(0, 1520, 20, 2500); bumperBed(1517, 2325, bc);
    KZ['아이방1 붙박이장 앞'] = [610, 2520, 910, 3200]; KZ['아이방1 서랍 빼는 자리'] = [530, 1510, 900, 2510]; }
  // 아이방2: 방 안쪽 x4704~6622, y1348~3961. 문 서쪽 벽 y3030~3880(경첩 4704,3880, 반경 850). 창고 샷시 북쪽 x5022~6622
  const p2 = KIDS.k2;
  dresser(5600, 3461, 6600, 3961, 'N', T); KZ['아이방2 서랍 빼는 자리'] = [5600, 3061, 6600, 3430];
  if (p2 === 'B') { kidsWardrobe(4704, 1360, 5154, 3010, 'E', T); bumperBed(6022, 2198, bc); KZ['아이방2 붙박이장 앞'] = [5160, 1400, 5410, 3010]; }
  else if (p2 === 'C') { bumperBed(5530, 2198, bc); KZ['아이방2 창고 가는 길'] = [6140, 1348, 6622, 3061]; } // 침대 서쪽 23cm 띄움: 방문이 열릴 때 문 끝이 지나가는 자리
  else if (p2 === 'D') { bumperBed(5772, 2430, bc, true); KZ['아이방2 창 앞 띠'] = [4704, 1348, 6622, 1820]; }
  else { kidsWardrobe(4704, 1360, 5154, 3010, 'E', T); bumperBed(6002, 2450, bc); KZ['아이방2 붙박이장 앞'] = [5160, 1500, 5395, 3010]; }
}
function dresser(x1, y1, x2, y2, facing, T) { // 기성 서랍장 1000x500x1100
  const W = facing === 'N' || facing === 'S' ? x2 - x1 : y2 - y1, D = facing === 'N' || facing === 'S' ? y2 - y1 : x2 - x1;
  const g = grp((x1 + x2) / 2, (y1 + y2) / 2, facing);
  cabinet(g, W, D, 0, 1100, { color: T.dresserCol || '#f4f2ee', drawers: [260, 260, 260, 260], drawerCols: 2, handle: 'bar', toe: 60 });
  B(-W / 2, -D / 2, W / 2, D / 2, 1100, 1120, M(T.dresserTop || T.desk, { tex: 'grain' }), 4, g);
  return g;
}
function sysAC(cx, cy, w, d, four = false) { // 천장형 시스템 에어컨(1웨이/4웨이 패널)
  const g = M('#f7f7f5', { rough: .45 }), sl = M('#9aa0a4', { rough: .5 });
  const m = B(cx - w / 2, cy - d / 2, cx + w / 2, cy + d / 2, CEIL - 28, CEIL, g, 6); m.userData.wall = true;
  if (four) { for (const [a, b, c, e] of [[-w / 2 + 40, -d / 2 + 40, w / 2 - 40, -d / 2 + 70], [-w / 2 + 40, d / 2 - 70, w / 2 - 40, d / 2 - 40], [-w / 2 + 40, -d / 2 + 90, -w / 2 + 70, d / 2 - 90], [w / 2 - 70, -d / 2 + 90, w / 2 - 40, d / 2 - 90]]) B(cx + a, cy + b, cx + c, cy + e, CEIL - 32, CEIL - 27, sl).userData.wall = true;
    B(cx - w / 2 + 120, cy - d / 2 + 120, cx + w / 2 - 120, cy + d / 2 - 120, CEIL - 31, CEIL - 27, M('#eceeee', { rough: .6 })).userData.wall = true; }
  else { const long = w >= d; B(long ? cx - w / 2 + 50 : cx - w / 2 + 40, long ? cy - d / 2 + 40 : cy - d / 2 + 50, long ? cx + w / 2 - 50 : cx - w / 2 + 120, long ? cy - d / 2 + 120 : cy + d / 2 - 50, CEIL - 33, CEIL - 27, sl).userData.wall = true; }
}
function tallUnit(T, kind) { // 키큰장(x2340~2840, y863~2341, 앞면 동쪽)
  const col = T.tall, w = !!T.kWood, h = T.khandle || 'groove';
  const box = (z0, z1, opt = {}) => { const g = grp(2590, 1602, 'E'); cabinet(g, 1478, 500, z0, z1 - z0, { color: col, wood: w, handle: h, toe: z0 === 0 ? 100 : 0, ...opt }); };
  if (kind === 'closed') { box(0, CEIL, { doors: 3 }); return; }
  // 공통: 아래 서랍, 위 장(1,650부터), 가운데 890~1,630 열린 칸
  box(0, 870, { drawers: [380, 380], drawerCols: 2, wood: true }); box(1650, CEIL, { doors: kind === 'cane' ? 3 : 2, cane: kind === 'cane', color: kind === 'cane' ? col : (T.upper || '#f3f1ec'), wood: kind === 'cane' });
  const inner = kind === 'bar' ? M('#2a2724', { rough: .5 }) : M(T.niche || darker(col, .95), { tex: T.nicheWood ? 'grainV' : undefined, rough: .5 });
  B(2340, 863, 2840, 2341, 870, 900, M(T.ctop, { rough: 0.3 }), 2); // 11/3 케이: 건조대 쪽 옆판 없앰 → 상판이 건조대 칸과 같은 높이(900)로 이어짐
  B(2340, 863, 2360, 2341, 900, 1650, inner); B(2340, 2321, 2840, 2341, 900, 1650, inner);
  B(2340, 863, 2840, 2341, 1630, 1650, M(darker(col, .9)));
  B(2600, 885, 2840, 2320, 1624, 1630, M('#fff7e0', { emissive: '#ffefc8', ei: 1.8 })).userData.wall = true;
  if (kind === 'bar') { // 거울 뒷벽 + 유리 선반 + 잔
    B(2360, 883, 2366, 2321, 900, 1620, M('#c9d0d4', { rough: .05, metal: .3 }));
    B(2366, 883, 2600, 2321, 1200, 1210, M('#e6f0f3', { rough: .05, opacity: .4 }));
    for (let i = 0; i < 8; i++) { cyl(2440 + (i % 2) * 80, 1000 + i * 150, 1210, 1330, 30, 22, M('#e9f2f5', { rough: .05, opacity: .5 })); }
    for (let i = 0; i < 4; i++) cyl(2450, 1900 + i * 90, 890, 1150, 35, 35, M(['#3c5a3a', '#6b2d2d', '#2d3e5a', '#c9a77c'][i], { rough: .2 }));
    B(2830, 883, 2840, 2321, 1050, 1060, M('#b8955a', { metal: .9, rough: .3 }));
  } else if (kind === 'cafeGlass') { // 플루티드 유리 포켓도어(한 짝 열림) + 선반 머그
    for (let i = 0; i < 2; i++) { const y0 = i ? 1602 : 870, y1 = i ? 2330 : 1590; const x = i ? 2800 : 2815;
      const fm = M(T.dframe || '#b8955a', { rough: .3, metal: .6 }); B(x, y0, x + 18, y0 + 20, 900, 1620, fm, 2); B(x, y1 - 20, x + 18, y1, 900, 1620, fm, 2); B(x, y0, x + 18, y1, 900, 915, fm, 2); B(x, y0, x + 18, y1, 1605, 1620, fm, 2);
      for (let k = 0; k < 18; k++) cyl(x + 9, y0 + 20 + k * (y1 - y0 - 40) / 17, 910, 1480, 9, 9, M('#eef3f3', { rough: .25, opacity: .45 }), 8); }
    B(2366, 883, 2560, 2321, 1250, 1265, M(T.niche || darker(col, .9), { tex: 'grain' }));
    for (let i = 0; i < 6; i++) cyl(2450, 980 + i * 220, 1265, 1350, 40, 34, M(['#f4f1ea', '#d9cbb5', '#9fb2bf', '#e8d3c0', '#ffffff', '#c9a77c'][i], { rough: .25 }));
  } else if (kind === 'cane') { // 라탄 캐인 도어 팬트리 + 열린 칸 바구니
    for (let i = 0; i < 3; i++) B(2380, 1000 + i * 420, 2700, 1350 + i * 420, 1250, 1450, M('#c9a77c', { tex: 'rattan' }), 20);
  }
  appliances(2340, 863, 900);
}
function appliances(x0, y0, z) { // 키큰장 홈카페 칸 (앞면 +x)
  // 커피머신
  B(x0 + 40, y0 + 120, x0 + 380, y0 + 360, z, z + 430, M('#2b2b2b', { rough: 0.35, metal: 0.3 }), 20);
  B(x0 + 360, y0 + 150, x0 + 400, y0 + 330, z + 260, z + 330, M('#b9bec3', { metal: .8, rough: .3 }), 8);
  cyl(x0 + 380, y0 + 240, z + 20, z + 120, 35, 30, M('#ffffff', { rough: .2 }));
  // 토스터
  B(x0 + 60, y0 + 480, x0 + 380, y0 + 840, z, z + 210, M('#f2f0eb', { rough: 0.35 }), 25);
  B(x0 + 378, y0 + 520, x0 + 382, y0 + 760, z + 50, z + 170, M('#222', { rough: .1 }), 5);
  // 얼음정수기(전자레인지 자리, 11/2): 폭 약 28cm x 깊이 45cm x 높이 47cm 가정, 싱크에서 급수관 연결
  { const px1 = x0 + 30, px2 = x0 + 480, py1 = y0 + 1000, py2 = y0 + 1280;
    B(px1, py1, px2, py2, z, z + 470, M('#f1f2f2', { rough: 0.3 }), 20);
    B(px2 - 6, py1 + 30, px2 + 2, py2 - 30, z + 300, z + 440, M('#2b2f33', { rough: .15 }), 6);
    B(px2 - 90, py1 + 90, px2 - 10, py2 - 90, z + 150, z + 250, M('#c9ced2', { metal: .7, rough: .3 }), 5);
    B(px2 - 180, py1 + 40, px2 + 5, py2 - 40, z, z + 20, M('#9aa2a8', { metal: .5, rough: .3 }), 4);
    cyl(px2 - 60, (py1 + py2) / 2, z + 20, z + 130, 35, 30, M('#e9f2f5', { rough: .05, opacity: .6 })); }
  // 컵·병
  for (let i = 0; i < 3; i++) cyl(x0 + 120 + i * 70, y0 + 1400, z + 0, z + 90, 32, 28, M(['#f4f1ea', '#d8cdbd', '#8e9c90'][i], { rough: .3 }));
}
function washTower(x1, y1, x2, y2) { // 앞면 서쪽(-x)
  const body = M('#e9eced', { rough: 0.35 }), dark = M('#2a3036', { rough: 0.1 });
  for (const [z0, z1] of [[0, 950], [980, 1940]]) {
    B(x1, y1, x2, y2, z0, z1, body, 12);
    B(x1 - 4, y1 + 20, x1 + 2, y2 - 20, z1 - 120, z1 - 20, M('#cfd5d9', { rough: .3 }), 3);
    const d = addMesh(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 40), dark); d.rotation.z = Math.PI / 2; d.position.set((x1 - 6) * S, (z0 + (z1 - z0) * 0.45) * S, (y1 + y2) / 2 * S);
    const r = addMesh(new THREE.TorusGeometry(0.2, 0.018, 10, 40), METAL()); r.rotation.y = Math.PI / 2; r.position.set((x1 - 12) * S, (z0 + (z1 - z0) * 0.45) * S, (y1 + y2) / 2 * S);
  }
  B(x1, y1, x2, y2, 950, 980, M('#bfc4c7'));
  // (11/5 옛 세제 수납 상자 제거: 세탁기 옆 틈새장으로 대체)
}
function windowBench(T) {
  const g = grp(1525, 10275, 'N'); cabinet(g, 2150, 450, 0, 380, { color: T.tall, doors: 5, handle: 'groove', toe: 40, wood: !!T.benchWood });
  B(450, 10050, 2600, 10500, 380, 450, M(T.seat, { tex: 'fabric', rough: 1 }), 30);
  const cols = [T.acc, mixc(T.acc, '#ffffff', 0.5), T.back, mixc(T.seat, '#ffffff', .3)];
  for (let i = 0; i < 4; i++) { const p = B(560 + i * 500, 10300, 980 + i * 500, 10460, 450, 850, M(cols[i], { tex: 'fabric' }), 80); p.rotation.x = 0.2; }
  books(2150, 10120, 450, 5); plant(600, 10200, 0.3, 450, '#ffffff');
}
function daybed(T) {
  const x1 = 0, x2 = 2150, y1 = 9330, y2 = 10500, h = 350;
  const g = grp((x1 + x2) / 2, (y1 + y2) / 2, 'N');
  cabinet(g, x2 - x1, y2 - y1, 0, h, { color: T.tall, drawers: [h - 40], drawerCols: 4, handle: 'groove', toe: 40, wood: true });
  // 매트 2장(리넨) + 등쿠션 + 볼스터
  const mat = M(T.seat, { tex: 'fabric', rough: 1 });
  B(20, 9350, 1065, 10480, h, h + 90, mat, 35); B(1085, 9350, 2130, 10480, h, h + 90, mat, 35);
  const cols = [T.back, mixc(T.back, '#ffffff', 0.35), T.acc];
  for (let i = 0; i < 4; i++) { const p = B(70 + i * 510, 10260, 530 + i * 510, 10460, h + 90, h + 560, M(cols[i % 3], { tex: 'fabric' }), 90); p.rotation.x = 0.22; }
  for (const x of [130, 2020]) { const b = addMesh(new THREE.CylinderGeometry(0.11, 0.11, 0.8, 24), M(T.acc, { tex: 'fabric' })); b.rotation.x = Math.PI / 2; b.position.set(x * S, (h + 200) * S, 9900 * S); }
  // 좌식 원형 테이블
  const tz = h + 90; const tx = 1075, ty = 9800;
  cyl(tx, ty, tz + 280, tz + 310, 330, 330, M(T.table, { tex: 'grain', rough: .45 }), 48);
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; cyl(tx + Math.cos(a) * 220, ty + Math.sin(a) * 220, tz, tz + 280, 16, 20, M(T.leg, { tex: 'grain' }), 12); }
  cyl(tx - 80, ty - 60, tz + 310, tz + 400, 40, 36, M('#efe9de', { rough: .3 })); cyl(tx + 100, ty + 40, tz + 310, tz + 330, 120, 120, M('#d9c3a5', { tex: 'rattan' }), 24);
  // 방석 + 접은 담요
  B(250, 9450, 650, 9850, tz, tz + 70, M(T.acc, { tex: 'fabric' }), 30); B(1500, 9450, 1900, 9850, tz, tz + 70, M(T.back, { tex: 'fabric' }), 30);
  B(1600, 10050, 2000, 10230, tz, tz + 90, M(mixc(T.seat, '#ffffff', .4), { tex: 'fabric' }), 25);
  // 라탄 바구니, 매트 앞 바닥
  cyl(1750, 9100, 0, 380, 200, 170, M('#c9a77c', { tex: 'rattan' }), 24); for (let i = 0; i < 3; i++) { const t = B(1650 + i * 25, 9020, 1850 - i * 25, 9180, 380 + i * 50, 430 + i * 50, M(['#e9e1d3', '#bfae95', '#a3b18a'][i], { tex: 'fabric' }), 20); t.rotation.y = i * 0.3; }
  rug(600, 7900, 2600, 9150, T.rug || '#e2d6c2');
}
function archHari(x1, x2, y1, y2, col) {
  const sh = new THREE.Shape(); const W = (x2 - x1) * S, top = CEIL * S, low = 1.62, apex = 2.08;
  sh.moveTo(0, top); sh.lineTo(W, top); sh.lineTo(W, low); sh.quadraticCurveTo(W / 2, apex + (apex - low), 0, low); sh.lineTo(0, top);
  const geo = new THREE.ExtrudeGeometry(sh, { depth: (y2 - y1) * S, bevelEnabled: false, curveSegments: 40 });
  const m = addMesh(geo, M(col, { rough: 0.9 })); m.position.set(x1 * S, 0, y1 * S);
  // 양쪽 날개벽
  B(x1, y1, x1 + 120, y2, 0, 1700, M(col, { rough: 0.9 }), 0); B(x2 - 120, y1, x2, y2, 0, 1700, M(col, { rough: 0.9 }), 0);
}
function bathroom(T) { // 욕실 x4474~6258, y4119~5724. 변기(북서) ↔ 세면대(욕조 옆) 위치 바꿈, 욕조 반만 얇은 돌 벽으로 분리
  const tc = hex2rgb(T.bathTile || '#e9e6e1');
  wallTile(4474, 4119, 6258, 4127, 0, CEIL, tc); wallTile(4474, 5716, 6258, 5724, 0, CEIL, tc);
  wallTile(4474, 4127, 4482, 4975, 0, CEIL, tc); wallTile(6250, 4127, 6258, 5716, 0, CEIL, tc);
  const tub = WHITEPORC();
  // 욕조 700 x 1500 — 11/3 케이: 덧벽·젠다이 없이 욕조를 동쪽 벽에 바로 붙임(욕실 바닥이 10cm 넓어짐)
  B(5550, 4180, 6250, 5680, 0, 560, tub, 30);
  B(5620, 4250, 6180, 5610, 420, 562, M('#dfe9ee', { rough: 0.1 }), 60);
  const bc = ['#ffffff', '#c9b49a', '#9fb2bf', '#e8d3c0', '#5d6b74', '#f4f1ea'];
  // 욕조 반만 분리: 얇은 돌 벽 30mm (물때 적게), 길이 750, 높이 2.0m
  B(5520, 4127, 5550, 4930, 0, 2000, M(T.bathStone || '#e3ded6', { rough: .3 }), 4);
  // 11/3 케이: 욕조 위 북쪽 벽, 돌 분리벽 끝(x5550)부터 욕조 끝 벽(x6250)까지 벽~벽 일자 선반(설치형 인조대리석, 깊이 120, 높이 1,160~1,190)
  //   세면대~변기 위 대리석 젠다이와 같은 높이·같은 자재 → 욕실 한 바퀴 가로선이 하나로 이어져 깔끔. 조적 없음, 욕실 안 좁아짐
  B(5550, 4127, 6250, 4247, 1160, 1190, M(T.bathMarble || '#ece8e2', { tex: 'marble', rough: .2 }), 3).userData.wall = true;
  for (const [x, h, c] of [[5700, 190, '#f4f1ea'], [5780, 190, '#f4f1ea'], [5860, 150, '#e8e1d4']]) cyl(x, 4190, 1190, 1190 + h, 30, 30, M(c, { rough: .3 }), 16).userData.skip = true;
  // 해바라기 샤워: 세로 바 없이 매립 수전(선반 아래 900) + 벽 매립 해바라기 암(선반 위) + 핸드샤워 거치
  B(5880, 4127, 5950, 4145, 850, 950, METAL(), 6); cyl(5915, 4320, 2000, 2015, 100, 100, METAL(), 24); B(5910, 4127, 5920, 4330, 2020, 2032, METAL());
  B(6090, 4127, 6110, 4150, 1400, 1440, METAL(), 4);
  // 변기 (북서, 옛 세면대 자리)
  B(4610, 4127, 4850, 4317, 380, 780, WHITEPORC(), 30);
  const bowl = addMesh(new THREE.CylinderGeometry(0.19, 0.15, 0.4, 32), WHITEPORC()); bowl.scale.z = 1.3; bowl.position.set(4730 * S, 0.2, 4530 * S);
  const seat = addMesh(new THREE.CylinderGeometry(0.19, 0.19, 0.03, 32), WHITEPORC()); seat.scale.z = 1.3; seat.position.set(4730 * S, 0.415, 4530 * S);
  B(4484, 4560, 4500, 4700, 750, 760, METAL()); cyl(4545, 4630, 700, 760, 55, 55, M('#ffffff'), 20).rotation.z = Math.PI / 2;
  // 세면대 (욕조 옆, 옛 변기 자리) + 거울장
  { const g = grp(5195, 4322, 'S'); cabinet(g, 410, 390, 350, 500, { color: T.vanity, doors: 1, handle: 'groove', toe: 0, wood: !!T.mWood }); }
  B(4995, 4130, 5395, 4520, 850, 870, WHITEPORC(), 10);
  B(5045, 4190, 5345, 4460, 870, 980, WHITEPORC(), 60);
  B(5185, 4127, 5205, 4235, 1050, 1066, METAL(), 4); B(5185, 4220, 5205, 4235, 1030, 1066, METAL(), 3); // 벽 수전
  // 세면대~변기 위: 대리석 다이(젠다이, 깊이 12cm) + 그 위 천장까지 긴 거울장(아래 띄움, 간접등)
  B(4482, 4127, 5412, 4247, 1160, 1190, M(T.bathMarble || '#ece8e2', { tex: 'marble', rough: .2 }), 3).userData.wall = true;
  for (const [x, h, c] of [[4560, 150, '#ffffff'], [4620, 110, '#9fb2bf'], [5280, 120, '#e8d3c0'], [5340, 160, '#f4f1ea']]) cyl(x, 4190, 1190, 1190 + h, 28, 26, M(c, { rough: .3 }), 16).userData.skip = true;
  B(4490, 4127, 5400, 4257, 1450, CEIL, M(T.vanity, { tex: T.mWood ? 'grainV' : undefined }), 4).userData.wall = true;
  for (let i = 0; i < 3; i++) { const x1 = 4495 + i * 302; B(x1, 4257, x1 + 298, 4263, 1456, CEIL - 10, M('#dfe6e9', { rough: 0.04, metal: 0.3 }), 3).userData.wall = true; }
  B(4495, 4250, 5395, 4258, 1440, 1448, M('#fff2d8', { emissive: '#ffeccc', ei: 1.8 })).userData.wall = true;
  // 욕조 위 전용 조명(방습 다운라이트 2개) + 니치 간접등은 위 · 욕실 천장 등
  for (const y of [4600, 5250]) { LIGHT_PLAN.push({ k: 'down', x: 5900, y }); const d = addMesh(new THREE.CylinderGeometry(0.04, 0.04, 0.006, 20), M('#ffffff', { emissive: '#fff4dc', ei: 1.8 }), null, false); d.position.set(5.9, (CEIL - 4) * S, y * S); CEIL_ONLY.push(d); }
  { const L = new THREE.PointLight('#fff1dc', 0.8, 3, 2); L.position.set(5.9, 2.05, 4.95); root.add(L); }
  { const d = addMesh(new THREE.CylinderGeometry(0.05, 0.05, 0.006, 20), M('#ffffff', { emissive: '#fff4dc', ei: 1.6 }), null, false); d.position.set(4.95, (CEIL - 4) * S, 4.85); CEIL_ONLY.push(d); }
  rug(4520, 4980, 5100, 5420, '#e6e1d8');
}
// ---------- 간섭 점검 (개발용) ----------
export const DOOR_SWINGS = { '보일러실 문': [932, 420, 1512, 1000, 932, 420, 580], '아이방1 문': [1250, 3175, 2040, 3965, 2040, 3965, 790], '아이방2 문': [4704, 3030, 5554, 3880, 4704, 3880, 850], '욕실 문': [4474, 4975, 5149, 5650, 4474, 5650, 675], '안방 문': [3264, 5951, 4164, 6851, 3264, 5951, 900] };
export const USE_ZONES = {
  '싱크 앞 서는 자리(60cm)': [2880, 885, 3840, 1463], '건조대 앞(손 닿는 자리)': [2865, 885, 3300, 1300], '쿡탑 앞(60cm)': [3255, 1930, 3835, 2510], '식세기 문 여는 자리': [3255, 1335, 3835, 1925], '냉장고 문 열림(60cm)': [3070, 2341, 3640, 4170], '키큰장 문 열림(50cm)': [2865, 890, 3340, 2341],
  '신발장 앞': [0, 4540, 1200, 4900], '현관→중문 동선': [0, 4560, 1190, 5120], 
  '식탁 의자 빼는 자리(옆)': [2060, 6790, 2460, 8000], '식탁 끝 의자 빼는 자리': [820, 8830, 1280, 9150], '의자 뒤 거실 통로(책장 앞)': [2060, 6000, 2760, 9250],
  '안방 침대 북쪽 옆': [3720, 6900, 5450, 7300], '안방 침대 남쪽 옆': [3720, 8960, 5450, 9317],
  '세탁기 문 앞(부스 안·앞)': [5050, 9850, 5700, 10465], '세탁실 양개 문 여는 자리': [5120, 9580, 5570, 10460], '세면대 앞': [4995, 4525, 5395, 4920], '변기 앞': [4550, 4790, 4910, 5200], '서재 의자 빼는 자리(65cm)': [3786, 9030, 4486, 9680], '세탁실 가는 길(책상 동쪽)': [4846, 9560, 5040, 10480], '안방 북쪽 붙박이장 앞(거울 문 포함)': [4221, 6560, 6012, 7150], '안방→서재 통로': [4610, 9317, 5160, 9540], '팬트리 문 여는 자리': [2180, 9560, 2720, 10300], '분리수거 통 빼는 자리': [0, 5130, 1150, 5525],
};
export function audit() {
  const out = []; const bb = new THREE.Box3();
  root.updateMatrixWorld(true);
  root.traverse(o => {
    if (!o.isMesh || o.userData.wall || o.userData.door || o.userData.skip) return;
    bb.setFromObject(o); const x1 = bb.min.x * 1000, x2 = bb.max.x * 1000, y1 = bb.min.z * 1000, y2 = bb.max.z * 1000, z0 = bb.min.y * 1000, z1 = bb.max.y * 1000;
    if (z1 - z0 < 70 && z0 < 30) return; // 바닥·러그·매트
    if (z0 > 2000) return;
    for (const [k, [a, b, c, d, hx, hy, r]] of Object.entries(DOOR_SWINGS)) {
      const nx = Math.max(x1, Math.min(hx, x2)), ny = Math.max(y1, Math.min(hy, y2));
      if (x1 < c - 5 && x2 > a + 5 && y1 < d - 5 && y2 > b + 5 && Math.hypot(nx - hx, ny - hy) < r - 5) {
        // 원호 안쪽인지 대략 판정: 박스 가장 가까운 점과 경첩 거리
        out.push(`[문] ${k} ↔ 물체 (${Math.round(x1)},${Math.round(y1)})-(${Math.round(x2)},${Math.round(y2)}) h${Math.round(z0)}~${Math.round(z1)}`);
      }
    }
    for (const [a, b, c, d, e, f] of WALLS) {
      const ox = Math.min(x2, c) - Math.max(x1, a), oy = Math.min(y2, d) - Math.max(y1, b), oz = Math.min(z1, f) - Math.max(z0, e);
      if (ox > 15 && oy > 15 && oz > 15) out.push(`[벽] 벽(${a},${b})-(${c},${d}) ↔ 물체 (${Math.round(x1)},${Math.round(y1)})-(${Math.round(x2)},${Math.round(y2)}) h${Math.round(z0)}~${Math.round(z1)}`);
    }
  });
  // 사용 공간 (+ 붙박이장 앞 통로는 현재 구성대로)
  const ZONES = { ...USE_ZONES };
  Object.assign(ZONES, KZ); // 아이방 배치안별 사용 공간
  if (CUR_LAYOUT.win) { for (const k of ['식탁 의자 빼는 자리(옆)', '식탁 끝 의자 빼는 자리', '의자 뒤 거실 통로(책장 앞)']) delete ZONES[k]; ZONES['책장 앞 통로'] = [2420, 6000, 2720, 8300]; ZONES['창가 식탁 의자 빼는 자리'] = [775, 8230, 2175, 8480]; } for (const sg of CUR_SEGS) if (sg[0] === 'wd') ZONES[`붙박이장 앞(${sg[1]}~${sg[2]})`] = [5470, sg[1], 5995, sg[2]];
  root.traverse(o => {
    if (!o.isMesh || o.userData.wall || o.userData.door || o.userData.skip || SKY.includes(o)) return;
    bb.setFromObject(o); const x1 = bb.min.x * 1000, x2 = bb.max.x * 1000, y1 = bb.min.z * 1000, y2 = bb.max.z * 1000, z0 = bb.min.y * 1000, z1 = bb.max.y * 1000;
    if (z1 - z0 < 70 && z0 < 30) return; if (z0 > 1950) return;
    for (const [k, [a, b, c, d]] of Object.entries(ZONES)) if (x1 < c - 10 && x2 > a + 10 && y1 < d - 10 && y2 > b + 10) out.push(`[사용공간] ${k} ↔ 물체 (${Math.round(x1)},${Math.round(y1)})-(${Math.round(x2)},${Math.round(y2)}) h${Math.round(z0)}~${Math.round(z1)}`);
  });
  // 가구끼리 겹침 (root 직속 물체 단위)
  const items = [];
  for (const c of root.children) { if (c.userData.wall || c.userData.door || c.userData.skip || c.isLight || SKY.includes(c)) continue; bb.setFromObject(c); if (bb.isEmpty()) continue; const z0 = bb.min.y * 1000, z1 = bb.max.y * 1000; if (z1 - z0 < 70 && z0 < 30) continue; if (z0 > 2000) continue; items.push([bb.min.x * 1000, bb.min.z * 1000, bb.max.x * 1000, bb.max.z * 1000, z0, z1, c.isGroup ? 'G' : 'M']); }
  for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) { const A = items[i], Bx = items[j];
    if (A[6] !== 'G' && Bx[6] !== 'G') continue;
    const ox = Math.min(A[2], Bx[2]) - Math.max(A[0], Bx[0]), oy = Math.min(A[3], Bx[3]) - Math.max(A[1], Bx[1]), oz = Math.min(A[5], Bx[5]) - Math.max(A[4], Bx[4]);
    if (ox > 30 && oy > 30 && oz > 30) out.push(`[가구] (${A.slice(0, 4).map(Math.round)}) ↔ (${Bx.slice(0, 4).map(Math.round)})`); }
  return [...new Set(out)];
}
