// 공통(모든 컨셉): 싱크 왼쪽 2단 건조대 + 위 상부장, 오른쪽 전부 상부장(주방 창은 싱크 위로 축소),
// 거실 오른쪽 벽 끝에서 끝까지 아기 책장·장난감장(높이 1.5m), 전실 분리수거함 5단, 세탁부스 돌출 + 세제장,
// 안방 침대 머리 서쪽 벽 + 동쪽 벽 붙박이장(가운데 화장대), 아이방 2곳 붙박이장(책상 없음)
export const CONCEPTS = [
  {
    id: '01', name: '화이트 오크 미니멀', tag: '밝은 오크 + 무광 화이트. 같은 평면 사례와 가장 가까운 기본안, 거실은 놀이 공간.',
    T: { wall: '#efede8', part: '#ece9e3', dframe: '#2f2f2f', klow: '#f7f6f3', ctop: '#ebe6de', kup: '#f7f6f3', tall: '#f6f5f2', fridge: '#eceeef', base: '#f1eee8', seat: '#e3d8c8', back: '#d8cab6', table: '#c9a272', leg: '#a07a52', chair: '#c9a272', mat: '#f4ead6', acc: '#cfe0d4', duvet: '#efe8dc', head: '#d9ccb8', desk: '#d2b892', vanity: '#ffffff', curtain: '#f3efe8', floor: 'wood', floorc: [214, 188, 152], entry: [214, 208, 198], rug: '#ece4d6', khandle: 'groove', shelf: '#f6f5f2', kidFrame: '#d2b892', mCab: '#f4f3f0', panel: '#d2b892' },
    V: { living: 'play', tall: 'closed', kids: 'single' },
    pal: [['#efede8', '벽 · 웜화이트'], ['#d6bc98', '바닥 · 라이트 오크 마루'], ['#f7f6f3', '주방·붙박이장 · 무광 화이트'], ['#e3d8c8', '붙박이 소파 · 오트밀 패브릭'], ['#c9a272', '식탁·의자 · 오크 원목'], ['#2f2f2f', '중문 · 블랙 슬림 프레임']],
    inter: ['벽·천장·문·붙박이장을 같은 웜화이트로 맞춰 24평이 한 공간처럼 넓어 보이게', '손잡이 없는 홈(그루브) 도어, 밝은 스톤 상판', '거실은 매입 다운라이트, 식탁 위만 펜던트 1개'],
    eff: ['거실 확장부: 놀이 매트 + 창가 낮은 바구니장 + 티피 텐트', '키큰장은 문을 모두 닫는 깔끔형(안쪽에 가전 칸·포켓도어)', '아이방: 싱글 침대 + 안전 가드, 창가 확장부는 놀이 러그'],
    ref: 'ECI·디자인다룸 씨티극동 24평(화이트·3연동 중문)', views: ['living', 'kitchen']
  },
  {
    id: '02', name: '웜 오크 호텔 스위트', tag: '미디엄 오크 무늬목 + 크림·그레이지 + 브라스. 천장 간접등과 우드 헤드월로 호텔 객실 느낌.',
    T: { wall: '#ebe4d9', part: '#e2d8c9', dframe: '#b8955a', moru: true, klow: '#b98d62', kWood: true, ctop: '#efe9df', kup: '#ece5da', tall: '#b98d62', fridge: '#ece5da', base: '#d9cbb7', seat: '#ece4d6', back: '#e2d6c3', table: '#a9805a', leg: '#7d5a3c', chair: '#d8c6ae', chairStyle: 'fabric', mat: '#efe2cc', acc: '#b9a17f', duvet: '#f3eee6', head: '#cbb79c', desk: '#a9805a', vanity: '#b98d62', curtain: '#efe8dd', floor: 'wood', floorc: [196, 160, 120], plank: 220, entry: [200, 190, 176], rug: '#e6dccd', pendant: '#b8955a', pendantStyle: 'dome', khandle: 'brass', faucet: 'brass', shelf: '#d8c3a5', shelfWood: true, kidCab: '#e9e1d4', kidFrame: '#c9a77c', mCab: '#b98d62', mWood: true, mHandle: 'brass', panel: '#a9805a', vanityTop: '#e9e3d8', niche: '#b98d62', nicheWood: true, entryCab: '#b98d62', entryWood: true, entryDoor: '#5a4636', lampc: '#efe2c8', doorCol: '#efe8dd' },
    V: { living: 'bench', tall: 'cafeGlass', kids: 'floor', headPanel: true, cove: true },
    pal: [['#ebe4d9', '벽 · 그레이지'], ['#c4a078', '바닥 · 미디엄 오크(220폭)'], ['#b98d62', '주방 하부장·키큰장·붙박이장 · 오크 무늬목'], ['#ece4d6', '소파·의자 · 크림 부클레'], ['#b8955a', '손잡이·수전·조명 · 브라스'], ['#efe9df', '상판 · 웜화이트 스톤']],
    inter: ['주방 하부장·키큰장·신발장·안방 붙박이장을 같은 오크 무늬목으로 이어서 고급스럽게', '천장 가장자리 간접등 + 안방 침대 뒤 오크 헤드월(위 간접등, 양쪽 브라스 벽등)', '브라스 손잡이·수전·펜던트, 중문은 브라스 프레임 + 모루유리'],
    eff: ['키큰장 가운데: 플루티드 유리 포켓도어 홈카페(쓸 땐 문을 옆으로 밀어 넣음) + 머그 선반', '거실 창 아래 길이 2.45m 수납 벤치 + 로만쉐이드', '아이방: 낮은 하우스 바닥침대(떨어져도 안전) + 붙박이장'],
    ref: '국보 씨티극동 43평(통창·간접등), 디자인다룸(중문)', views: ['cafe', 'master']
  },
  {
    id: '03', name: '월넛 호텔 라운지', tag: '짙은 월넛 무늬목 + 헤링본 마루 + 트래버틴. 거실은 낮은 라운지 소파로 좌식 생활.',
    T: { wall: '#e6dfd6', part: '#ddd3c6', dframe: '#3a2e26', klow: '#6b4a34', kWood: true, ctop: '#e4dbcf', kup: '#e6dfd6', tall: '#6b4a34', fridge: '#e6dfd6', base: '#cdbfae', seat: '#d9cfc2', back: '#c8b9a6', table: '#d8c8b2', stone: true, leg: '#3a2e26', metalLeg: true, chair: '#6b4a34', chairStyle: 'wood', mat: '#e2d8cb', acc: '#8a6a52', duvet: '#efebe5', head: '#7a5a44', channel: true, desk: '#6b4a34', vanity: '#6b4a34', curtain: '#e7e0d6', floor: 'herring', floorc: [170, 128, 90], entry: [186, 176, 162], rug: '#d9cfc2', pendant: '#3a2e26', pendantStyle: 'cone', khandle: 'brass', faucet: 'brass', shelf: '#e9e3da', kidCab: '#efe9e0', kidFrame: '#b08a68', mCab: '#6b4a34', mWood: true, mHandle: 'brass', panel: '#6b4a34', vanityTop: '#e4dbcf', splash: '#e4dbcf', entryCab: '#6b4a34', entryWood: true, entryDoor: '#3a2e26', lampc: '#efe2c8', doorCol: '#e9e2d8' },
    V: { living: 'lounge', tall: 'bar', kids: 'nook', headPanel: true, cove: true },
    pal: [['#e6dfd6', '벽 · 웜 그레이지'], ['#aa805a', '바닥 · 오크 헤링본'], ['#6b4a34', '주방·붙박이장·헤드월 · 월넛 무늬목'], ['#d8c8b2', '식탁 · 트래버틴'], ['#d9cfc2', '라운지 소파 · 스톤 부클레'], ['#b8955a', '손잡이·수전 · 브라스']],
    inter: ['거실·주방 바닥을 헤링본 마루로 깔아 호텔 라운지 느낌', '주방 하부장·키큰장·신발장·안방 붙박이장·헤드월을 월넛 무늬목으로', '트래버틴 식탁·상판, 브라스 손잡이, 천장 간접등'],
    eff: ['거실 확장부: 바닥에 가까운 라운지 소파(좌식, 아이가 올라가도 낮음) + 원형 낮은 테이블', '키큰장 가운데: 거울 뒷벽 + 유리 선반 바(커피머신·잔·병)', '아이방: 싱글 침대 + 창가 쿠션 벤치(아래 수납) 책 읽는 자리'],
    ref: '국보 한강극동·씨티극동 43평(간접등·마감), 벨류(라인조명)', views: ['living', 'cafe']
  },
  {
    id: '04', name: '재팬디 좌식 평상', tag: '애쉬·리넨·라탄. 거실 확장부 전체를 평상으로, 하리는 아치로.',
    T: { wall: '#e9e1d3', part: '#ddd2c0', dframe: '#a88763', muntin: true, moru: true, klow: '#ddd2bf', ctop: '#efe9de', kup: '#ece5d9', tall: '#e4dccd', fridge: '#e4dccd', base: '#d9cdb8', seat: '#d8ccb6', back: '#bfae95', table: '#a88763', leg: '#7d6448', chair: '#c2a072', chairStyle: 'rattan', mat: '#e2d6c2', acc: '#a3b18a', duvet: '#ede6d8', head: '#bfa98a', desk: '#b8976d', vanity: '#ddd2bf', curtain: '#efe8db', floor: 'wood', floorc: [222, 204, 174], plank: 220, entry: [208, 198, 182], rug: '#e2d6c2', pendant: '#d9c3a0', lampc: '#efe2c8', khandle: 'groove', shelf: '#e4dccd', kidFrame: '#c9a77c', mCab: '#e4dccd', niche: '#c9b08a', nicheWood: true },
    V: { living: 'daybed', tall: 'cafe', kids: 'floor', arch: true },
    pal: [['#e9e1d3', '벽 · 베이지 화이트'], ['#decbad', '바닥 · 애쉬 마루'], ['#d8ccb6', '평상 매트 · 리넨'], ['#c2a072', '의자 · 라탄'], ['#a88763', '목재 · 오크 브라운'], ['#a3b18a', '포인트 · 올리브']],
    inter: ['낮은 가구·라탄 의자·리넨으로 차분하게', '확장부 하리(상부 보)를 아치로 마감해 부드러운 선(벨류 사례)', '우드 프레임 + 모루유리 중문'],
    eff: ['거실 확장부 전체(약 2.9m × 1.17m)를 높이 35cm 평상으로: 아래 서랍 4개, 위는 낮잠·놀이·좌식 테이블', '키큰장 가운데 열린 홈카페 칸(원목 안쪽, 위 간접등)', '아이방: 하우스 바닥침대 + 놀이 러그'],
    ref: '벨류인테리어(하리 아치), 원앙마을 사례(발코니 단높임)', views: ['living', 'kids1']
  },
  {
    id: '05', name: '티크·라탄 리조트', tag: '티크 무늬목 + 라탄 캐인 도어 + 초록 식물. 발리 리조트 같은 따뜻한 좌식 거실.',
    T: { wall: '#ede6da', part: '#e2d8c8', dframe: '#7a5a3c', muntin: true, klow: '#9a6b44', kWood: true, ctop: '#ece6db', kup: '#ece6db', tall: '#9a6b44', fridge: '#ece6db', base: '#cdb89a', seat: '#e9dfcf', back: '#d6c6ae', table: '#8a5f3c', leg: '#6a4a30', chair: '#c9a77c', chairStyle: 'rattan', mat: '#e6dccb', acc: '#7f9a6b', duvet: '#f0ebe1', head: '#9a6b44', desk: '#9a6b44', vanity: '#9a6b44', curtain: '#efe7da', floor: 'wood', floorc: [176, 132, 92], plank: 200, entry: [196, 184, 166], rug: '#e6dccb', pendant: '#c9a77c', pendantStyle: 'dome', khandle: 'brass', shelf: '#d9c3a2', shelfWood: true, kidCab: '#efe7da', kidFrame: '#9a6b44', mCab: '#9a6b44', mWood: true, mHandle: 'brass', panel: '#8a5f3c', niche: '#9a6b44', nicheWood: true, lampc: '#f0e2c6' },
    V: { living: 'floor', tall: 'cane', kids: 'single', headPanel: true },
    pal: [['#ede6da', '벽 · 샌드 화이트'], ['#b0845c', '바닥 · 티크톤 마루'], ['#9a6b44', '주방·키큰장·붙박이장 · 티크 무늬목'], ['#c9a77c', '캐인 도어·의자 · 라탄'], ['#7f9a6b', '쿠션·식물 · 올리브 그린'], ['#e9dfcf', '패브릭 · 내추럴 리넨']],
    inter: ['키큰장 윗장 문을 라탄 캐인(그물)으로: 통풍 되고 가볍게', '티크 무늬목 + 라탄 의자·라운지체어 + 큰 화분', '안방은 티크 헤드월 + 브라스 벽등'],
    eff: ['거실 확장부: 좌식 방석(푸프) + 라탄 낮은 테이블 + 라탄 라운지체어', '키큰장 가운데 홈카페 + 라탄 바구니 칸', '아이방: 싱글 침대 + 가드, 창가 러그·티피'],
    ref: '원앙마을 사례(발코니), 오늘의집 리조트 스타일', views: ['living', 'cafe']
  },
  {
    id: '06', name: '스모크 오크 + 트래버틴', tag: '짙은 스모크 오크 + 따뜻한 트래버틴 + 웜화이트. 차분하고 묵직한 고급감.',
    T: { wall: '#efebe5', part: '#e4ddd3', dframe: '#3b3631', klow: '#5e5246', kWood: true, ctop: '#e2d5c3', kup: '#efebe5', tall: '#5e5246', fridge: '#efebe5', base: '#d8cdbf', seat: '#e3dbd0', back: '#d3c7b8', table: '#dccbb3', stone: true, leg: '#3b3631', metalLeg: true, chair: '#5e5246', chairStyle: 'wood', mat: '#e9e1d6', acc: '#a58e74', duvet: '#f1ede7', head: '#8c7a68', channel: true, desk: '#5e5246', vanity: '#5e5246', curtain: '#ece6dd', floor: 'wood', floorc: [206, 182, 150], plank: 240, entry: [190, 180, 168], rug: '#e3dbd0', pendant: '#e2d5c3', pendantStyle: 'dome', khandle: 'bar', splash: '#e2d5c3', shelf: '#efebe5', kidCab: '#f1ede7', kidFrame: '#b39b80', mCab: '#5e5246', mWood: true, mHandle: 'bar', panel: '#5e5246', vanityTop: '#e2d5c3', niche: '#e2d5c3', entryCab: '#5e5246', entryWood: true, entryDoor: '#3b3631', lampc: '#efe2c8' },
    V: { living: 'play', tall: 'cafe', kids: 'nook', headPanel: true, cove: true },
    pal: [['#efebe5', '벽 · 웜화이트'], ['#ceb696', '바닥 · 내추럴 오크(240폭)'], ['#5e5246', '주방·키큰장·붙박이장 · 스모크 오크'], ['#e2d5c3', '상판·식탁·벽타일 · 트래버틴'], ['#e3dbd0', '소파 · 스톤 패브릭'], ['#3b3631', '중문·조명 · 다크 브론즈']],
    inter: ['짙은 스모크 오크 수납장 + 밝은 바닥·벽으로 대비', '주방 상판·벽타일·식탁을 트래버틴 톤으로 통일', '천장 간접등, 안방 스모크 오크 헤드월'],
    eff: ['키큰장 가운데 홈카페 칸: 트래버틴 안쪽 + 위 간접등', '거실 확장부 놀이 매트 + 바구니장 (책장은 오른쪽 벽 전체)', '아이방: 싱글 침대 + 창가 쿠션 벤치'],
    ref: '국보 씨티극동 43평, 디자인다룸', views: ['kitchen', 'master']
  }
];

