// 공통(모든 컨셉, 11/2 아내 레퍼런스): 무몰딩·마이너스 걸레받이, 거실·주방 마그네틱 레일 + 커튼박스 간접등, 방 2인치 매입등, 세탁부스 무광 화이트 폴딩도어 + 배관 점검구, 신발장 니치 왼쪽 아이 가방 칸
// 공통(모든 컨셉): 싱크 왼쪽 2단 건조대 + 위 상부장, 오른쪽 전부 상부장(주방 창은 싱크 위로 축소),
// 거실 오른쪽 벽 끝에서 끝까지 아기 책장·장난감장(높이 1.5m), 거실 창 양쪽 키큰장, 전실 분리수거장(세로 통 3개+키 칸+상부장), 세탁부스 돌출 + 세제장,
// 안방 침대 머리 서쪽 벽 + 동쪽 벽 붙박이장(가운데 화장대), 아이방 2곳 붙박이장(책상 없음)
export const CONCEPTS = [
  {
    id: '01', name: '화이트 오크 미니멀', tag: '밝은 오크 + 무광 화이트. 같은 평면 사례와 가장 가까운 기본안. 식탁은 창가 ㄱ자 소파, 가운데는 비워 둠.',
    T: { upper: '#f5f3ef', niche: '#d2b48c', blackout: '#b9b4ad', wall: '#efede8', part: '#ece9e3', dframe: '#2f2f2f', klow: '#d2b48c', kWood: true, ctop: '#ebe6de', kup: '#f5f3ef', tall: '#d2b48c', fridge: '#eceeef', base: '#f1eee8', seat: '#e3d8c8', back: '#d8cab6', table: '#c9a272', leg: '#a07a52', chair: '#c9a272', mat: '#f4ead6', acc: '#cfe0d4', duvet: '#efe8dc', head: '#d9ccb8', desk: '#d2b892', vanity: '#ffffff', curtain: '#f3efe8', floor: 'wood', floorc: [214, 188, 152], entry: [214, 208, 198], rug: '#ece4d6', khandle: 'groove', shelf: '#f6f5f2', kidFrame: '#d2b892', mCab: '#f4f3f0', panel: '#d2b892' },
    V: { living: 'corner', tall: 'cafe', kids: 'single', sep: 'glass', cove: true, dresser: true, wd: [['van', 6551, 7551], ['wd', 7551, 9317, []]] },
    pal: [['#efede8', '벽 · 웜화이트'], ['#d6bc98', '바닥 · 라이트 오크 마루'], ['#f7f6f3', '주방·붙박이장 · 무광 화이트'], ['#e3d8c8', '창가 소파 · 오트밀 패브릭'], ['#c9a272', '식탁·의자 · 오크 원목'], ['#2f2f2f', '중문 · 블랙 간살 양개']],
    inter: ['상부장·키큰장 윗부분은 화이트로 가볍게, 하부장·서랍은 라이트 오크로 무게감(투톤)', '손잡이 없는 홈(그루브) 도어, 밝은 스톤 상판', '거실·주방은 마그네틱 레일 조명 + 커튼박스 간접등, 방은 작은 2인치 매입등, 식탁 위만 펜던트 1개'],
    eff: ['거실 창가: 기성품 ㄱ자 다이닝 소파(창 쪽 약 2.15m + 왼쪽 벽 약 1.16m) + 식탁 1,600×800 + 맞은편 의자 2, 가운데는 비워 둔 거실', '창 오른쪽 벽 키큰장(가운데 니치 없이 전부 수납, 위 화이트 장·가운데 간접등 니치+콘센트·아래 우드 서랍)', '키큰장 가운데 허리 높이 열린 홈카페 칸(커피머신·토스터·전자레인지) + 위 간접등', '아이방: 비비엔다 범퍼침대 120×170, 기성 서랍장(100×50×110)은 아이방2 창가·아이방1 붙박이장 앞쪽에'],
    sep: '안방↔서재: 문 없이 트임(11/3) · 붙박이장: 전부 미닫이, 방문 옆 북쪽 벽부터 ㄴ자 붙박이장(코너 옆 문 1짝은 전신 거울 문), 동쪽 벽 화장대 폭 100cm·서서 쓰는 높이(상판 90cm)·아래 서랍, 옆 문 1짝 전신거울',
    ref: 'ECI·디자인다룸 씨티극동 24평(화이트·3연동 중문)', views: ['living', 'livingCab']
  },
  {
    id: '02', name: '웜 오크 호텔 스위트', tag: '미디엄 오크 무늬목 + 크림·그레이지 + 브라스. 천장 간접등과 우드 헤드월로 호텔 객실 느낌.',
    T: { upper: '#f3f0ea', niche: '#b98d62', blackout: '#b9b4ad', wall: '#ebe4d9', part: '#e2d8c9', dframe: '#b8955a', moru: true, klow: '#b98d62', kWood: true, ctop: '#efe9df', kup: '#f3f0ea', tall: '#b98d62', fridge: '#ece5da', base: '#d9cbb7', seat: '#ece4d6', back: '#e2d6c3', table: '#a9805a', leg: '#7d5a3c', chair: '#d8c6ae', chairStyle: 'fabric', mat: '#efe2cc', acc: '#b9a17f', duvet: '#f3eee6', head: '#cbb79c', desk: '#a9805a', vanity: '#b98d62', curtain: '#efe8dd', floor: 'wood', floorc: [196, 160, 120], plank: 220, entry: [200, 190, 176], rug: '#e6dccd', pendant: '#b8955a', pendantStyle: 'dome', khandle: 'brass', faucet: 'brass', shelf: '#d8c3a5', shelfWood: true, kidCab: '#e9e1d4', kidFrame: '#c9a77c', mCab: '#b98d62', mWood: true, mHandle: 'brass', panel: '#a9805a', vanityTop: '#e9e3d8', entryCab: '#b98d62', entryWood: true, entryDoor: '#5a4636', lampc: '#efe2c8', doorCol: '#efe8dd' },
    V: { living: 'corner', tall: 'cafeGlass', kids: 'floor', headPanel: true, cove: true, jungmun: 'one', sep: 'gansal', wd: [['pow', 6551, 7551], ['wd', 7551, 9317, []]] },
    pal: [['#ebe4d9', '벽 · 그레이지'], ['#c4a078', '바닥 · 미디엄 오크(220폭)'], ['#b98d62', '주방 하부장·키큰장·붙박이장 · 오크 무늬목'], ['#ece4d6', '소파·의자 · 크림 부클레'], ['#b8955a', '손잡이·수전·조명 · 브라스'], ['#efe9df', '상판 · 웜화이트 스톤']],
    inter: ['주방 하부장·키큰장·신발장·안방 붙박이장을 같은 오크 무늬목으로 이어서 고급스럽게', '천장 가장자리 간접등 + 안방 침대 뒤 오크 헤드월(위 간접등, 양쪽 브라스 벽등)', '브라스 손잡이·수전·펜던트, 중문은 오크 간살 양개(유리 없음)'],
    eff: ['키큰장 가운데: 플루티드 유리 포켓도어 홈카페(쓸 땐 문을 옆으로 밀어 넣음) + 머그 선반', '거실 창가: 기성품 ㄱ자 다이닝 소파(창 쪽 약 2.15m + 왼쪽 벽 약 1.16m) + 식탁 1,600×800 + 맞은편 의자 2, 가운데는 비워 둔 거실', '현관은 간살 양개 중문(유리 없음, 살 뒤 반투명 폴리카보네이트)', '아이방: 비비엔다 범퍼침대 120×170(바닥형) + 붙박이장'],
    sep: '안방↔서재: 문 없이 트임(11/3) · 파우더룸: ㄴ자 붙박이장 + 화장대(폭 100cm)를 포켓도어로 숨김 → 닫으면 붙박이장처럼 보임, 옆 문 1짝 전신거울',
    ref: '국보 씨티극동 43평(통창·간접등), 디자인다룸(중문)', views: ['cafe', 'vanityN']
  },
  {
    id: '03', name: '월넛 호텔 라운지', tag: '짙은 월넛 무늬목 + 헤링본 마루 + 트래버틴. 호텔 라운지 같은 묵직한 분위기.',
    T: { upper: '#efebe5', niche: '#6b4a34', blackout: '#b9b4ad', wall: '#e6dfd6', part: '#ddd3c6', dframe: '#3a2e26', klow: '#6b4a34', kWood: true, ctop: '#e4dbcf', kup: '#efebe5', tall: '#6b4a34', fridge: '#e6dfd6', base: '#cdbfae', seat: '#d9cfc2', back: '#c8b9a6', table: '#d8c8b2', stone: true, leg: '#3a2e26', metalLeg: true, chair: '#6b4a34', chairStyle: 'wood', mat: '#e2d8cb', acc: '#8a6a52', duvet: '#efebe5', head: '#7a5a44', channel: true, desk: '#6b4a34', vanity: '#6b4a34', curtain: '#e7e0d6', floor: 'herring', floorc: [170, 128, 90], entry: [186, 176, 162], rug: '#d9cfc2', pendant: '#3a2e26', pendantStyle: 'cone', khandle: 'brass', faucet: 'brass', shelf: '#e9e3da', kidCab: '#efe9e0', kidFrame: '#b08a68', mCab: '#6b4a34', mWood: true, mHandle: 'brass', panel: '#6b4a34', vanityTop: '#e4dbcf', splash: '#e4dbcf', entryCab: '#6b4a34', entryWood: true, entryDoor: '#3a2e26', lampc: '#efe2c8', doorCol: '#e9e2d8' },
    V: { living: 'corner', tall: 'bar', kids: 'nook', headPanel: true, cove: true, sep: 'fluted', wd: [['van', 6551, 7551], ['wd', 7551, 9317, []]] },
    pal: [['#e6dfd6', '벽 · 웜 그레이지'], ['#aa805a', '바닥 · 오크 헤링본'], ['#6b4a34', '주방·붙박이장·헤드월 · 월넛 무늬목'], ['#d8c8b2', '식탁 · 트래버틴'], ['#d9cfc2', '창가 소파 · 스톤 부클레'], ['#b8955a', '손잡이·수전 · 브라스']],
    inter: ['거실·주방 바닥을 헤링본 마루로 깔아 호텔 라운지 느낌', '주방 하부장·키큰장·신발장·안방 붙박이장·헤드월을 월넛 무늬목으로', '트래버틴 식탁·상판, 브라스 손잡이, 천장 간접등'],
    eff: ['거실 창가: 기성품 ㄱ자 다이닝 소파(창 쪽 약 2.15m + 왼쪽 벽 약 1.16m) + 식탁 1,600×800 + 맞은편 의자 2, 가운데는 비워 둔 거실', '바닥은 헤링본', '키큰장 가운데: 거울 뒷벽 + 유리 선반 바(커피머신·잔·병)', '아이방: 비비엔다 범퍼침대 + 창가 쿠션 벤치(아래 수납) 책 읽는 자리'],
    sep: '안방↔서재: 문 없이 트임(11/3) · 붙박이장: ㄴ자 붙박이장 + 화장대(폭 100cm)',
    ref: '국보 한강극동·씨티극동 43평(간접등·마감), 벨류(라인조명)', views: ['living', 'cafe']
  },
  {
    id: '04', name: '재팬디 리넨', tag: '애쉬·리넨·라탄. 낮고 차분한 가구, 창가 하리는 아치로.',
    T: { upper: '#f2ede4', niche: '#cdb592', blackout: '#b9b4ad', wall: '#e9e1d3', part: '#ddd2c0', dframe: '#a88763', muntin: true, moru: true, klow: '#cdb592', kWood: true, ctop: '#efe9de', kup: '#f2ede4', tall: '#cdb592', fridge: '#e4dccd', base: '#d9cdb8', seat: '#d8ccb6', back: '#bfae95', table: '#a88763', leg: '#7d6448', chair: '#c2a072', chairStyle: 'rattan', mat: '#e2d6c2', acc: '#a3b18a', duvet: '#ede6d8', head: '#bfa98a', desk: '#b8976d', vanity: '#ddd2bf', curtain: '#efe8db', floor: 'wood', floorc: [222, 204, 174], plank: 220, entry: [208, 198, 182], rug: '#e2d6c2', pendant: '#d9c3a0', lampc: '#efe2c8', khandle: 'groove', shelf: '#e4dccd', kidFrame: '#c9a77c', mCab: '#e4dccd' },
    V: { living: 'daybed', tall: 'cafe', kids: 'floor', arch: true, cove: true, sep: 'shoji', wd: [['van', 6551, 7551], ['wd', 7551, 9317, []]] },
    pal: [['#e9e1d3', '벽 · 베이지 화이트'], ['#decbad', '바닥 · 애쉬 마루'], ['#d8ccb6', '창가 소파 · 리넨'], ['#c2a072', '의자 · 라탄'], ['#a88763', '목재 · 오크 브라운'], ['#a3b18a', '포인트 · 올리브']],
    inter: ['낮은 가구·라탄 의자·리넨으로 차분하게', '확장부 하리(상부 보)를 아치로 마감해 부드러운 선(벨류 사례)', '우드 간살 양개 중문(유리 없음)'],
    eff: ['거실 창가: 기성품 ㄱ자 다이닝 소파(창 쪽 약 2.15m + 왼쪽 벽 약 1.16m) + 식탁 1,600×800 + 맞은편 의자 2, 가운데는 비워 둔 거실', '키큰장 가운데 열린 홈카페 칸(원목 안쪽, 위 간접등)', '아이방: 비비엔다 범퍼침대 120×170'],
    sep: '안방↔서재: 문 없이 트임(11/3) · 붙박이장: ㄴ자 붙박이장 + 화장대(폭 100cm), 거울문 없이 단정하게',
    ref: '벨류인테리어(하리 아치), 원앙마을 사례(발코니 단높임)', views: ['living', 'kids1']
  },
  {
    id: '05', name: '티크·라탄 리조트', tag: '티크 무늬목 + 라탄 캐인 도어 + 초록 식물. 발리 리조트 같은 따뜻한 분위기.',
    T: { upper: '#f1ebe1', niche: '#9a6b44', blackout: '#b9b4ad', wall: '#ede6da', part: '#e2d8c8', dframe: '#7a5a3c', muntin: true, klow: '#9a6b44', kWood: true, ctop: '#ece6db', kup: '#f1ebe1', tall: '#9a6b44', fridge: '#ece6db', base: '#cdb89a', seat: '#e9dfcf', back: '#d6c6ae', table: '#8a5f3c', leg: '#6a4a30', chair: '#c9a77c', chairStyle: 'rattan', mat: '#e6dccb', acc: '#7f9a6b', duvet: '#f0ebe1', head: '#9a6b44', desk: '#9a6b44', vanity: '#9a6b44', curtain: '#efe7da', floor: 'wood', floorc: [176, 132, 92], plank: 200, entry: [196, 184, 166], rug: '#e6dccb', pendant: '#c9a77c', pendantStyle: 'dome', khandle: 'brass', shelf: '#d9c3a2', shelfWood: true, kidCab: '#efe7da', kidFrame: '#9a6b44', mCab: '#9a6b44', mWood: true, mHandle: 'brass', panel: '#8a5f3c', lampc: '#f0e2c6' },
    V: { living: 'floor', tall: 'cane', kids: 'single', headPanel: true, cove: true, dresser: true, sep: 'cane', wd: [['van', 6551, 7551], ['wd', 7551, 9317, []]] },
    pal: [['#ede6da', '벽 · 샌드 화이트'], ['#b0845c', '바닥 · 티크톤 마루'], ['#9a6b44', '주방·키큰장·붙박이장 · 티크 무늬목'], ['#c9a77c', '캐인 도어·의자 · 라탄'], ['#7f9a6b', '쿠션·식물 · 올리브 그린'], ['#e9dfcf', '패브릭 · 내추럴 리넨']],
    inter: ['키큰장 윗장 문을 라탄 캐인(그물)으로: 통풍 되고 가볍게', '티크 무늬목 + 라탄 의자 + 큰 화분', '안방은 티크 헤드월 + 브라스 벽등'],
    eff: ['거실 창가: 기성품 ㄱ자 다이닝 소파(창 쪽 약 2.15m + 왼쪽 벽 약 1.16m) + 식탁 1,600×800 + 맞은편 의자 2, 가운데는 비워 둔 거실', '키큰장 가운데 홈카페 + 라탄 바구니 칸', '아이방: 비비엔다 범퍼침대 120×170, 기성 서랍장은 아이방2 창가·아이방1 붙박이장 앞쪽에'],
    sep: '안방↔서재: 문 없이 트임(11/3) · 붙박이장: ㄴ자 붙박이장 + 화장대(폭 100cm)',
    ref: '원앙마을 사례(발코니), 오늘의집 리조트 스타일', views: ['living', 'vanityN']
  },
  {
    id: '06', name: '스모크 오크 + 트래버틴', tag: '짙은 스모크 오크 + 따뜻한 트래버틴 + 웜화이트. 차분하고 묵직한 고급감.',
    T: { upper: '#f1ede7', niche: '#5e5246', blackout: '#b9b4ad', wall: '#efebe5', part: '#e4ddd3', dframe: '#3b3631', klow: '#5e5246', kWood: true, ctop: '#e2d5c3', kup: '#f1ede7', tall: '#5e5246', fridge: '#efebe5', base: '#d8cdbf', seat: '#e3dbd0', back: '#d3c7b8', table: '#dccbb3', stone: true, leg: '#3b3631', metalLeg: true, chair: '#5e5246', chairStyle: 'wood', mat: '#e9e1d6', acc: '#a58e74', duvet: '#f1ede7', head: '#8c7a68', channel: true, desk: '#5e5246', vanity: '#5e5246', curtain: '#ece6dd', floor: 'wood', floorc: [206, 182, 150], plank: 240, entry: [190, 180, 168], rug: '#e3dbd0', pendant: '#e2d5c3', pendantStyle: 'dome', khandle: 'bar', splash: '#e2d5c3', shelf: '#efebe5', kidCab: '#f1ede7', kidFrame: '#b39b80', mCab: '#5e5246', mWood: true, mHandle: 'bar', panel: '#5e5246', vanityTop: '#e2d5c3', niche: '#e2d5c3', entryCab: '#5e5246', entryWood: true, entryDoor: '#3b3631', lampc: '#efe2c8' },
    V: { living: 'corner', tall: 'cafe', kids: 'nook', headPanel: true, cove: true, sep: 'gansal', wd: [['pow', 6551, 7551], ['wd', 7551, 9317, []]] },
    pal: [['#efebe5', '벽 · 웜화이트'], ['#ceb696', '바닥 · 내추럴 오크(240폭)'], ['#5e5246', '주방·키큰장·붙박이장 · 스모크 오크'], ['#e2d5c3', '상판·식탁·벽타일 · 트래버틴'], ['#e3dbd0', '창가 소파 · 스톤 패브릭'], ['#3b3631', '중문 간살·조명 · 다크 브론즈']],
    inter: ['짙은 스모크 오크 수납장 + 밝은 바닥·벽으로 대비', '주방 상판·벽타일·식탁을 트래버틴 톤으로 통일', '천장 간접등, 안방 스모크 오크 헤드월'],
    eff: ['키큰장 가운데 홈카페 칸: 트래버틴 안쪽 + 위 간접등', '거실 창가: 기성품 ㄱ자 다이닝 소파(창 쪽 약 2.15m + 왼쪽 벽 약 1.16m) + 식탁 1,600×800 + 맞은편 의자 2, 가운데는 비워 둔 거실', '아이방: 비비엔다 범퍼침대 + 창가 쿠션 벤치'],
    sep: '안방↔서재: 문 없이 트임(11/3) · 파우더룸: ㄴ자 붙박이장 + 화장대(폭 100cm)를 포켓도어로 숨김',
    ref: '국보 씨티극동 43평, 디자인다룸', views: ['kitchen', 'vanityN']
  },
  {
    id: '07', name: '세이지 오크 키즈', tag: '내추럴 오크 + 세이지 포인트. 거실을 가장 밝고 넓게.',
    T: { upper: '#f4f0e9', niche: '#c9a77c', blackout: '#b9b4ad', wall: '#eeeae3', part: '#e6dfd4', dframe: '#3b3631', klow: '#c9a77c', kWood: true, ctop: '#eee8de', kup: '#f4f0e9', tall: '#c9a77c', fridge: '#efebe5', base: '#e6dccd', seat: '#e9e1d4', back: '#ddd2c2', table: '#b48a60', leg: '#7d5a3c', chair: '#e6dccd', chairStyle: 'fabric', mat: '#e7efe6', acc: '#a9c2a6', duvet: '#f2eee8', head: '#d6c6ae', desk: '#c9a77c', vanity: '#c9a77c', curtain: '#f0ebe2', floor: 'wood', floorc: [208, 180, 142], plank: 220, entry: [204, 194, 180], rug: '#e6ddcf', pendant: '#e2d5c3', pendantStyle: 'dome', khandle: 'brass', faucet: 'brass', shelf: '#f3eee6', kidCab: '#f1ece4', kidFrame: '#c9a77c', mCab: '#c9a77c', mWood: true, panel: '#b48a60', entryCab: '#c9a77c', entryWood: true, lampc: '#efe2c8' },
    V: { living: 'diningWin', tall: 'cafe', kids: 'single', sep: 'glass', headPanel: true, cove: true, jungmun: 'one', dresser: true, wd: [['van', 6551, 7551], ['wd', 7551, 9317, []]] },
    pal: [['#eeeae3', '벽 · 웜 화이트'], ['#d0b48e', '바닥 · 내추럴 오크'], ['#c9a77c', '주방·붙박이장 · 라이트 오크 무늬목'], ['#b48a60', '식탁 · 오크'], ['#a9c2a6', '포인트 · 세이지'], ['#e7efe6', '포인트 · 민트 그레이']],
    inter: ['창가 ㄱ자 소파 식탁에서 바깥을 보며 식사', '책장은 오른쪽 벽 전체 그대로'],
    eff: ['거실 창가: 기성품 ㄱ자 다이닝 소파(창 쪽 약 2.15m + 왼쪽 벽 약 1.16m) + 식탁 1,600×800 + 맞은편 의자 2, 가운데는 비워 둔 거실', '소파가 없어 거실 가운데가 넓게 비어 있음', '아쉬운 점: 주방에서 식탁까지 약 6m로 멀어짐'],
    sep: '안방↔서재: 문 없이 트임(11/3) · 붙박이장: ㄴ자 붙박이장 + 화장대(폭 100cm)',
    ref: 'ECI·디자인다룸(일자 통창 → 창가 활용)', views: ['living', 'play']
  },
  {
    id: '08', name: '웜 월넛 브라스', tag: '웜 월넛 + 오크 헤링본 + 브라스 조명. 저녁에 따뜻한 분위기.',
    T: { upper: '#f2ede6', niche: '#8a6a52', blackout: '#b9b4ad', wall: '#ebe4d9', part: '#e2d8c9', dframe: '#b8955a', moru: true, klow: '#8a6a52', kWood: true, ctop: '#ece6dc', kup: '#f2ede6', tall: '#8a6a52', fridge: '#ebe4d9', base: '#d6c8b4', seat: '#e6dccc', back: '#d8cab4', table: '#a9805a', leg: '#5c4330', chair: '#8a6a52', chairStyle: 'wood', mat: '#efe4d2', acc: '#c49a6c', duvet: '#f2ede5', head: '#b9a387', channel: true, desk: '#8a6a52', vanity: '#8a6a52', curtain: '#efe8dd', floor: 'herring', floorc: [190, 150, 110], entry: [196, 184, 168], rug: '#e6dccc', pendant: '#b8955a', pendantStyle: 'cone', khandle: 'brass', faucet: 'brass', shelf: '#efe9df', kidCab: '#efe8de', kidFrame: '#b08a68', mCab: '#8a6a52', mWood: true, panel: '#8a6a52', entryCab: '#8a6a52', entryWood: true, lampc: '#efe2c8' },
    V: { living: 'diningWinSofa', tall: 'cafeGlass', kids: 'nook', sep: 'wood', headPanel: true, cove: true, jungmun: 'one', wd: [['pow', 6551, 7551], ['wd', 7551, 9317, []]] },
    pal: [['#ebe4d9', '벽 · 그레이지'], ['#be966e', '바닥 · 오크 헤링본'], ['#8a6a52', '주방·붙박이장 · 웜 월넛'], ['#e6dccc', '창가 소파 · 크림 부클레'], ['#a9805a', '식탁 · 오크'], ['#b8955a', '조명·손잡이 · 브라스']],
    inter: ['창가 기성품 ㄱ자 소파(좌판 아래 서랍) = 쉬는 자리 겸 식탁 의자', '식탁 위 브라스 펜던트, 로만쉐이드로 창가 분위기', '원래 식탁 자리는 비워 둔 거실'],
    eff: ['거실 창가: 기성품 ㄱ자 다이닝 소파(창 쪽 약 2.15m + 왼쪽 벽 약 1.16m) + 식탁 1,600×800 + 맞은편 의자 2, 가운데는 비워 둔 거실', '소파 4~5명 + 의자 2 → 6~7명', '아쉬운 점: 주방에서 식탁까지 약 6m, 소파 안쪽 자리는 드나들기 불편'],
    sep: '안방↔서재: 문 없이 트임(11/3) · 파우더룸: ㄴ자 붙박이장 + 화장대(폭 100cm)를 포켓도어로 숨김',
    ref: '같은 평면 일자 통창 사례(ECI·디자인다룸)', views: ['living', 'play']
  }
];

