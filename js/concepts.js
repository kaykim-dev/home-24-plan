export const CONCEPTS = [
  {
    id: '01', name: '화이트 오크 미니멀', tag: '같은 평면 사례(ECI·디자인다룸)와 가장 가까운 기본안. 밝고 넓어 보이게.',
    T: { wall: '#efede8', part: '#ece9e3', door: '#ece9e3', dframe: '#2f2f2f', klow: '#f7f6f3', ctop: '#ebe6de', kup: '#f7f6f3', tall: '#f6f5f2', fridge: '#e3e6e8', base: '#f1eee8', seat: '#e3d8c8', back: '#d8cab6', table: '#c9a272', leg: '#a07a52', chair: '#c9a272', mat: '#f4ead6', acc: '#cfe0d4', duvet: '#efe8dc', head: '#d9ccb8', desk: '#d2b892', vanity: '#ffffff', curtain: '#f3efe8', floor: 'wood', floorc: [214, 188, 152], entry: [214, 208, 198], rug: '#ece4d6', khandle: 'groove' },
    V: { playhouse: true },
    pal: [['#efede8', '벽 · 웜화이트'], ['#d6bc98', '바닥 · 라이트 오크 마루'], ['#f7f6f3', '주방·수납장 · 무광 화이트'], ['#e3d8c8', '붙박이 소파 · 오트밀 패브릭'], ['#c9a272', '식탁·의자 · 오크 원목'], ['#2f2f2f', '중문 · 블랙 슬림 프레임 + 투명유리']],
    inter: ['벽·천장·문·몰딩을 같은 웜화이트로 맞춰 24평이 한 공간처럼 넓어 보이게', '3연동 초슬림 중문(블랙 프레임 + 투명유리)으로 현관 빛을 거실까지', '주방은 손잡이 없는 홈(그루브) 도어, 상판은 밝은 스톤', '거실은 매입 다운라이트, 식탁 위만 펜던트 1개로 포인트'],
    eff: ['전실 뒤 ㄱ자 붙박이 소파 = 소파 + 식탁 의자 겸용(좌판 아래 서랍 수납)', '거실은 비워서 놀이 매트, 장난감은 창가 낮은 수납장(바구니)에', '둥근 창을 일자 통창으로 바꿔 창가까지 다 씀'],
    ref: 'ECI 씨티극동 24평(일자 창·중문), 디자인다룸 씨티극동 24평(화이트·3연동 중문)', views: ['dining', 'living']
  },
  {
    id: '02', name: '웜 내추럴 우드', tag: '크림 벽 + 월넛 식탁 + 우드 간살 중문. 거실 창가에 길게 앉는 수납 벤치.',
    T: { wall: '#efe6d9', part: '#e7dccb', door: '#8a6446', dframe: '#7a5236', muntin: true, moru: true, klow: '#e6d9c4', ctop: '#f3ede3', kup: '#e6d9c4', tall: '#ece2d3', fridge: '#e0d6c6', base: '#e3d6c3', seat: '#c9ae8f', back: '#b8987a', table: '#7a5236', leg: '#5c3d27', chair: '#c48a6a', chairStyle: 'fabric', mat: '#efdcc0', acc: '#c8876a', duvet: '#efe3d2', head: '#9a7556', desk: '#8a6446', vanity: '#e6d9c4', curtain: '#efe6d9', floor: 'wood', floorc: [186, 145, 104], plank: 200, entry: [201, 186, 166], rug: '#e9dcc8', pendant: '#c9a37a', pendantStyle: 'cone', benchWood: true, khandle: 'bar' },
    V: { bench: true },
    pal: [['#efe6d9', '벽 · 크림'], ['#ba9168', '바닥 · 미디엄 오크'], ['#7a5236', '식탁 · 월넛'], ['#c9ae8f', '소파 · 카멜 패브릭'], ['#c48a6a', '의자 · 테라코타 패브릭'], ['#8a6446', '중문 · 우드 프레임 + 모루유리']],
    inter: ['우드 프레임 + 모루유리 중문으로 현관을 따뜻하게(빛은 통과, 시선은 흐리게)', '월넛 식탁·테라코타 패브릭 의자로 거실 중심을 잡고 큰 면은 크림', '커튼 박스 + 간접등, 창가 플로어 스탠드로 저녁 분위기'],
    eff: ['거실 창 아래 높이 45cm 수납 벤치(길이 약 2.45m, 깊이 45cm): 앉고, 눕고, 장난감 수납', '벤치 위 쿠션만 바꾸면 아이 낮잠·책 읽는 자리', '놀이 매트는 거실 가운데로'],
    ref: '원앙마을 성화인테리어(창고장), 국보 한강극동(우드 포인트)', views: ['living', 'dining']
  },
  {
    id: '03', name: '그레이 모던 + 안방 붙박이장', tag: '포그그레이 주방·600각 포세린 바닥. 안방 왼쪽 벽 붙박이장 + 창가 화장대.',
    T: { wall: '#ebebe9', part: '#dcdcda', door: '#4a4d50', dframe: '#3b3e41', klow: '#8f969a', ctop: '#e8e6e1', kup: '#8f969a', tall: '#d9dbdc', fridge: '#b9bec2', base: '#d9dbdc', seat: '#a9adb0', back: '#9a9fa3', table: '#e6e2da', stone: true, leg: '#2f3235', metalLeg: true, chair: '#3b3e41', chairStyle: 'fabric', mat: '#e4e2dc', acc: '#9fb3c0', duvet: '#e9eaeb', head: '#7d8387', channel: true, desk: '#bfc3c6', vanity: '#d9dbdc', curtain: '#d9dadb', floor: 'tile', floorc: [206, 204, 199], entry: [190, 188, 184], rug: '#cfd0d0', pendant: '#2f3235', pendantStyle: 'cone', khandle: 'bar', splash: '#e9e7e2' },
    V: { dress: true, upper: true },
    pal: [['#ebebe9', '벽 · 라이트 그레이'], ['#cecbc6', '바닥 · 600각 포세린'], ['#8f969a', '주방 · 포그그레이'], ['#e6e2da', '식탁 · 화이트 스톤'], ['#3b3e41', '의자·조명 · 차콜'], ['#9fb3c0', '포인트 · 블루그레이']],
    inter: ['거실·주방 바닥을 600각 포세린 타일로 통일(국보 한강극동·씨티극동 43평 방식)', '주방 하부장·상부장 포그그레이 + 밝은 상판, 상부장 아래 간접등', '침대 헤드는 세로 채널 패브릭, 블랙 금속 다리 식탁·의자로 선 정리'],
    eff: ['안방 왼쪽 벽(약 2.4m) 천장까지 슬라이딩 붙박이장(방문 열리는 자리는 피해서 시작)', '안방 확장부 창가는 화장대 + 거울 + 스툴(창 빛 그대로), 붙박이장 앞쪽 끝에 낮은 서랍장 + 거울', '주방 오른쪽 작업대 위 상부장 추가'],
    ref: '국보 씨티극동 43평·한강극동 24평(포그그레이 주방, 포세린), ECI(안방 붙박이장 3,388)', views: ['master', 'kitchen']
  },
  {
    id: '04', name: '키즈 프렌들리 파스텔', tag: '아이방 2개 모두 2층 침대 + 아래 책상. 거실은 매트·티피 텐트 놀이 공간.',
    T: { wall: '#f4f0ea', part: '#ebe3d8', door: '#ebe3d8', dframe: '#e2cdb8', klow: '#f6f2ea', ctop: '#efe8dc', kup: '#f6f2ea', tall: '#f6f2ea', fridge: '#e6e8e6', base: '#f1ebe2', seat: '#e7c9b8', back: '#dbb7a3', table: '#e9dcc6', leg: '#c9b394', chair: '#cfe4d9', chairStyle: 'paint', mat: '#cfe4d9', acc: '#f2c9b3', duvet: '#f6e3d8', head: '#e7c9b8', desk: '#e3cfae', vanity: '#f6f2ea', curtain: '#f6efe6', floor: 'wood', floorc: [226, 203, 168], entry: [222, 214, 202], rug: '#f1e4d6', khandle: 'groove' },
    V: { loft: true, playhouse: true },
    pal: [['#f4f0ea', '벽 · 밀크화이트'], ['#e2cba8', '바닥 · 밝은 오크'], ['#e7c9b8', '소파 · 피치'], ['#cfe4d9', '매트·의자 · 민트'], ['#f2c9b3', '포인트 · 살구'], ['#e9dcc6', '식탁 · 메이플']],
    inter: ['기둥·가구 모서리를 둥글게(라운드) 마감해 부딪혀도 덜 다치게', '파스텔은 소품·패브릭으로만, 큰 면은 밀크화이트', '문틈 손끼임 방지, 콘센트 안전 커버, 닦기 쉬운 페인트 의자'],
    eff: ['아이방 2개 모두 높이 약 1.25m 2층 침대 + 아래 책상(방 바닥이 그대로 남음)', '확장한 발코니 자리에 러그 + 티피 텐트 놀이 코너', '거실 창가 매트 + 낮은 장난감 수납장 + 티피'],
    ref: 'ECI(아이방 발코니 확장·아기 침대 동선)', views: ['kids1', 'living']
  },
  {
    id: '05', name: '재팬디 좌식 거실', tag: '베이지·라탄·리넨. 거실 확장부 전체를 평상(데이베드)으로, 하리는 아치로.',
    T: { wall: '#e9e1d3', part: '#ddd2c0', door: '#c2a072', dframe: '#a88763', muntin: true, moru: true, klow: '#ddd2bf', ctop: '#efe9de', kup: '#ddd2bf', tall: '#e4dccd', fridge: '#d8d0c2', base: '#d9cdb8', seat: '#d8ccb6', back: '#bfae95', table: '#a88763', leg: '#7d6448', chair: '#c2a072', chairStyle: 'rattan', mat: '#e2d6c2', acc: '#a3b18a', duvet: '#ede6d8', head: '#bfa98a', desk: '#b8976d', vanity: '#ddd2bf', curtain: '#efe8db', floor: 'wood', floorc: [222, 204, 174], plank: 220, entry: [208, 198, 182], rug: '#e2d6c2', pendant: '#d9c3a0', lampc: '#efe2c8', khandle: 'groove' },
    V: { daybed: true, notv: true, arch: true },
    pal: [['#e9e1d3', '벽 · 베이지 화이트'], ['#decbad', '바닥 · 애쉬 마루'], ['#d8ccb6', '평상 매트 · 리넨'], ['#c2a072', '의자 · 라탄'], ['#a88763', '목재 · 오크 브라운'], ['#a3b18a', '포인트 · 올리브']],
    inter: ['낮은 가구·라탄 의자·리넨 커튼으로 차분하게', 'TV 대신 오른쪽 벽 전체 책장(TV는 안방이나 빔프로젝터)', '확장부 하리(상부 보)를 아치로 마감해 부드러운 선(벨류 사례)'],
    eff: ['거실 확장부 전체(약 2.9m × 1.17m)를 높이 35cm 평상으로: 아래는 서랍 4개, 위는 낮잠·놀이', '평상 위 리넨 매트 2장 + 등쿠션 + 좌식 원형 테이블(간식·그림 그리기)', '평상 앞은 러그만 깔아 아이가 기어 다니기 좋게'],
    ref: '벨류인테리어(하리 아치), 원앙마을 사례(발코니 단높임)', views: ['living', 'entry']
  },
  {
    id: '06', name: '네이비 포인트 + 홈카페', tag: '화이트 바탕에 네이비 주방·중문, 테라조 현관. 키큰장 가운데를 홈카페로.',
    T: { wall: '#f0efec', part: '#e3e2de', door: '#2f4253', dframe: '#2f4253', klow: '#2f4253', ctop: '#f2f0ec', kup: '#f4f3f0', tall: '#f4f3f0', tall2: '#2f4253', fridge: '#dfe3e6', base: '#eceae5', seat: '#6d7f8f', back: '#5d6f80', table: '#c49a6c', leg: '#2f4253', metalLeg: true, chair: '#f0ece4', chairStyle: 'fabric', mat: '#ece5d6', acc: '#e0b46a', duvet: '#eef0f2', head: '#2f4253', channel: true, desk: '#c49a6c', vanity: '#2f4253', curtain: '#f0efec', floor: 'wood', floorc: [205, 177, 140], entry: [60, 66, 72], entryTex: 'terrazzo', rug: '#e6e0d4', pendant: '#c9a24a', pendantStyle: 'dome', khandle: 'bar', splash: '#ffffff' },
    V: { cafe: true, upper: true },
    pal: [['#f0efec', '벽 · 화이트'], ['#cdb18c', '바닥 · 내추럴 오크'], ['#2f4253', '포인트 · 네이비'], ['#6d7f8f', '소파 · 블루그레이'], ['#c9a24a', '조명·손잡이 · 브라스'], ['#3c4248', '현관 바닥 · 다크 테라조']],
    inter: ['주방 하부장·중문 프레임·현관 신발장을 네이비로(디자인다룸 네이비 현관)', '현관 바닥은 짙은 테라조 타일', '상부장·벽은 화이트로 가볍게, 브라스 펜던트로 포인트'],
    eff: ['키큰장 가운데 허리 높이(89~150cm)를 열어 커피머신·토스터·전자레인지 홈카페 + 위 간접등', '주방 오른쪽 작업대 위 천장까지 상부장', '붙박이 소파 좌판 아래 서랍'],
    ref: '디자인다룸(네이비 현관·테라조), ECI(주방 상부장 추가)', views: ['cafe', 'entry']
  }
];

