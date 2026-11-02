// 풍납동 24평 실시간 3D 모델 (단위: mm, 평면 x=왼→오, y=위(북,주방)→아래(남,거실 창), z=높이)
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const CEIL = 2300;
const S = 0.001;
let root;
export const CEIL_ONLY = [];
export const WALLS = [];
const CUR_SEGS = [];
const CUR_LAYOUT = { win: false, sofa: false, dresser: false };
let tagNext = null;
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
function casing(x1, y1, x2, y2, col) { // 개구부 주위 몰딩
  const m = M(col, { rough: 0.5 }); const t = 45;
  if ((x2 - x1) > (y2 - y1)) { // 벽이 x 방향(문은 y로 통과)
    for (const yy of [y1 - 12, y2]) { B(x1 - t, yy, x1, yy + 12, 0, 2100 + t, m); B(x2, yy, x2 + t, yy + 12, 0, 2100 + t, m); B(x1 - t, yy, x2 + t, yy + 12, 2100, 2100 + t, m); }
  } else {
    for (const xx of [x1 - 12, x2]) { B(xx, y1 - t, xx + 12, y1, 0, 2100 + t, m); B(xx, y2, xx + 12, y2 + t, 0, 2100 + t, m); B(xx, y1 - t, xx + 12, y2 + t, 2100, 2100 + t, m); }
  }
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
function floorZone(x1, y1, x2, y2, tex, rough = 0.6, rep = 2000) {
  const t = tex.clone(); t.needsUpdate = true; t.repeat.set((x2 - x1) / rep, (y2 - y1) / rep); t.offset.set(x1 / rep, y1 / rep);
  const m = new THREE.MeshStandardMaterial({ map: t, roughness: rough });
  const p = addMesh(new THREE.PlaneGeometry((x2 - x1) * S, (y2 - y1) * S), m, null, false);
  p.rotation.x = -Math.PI / 2; p.position.set((x1 + x2) / 2 * S, 0.001, (y1 + y2) / 2 * S);
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
function cove(x1, y1, x2, y2) { // 천장 간접조명 띠
  const m = M('#fff3dc', { emissive: '#ffe6bf', ei: 2.2 });
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
        if ((i + k + c) % 4 === 3) { // 장난감 그대로
          B(a + c * cw + 60, -D / 2 + 60, a + c * cw + 220, D / 2 - 60, zz, zz + 150, M(coverCols[(k + c) % 8], { rough: .5 }), 30, g);
          const s2 = addMesh(new THREE.SphereGeometry(0.06, 16, 12), M(coverCols[(k + c + 3) % 8], { rough: .4 }), g); s2.position.set((a + c * cw + 290) * S, (zz + 60) * S, 0);
        } else B(a + c * cw + 15, -D / 2 + 30, a + (c + 1) * cw - 15, D / 2 - 5, zz, zz + rh - 50, M(binCols[(i + k * 2 + c) % 5], { tex: 'fabric' }), 25, g);
      }
    }
  }
  // 위: 액자·화분·인형
  for (let i = 0; i < n; i += 2) { B(lx(i * mw + 100), -D / 2 + 30, lx(i * mw + 360), -D / 2 + 50, H, H + 300, M('#f4f1ea'), 4, g); B(lx(i * mw + 130), -D / 2 + 50, lx(i * mw + 330), -D / 2 + 53, H + 30, H + 270, M(['#c9d6c4', '#e8d3c0', '#cfd9e3'][i % 3])); }
  const bear = M('#c8a27c', { tex: 'fabric' });
  const s1 = addMesh(new THREE.SphereGeometry(0.11, 18, 14), bear, g); s1.position.set(lx(mw * 1.5) * S, (H + 110) * S, 0);
  const s2 = addMesh(new THREE.SphereGeometry(0.075, 18, 14), bear, g); s2.position.set(lx(mw * 1.5) * S, (H + 280) * S, 0);
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
  root = new THREE.Group(); scene.add(root); CEIL_ONLY.length = 0; WALLS.length = 0; SKY.length = 0;
  const wallM = M(T.wall, { rough: 0.92, tex: 'paint' }); const capM = M('#4d4b47', { rough: 0.9 });
  const wallMats = [wallM, wallM, capM, wallM, wallM, wallM];
  const partM = M(T.part, { rough: 0.9, tex: 'paint' }); const partMats = [partM, partM, capM, partM, partM, partM];
  const wall = (x1, y1, x2, y2, z0 = 0, z1 = CEIL, mats = wallMats) => { const m = addMesh(new THREE.BoxGeometry((x2 - x1) * S, (z1 - z0) * S, (y2 - y1) * S), z1 >= CEIL ? mats : mats[0]); m.position.set((x1 + x2) / 2 * S, (z0 + z1) / 2 * S, (y1 + y2) / 2 * S); m.userData.wall = true; WALLS.push([x1, y1, x2, y2, z0, z1]); return m; };
  skyline();

  // 바닥
  const fc = T.floorc;
  const floorTex = T.floor === 'tile' ? tileTex(fc, 600, 3) : T.floor === 'herring' ? herringboneTex(fc) : woodFloorTex(fc, T.plank || 190);
  const rep = T.floor === 'tile' ? 1200 : 2000;
  for (const z of [[0, 4170, 3066, 10500], [2340, 263, 4455, 4170], [2340, 3961, 4250, 5724], [3066, 5724, 6622, 10500], [0, 1417, 2117, 3965], [932, 263, 2117, 1417], [4704, 263, 6622, 3961]])
    floorZone(...z, floorTex, T.floor === 'tile' ? 0.35 : 0.5, rep);
  floorZone(4474, 4119, 6258, 5724, tileTex([228, 231, 232], 300, 3), 0.3, 1200);
  floorZone(0, 4170, 1250, 6000, T.entryTex === 'terrazzo' ? terrazzoTex(T.entry) : tileTex(T.entry, 600, 3), 0.35, 1200);
  floorZone(0, 263, 832, 1417, tileTex([214, 214, 212], 300, 3), 0.5, 1200);
  floorZone(5222, 9540, 6622, 10500, tileTex([226, 232, 234], 300, 3), 0.4, 1200); floorZone(5172, 9540, 5222, 10500, tileTex([226, 232, 234], 300, 3), 0.4, 1200);

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
  B(932, 1417, 2117, 1500, 1980, CEIL, wallM); B(5022, 1150, 6622, 1348, 1980, CEIL, wallM);
  for (const c of root.children) if (c.isMesh && c.position.y > 1.9) c.userData.wall = true;
  // 거실/안방 확장부 새 벽
  wall(3066, 9540, 3176, 10500);
  // 세탁 부스: 정면 전체 4짝 폴딩도어(흡음 패널) → 열면 앞이 다 트여 세탁기 문이 끝까지 열림
  wall(5172, 9480, 5672, 9540); B(5172, 9540, 5222, 10500, 2050, CEIL, wallM).userData.wall = true;
  { const pm = M(T.part, { rough: 0.5 }); const pan = (ax, ay, bx, by) => { const L = Math.hypot(bx - ax, by - ay); const m = addMesh(new THREE.BoxGeometry(22 * S, 2030 * S, L * S), pm); m.position.set((ax + bx) / 2 * S, 1.03, (ay + by) / 2 * S); m.rotation.y = Math.atan2(bx - ax, by - ay); m.userData.door = true; };
    pan(5197, 9545, 4972, 9627); pan(4972, 9627, 5197, 9709); pan(5197, 10495, 4972, 10413); pan(4972, 10413, 5197, 10331);
    B(5172, 9540, 5222, 10500, 2040, 2050, M('#b9b9b9', { metal: .6, rough: .3 })).userData.wall = true; }
  // 전실 벽 + 3연동 중문
  wall(1200, 4170, 1250, 4400, 0, CEIL, partMats); wall(1200, 5750, 1250, 6000, 0, CEIL, partMats); wall(0, 5950, 1250, 6000, 0, CEIL, partMats); wall(1200, 4400, 1250, 5750, 2100, CEIL, partMats);
  { const fr = M(T.dframe, { rough: 0.4, metal: 0.3 }); const gm = V.jungmun === 'one' ? M('#f4f2ec', { rough: 0.55, opacity: 0.72 }) : V.moru ? M('#eef2f2', { rough: 0.6, opacity: 0.55 }) : GLASS();
    (V.jungmun === 'one' ? [[4400, 5380], [5330, 5750]] : [[4400, 4880], [4850, 5320], [5290, 5750]]).forEach(([a, b], i) => { const x = 1196 + i * 16; B(x, a, x + 14, b, 0, 25, fr); B(x, a, x + 14, b, 2075, 2100, fr); B(x, a, x + 14, a + 25, 0, 2100, fr); B(x, b - 25, x + 14, b, 0, 2100, fr); if (V.muntin) B(x, a, x + 14, b, 1000, 1020, fr); const g = B(x + 5, a + 25, x + 9, b - 25, 25, 2075, gm); g.castShadow = false; });
    B(1190, 4400, 1250, 5750, 2085, 2100, fr); if (V.jungmun === 'one') B(1180, 5240, 1192, 5260, 700, 1400, METAL(), 5); }
  // 문짝 + 문틀
  const doorCol = T.doorCol || '#f3f1ec';
  // 보일러실 문(11/2 실장님: 발코니2 확장 후 아이방1에서 보일러실로 문 필요). 폭 약 580, 아이방 쪽으로 열림
  B(832, 420, 932, 1000, 2080, CEIL, wallM).userData.wall = true; casing(832, 420, 932, 1000, doorCol);
  doorLeaf(932, 420, 1512, 460, doorCol, 1);
  { const bm = M('#f2f2f0', { rough: .4 }); B(80, 330, 480, 630, 1150, 1850, bm, 8); cyl(280, 480, 1850, CEIL, 50, 50, M('#c9ced2', { metal: .6, rough: .3 })); B(120, 360, 440, 600, 1100, 1150, M('#9aa0a4', { metal: .5 })); }
  doorLeaf(2077, 3290, 2117, 3965, doorCol, -1); doorLeaf(4704, 3840, 5380, 3880, doorCol); doorLeaf(4474, 5640, 5100, 5680, doorCol); doorLeaf(3264, 5951, 3304, 6750, doorCol, 1);
  casing(1250, 3965, 2040, 4170, doorCol); casing(4455, 3030, 4704, 3880, doorCol); casing(4250, 4975, 4474, 5650, doorCol); casing(3264, 5724, 4211, 5951, doorCol);
  // 걸레받이
  const base = M(darker(T.wall, 0.9), { rough: 0.5 });
  const nb = root.children.length;
  for (const [x1, y1, x2, y2] of [[0, 6000, 12, 9255], [3054, 5951, 3066, 6000], [3264, 5951, 3276, 6800], [12, 10488, 2900, 10500]]) B(x1, y1, x2, y2, 0, 70, base);
  for (let i = nb; i < root.children.length; i++) root.children[i].userData.wall = true;

  // 천장 (아래에서만 보임) + 조명
  const ceil = addMesh(new THREE.PlaneGeometry(6.622, 10.5), M('#fbfaf7', { rough: 1 }), null, false); ceil.rotation.x = Math.PI / 2; ceil.position.set(3.311, CEIL * S - 0.001, 5.25);
  for (const [x, y] of [[700, 9800], [1700, 9800], [2400, 9800], [2400, 6800], [2400, 8000], [3300, 1200], [3300, 2600], [3600, 3700], [620, 4600], [620, 5500], [3600, 4700], [3800, 9900], [4700, 7000], [4700, 8600]]) downlight(x, y);
  for (const [x, y, i] of [[1500, 9600, 1.4], [3300, 2200, 1.4], [4700, 7700, 1.2], [1100, 2600, 1.1], [5700, 2200, 1.1], [600, 5000, 0.9], [3300, 4800, 0.9], [5300, 5000, 0.8], [5900, 10000, 0.6]]) { const L = new THREE.PointLight('#fff1dc', i, 5, 2); L.position.set(x * S, 2.1, y * S); root.add(L); }
  // 시스템 에어컨(11/2): 거실 4웨이 1대 + 안방·아이방1·아이방2 1웨이 각 1대, 주방 없음
  sysAC(1250, 7600, 650, 650, true); sysAC(5300, 7800, 400, 1000); sysAC(1350, 850, 1000, 400); sysAC(5750, 1550, 900, 380);
  if (V.cove) { cove(20, 6000, 60, 9250); cove(20, 9350, 2880, 9390); cove(3290, 6000, 3330, 9290); }

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
  B(4105, 1380, 4440, 1960, 1480, 1500, M('#cfd2d5', { metal: .6, rough: .3 })); // 슬라이드 후드
  for (const [x1, y1, x2, y2] of [[4110, 275, 4125, 3000]]) B(x1, y1, x2, y2, 1490, 1496, M('#fff8e8', { emissive: '#fff1d0', ei: 1.6 })).userData.wall = true;
  B(2830, 275, 2840, 850, 1640, 1646, M('#fff8e8', { emissive: '#fff1d0', ei: 1.6 })).userData.wall = true; // 건조대 위 조명
  // 인덕션
  B(3940, 1380, 4400, 1960, 900, 907, M('#111111', { rough: 0.1 }), 4);
  for (const [x, y, r] of [[4060, 1520, 95], [4260, 1520, 80], [4160, 1800, 110]]) { const t = addMesh(new THREE.TorusGeometry(r * S, 0.0015, 4, 40), M('#555')); t.rotation.x = Math.PI / 2; t.position.set(x * S, 0.909, y * S); }
  // 상판 소품
  B(3950, 2020, 4300, 2300, 900, 925, M(T.table, { tex: 'grain' }), 8); cyl(4370, 2080, 900, 1080, 45, 45, M('#e9e4da', { rough: .3 })); cyl(4370, 2200, 900, 1000, 35, 35, M('#c9b49a', { rough: .3 }));
  // 전자레인지: 싱크 기준 오른쪽(ㄱ자 오른쪽 끝 상판, 11/2) + 전용 콘센트
  B(4020, 2430, 4430, 2930, 900, 1190, M('#dcdfe2', { rough: 0.35, metal: .4 }), 10);
  B(4016, 2470, 4022, 2800, 930, 1160, M('#1d1d1d', { rough: .1 }), 3); B(4016, 2830, 4022, 2900, 950, 1150, M('#b9bec3', { metal: .6 }), 3);
  B(4440, 2600, 4443, 2680, 1250, 1320, M('#f4f4f2', { rough: .3 })).userData.skip = true;
  // 키큰장 변형
  tallUnit(T, V.tall || 'closed');
  // 냉장고장
  { const g = grp(2690, 3255, 'E'); cabinet(g, 1829, 700, 0, 1880, { color: T.fridge, doors: 3, handle: 'none', toe: 0, gloss: !T.fridgeWood, wood: !!T.fridgeWood });
    for (const y of [2341 + 600, 2341 + 1210, 2341 + 1820]) B(3040, y - 30, 3062, y - 15, 700, 1500, T.khandle === 'brass' ? M('#b8955a', { rough: .3, metal: .9 }) : METAL(), 4);
    cabinet(grp(2690, 3255, 'E'), 1829, 700, 1880, CEIL - 1880, { color: T.upper || T.kup, doors: 3, handle: 'none', toe: 0 }); }
  // 주방 창 블라인드
  for (let i = 0; i < 12; i++) B(2920, 190, 3800, 205, 1800 + i * 20, 1805 + i * 20, M('#f6f4ef', { rough: 0.8 }));

  // ---------- 전실 ----------
  { const g = grp(600, 4355, 'S'); const tc = T.entryCab || T.tall;
    cabinet(g, 1200, 370, 250, 650, { color: T.tall, doors: 3, handle: 'none', toe: 0, wood: true });
    cabinet(g, 1200, 370, 1250, CEIL - 1250, { color: T.upper || '#f3f1ec', doors: 3, handle: 'none', toe: 0 });
    B(0, 4170, 1200, 4540, 1235, 1250, M(darker(T.upper || '#f3f1ec', .95))); B(0, 4170, 1200, 4540, 890, 900, M(T.tall, { tex: 'grain' })); B(0, 4170, 18, 4540, 900, 1235, M(T.tall, { tex: 'grainV' })); B(0, 4170, 1200, 4190, 900, 1235, M(T.tall, { tex: 'grainV' }));
    B(10, 4500, 1190, 4520, 1225, 1230, M('#fff4dc', { emissive: '#ffe9c0', ei: 2 })); B(10, 4490, 1190, 4520, 240, 245, M('#fff4dc', { emissive: '#ffe9c0', ei: 2 }));
    cyl(300, 4380, 900, 1080, 50, 60, M('#cdbfa8', { rough: .4 })).userData.skip = true; B(700, 4300, 900, 4420, 900, 920, M('#2b2b2b', { rough: .3 }), 4);
    for (let i = 0; i < 3; i++) B(150 + i * 300, 4400, 400 + i * 300, 4520, 0, 90, M(['#5a5a5a', '#e8e1d6', '#9a7b62'][i]), 30); }
  // 분리수거장(5분류): 종량제·플라스틱·비닐/캔유리(2단)·종이 세움칸 인출장 + 가운데 30cm 열린 칸(간접등·키 트레이) + 위 상부장(봉투·장바구니)
  { const ec = T.entryCab || T.tall, ew = !!T.entryWood; const g = grp(575, 5740, 'N');
    // 아래: 5분류 인출장(문을 당기면 통이 같이 나옴, 투입구 없음). 종량제(뚜껑 통) 300 | 플라스틱 320 | 위 비닐·아래 캔/유리 280 | 종이 세움칸 160
    { const cw = M(T.tall, { tex: 'grainV', rough: .55 }), dk = M('#3a3530', { rough: .6 });
      B(0, 5545, 1150, 5950, 60, 1050, M(darker(T.tall, .92), { tex: 'grainV' })); B(20, 5560, 1130, 5950, 0, 60, M(darker(T.tall, .55)));
      const fr = [[18, 318, 60, 1050], [336, 656, 60, 1050], [674, 954, 520, 1050], [674, 954, 60, 502], [972, 1132, 60, 1050]];
      for (const [x1, x2, z0, z1] of fr) { B(x1 + 2, 5527, x2 - 2, 5545, z0 + 2, z1 - 2, cw); B(x1 + 2, 5524, x2 - 2, 5528, z1 - 34, z1 - 24, dk); }
      for (const x of [0, 318, 656, 954, 1132]) B(x, 5527, x + 18, 5545, 60, 1050, M(darker(T.tall, .85), { tex: 'grainV' }));
      const tags = [[168, 1000, '#6b6b6b'], [496, 1000, '#9fbf8f'], [814, 1000, '#c9c2e0'], [814, 452, '#7ea6c9'], [1052, 1000, '#e2c48b']];
      for (const [cx, z, c] of tags) B(cx - 40, 5521, cx + 40, 5525, z - 30, z, M(c, { rough: .4 }), 2).userData.skip = true; }
    cabinet(g, 1150, 420, 1350, CEIL - 1350, { color: T.upper || '#f3f1ec', doors: 3, handle: 'none', toe: 0 });
    const nm = M(T.niche || T.tall, { tex: 'grainV', rough: .5 });
    B(0, 5530, 1150, 5950, 1050, 1068, nm); B(0, 5930, 1150, 5950, 1050, 1350, nm); B(0, 5530, 18, 5950, 1050, 1350, nm); B(1132, 5530, 1150, 5950, 1050, 1350, nm); B(0, 5530, 1150, 5950, 1332, 1350, nm);
    B(30, 5540, 1120, 5560, 1322, 1328, M('#fff4dc', { emissive: '#ffe9c0', ei: 2.2 })).userData.wall = true;
    B(150, 5700, 450, 5880, 1068, 1085, M(T.table || '#c9a272', { tex: 'grain' }), 6).userData.skip = true; // 키 트레이
    B(250, 5760, 300, 5800, 1085, 1095, METAL(), 3).userData.skip = true;
    cyl(850, 5800, 1068, 1220, 45, 55, M('#d9cfc2', { rough: .4 })).userData.skip = true;
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
  kidsBookshelf(2766, 6020, 3066, 9180, 1500, T);
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
  nsBox(3310, 6880, 3710, 7300, T, !V.headPanel); nsBox(3310, 8960, 3710, 9300, T, !V.headPanel);
  // 동쪽 벽: 붙박이장 + 화장대 (구성은 컨셉별 V.wd), 일부 문은 전신 거울
  const mCab = T.mCab || T.tall, mWood = !!T.mWood, mH = T.mHandle || 'groove';
  const segs = V.wd || [['wd', 5951, 7300, []], ['van', 7300, 8400], ['wd', 8400, 9317, []]]; CUR_SEGS.length = 0; CUR_SEGS.push(...segs);
  for (const sg of segs) {
    if (sg[0] === 'wd') wardrobe(6022, sg[1], 6622, sg[2], 'W', T, { doors: Math.max(2, Math.round((sg[2] - sg[1]) / 600)), color: mCab, handle: 'none', wood: mWood, mirror: sg[3] || [], sliding: true });
    else vanityNook(sg[1], sg[2], T, mCab, mWood, sg[0] === 'pow');
  }
  // 안방 확장부 = 서재: 창가 긴 책상(1.5m) + 의자 + 벽 선반, 안방과는 3짝 슬라이딩 도어로 분리
  desk(3200, 9880, 4700, 10370, T); officeChair(3950, 9640, 'S', T.chair); lamp(4500, 10200, 740, T.lampc || '#efe7d8'); books(3260, 10250, 740, 6);
  B(3180, 9600, 3200, 9860, 1100, 1118, M(T.desk, { tex: 'grain' })).userData.wall = true;
  curtain(3176, 3480, 10420, 30, 2140, T.curtain); curtain(4620, 4950, 10420, 30, 2140, T.curtain);
  slidingPartition(V.sep || 'glass', T);
  // 세탁 부스 내부: 워시타워 + 세제장 + 벽 선반
  washTower(5740, 9575, 6612, 10261);
  { // 세탁기 옆 빼서 쓰는 세제 틈새장(폭 210, 깊이 600, 앞으로 당겨 둔 모습) + 위 선반
    const fm = M(T.part, { rough: .45 }); const x1 = 5780, x2 = 6380, y1 = 10275, y2 = 10490;
    B(x1, y1, x1 + 18, y2, 40, 1800, fm); B(x2 - 12, y1, x2, y2, 40, 1800, fm); B(x1, y1, x2, y2, 40, 60, fm); B(x1, y1, x2, y2, 1780, 1800, fm);
    const bc = ['#5d8fc9', '#f2f2f2', '#e8b04a', '#8ac0a8', '#d96a6a', '#ffffff', '#c9d6e3', '#f0d0a0'];
    for (let k = 0; k < 4; k++) { const z = 60 + k * 430; B(x1 + 18, y1, x2 - 12, y2, z, z + 14, fm).userData.skip = true; for (let j = 0; j < 3; j++) B(x1 + 50 + j * 170, y1 + 25, x1 + 160 + j * 170, y2 - 25, z + 14, z + 14 + 220 + (j % 2) * 60, M(bc[(k * 3 + j) % 8], { rough: .35 }), 18).userData.skip = true; }
    B(5740, 9560, 6612, 10490, 2140, 2160, M(darker(T.part, .9))).userData.wall = true;
    for (let j = 0; j < 3; j++) B(5800 + j * 270, 9620, 6040 + j * 270, 10440, 2160, 2280, M('#d9c9ae', { tex: 'rattan' }), 15).userData.wall = true;
  }

  // ---------- 아이방 (붙박이장, 책상 없음) ----------
  const KS = V.kids || 'single';
  if (V.dresser) { kidsWardrobe(0, 2520, 600, 3900, 'E', T); dresser(0, 1510, 500, 2510, 'E', T); B(0, 1520, 20, 2500, 1300, 1900, M('#d5dee2', { rough: .05, metal: .2 }), 4); }
  else kidsWardrobe(0, 1510, 600, 3900, 'E', T); // 아이방1: 붙박이장(깊이 600, 미닫이)을 서쪽 벽으로, 침대는 동쪽(창 안 가림)
  kidBed(KS === 'floor' ? 1570 : 1590, 2125, T, KS === 'floor' ? 'floor' : 'single');
  kidsWardrobe(4704, 1360, 5154, 3010, 'E', T);
  kidBed(KS === 'floor' ? 6060 : 6100, 2475, T, KS === 'floor' ? 'floor' : 'single');
  if (V.dresser) { // 기성 서랍장(1000x500x1100): 아이방2 창가, 아이방1은 붙박이장 앞쪽 1m 대신
    dresser(5300, 340, 6300, 840, 'S', T); plant(6420, 600, 0.35, 0);
    rug(1560, 380, 2080, 1000, T.kidRug || '#efe6d8', true);
  } else if (KS === 'nook') { readingNook(5100, 300, 6500, 700, T); }
  else { rug(1560, 380, 2080, 1000, T.kidRug || '#efe6d8', true); rug(5150, 450, 6450, 1250, T.kidRug || '#f2e6dc', true); teepee(5800, 820, 0.6, '#f6ece0'); }
  curtain(980, 1300, 330, 900, 2140, T.curtain); curtain(5100, 5420, 330, 900, 2140, T.curtain);

  // ---------- 욕실 ----------
  bathroom(T);
  return root;
}