// 시점: [이름, 카메라(x,y높이,z), 바라보는 점] 단위 m
export const VIEWS = {
  overview: ['집 전체', [7.6, 13.5, 17.2], [3.3, 0, 5.4]],
  overview2: ['위에서', [3.31, 17.5, 6.2], [3.31, 0, 5.3]],
  living: ['창가 식탁(ㄱ자 소파)', [2.55, 1.55, 7.6], [0.9, 0.5, 10.4]],
  dining: ['식탁·책장', [0.9, 1.5, 9.6], [2.6, 0.9, 6.6]],
  entry: ['현관·전실', [2.4, 1.5, 7.4], [0.35, 0.95, 4.8]],
  kitchen: ['주방', [3.5, 1.55, 4.95], [3.0, 1.1, 0.6]],
  sink: ['싱크·건조대', [3.36, 1.6, 2.95], [3.36, 1.35, 0.3]],
  lightPlan: ['천장 조명 평면도', [3.31, 13.2, 5.36], [3.31, 0, 5.3]],
  entryBoth: ['신발장·분리수거장(양쪽)', [1.17, 1.75, 5.05], [-0.4, 0.55, 5.05]],
  recycle: ['분리수거장', [0.75, 1.45, 4.55], [0.55, 0.75, 5.9]],
  cafe: ['키큰장', [3.75, 1.45, 2.75], [2.45, 1.15, 1.5]],
  master: ['안방', [3.75, 1.6, 6.2], [6.0, 0.8, 8.3]],
  vanityN: ['화장대', [4.3, 1.6, 7.25], [6.6, 1.2, 7.05]],
  vanityS: ['화장대(오른쪽 끝)', [5.2, 1.6, 8.75], [6.6, 1.25, 9.05]],
  kids1: ['아이방 1', [1.75, 1.55, 4.55], [0.8, 0.9, 1.3]],
  kids2: ['아이방 2', [5.0, 1.55, 3.6], [6.0, 0.85, 1.0]],
  bath: ['욕실', [4.40, 1.65, 5.5], [5.9, 0.95, 4.45]],
  boiler: ['아이방1 보일러실 문', [1.95, 1.5, 2.75], [0.85, 1.0, 0.7]],
  ac: ['천장 에어컨·실링팬(거실)', [2.6, 1.2, 9.6], [1.3, 2.25, 7.6]],
  livingCab: ['거실 팬트리장', [1.5, 1.45, 8.7], [2.95, 1.2, 9.85]],
  play: ['거실 가운데', [2.55, 1.55, 8.6], [0.6, 0.6, 6.4]],
  study: ['서재(안방 확장)', [4.95, 1.55, 8.75], [3.9, 0.9, 10.2]],
  laundry: ['세탁 부스', [4.1, 1.75, 8.7], [5.9, 0.9, 10.05]],
  // 11/5 케이: 아이방 배치안 비교용 시점(문에서·위에서)
  kids1Door: ['아이방1 문에서', [1.95, 1.6, 3.85], [0.7, 0.75, 1.7]],
  kids1Top: ['아이방1 위에서', [1.06, 4.6, 2.72], [1.06, 0, 2.7]],
  kids2Door: ['아이방2 문에서', [4.85, 1.6, 3.8], [6.2, 0.6, 1.8]],
  kids2Top: ['아이방2 위에서', [5.66, 4.6, 2.66], [5.66, 0, 2.65]],
};
export const VIEW_ORDER = ['overview', 'overview2', 'living', 'livingCab', 'ac', 'dining', 'play', 'entry', 'entryBoth', 'recycle', 'kitchen', 'sink', 'cafe', 'master', 'vanityN', 'study', 'kids1', 'kids1Door', 'kids1Top', 'boiler', 'kids2', 'kids2Door', 'kids2Top', 'bath', 'laundry'];