// 시점: [이름, 카메라(x,y높이,z), 바라보는 점] 단위 m
export const VIEWS = {
  overview: ['집 전체', [7.6, 13.5, 17.2], [3.3, 0, 5.4]],
  overview2: ['위에서', [3.31, 17.5, 6.2], [3.31, 0, 5.3]],
  living: ['거실 창가', [2.85, 1.55, 7.85], [0.9, 0.5, 10.4]],
  dining: ['식탁·소파', [2.85, 1.5, 9.2], [0.5, 0.7, 6.9]],
  entry: ['현관·전실', [2.6, 1.5, 7.6], [0.35, 0.95, 4.8]],
  kitchen: ['주방', [3.5, 1.55, 4.95], [3.15, 0.95, 0.8]],
  cafe: ['키큰장·홈카페', [3.75, 1.45, 2.75], [2.45, 1.1, 1.5]],
  master: ['안방', [3.75, 1.6, 6.2], [5.9, 0.5, 8.3]],
  masterExt: ['안방 창가', [5.35, 1.5, 9.95], [3.3, 0.8, 10.1]],
  kids1: ['아이방 1', [1.85, 1.6, 4.6], [0.6, 0.95, 1.6]],
  kids2: ['아이방 2', [5.0, 1.55, 3.6], [6.0, 0.85, 1.0]],
  bath: ['욕실', [4.45, 1.85, 5.55], [5.8, 0.5, 4.5]],
  laundry: ['세탁 부스', [3.55, 1.5, 10.0], [6.3, 0.95, 9.95]],
};
export const VIEW_ORDER = ['overview', 'overview2', 'living', 'dining', 'entry', 'kitchen', 'cafe', 'master', 'kids1', 'kids2', 'bath', 'laundry'];