// 시점: [이름, 카메라(x,y높이,z), 바라보는 점] 단위 m
export const VIEWS = {
  overview: ['집 전체', [7.6, 13.5, 17.2], [3.3, 0, 5.4]],
  overview2: ['위에서', [3.31, 17.5, 6.2], [3.31, 0, 5.3]],
  living: ['거실 창가', [2.55, 1.55, 7.6], [0.9, 0.5, 10.4]],
  dining: ['식탁·책장', [0.9, 1.5, 9.6], [2.6, 0.9, 6.6]],
  entry: ['현관·전실', [2.4, 1.5, 7.4], [0.35, 0.95, 4.8]],
  kitchen: ['주방', [3.5, 1.55, 4.95], [3.0, 1.1, 0.6]],
  cafe: ['키큰장', [3.75, 1.45, 2.75], [2.45, 1.15, 1.5]],
  master: ['안방', [3.75, 1.6, 6.2], [6.0, 0.8, 8.3]],
  vanity: ['화장대', [4.7, 1.45, 7.85], [6.6, 1.2, 7.85]],
  kids1: ['아이방 1', [1.75, 1.55, 4.55], [0.8, 0.9, 1.3]],
  kids2: ['아이방 2', [5.0, 1.55, 3.6], [6.0, 0.85, 1.0]],
  bath: ['욕실', [4.45, 1.85, 5.55], [5.8, 0.5, 4.5]],
  laundry: ['세탁 부스', [4.2, 1.5, 9.95], [6.3, 1.0, 10.0]],
};
export const VIEW_ORDER = ['overview', 'overview2', 'living', 'dining', 'entry', 'kitchen', 'cafe', 'master', 'vanity', 'kids1', 'kids2', 'bath', 'laundry'];