function vanityNook(y1, y2, T, mCab, mWood, hidden = false) { // 서서 쓰는 좁은 화장대(폭 약 60cm, 상판 900) + 아래 서랍 + 거울·조명 + 위 장. hidden=파우더룸
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

function diningCorner(T) { // 창가 ㄱ자 붙박이 벤치(창 쪽 2.15m + 왼쪽 벽 1.2m, 좌판 아래 서랍) + 식탁 1,600×800 + 맞은편 의자 2
  const base = M(T.benchBase || T.tall || T.base, { tex: 'grain', rough: .6 }), seat = M(T.seat, { tex: 'fabric', rough: .95 }), back = M(T.back, { tex: 'fabric', rough: .95 });
  // 창 쪽 다리 x0~2150, y9950~10440 / 왼쪽 벽 다리 x0~490, y8750~9950
  B(20, 9980, 2130, 10430, 0, 80, M(darker(T.base, .6))); B(0, 9950, 2150, 10440, 80, 400, base, 6);
  B(20, 8770, 470, 9950, 0, 80, M(darker(T.base, .6))); B(0, 8750, 490, 9950, 80, 400, base, 6);
  for (let i = 0; i < 3; i++) B(10 + i * 712, 9955, 712 + i * 712, 10330, 400, 470, seat, 40);
  for (const [a, b] of [[8760, 9350], [9360, 9945]]) B(5, a, 380, b, 400, 470, seat, 40);
  for (let i = 0; i < 3; i++) { const m = B(150 + i * 665, 10300, 805 + i * 665, 10440, 470, 900, back, 60); m.rotation.x = 0.1; }
  for (const [a, b] of [[8760, 9350], [9360, 9940]]) { const m = B(30, a, 170, b, 470, 900, back, 60); m.rotation.z = -0.1; }
  for (let i = 0; i < 3; i++) B(80 + i * 700, 9948, 700 + i * 700, 9952, 230, 240, M('#555'));
  B(488, 8820, 492, 9880, 230, 240, M('#555'));
  for (const [x, y, w, d, ry, c] of [[200, 10170, 400, 130, 0.2, T.acc], [1500, 10170, 400, 130, -0.15, mixc(T.acc, '#ffffff', .4)], [140, 9000, 130, 400, 0.15, T.back]]) { const p = B(x, y, x + w, y + d, 470, 820, M(c, { tex: 'fabric' }), 70); p.rotation.y = ry; }
  table(520, 9120, 2120, 9920, T);
  for (const x of [920, 1720]) chair(x, 8890, 'S', T, T.chairStyle);
  pendant(1320, 9520, 1500, T.pendant || '#e9e2d5', T.pendantStyle || 'dome');
  cyl(1170, 9520, 750, 950, 45, 55, M('#e8e1d4', { rough: .3 })); cyl(1470, 9520, 750, 790, 140, 110, M('#f2efe8', { rough: .3 }), 32);
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
function playroom(T, yMax) { // 옛 식탁 자리 = 아이 놀이방 (소파 없음)
  playMat(250, 6200, 2350, yMax - 150, T.mat);
  toyShelf(0, 6150, 330, 7950, 'E', T, 3, 2, 600);
  teepee(1450, 6720, 0.7, '#f3ebe0');
  toys(1600, yMax - 430);
  // 미끄럼틀 (북쪽 계단 → 남쪽으로 내려옴)
  const sm = M(T.acc, { rough: .45 }), sm2 = M(mixc(T.acc, '#ffffff', .4), { rough: .45 });
  B(2000, 6300, 2400, 6750, 0, 600, sm2, 20); B(2000, 6300, 2400, 6750, 600, 640, sm, 10);
  for (let i = 0; i < 3; i++) B(2020, 6200, 2380, 6300, 0, 150 + i * 150, sm, 6);
  const sl = B(2060, 7150 - 488, 2340, 7150 + 488, 300, 340, sm, 20); sl.rotation.x = 0.61; sl.position.y = 0.33;
  // 아이 테이블 + 작은 의자 2
  const ty = yMax - 620;
  cyl(850, ty, 0, 480, 260, 260, M(T.desk, { tex: 'grain' }), 40);
  for (const [x, c] of [[455, '#cfe4d9'], [1245, '#f2c9b3']]) cyl(x, ty, 0, 260, 120, 120, M(c, { rough: .45 }), 28);
}

function livingNicheCabinet(T) { // 창 오른쪽 벽(x3066) 키큰장 x2616~3066, y9560~10500, 앞면 서쪽
  const wood = T.tall, white = T.upper || '#f3f1ec';
  { const g = grp(2841, 9940, 'W'); cabinet(g, 760, 450, 0, 820, { color: wood, drawers: [360, 360], drawerCols: 2, handle: 'groove', toe: 100, wood: true });
    cabinet(g, 760, 450, 1350, CEIL - 1350, { color: white, doors: 2, handle: 'none', toe: 0 }); }
  const nm = M(T.niche || wood, { tex: 'grainV', rough: .5 });
  B(2616, 9560, 3066, 10320, 820, 850, nm, 2); B(3046, 9560, 3066, 10320, 850, 1350, nm); B(2616, 9560, 3066, 9580, 850, 1350, nm); B(2616, 10300, 3066, 10320, 850, 1350, nm); B(2616, 9560, 3066, 10320, 1332, 1350, M(darker(white, .96)));
  B(2630, 9580, 2650, 10300, 1322, 1328, M('#fff4dc', { emissive: '#ffe9c0', ei: 2.2 })).userData.wall = true;
  B(3040, 9900, 3046, 9980, 1000, 1080, M('#f4f4f2', { rough: .3 })).userData.skip = true; // 콘센트
  cyl(2850, 9750, 850, 1050, 45, 55, M('#d9cfc2', { rough: .4 })).userData.skip = true; B(2700, 10050, 2900, 10200, 850, 870, M(T.table || '#c9a272', { tex: 'grain' }), 5).userData.skip = true;
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
  box(0, 860, { drawers: [380, 380], drawerCols: 2, wood: true }); box(1650, CEIL, { doors: kind === 'cane' ? 3 : 2, cane: kind === 'cane', color: kind === 'cane' ? col : (T.upper || '#f3f1ec'), wood: kind === 'cane' });
  const inner = kind === 'bar' ? M('#2a2724', { rough: .5 }) : M(T.niche || darker(col, .95), { tex: T.nicheWood ? 'grainV' : undefined, rough: .5 });
  B(2340, 863, 2840, 2341, 860, 890, M(T.ctop, { rough: 0.3 }), 2);
  B(2340, 863, 2360, 2341, 890, 1650, inner); B(2340, 863, 2840, 883, 890, 1650, inner); B(2340, 2321, 2840, 2341, 890, 1650, inner);
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
  appliances(2340, 863, 890);
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
  B(x1 + 40, y2 + 15, x2 - 40, y2 + 160, 0, 700, M('#ffffff', { rough: .5 }), 20); // 세제 수납
}
function windowBench(T) {
  const g = grp(1525, 10275, 'N'); cabinet(g, 2150, 450, 0, 380, { color: T.tall, doors: 5, handle: 'groove', toe: 40, wood: !!T.benchWood });
  B(450, 10050, 2600, 10500, 380, 450, M(T.seat, { tex: 'fabric', rough: 1 }), 30);
  const cols = [T.acc, mixc(T.acc, '#ffffff', 0.5), T.back, mixc(T.seat, '#ffffff', .3)];
  for (let i = 0; i < 4; i++) { const p = B(560 + i * 500, 10300, 980 + i * 500, 10460, 450, 850, M(cols[i], { tex: 'fabric' }), 80); p.rotation.x = 0.2; }
  books(2150, 10120, 450, 5); plant(600, 10200, 0.3, 450, '#ffffff');
  playMat(600, 8950, 2300, 9900, T.mat);
  rug(700, 8900, 2300, 9850, T.rug || '#efe2d0');
  toys(1400, 9400);
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
  // 욕조 700 x 1500
  B(5450, 4180, 6150, 5680, 0, 560, tub, 30);
  B(5520, 4250, 6080, 5610, 420, 562, M('#dfe9ee', { rough: 0.1 }), 60);
  // 욕조 뒤 벽: 100mm 덧벽에 긴 수납 니치 2줄 (샴푸·바디용품)
  const st = M(T.bathStone || '#e3ded6', { rough: .3 });
  const fw = (y1, y2, z0, z1) => { B(6150, y1, 6250, y2, z0, z1, st).userData.wall = true; };
  fw(4127, 5716, 560, 1000); fw(4127, 4300, 1000, 1300); fw(5560, 5716, 1000, 1300); fw(4127, 5716, 1300, 1500); fw(4127, 4300, 1500, 1720); fw(5000, 5716, 1500, 1720); fw(4127, 5716, 1720, CEIL);
  B(6160, 4300, 6250, 5560, 1140, 1152, M('#e8f0f2', { rough: .05, opacity: .6 })).userData.skip = true; // 니치 중간 유리 선반
  B(6160, 4310, 6175, 5550, 1288, 1296, M('#fff3dc', { emissive: '#ffe6bf', ei: 2 })).userData.wall = true;
  const bc = ['#ffffff', '#c9b49a', '#9fb2bf', '#e8d3c0', '#5d6b74', '#f4f1ea'];
  for (let i = 0; i < 9; i++) { const y = 4350 + i * 135; cyl(6205, y, 1000, 1000 + 120 + (i % 3) * 15, 28, 28, M(bc[i % 6], { rough: .3 }), 16).userData.skip = true; }
  for (let i = 0; i < 7; i++) { const y = 4360 + i * 160; cyl(6205, y, 1152, 1152 + 100 + (i % 2) * 20, 25, 25, M(bc[(i + 2) % 6], { rough: .3 }), 16).userData.skip = true; }
  for (let i = 0; i < 4; i++) { const y = 4360 + i * 150; cyl(6205, y, 1500, 1500 + 150, 30, 30, M(bc[(i + 4) % 6], { rough: .3 }), 16).userData.skip = true; }
  // 욕조 반만 분리: 얇은 돌 벽 30mm (물때 적게), 길이 750, 높이 2.0m
  B(5420, 4127, 5450, 4930, 0, 2000, M(T.bathStone || '#e3ded6', { rough: .3 }), 4);
  // 수전·샤워 (북쪽 벽)
  B(5780, 4127, 5850, 4145, 950, 1050, METAL(), 6); cyl(5815, 4235, 1880, 1900, 90, 90, METAL(), 24); B(5810, 4127, 5820, 4160, 1050, 1990, METAL()); B(5810, 4127, 5820, 4240, 1980, 1990, METAL());
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
  for (const y of [4600, 5250]) { const d = addMesh(new THREE.CylinderGeometry(0.04, 0.04, 0.006, 20), M('#ffffff', { emissive: '#fff4dc', ei: 1.8 }), null, false); d.position.set(5.8, (CEIL - 4) * S, y * S); CEIL_ONLY.push(d); }
  { const L = new THREE.PointLight('#fff1dc', 0.8, 3, 2); L.position.set(5.8, 2.05, 4.95); root.add(L); }
  { const d = addMesh(new THREE.CylinderGeometry(0.05, 0.05, 0.006, 20), M('#ffffff', { emissive: '#fff4dc', ei: 1.6 }), null, false); d.position.set(4.95, (CEIL - 4) * S, 4.85); CEIL_ONLY.push(d); }
  rug(4520, 4980, 5100, 5420, '#e6e1d8');
}
// ---------- 간섭 점검 (개발용) ----------
export const DOOR_SWINGS = { '보일러실 문': [932, 420, 1512, 1000, 932, 420, 580], '아이방1 문': [1250, 3175, 2040, 3965, 2040, 3965, 790], '아이방2 문': [4704, 3030, 5554, 3880, 4704, 3880, 850], '욕실 문': [4474, 4975, 5149, 5650, 4474, 5650, 675], '안방 문': [3264, 5951, 4164, 6851, 3264, 5951, 900] };
export const USE_ZONES = {
  '싱크 앞 서는 자리(60cm)': [2880, 885, 3840, 1463], '건조대 앞(손 닿는 자리)': [2865, 885, 3300, 1300], '쿡탑 앞(60cm)': [3255, 1380, 3835, 1960], '냉장고 문 열림(60cm)': [3070, 2341, 3640, 4170], '키큰장 문 열림(50cm)': [2865, 890, 3340, 2341],
  '신발장 앞': [0, 4540, 1200, 4900], '현관→중문 동선': [0, 4560, 1190, 5120], '중문 앞 복도': [1250, 4400, 1800, 5750],
  '식탁 의자 빼는 자리(옆)': [2060, 6790, 2460, 8000], '식탁 끝 의자 빼는 자리': [820, 8830, 1280, 9150], '의자 뒤 거실 통로(책장 앞)': [2060, 6000, 2760, 9250],
  '안방 침대 북쪽 옆': [3720, 6900, 5450, 7300], '안방 침대 남쪽 옆': [3720, 8960, 5450, 9317],
  '세탁기 문 앞(부스 안)': [5232, 9640, 5700, 10250], '세탁부스 앞(폴딩도어 펼침)': [4960, 9545, 5170, 10495], '세제 틈새장 빼는 자리': [5232, 10275, 5770, 10490], '세면대 앞': [4995, 4525, 5395, 4920], '변기 앞': [4550, 4790, 4910, 5200], '안방→서재 통로': [4610, 9317, 5160, 9540], '거실 키큰장 서랍 빼는 자리': [2180, 9580, 2610, 10300], '분리수거 통 빼는 자리': [0, 5130, 1150, 5525],
  '아이방1 침대~붙박이장 통로': [610, 1600, 1020, 3150],  '아이방2 침대~붙박이장 통로': [5160, 1500, 5530, 3400]
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
  if (CUR_LAYOUT.dresser) ZONES['아이방2 서랍장 앞'] = [5300, 870, 6300, 1300];
  if (CUR_LAYOUT.win) { for (const k of ['식탁 의자 빼는 자리(옆)', '식탁 끝 의자 빼는 자리', '의자 뒤 거실 통로(책장 앞)']) delete ZONES[k]; ZONES['놀이방 앞 책장 통로'] = [2420, 6000, 2760, 8300]; ZONES['창가 식탁 의자 빼는 자리'] = [700, 8380, 2100, 8640]; ZONES['벤치 앞 식탁 아래 무릎 자리'] = [500, 9930, 2120, 9940]; } for (const sg of CUR_SEGS) if (sg[0] === 'wd') ZONES[`붙박이장 앞(${sg[1]}~${sg[2]})`] = [5470, sg[1], 5995, sg[2]];
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
