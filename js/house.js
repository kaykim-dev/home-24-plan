// 풍납동 24평 실시간 3D 모델 (단위: mm, 평면 x=왼→오, y=위(북,주방)→아래(남,거실 창), z=높이)
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const CEIL = 2300;
const S = 0.001;
let root;
export const CEIL_ONLY = [];
const matCache = new Map();

// ---------- textures ----------
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
    for (let k = 0; k < 140; k++) { g.strokeStyle = `rgba(70,40,15,${0.03 + r() * 0.07})`; g.lineWidth = 0.6 + r() * 1.6; g.beginPath(); const y = r() * H; g.moveTo(0, y); g.bezierCurveTo(W / 3, y + (r() - .5) * 18, 2 * W / 3, y + (r() - .5) * 18, W, y + (r() - .5) * 10); g.stroke(); }
  });
}
function fabricTex(col) {
  return canvasTex(256, 256, (g, W, H) => {
    const r = rnd(9); g.fillStyle = rgb(col); g.fillRect(0, 0, W, H);
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
  if (o.tex === 'rattan') { p.map = rattanTex(hex2rgb(color)); p.color = new THREE.Color('#ffffff'); }
  if (o.opacity !== undefined) { p.transparent = true; p.opacity = o.opacity; p.depthWrite = o.opacity > 0.6; }
  if (o.emissive) { p.emissive = new THREE.Color(o.emissive); p.emissiveIntensity = o.ei ?? 1; }
  if (o.side) p.side = THREE.DoubleSide;
  const m = new THREE.MeshStandardMaterial(p);
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
  const body = M(darker(col, 0.92), { rough: 0.6 }); const door = M(col, { rough: o.gloss ? 0.25 : 0.55, tex: o.wood ? 'grain' : undefined });
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
      B(x + 1.5, D / 2 - 19, x + w - 1.5, D / 2, zz + 1.5, zz + rh - 1.5, door, 2, g);
      if (o.handle === 'bar') {
        const m = BLACKMETAL();
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

function sofaBanquette(T) {
  const base = M(T.base, { rough: 0.7 }), seat = M(T.seat, { tex: 'fabric', rough: 0.95 }), back = M(T.back, { tex: 'fabric', rough: 0.95 });
  const plinth = M(darker(T.base, 0.6));
  // A: 전실 벽 앞 (등받이 북쪽, 앉는 방향 남)
  B(20, 6040, 1230, 6500, 0, 80, plinth); B(0, 6000, 1250, 6550, 80, 330, base, 6);
  B(0, 6550, 550, 8450, 80, 330, base, 6); B(20, 6550, 510, 8430, 0, 80, plinth);
  // 서랍 손잡이 홈
  for (const [a, b] of [[30, 600], [650, 1220]]) B(a, 6548, b, 6552, 300, 312, M('#555'), 0);
  for (const [a, b] of [[6580, 7480], [7530, 8420]]) B(548, a, 552, b, 300, 312, M('#555'), 0);
  // 좌판 쿠션 (두께 100, 좌판 높이 ~430)
  for (const [a, b] of [[170, 700], [710, 1245]]) B(a, 6150, b, 6545, 330, 435, seat, 45);
  for (const [a, b] of [[6555, 7180], [7190, 7815], [7825, 8445]]) B(160, a, 545, b, 330, 435, seat, 45);
  B(5, 6150, 165, 6545, 330, 435, seat, 45);
  // 등쿠션 (뒤로 살짝 기움)
  for (const [a, b] of [[160, 700], [710, 1245]]) { const m = B(a, 6010, b, 6170, 440, 860, back, 60); m.rotation.x = -0.12; m.position.z -= 0.01; }
  for (const [a, b] of [[6180, 7180], [7190, 7815], [7825, 8445]]) { const m = B(5, a, 165, b, 440, 860, back, 60); m.rotation.z = 0.12; m.position.x -= 0.01; }
  const corner = B(5, 6010, 160, 6170, 440, 860, back, 50);
  // 쿠션
  const acc = M(T.acc, { tex: 'fabric', rough: 0.95 }), acc2 = M(mixc(T.acc, '#ffffff', 0.5), { tex: 'fabric' });
  let p = B(230, 6180, 640, 6320, 435, 820, acc, 90); p.rotation.x = -0.25; p.rotation.y = 0.15;
  p = B(180, 7900, 320, 8300, 435, 800, acc2, 90); p.rotation.z = 0.25; p.rotation.y = -0.1;
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
  CEIL_ONLY.push(cyl(cx, cy, zBottom + 150, CEIL, 2.5, 2.5, M('#333'), 6));
  CEIL_ONLY.push(cyl(cx, cy, CEIL - 10, CEIL, 45, 45, M('#eeeeee'), 20));
  const mat = M(col, { rough: 0.5, side: true });
  let shade;
  if (style === 'dome') { shade = addMesh(new THREE.SphereGeometry(0.2, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat); shade.position.set(cx * S, (zBottom + 10) * S, cy * S); shade.scale.y = 0.75; }
  else { shade = addMesh(new THREE.CylinderGeometry(0.06, 0.18, 0.2, 32, 1, true), mat); shade.position.set(cx * S, (zBottom + 100) * S, cy * S); }
  const bulb = addMesh(new THREE.SphereGeometry(0.04, 16, 8), M('#fff6e0', { emissive: '#ffe8b8', ei: 2.5 }), null, false); bulb.position.set(cx * S, (zBottom + 30) * S, cy * S);
  const L = new THREE.PointLight('#ffe2b0', 2.2, 4.5, 2); L.position.set(cx * S, (zBottom - 40) * S, cy * S); root.add(L);
}
function downlight(cx, cy) {
  const d = addMesh(new THREE.CylinderGeometry(0.045, 0.045, 0.006, 20), M('#ffffff', { emissive: '#fff4dc', ei: 1.6 }), null, false); d.position.set(cx * S, (CEIL - 4) * S, cy * S); CEIL_ONLY.push(d);
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
function curtain(x1, x2, y, z0, z1, col, gathered = false) {
  const W = (x2 - x1), folds = Math.max(4, Math.round(W / 110));
  const geo = new THREE.PlaneGeometry(W * S, (z1 - z0) * S, folds * 8, 1);
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) { const x = pos.getX(i); pos.setZ(i, Math.sin((x / (W * S)) * folds * Math.PI * 2) * 0.035); }
  geo.computeVertexNormals();
  const m = addMesh(geo, M(col, { rough: 1, side: true, opacity: 0.93 }));
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
function bed(x1, y1, x2, y2, T, o = {}) { // 머리 북쪽(y1)
  const frame = M(o.frame || T.head, { tex: o.woodFrame ? 'grain' : 'fabric', rough: 0.9 });
  B(x1, y1, x2, y2, 60, 300, frame, 25);
  B(x1 + 40, y1 + 40, x2 - 40, y2 - 40, 0, 60, M('#2a2a2a'));
  const hh = o.headH ?? 1050;
  if (o.channel) { const n = Math.round((x2 - x1) / 180); const w = (x2 - x1 + 40) / n; for (let i = 0; i < n; i++) B(x1 - 20 + i * w + 4, y1 - 90, x1 - 20 + (i + 1) * w - 4, y1, 280, hh, frame, 40); B(x1 - 20, y1 - 100, x2 + 20, y1 - 60, 0, 300, frame, 10); }
  else B(x1 - 20, y1 - 90, x2 + 20, y1, 0, hh, frame, 40);
  const sheet = M('#fbfaf6', { tex: 'fabric', rough: 1 });
  B(x1 + 25, y1 + 15, x2 - 25, y2 - 25, 300, 520, sheet, 60);
  // 이불 (발쪽 2/3, 옆으로 늘어짐)
  const duv = M(T.duvet, { tex: 'fabric', rough: 1 }); const yd = y1 + (y2 - y1) * 0.33;
  B(x1 + 5, yd, x2 - 5, y2 - 5, 300, 560, duv, 70);
  B(x1 + 15, yd - 60, x2 - 15, yd + 80, 545, 585, M(mixc(T.duvet, '#ffffff', 0.4), { tex: 'fabric' }), 25); // 접힌 윗단
  // 발치 담요
  B(x1 - 10, y2 - 520, x2 + 10, y2 - 160, 300, 575, M(T.acc, { tex: 'fabric', rough: 1 }), 30);
  // 베개
  const pw = (x2 - x1 - 120) / (o.pillows || 2);
  for (let i = 0; i < (o.pillows || 2); i++) { const p = B(x1 + 60 + i * pw + 15, y1 + 40, x1 + 60 + (i + 1) * pw - 15, y1 + 400, 515, 660, M('#ffffff', { tex: 'fabric' }), 70); p.rotation.x = -0.35; }
  if ((o.pillows || 2) >= 2) { const p = B((x1 + x2) / 2 - 220, y1 + 260, (x1 + x2) / 2 + 220, y1 + 380, 540, 820, M(T.acc, { tex: 'fabric' }), 60); p.rotation.x = -0.3; }
}
function nightstand(cx, cy, T, lampOn = true) {
  B(cx - 225, cy - 200, cx + 225, cy + 200, 60, 500, M(T.desk, { tex: 'grain', rough: 0.55 }), 8);
  B(cx - 205, cy + 200, cx + 205, cy + 203, 300, 312, M('#4a4a4a'));
  for (const [dx, dy] of [[-190, -170], [190, -170], [-190, 170], [190, 170]]) cyl(cx + dx, cy + dy, 0, 60, 12, 12, M('#3a3a3a'), 8);
  if (lampOn) lamp(cx + 40, cy - 30, 500);
}
function wardrobe(x1, y1, x2, y2, facing, T, o = {}) {
  const W = facing === 'N' || facing === 'S' ? x2 - x1 : y2 - y1, D = facing === 'N' || facing === 'S' ? y2 - y1 : x2 - x1;
  const g = grp((x1 + x2) / 2, (y1 + y2) / 2, facing);
  cabinet(g, W, D, o.z0 ?? 0, o.H ?? CEIL, { color: o.color || T.tall, doors: o.doors, handle: o.handle || 'bar', toe: o.toe, drawers: o.drawers, drawerCols: o.drawerCols, wood: o.wood, gloss: o.gloss });
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
  for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; const s = addMesh(new THREE.BoxGeometry(0.3, 0.02, 0.03), k, g); s.position.set(Math.cos(a) * 0.15, 0.06, Math.sin(a) * 0.15); s.rotation.y = -a; const w = addMesh(new THREE.SphereGeometry(0.025, 8, 6), k, g); w.position.set(Math.cos(a) * 0.29, 0.025, Math.sin(a) * 0.29); }
  const p = addMesh(new THREE.CylinderGeometry(0.02, 0.02, 0.38, 10), k, g); p.position.y = 0.26;
  B(-230, -220, 230, 220, 440, 510, m, 30, g);
  const bk = B(-210, -260, 210, -200, 560, 960, m, 40, g); bk.rotation.x = -0.15;
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
function doorLeaf(x1, y1, x2, y2, col, handleSide = 'a') {
  B(x1, y1, x2, y2, 0, 2080, M(col, { rough: 0.5 }), 3);
  const m = METAL(); const along = (x2 - x1) > (y2 - y1);
  if (along) { const hx = handleSide === 'a' ? x2 - 80 : x1 + 60; B(hx, y1 - 50, hx + 20, y2 + 50, 980, 1000, m, 5); }
  else { const hy = handleSide === 'a' ? y2 - 80 : y1 + 60; B(x1 - 50, hy, x2 + 50, hy + 20, 980, 1000, m, 5); }
}
function casing(x1, y1, x2, y2, col) { // 개구부 주위 몰딩
  const m = M(col, { rough: 0.5 }); const t = 45;
  if ((x2 - x1) > (y2 - y1)) { // 벽이 x 방향(문은 y로 통과)
    for (const yy of [y1 - 12, y2]) { B(x1 - t, yy, x1, yy + 12, 0, 2100 + t, m); B(x2, yy, x2 + t, yy + 12, 0, 2100 + t, m); B(x1 - t, yy, x2 + t, yy + 12, 2100, 2100 + t, m); }
  } else {
    for (const xx of [x1 - 12, x2]) { B(xx, y1 - t, xx + 12, y1, 0, 2100 + t, m); B(xx, y2, xx + 12, y2 + t, 0, 2100 + t, m); B(xx, y1 - t, xx + 12, y2 + t, 2100, 2100 + t, m); }
  }
}
function windowSet(x1, x2, yWall, sill, top, frameCol = '#f4f4f2', panes = 2, depth = 263) {
  const fm = M(frameCol, { rough: 0.4 });
  B(x1, yWall - 70, x2, yWall - 10, sill - 30, sill, fm); B(x1, yWall - 70, x2, yWall - 10, top, top + 30, fm);
  B(x1, yWall - 70, x1 + 50, yWall - 10, sill, top, fm); B(x2 - 50, yWall - 70, x2, yWall - 10, sill, top, fm);
  for (let i = 1; i < panes; i++) { const x = x1 + (x2 - x1) * i / panes; B(x - 25, yWall - 75, x + 25, yWall - 5, sill, top, fm); }
  const g = B(x1 + 50, yWall - 45, x2 - 50, yWall - 35, sill, top, GLASS()); g.castShadow = false;
  // 창턱(안쪽)
  B(x1 - 20, yWall - 20, x2 + 20, yWall + (depth > 0 ? depth : 0), sill - 30, sill, M('#f2f0ea', { rough: 0.3 }));
}

// ---------- floor ----------
function floorZone(x1, y1, x2, y2, tex, rough = 0.6, rep = 2000) {
  const t = tex.clone(); t.needsUpdate = true; t.repeat.set((x2 - x1) / rep, (y2 - y1) / rep); t.offset.set(x1 / rep, y1 / rep);
  const m = new THREE.MeshStandardMaterial({ map: t, roughness: rough });
  const p = addMesh(new THREE.PlaneGeometry((x2 - x1) * S, (y2 - y1) * S), m, null, false);
  p.rotation.x = -Math.PI / 2; p.position.set((x1 + x2) / 2 * S, 0.001, (y1 + y2) / 2 * S);
}

// ---------- house ----------
export const LABELS = [
  ['거실·놀이', 1700, 9700], ['주방', 3300, 2000], ['안방', 4900, 8700], ['아이방 1', 1000, 2700], ['아이방 2', 5700, 2300], ['욕실', 5350, 4950], ['전실', 620, 5100], ['식탁', 1050, 7500], ['세탁 부스', 6150, 10000], ['안방 확장', 4300, 10000]
];

export function buildHouse(scene, T, V) {
  if (root) { scene.remove(root); root.traverse(o => { if (o.geometry) o.geometry.dispose(); }); }
  root = new THREE.Group(); scene.add(root); CEIL_ONLY.length = 0;
  const wallM = M(T.wall, { rough: 0.92 }); const capM = M('#4d4b47', { rough: 0.9 });
  const wallMats = [wallM, wallM, capM, wallM, wallM, wallM];
  const partM = M(T.part, { rough: 0.9 }); const partMats = [partM, partM, capM, partM, partM, partM];
  const wall = (x1, y1, x2, y2, z0 = 0, z1 = CEIL, mats = wallMats) => { const m = addMesh(new THREE.BoxGeometry((x2 - x1) * S, (z1 - z0) * S, (y2 - y1) * S), z1 >= CEIL ? mats : mats[0]); m.position.set((x1 + x2) / 2 * S, (z0 + z1) / 2 * S, (y1 + y2) / 2 * S); return m; };

  // 바닥
  const fc = T.floorc;
  const floorTex = T.floor === 'tile' ? tileTex(fc, 600, 3) : woodFloorTex(fc, T.plank || 190);
  const rep = T.floor === 'tile' ? 1200 : 2000;
  for (const z of [[0, 4170, 3066, 10500], [2340, 263, 4455, 4170], [2340, 3961, 4250, 5724], [3066, 5724, 6622, 10500], [0, 1417, 2117, 3965], [932, 263, 2117, 1417], [4704, 263, 6622, 3961]])
    floorZone(...z, floorTex, T.floor === 'tile' ? 0.35 : 0.55, rep);
  floorZone(4474, 4119, 6258, 5724, tileTex([228, 231, 232], 300, 3), 0.3, 1200);
  floorZone(0, 4170, 1250, 6000, T.entryTex === 'terrazzo' ? terrazzoTex(T.entry) : tileTex(T.entry, 400, 4), 0.4, 1200);
  floorZone(0, 263, 832, 1417, tileTex([214, 214, 212], 300, 3), 0.5, 1200);
  floorZone(5672, 9540, 6622, 10500, tileTex([226, 232, 234], 300, 3), 0.4, 1200);
  // 바깥 바닥(배경)

  // 내부 벽 (천장까지)
  for (const w of [[832, 263, 932, 1417], [0, 1417, 932, 1500], [2117, 263, 2340, 3965], [0, 3965, 1250, 4170], [2040, 3965, 2340, 4170], [4455, 263, 4704, 1348], [4455, 1348, 4704, 3030], [4455, 3880, 4704, 3961], [4250, 3961, 6622, 4119], [4704, 263, 5022, 1348], [4250, 3961, 4474, 4975], [4250, 5650, 4474, 5724], [6258, 4119, 6622, 5724], [3066, 5724, 3264, 5951], [4211, 5724, 6622, 5951], [3066, 5724, 3264, 9317], [2900, 9200, 3264, 9540], [5672, 9317, 6622, 9540]]) wall(...w);
  for (const [x1, y1, x2, y2] of [[1250, 3965, 2040, 4170], [4455, 3030, 4704, 3880], [4250, 4975, 4474, 5650], [3264, 5724, 4211, 5951], [-220, 4560, 0, 5400]]) wall(x1, y1, x2, y2, 2100, CEIL);
  // 뒤쪽 외벽 + 창
  wall(-220, -220, 980, 263); wall(2070, -220, 2450, 263); wall(4350, -220, 5100, 263); wall(6500, -220, 6842, 263);
  for (const [x1, x2] of [[980, 2070], [2450, 4350], [5100, 6500]]) { wall(x1, -220, x2, 263, 0, 900); wall(x1, -220, x2, 263, 2100, CEIL); windowSet(x1, x2, 263, 900, 2100); }
  // 좌우 외벽
  wall(-220, 0, 0, 4560); wall(-220, 5400, 0, 10650); wall(6622, 0, 6842, 10650);
  // 현관문
  B(-200, 4580, -150, 5380, 0, 2080, M(T.door === T.part ? '#3d3d3d' : T.door, { rough: 0.5 }), 4);
  B(-150, 5280, -110, 5300, 950, 1150, METAL(), 4);
  // 앞쪽 일자 통창
  wall(-220, 10500, 5900, 10650, 0, 450); wall(-220, 10500, 5900, 10650, 2150, CEIL); wall(5900, 10500, 6842, 10650);
  { const fm = M('#f4f4f2', { rough: 0.4 }); for (const x of [0, 1460, 2900, 2960, 4400, 5850]) B(x, 10520, x + 50, 10600, 450, 2150, fm); B(0, 10520, 5900, 10600, 430, 460, fm); B(0, 10520, 5900, 10600, 2120, 2150, fm); const g = B(0, 10555, 5900, 10565, 450, 2150, GLASS()); g.castShadow = false; B(-20, 10440, 5920, 10520, 420, 450, M('#f2f0ea', { rough: 0.3 })); }
  // 하리(상부 보)
  if (V.arch) archHari(0, 2900, 9255, 9330, T.wall); else B(0, 9255, 2900, 9330, 1980, CEIL, wallM);
  B(3264, 9317, 5672, 9540, 1980, CEIL, wallM);
  B(932, 1417, 2117, 1500, 1980, CEIL, wallM); B(5022, 1150, 6622, 1348, 1980, CEIL, wallM);
  // 거실/안방 확장부 새 벽 + 세탁 부스
  wall(3066, 9540, 3176, 10500);
  wall(5572, 9317, 5672, 9620); wall(5572, 10420, 5672, 10500); wall(5572, 9620, 5672, 10420, 2100, CEIL);
  B(4790, 9550, 5572, 9590, 0, 2080, M(T.part, { rough: 0.45 }), 3); B(4850, 9590, 4870, 9610, 950, 1150, METAL(), 4); casing(5572, 9620, 5672, 10420, T.part);
  // 전실 벽 + 3연동 중문
  wall(1200, 4170, 1250, 4400, 0, CEIL, partMats); wall(1200, 5750, 1250, 6000, 0, CEIL, partMats); wall(0, 5950, 1250, 6000, 0, CEIL, partMats); wall(1200, 4400, 1250, 5750, 2100, CEIL, partMats);
  { const fr = M(T.dframe, { rough: 0.4, metal: 0.3 }); const gm = V.moru ? M('#eef2f2', { rough: 0.6, opacity: 0.55 }) : GLASS();
    [[4400, 4880], [4850, 5320], [5290, 5750]].forEach(([a, b], i) => { const x = 1196 + i * 16; B(x, a, x + 14, b, 0, 25, fr); B(x, a, x + 14, b, 2075, 2100, fr); B(x, a, x + 14, a + 25, 0, 2100, fr); B(x, b - 25, x + 14, b, 0, 2100, fr); if (V.muntin) B(x, a, x + 14, b, 1000, 1020, fr); const g = B(x + 5, a + 25, x + 9, b - 25, 25, 2075, gm); g.castShadow = false; });
    B(1190, 4400, 1250, 5750, 2085, 2100, fr); }
  // 문짝 + 문틀
  const doorCol = T.door === T.part ? '#f3f1ec' : T.door;
  doorLeaf(2077, 3290, 2117, 3965, doorCol); doorLeaf(4704, 3840, 5380, 3880, doorCol); doorLeaf(4474, 5640, 5100, 5680, doorCol); doorLeaf(3264, 5951, 3304, 6750, doorCol);
  casing(1250, 3965, 2040, 4170, doorCol); casing(4455, 3030, 4704, 3880, doorCol); casing(4250, 4975, 4474, 5650, doorCol); casing(3264, 5724, 4211, 5951, doorCol);
  // 걸레받이
  const base = M(darker(T.wall, 0.9), { rough: 0.5 });
  for (const [x1, y1, x2, y2] of [[0, 6000, 12, 9255], [3054, 5951, 3066, 9200], [3264, 5951, 3276, 9317], [6610, 5951, 6622, 9317], [12, 10488, 2900, 10500]]) B(x1, y1, x2, y2, 0, 70, base);

  // 천장 (아래에서만 보임)
  const ceil = addMesh(new THREE.PlaneGeometry(6.622, 10.5), M('#fbfaf7', { rough: 1 }), null, false); ceil.rotation.x = Math.PI / 2; ceil.position.set(3.311, CEIL * S - 0.001, 5.25);
  for (const [x, y] of [[700, 9800], [1700, 9800], [2600, 9800], [2600, 6800], [2600, 8000], [3300, 1200], [3300, 2600], [3600, 3700], [620, 4600], [620, 5500], [3600, 4700], [3800, 9900], [4900, 9900]]) downlight(x, y);
  for (const [x, y, i] of [[1500, 9600, 1.6], [3300, 2200, 1.6], [4800, 7300, 1.4], [1100, 2600, 1.2], [5700, 2000, 1.2], [600, 5000, 0.9], [3300, 4800, 0.9], [5300, 5000, 0.8]]) { const L = new THREE.PointLight('#fff1dc', i, 5, 2); L.position.set(x * S, 2.1, y * S); root.add(L); }

  // ---------- 주방 ----------
  const K = T.klow;
  { const g = grp((2340 + 3855) / 2, (263 + 863) / 2, 'S'); cabinet(g, 3855 - 2340, 600, 0, 870, { color: K, drawers: [290, 290, 190], drawerCols: 3, handle: T.khandle || 'groove' }); }
  { const g = grp((3855 + 4455) / 2, (263 + 3010) / 2, 'W'); cabinet(g, 3010 - 263, 600, 0, 870, { color: K, doors: 5, handle: T.khandle || 'groove' }); }
  countertop(2330, 253, 4465, 885, 870, T.ctop); countertop(3835, 885, 4465, 3025, 870, T.ctop);
  // 상판 위 벽 타일
  B(2340, 263, 4455, 275, 900, 1450, M(T.splash || '#f1efea', { rough: 0.2 }));
  B(4443, 263, 4455, 3010, 900, 1450, M(T.splash || '#f1efea', { rough: 0.2 }));
  // 싱크 960
  B(2600, 330, 3560, 794, 885, 902, M('#a9b0b6', { rough: 0.35, metal: 0.8 }), 6);
  B(2620, 350, 3540, 774, 880, 903, M('#8e969d', { rough: 0.4, metal: 0.7 }), 10);
  { const fx = 3080, fy = 320; cyl(fx, fy, 900, 960, 28, 28, METAL()); cyl(fx, fy, 960, 1280, 13, 13, METAL()); const t = addMesh(new THREE.TorusGeometry(0.11, 0.013, 10, 24, Math.PI), METAL()); t.position.set(fx * S, 1.28, (fy + 110) * S); t.rotation.y = Math.PI / 2; cyl(fx, fy + 220, 1180, 1280, 13, 11, METAL()); B(fx + 40, fy - 20, fx + 50, fy + 20, 1080, 1200, METAL(), 3); }
  // 인덕션 + 후드
  B(3940, 1380, 4400, 1960, 900, 907, M('#111111', { rough: 0.1 }), 4);
  for (const [x, y, r] of [[4060, 1520, 95], [4260, 1520, 80], [4160, 1800, 110]]) { const t = addMesh(new THREE.TorusGeometry(r * S, 0.0015, 4, 40), M('#555')); t.rotation.x = Math.PI / 2; t.position.set(x * S, 0.909, y * S); }
  if (!V.upper) { B(3960, 1360, 4455, 1980, 1600, 1680, M('#d9dcdf', { rough: 0.3, metal: 0.7 }), 6); B(4255, 1400, 4455, 1940, 1680, CEIL, M('#d9dcdf', { rough: 0.3, metal: 0.7 })); }
  if (V.upper) { const g = grp(4280, (863 + 3010) / 2, 'W'); cabinet(g, 3010 - 863, 350, 1450, CEIL - 1450, { color: T.kup, doors: 5, handle: 'none', toe: 0 }); B(4105, 1360, 4440, 1980, 1430, 1450, M('#cfd2d5', { metal: .6, rough: .3 })); B(4100, 870, 4120, 3000, 1440, 1446, M('#fff8e8', { emissive: '#fff1d0', ei: 1.5 })); }
  // 키큰장(가전) + 냉장고장
  if (V.cafe) {
    { const g = grp(2590, 1602, 'E'); cabinet(g, 1478, 500, 0, 860, { color: T.tall, drawers: [380, 380], drawerCols: 2, handle: 'groove' }); }
    { const g = grp(2590, 1602, 'E', 0); cabinet(g, 1478, 500, 1520, CEIL - 1520, { color: T.tall, doors: 2, handle: 'groove', toe: 0 }); }
    B(2340, 863, 2840, 2341, 860, 890, M(T.ctop, { rough: 0.3 }), 2);
    B(2340, 863, 2360, 2341, 890, 1520, M(T.splash || '#f1efea', { rough: 0.25 }));
    B(2340, 863, 2840, 2341, 1500, 1520, M(darker(T.tall, .9)));
    B(2600, 870, 2840, 2335, 1494, 1500, M('#fff7e0', { emissive: '#ffefc8', ei: 1.8 }));
    appliances(2340, 863, 890);
  } else {
    const g = grp(2590, 1602, 'E'); cabinet(g, 1478, 500, 0, CEIL, { color: T.tall, doors: 3, handle: 'groove' });
  }
  { const g = grp(2690, 3255, 'E'); cabinet(g, 1829, 700, 0, 1880, { color: T.fridge, doors: 3, handle: 'none', toe: 0, gloss: true });
    for (const y of [2341 + 600, 2341 + 1210, 2341 + 1820]) B(3040, y - 30, 3062, y - 15, 700, 1500, METAL(), 4);
    cabinet(grp(2690, 3255, 'E'), 1829, 700, 1880, CEIL - 1880, { color: T.tall, doors: 3, handle: 'none', toe: 0 }); }
  B(2340, 3600, 2345, 3610, 0, 1, wallM);
  // 주방 창 블라인드
  for (let i = 0; i < 20; i++) B(2470, 190, 4330, 205, 1700 + i * 20, 1705 + i * 20, M('#f6f4ef', { rough: 0.8 }));
  plant(2500, 450, 0.35, 900, '#ffffff');

  // ---------- 전실 ----------
  { const g = grp(625, 4355, 'S'); const tc = T.tall2 || T.tall;
    cabinet(g, 1250, 370, 250, 650, { color: tc, doors: 3, handle: 'none', toe: 0 });
    cabinet(g, 1250, 370, 1250, CEIL - 1250, { color: tc, doors: 3, handle: 'none', toe: 0 });
    B(0, 4170, 1250, 4540, 1235, 1250, M(darker(tc, .9))); B(0, 4170, 1250, 4540, 890, 900, M(darker(tc, .9)));
    B(10, 4500, 1240, 4520, 1225, 1230, M('#fff4dc', { emissive: '#ffe9c0', ei: 2 })); B(10, 4490, 1240, 4520, 240, 245, M('#fff4dc', { emissive: '#ffe9c0', ei: 2 }));
    cyl(300, 4380, 900, 1080, 50, 60, M('#cdbfa8', { rough: .4 })); B(700, 4300, 900, 4420, 900, 920, M('#2b2b2b', { rough: .3 }), 4);
    for (let i = 0; i < 3; i++) B(150 + i * 300, 4400, 400 + i * 300, 4520, 0, 90, M(['#5a5a5a', '#e8e1d6', '#9a7b62'][i]), 30); }
  // 분리수거 적층 수납(40x40)
  { const bc = ['#e9eef0', '#e9eef0', '#e9eef0'], lid = ['#7ea6c9', '#9fbf8f', '#e2b86b'];
    for (let i = 0; i < 3; i++) { const z = 30 + i * 380; B(30, 5490, 450, 5910, z, z + 360, M(bc[i], { rough: 0.4 }), 18); B(60, 5895, 420, 5915, z + 200, z + 330, M(lid[i], { rough: 0.4 }), 10); }
    B(20, 5480, 460, 5920, 1180, 1200, M(darker(T.tall, .9))); }
  // 현관 매트, 거울
  rug(150, 4650, 1050, 5350, '#cfc6b8');
  B(600, 5925, 1150, 5950, 300, 2000, M('#d5dee2', { rough: 0.06, metal: 0.15 }), 3); B(590, 5940, 1160, 5950, 290, 2010, M(T.dframe, { rough: .4 }), 2);

  // ---------- 거실·식탁 ----------
  sofaBanquette(T);
  table(650, 6700, 1450, 8300, T);
  chair(1830, 7120, 'W', T, T.chairStyle); chair(1830, 7880, 'W', T, T.chairStyle); chair(1050, 8680, 'N', T, T.chairStyle);
  pendant(1050, 7500, 1500, T.pendant || '#e9e2d5', T.pendantStyle || 'dome');
  // 식탁 위 소품
  cyl(1000, 7350, 750, 950, 45, 55, M('#e8e1d4', { rough: .3 })); for (let i = 0; i < 5; i++) { const m = addMesh(new THREE.SphereGeometry(0.05, 10, 6), M('#7f9a6b', { side: true })); m.scale.set(1, .25, .6); m.position.set((1000 + (i - 2) * 40) * S, 1.0 + (i % 2) * 0.05, (7350 + (i % 3 - 1) * 30) * S); m.rotation.z = (i - 2) * .4; }
  cyl(1100, 7800, 750, 790, 140, 110, M('#f2efe8', { rough: .3 }), 32); for (let i = 0; i < 4; i++) { const f = addMesh(new THREE.SphereGeometry(0.04, 12, 8), M(['#e8a34a', '#d6553a', '#e8c64a', '#e8a34a'][i], { rough: .5 })); f.position.set((1080 + (i % 2) * 50) * S, 0.81, (7780 + (i > 1 ? 50 : 0)) * S); }
  // TV (벽걸이) + 얇은 선반
  if (!V.notv) { B(3020, 6850, 3062, 8050, 950, 1630, M('#111', { rough: 0.15 }), 6); B(2870, 6950, 3066, 7950, 420, 470, M(T.desk, { tex: 'grain' }), 4); }
  else { B(2950, 6700, 3066, 8200, 0, 1700, M(T.tall, { rough: .6 })); for (let j = 1; j < 5; j++) B(2950, 6700, 3066, 8200, j * 340, j * 340 + 18, M(darker(T.tall, .92))); books(2970, 6800, 360, 10, 'y'); books(2970, 7500, 1040, 8, 'y'); plant(3000, 8000, 0.3, 700); }
  // 거실 확장부
  if (V.bench) windowBench(T);
  else if (V.daybed) daybed(T);
  else {
    playMat(500, 8950, 2850, 10300, T.mat);
    toyShelf(150, 10080, 1350, 10450, 'N', T, 3, 2, 600);
    toys(1700, 9500);
  }
  if (V.playhouse) teepee(900, 9500, 0.85, '#f3ebe0');
  plant(2720, 10250, 1.0);
  curtain(0, 420, 10420, 30, 2140, T.curtain); curtain(2480, 2900, 10420, 30, 2140, T.curtain);
  if (V.daybed || V.bench) floorLamp(2700, 9550, T.lampc || '#efe7d8');

  // ---------- 안방 ----------
  if (V.dress) {
    rug(3950, 7300, 6450, 9100, T.rug || '#ece6dc');
    bed(4350, 6150, 6150, 8150, T, { channel: T.channel, frame: T.head });
    nightstand(6390, 6250, T);
    wardrobe(3264, 6800, 3864, 9300, 'E', T, { doors: 4, color: T.tall, handle: 'groove' });
    B(3264, 6790, 3864, 6800, 0, CEIL, M(darker(T.tall, .9)));
    wardrobe(6022, 8350, 6622, 9300, 'W', T, { color: T.desk, drawers: [260, 260, 260], drawerCols: 2, handle: 'bar', H: 850, toe: 60, wood: true });
    lamp(6350, 9000, 850);
    // 확장부 창가: 화장대 + 전신거울 + 스툴
    B(3700, 10050, 4900, 10450, 720, 750, M(T.desk, { tex: 'grain' }), 5); for (const x of [3720, 4860]) B(x, 10070, x + 20, 10430, 0, 720, M('#3b3b3b', { metal: .5 }));
    B(4100, 10380, 4500, 10420, 750, 1350, M('#d5dee2', { rough: 0.06, metal: 0.15 }), 30);
    cyl(4300, 9850, 0, 450, 180, 180, M(T.acc, { tex: 'fabric' }), 32);
    B(3200, 9600, 3240, 10400, 100, 1900, M('#d5dee2', { rough: 0.06, metal: 0.15 }), 10);
    plant(5300, 10200, 0.55);
    curtain(3176, 3600, 10420, 30, 2140, T.curtain); curtain(5150, 5572, 10420, 30, 2140, T.curtain);
  } else {
    rug(3700, 7300, 6300, 9100, T.rug || '#ece6dc');
    bed(4100, 6150, 5900, 8150, T, { channel: T.channel, frame: T.head });
    nightstand(3800, 6250, T); nightstand(6200, 6250, T);
    wardrobe(6022, 8250, 6622, 9317, 'W', T, { doors: 2, color: T.tall });
    desk(3700, 9850, 4900, 10400, T); officeChair(4300, 9600, 'S', T.chair); lamp(4700, 10200, 740); books(3800, 10250, 740, 6);
    curtain(3176, 3600, 10420, 30, 2140, T.curtain); curtain(5150, 5572, 10420, 30, 2140, T.curtain);
  }
  // 세탁 부스: 워시타워
  washTower(5710, 9640, 6582, 10326);

  // ---------- 아이방 ----------
  if (V.loft) {
    loftBed(100, 1600, 1100, 3600, T, 'E'); loftBed(5600, 1450, 6560, 3450, T, 'W');
    rug(1100, 600, 2000, 1300, '#cfe4d9', true); teepee(1500, 900, 0.6, '#f6e7dc');
    rug(5150, 500, 6400, 1250, '#f2dcd0', true); toyShelf(5150, 300, 6400, 600, 'S', T, 3, 2, 600);
  } else {
    bed(150, 1650, 1150, 3700, T, { pillows: 1, frame: T.desk, woodFrame: true, headH: 800 });
    bed(5550, 1500, 6550, 3550, T, { pillows: 1, frame: T.desk, woodFrame: true, headH: 800 });
    desk(1050, 380, 2050, 950, T); officeChair(1550, 1150, 'N', T.acc); lamp(1900, 600, 740);
    desk(5150, 380, 6450, 950, T); officeChair(5800, 1150, 'N', T.acc); lamp(6300, 600, 740); books(5250, 800, 740, 7);
    rug(1250, 2200, 2050, 3300, '#efe6d8'); toyShelf(4760, 3300, 5560, 3600, 'E', T, 2, 2, 600);
  }

  // ---------- 욕실 ----------
  bathroom(T);
  return root;
}

function appliances(x0, y0, z) { // 키큰장 홈카페 칸 (앞면 +x)
  // 커피머신
  B(x0 + 40, y0 + 120, x0 + 380, y0 + 360, z, z + 430, M('#2b2b2b', { rough: 0.35, metal: 0.3 }), 20);
  B(x0 + 360, y0 + 150, x0 + 400, y0 + 330, z + 260, z + 330, M('#b9bec3', { metal: .8, rough: .3 }), 8);
  cyl(x0 + 380, y0 + 240, z + 20, z + 120, 35, 30, M('#ffffff', { rough: .2 }));
  // 토스터
  B(x0 + 60, y0 + 480, x0 + 380, y0 + 840, z, z + 210, M('#f2f0eb', { rough: 0.35 }), 25);
  B(x0 + 378, y0 + 520, x0 + 382, y0 + 760, z + 50, z + 170, M('#222', { rough: .1 }), 5);
  // 전자레인지
  B(x0 + 40, y0 + 960, x0 + 420, y0 + 1440, z, z + 290, M('#dcdfe2', { rough: 0.35, metal: .4 }), 10);
  B(x0 + 418, y0 + 990, x0 + 422, y0 + 1320, z + 30, z + 260, M('#1d1d1d', { rough: .1 }), 3);
  // 컵·병
  for (let i = 0; i < 3; i++) cyl(x0 + 120 + i * 70, y0 + 1440 - 60, z + 330, z + 420, 32, 28, M(['#f4f1ea', '#d8cdbd', '#8e9c90'][i], { rough: .3 }));
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
  B(x1 + 40, y2 + 15, x2 - 40, y2 + 160, 0, 700, M('#ffffff', { rough: .5 }), 20); // 세제 수납
}
function loftBed(x1, y1, x2, y2, T, ladderSide) {
  const w = M(T.desk, { tex: 'grain', rough: 0.55 }); const z = 1250;
  for (const [x, y] of [[x1, y1], [x2 - 60, y1], [x1, y2 - 60], [x2 - 60, y2 - 60]]) B(x, y, x + 60, y + 60, 0, 1750, w, 6);
  B(x1, y1, x2, y2, z, z + 120, w, 6);
  B(x1 + 30, y1 + 30, x2 - 30, y2 - 30, z + 120, z + 300, M('#fbfaf6', { tex: 'fabric' }), 50);
  B(x1 + 20, y1 + 600, x2 - 20, y2 - 20, z + 140, z + 340, M(T.duvet, { tex: 'fabric' }), 60);
  B(x1 + 120, y1 + 60, x2 - 120, y1 + 420, z + 280, z + 400, M('#ffffff', { tex: 'fabric' }), 60);
  // 안전 난간
  const rx = ladderSide === 'E' ? x2 - 40 : x1;
  for (const y of [y1, y2 - 40]) B(x1, y, x2, y + 40, z + 300, z + 500, w, 8);
  B(rx, y1, rx + 40, y1 + (y2 - y1) * 0.55, z + 420, z + 500, w, 8);
  // 사다리
  const ly = y2 - 600; const lx = ladderSide === 'E' ? x2 : x1 - 60;
  for (const yy of [ly, ly + 400]) B(lx, yy, lx + 60, yy + 40, 0, z + 400, w, 6);
  for (let i = 1; i <= 5; i++) B(lx, ly, lx + 60, ly + 440, i * 240 - 15, i * 240 + 15, w, 6);
  // 아래 책상 + 의자 + 조명
  const dx1 = x1 + 80, dx2 = x2 - 80, dy = y1 + 200;
  B(dx1, dy, dx2, dy + 550, 700, 730, w, 5);
  for (const yy of [dy, dy + 510]) B(dx1, yy, dx1 + 40, yy + 40, 0, 700, w); 
  officeChair((x1 + x2) / 2, dy + 750, 'N', T.acc); lamp(dx2 - 120, dy + 120, 730); books(dx1 + 30, dy + 30, 730, 6);
  B(x1 + 70, y1 + 70, x2 - 70, y1 + 200, 1000, 1020, w);
  B(x1 + 70, y1 + 1300, x2 - 70, y1 + 1320, z - 30, z, M('#fff4dc', { emissive: '#ffe9c0', ei: 1.5 }));
}
function windowBench(T) {
  const g = grp(1425, 10275, 'N'); cabinet(g, 2850, 450, 0, 380, { color: T.tall, doors: 5, handle: 'groove', toe: 40, wood: !!T.benchWood });
  B(0, 10050, 2850, 10500, 380, 450, M(T.seat, { tex: 'fabric', rough: 1 }), 30);
  const cols = [T.acc, mixc(T.acc, '#ffffff', 0.5), T.back, mixc(T.seat, '#ffffff', .3)];
  for (let i = 0; i < 4; i++) { const p = B(200 + i * 640, 10300, 650 + i * 640, 10460, 450, 850, M(cols[i], { tex: 'fabric' }), 80); p.rotation.x = 0.2; }
  books(2300, 10120, 450, 5); plant(400, 10250, 0.3, 450, '#ffffff');
  playMat(500, 8950, 2600, 9900, T.mat);
  rug(900, 8900, 2500, 9850, T.rug || '#efe2d0');
  toys(1400, 9400);
}
function daybed(T) {
  const x1 = 0, x2 = 2900, y1 = 9330, y2 = 10500, h = 350;
  const g = grp((x1 + x2) / 2, (y1 + y2) / 2, 'N');
  cabinet(g, x2 - x1, y2 - y1, 0, h, { color: T.tall, drawers: [h - 40], drawerCols: 4, handle: 'groove', toe: 40, wood: true });
  // 매트 2장(리넨) + 등쿠션 + 볼스터
  const mat = M(T.seat, { tex: 'fabric', rough: 1 });
  B(20, 9350, 1440, 10480, h, h + 90, mat, 35); B(1460, 9350, 2880, 10480, h, h + 90, mat, 35);
  const cols = [T.back, mixc(T.back, '#ffffff', 0.35), T.acc];
  for (let i = 0; i < 4; i++) { const p = B(80 + i * 700, 10260, 680 + i * 700, 10460, h + 90, h + 560, M(cols[i % 3], { tex: 'fabric' }), 90); p.rotation.x = 0.22; }
  for (const x of [60, 2840]) { const b = addMesh(new THREE.CylinderGeometry(0.11, 0.11, 0.8, 24), M(T.acc, { tex: 'fabric' })); b.rotation.x = Math.PI / 2; b.position.set(x * S, (h + 200) * S, 9900 * S); }
  // 좌식 원형 테이블
  const tz = h + 90; const tx = 1450, ty = 9800;
  cyl(tx, ty, tz + 280, tz + 310, 330, 330, M(T.table, { tex: 'grain', rough: .45 }), 48);
  for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; cyl(tx + Math.cos(a) * 220, ty + Math.sin(a) * 220, tz, tz + 280, 16, 20, M(T.leg, { tex: 'grain' }), 12); }
  cyl(tx - 80, ty - 60, tz + 310, tz + 400, 40, 36, M('#efe9de', { rough: .3 })); cyl(tx + 100, ty + 40, tz + 310, tz + 330, 120, 120, M('#d9c3a5', { tex: 'rattan' }), 24);
  // 방석 + 접은 담요
  B(500, 9450, 950, 9900, tz, tz + 70, M(T.acc, { tex: 'fabric' }), 30); B(1950, 9450, 2400, 9900, tz, tz + 70, M(T.back, { tex: 'fabric' }), 30);
  B(2300, 10050, 2750, 10250, tz, tz + 90, M(mixc(T.seat, '#ffffff', .4), { tex: 'fabric' }), 25);
  // 라탄 바구니, 매트 앞 바닥
  cyl(2600, 9050, 0, 380, 200, 170, M('#c9a77c', { tex: 'rattan' }), 24);
  rug(600, 7900, 2600, 9150, T.rug || '#e2d6c2');
  books(300, 9050, 0, 1);
}
function archHari(x1, x2, y1, y2, col) {
  const sh = new THREE.Shape(); const W = (x2 - x1) * S, top = CEIL * S, low = 1.62, apex = 2.08;
  sh.moveTo(0, top); sh.lineTo(W, top); sh.lineTo(W, low); sh.quadraticCurveTo(W / 2, apex + (apex - low), 0, low); sh.lineTo(0, top);
  const geo = new THREE.ExtrudeGeometry(sh, { depth: (y2 - y1) * S, bevelEnabled: false, curveSegments: 40 });
  const m = addMesh(geo, M(col, { rough: 0.9 })); m.position.set(x1 * S, 0, y1 * S);
  // 양쪽 날개벽
  B(x1, y1, x1 + 120, y2, 0, 1700, M(col, { rough: 0.9 }), 0); B(x2 - 120, y1, x2, y2, 0, 1700, M(col, { rough: 0.9 }), 0);
}
function bathroom(T) {
  const tub = WHITEPORC();
  B(5450, 4180, 6220, 5680, 0, 560, tub, 30);
  B(5520, 4250, 6150, 5610, 420, 562, M('#dfe9ee', { rough: 0.1 }), 60);
  cyl(6150, 4500, 1700, 1800, 90, 90, METAL(), 24); cyl(6200, 4500, 1800, 2000, 10, 10, METAL());
  // 세면대
  const g = grp(4780, 4365, 'S'); cabinet(g, 440, 390, 350, 500, { color: T.vanity, doors: 1, handle: 'groove', toe: 0 });
  B(4570, 4175, 4990, 4560, 850, 870, WHITEPORC(), 10);
  B(4630, 4230, 4930, 4500, 870, 990, WHITEPORC(), 60);
  cyl(4780, 4200, 990, 1150, 12, 12, METAL());
  B(4560, 4125, 5000, 4170, 1050, 1800, M('#d5dee2', { rough: 0.06, metal: 0.15 }), 6);
  B(4560, 4124, 5000, 4135, 1810, 1820, M('#fff2d8', { emissive: '#ffeccc', ei: 1.5 }));
  // 변기
  B(5090, 4170, 5330, 4360, 380, 780, WHITEPORC(), 30);
  const bowl = addMesh(new THREE.CylinderGeometry(0.19, 0.15, 0.4, 32), WHITEPORC()); bowl.scale.z = 1.3; bowl.position.set(5210 * S, 0.2, 4560 * S);
  const seat = addMesh(new THREE.CylinderGeometry(0.19, 0.19, 0.03, 32), WHITEPORC()); seat.scale.z = 1.3; seat.position.set(5210 * S, 0.415, 4560 * S);
  // 수건
  B(4500, 5200, 4520, 5600, 1300, 1320, METAL()); B(4505, 5250, 4545, 5550, 900, 1310, M('#e8dccb', { tex: 'fabric' }), 10);
}
