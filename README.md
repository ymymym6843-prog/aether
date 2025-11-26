# AETHER - Advanced Aesthetic Weather Experience

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow.svg)](https://www.javascript.com/)

**AETHER**는 "Deep Space" 테마의 프리미엄 날씨 애플리케이션입니다. Glassmorphism UI와 네온 컬러의 몽환적인 애니메이션으로 실시간 날씨 정보를 제공합니다.

![AETHER Preview](preview.png)

---

## ✨ 주요 기능

### 📊 Today Tab (메인 대시보드)
- **실시간 날씨 정보**: 현재 온도, 체감온도, 최고/최저 기온
- **Weather Map**: 회전하는 레이더 + 유기적 구름 + 실시간 풍향/풍속 시각화
- **시간별 예보**: 3시간 간격 8개 시간대
- **5일 예보**: 
  - 인터랙티브 Canvas 그래프 (고해상도 디스플레이 지원)
  - 일자별 상세 정보 (날짜, 요일, 강수확률, 최고/최저 기온)
- **대기질 정보**: AQI 점수 + PM2.5/PM10/O3/CO2/꽃가루 상세 데이터
- **생활 지수**: 러닝, 우산, 운전, 빨래 적합도
- **Outfit Guide**: AI 기반 옷차림 추천
- **도시 하이라이트**: 국내 4개 도시 + 해외 4개 도시

### ⭐ Favorites Tab
- 즐겨찾기 도시 관리
- 원클릭 날씨 조회
- 색상 구분 최고/최저 기온 (빨강/파랑)

### 🌌 Sky View Tab
- **Solar Arc**: 일출부터 일몰까지 실시간 태양 위치 추적
- **Breathing Moon**: 달의 위상과 숨 쉬는 듯한 Glow 애니메이션
- **Constellations**: 
  - **Premium Visuals**: Star Glow(별 빛 번짐), Neon Bloom(네온 효과), Background Stars(배경 별) 적용
  - 현재 날짜 기반 황도 12궁 자동 선택
  - 3단계 애니메이션 (Chaos → Forming → Connect)
  - 실제 별자리 패턴 기반의 기하학적 렌더링
- **Meteor Shower**: 유성우 예보 + 실시간 유성 애니메이션

---

## 🎨 디자인 시스템

### 컬러 팔레트
- **Background**: Deep Space (`#1A1B41` → `#2E0249`)
- **Neon Accents**: Cyan (`#00F2FF`), Purple (`#BC13FE`)
- **Temperature Colors**: Warm (`#FF6B6B`), Cool (`#4D96FF`)

### UI 요소
- **Glassmorphism**: `backdrop-filter: blur(20px)` + 반투명 배경
- **Hover Effects**: 모든 카드에 Glow + translateY 애니메이션
- **High-DPI Support**: Retina 디스플레이 최적화

---

## 🚀 시작하기

### 요구사항
- 모던 웹 브라우저 (Chrome 90+, Firefox 88+, Safari 14+)
- Node.js (개발 서버용, 선택사항)
- OpenWeatherMap API 키 (무료)

### 설치 방법

#### 1. 저장소 클론
\`\`\`bash
git clone https://github.com/yourusername/aether-weather-app.git
cd aether-weather-app
\`\`\`

#### 2. API 키 설정
1. [OpenWeatherMap](https://openweathermap.org/api)에서 무료 API 키 발급
2. \`js/config.example.js\`를 \`js/config.js\`로 복사
   \`\`\`bash
   cp js/config.example.js js/config.js
   \`\`\`
3. \`js/config.js\`에서 API 키 입력
   \`\`\`javascript
   window.AETHER_API_KEY = 'your_api_key_here';
   \`\`\`

#### 3. 로컬 서버 실행

**방법 1: start.bat 사용 (Windows)**
\`\`\`bash
start.bat
\`\`\`

**방법 2: npx serve 직접 실행**
\`\`\`bash
npx serve .
\`\`\`

**방법 3: Python HTTP 서버**
\`\`\`bash
python -m http.server 3000
\`\`\`

#### 4. 브라우저에서 열기
\`\`\`
http://localhost:3000
\`\`\`

---

## 📁 프로젝트 구조

\`\`\`
codex/
├── index.html                 # 메인 HTML
├── css/
│   └── style.css             # 전체 스타일 (Glassmorphism, Animations)
├── js/
│   ├── main.js               # 앱 컨트롤러
│   ├── config.js             # API 키 (gitignore됨)
│   ├── config.example.js     # API 키 템플릿
│   ├── api/
│   │   └── apiService.js     # OpenWeatherMap API 연동
│   ├── data/
│   │   └── mockData.js       # 오프라인 Fallback 데이터
│   ├── engine/
│   │   └── WeatherEngine.js  # Canvas 날씨 애니메이션
│   └── ui/
│       ├── DomRenderer.js    # UI 렌더링 (Today/Favorites)
│       └── SkyViewRenderer.js # Sky View 애니메이션
├── start.bat                  # Windows 실행 스크립트
├── .gitignore
└── README.md
\`\`\`

---

## 🛠️ 기술 스택

- **순수 JavaScript (ES6+ Modules)**: 외부 라이브러리 없이 구현
- **HTML5 Canvas**: 고성능 애니메이션
- **CSS3**: Glassmorphism, Keyframe Animations
- **OpenWeatherMap API**: 실시간 날씨 데이터
- **localStorage**: 즐겨찾기 영구 저장

---

## 🌟 핵심 기능 상세

### 1. Weather Map 시각화
\`\`\`javascript
// 실제 날씨 데이터 기반 동적 렌더링
- 구름 개수 = cloudiness / 20
- 바람 선 개수 = windSpeed * 1.5
- 비 속도 = precipChance / 50 (강수 강도 비례)
\`\`\`

### 2. 별자리 애니메이션
- **Phase 1 (Scatter)**: 별들이 랜덤 위치에서 부유
- **Phase 2 (Form)**: Easing 함수로 별자리 형태로 이동
- **Phase 3 (Connect)**: 특정 별 쌍만 연결 (connections 배열)

### 3. High-DPI 렌더링
\`\`\`javascript
const dpr = window.devicePixelRatio || 1;
canvas.width = rect.width * dpr;
canvas.height = rect.height * dpr;
ctx.scale(dpr, dpr);
\`\`\`

### 4. API Fallback 시스템
- 인터넷 연결 실패 시 자동으로 Mock Data로 전환
- UI에 "Live API" 또는 "Mock Data" 배지 표시

---

## 🎯 브라우저 지원

| Browser | Version | Status |
|---------|---------|--------|
| Chrome  | 90+     | ✅ Fully Supported |
| Firefox | 88+     | ✅ Fully Supported |
| Safari  | 14+     | ✅ Fully Supported |
| Edge    | 90+     | ✅ Fully Supported |

---

## 📝 개발 가이드

### 새 별자리 추가
\`\`\`javascript
// js/ui/SkyViewRenderer.js
constellations: [
    {
        name: 'NewConstellation',
        start: 'MM-DD',
        end: 'MM-DD',
        points: [
            { x: -30, y: 20, brightness: 1.5 },
            // ... 더 많은 별
        ],
        connections: [[0,1], [1,2]] // 연결할 별 쌍
    }
]
\`\`\`

### 새 도시 Mock Data 추가
\`\`\`javascript
// js/data/mockData.js
cities: {
    'NewCity': {
        current: { /* ... */ },
        forecast: { /* ... */ },
        // ...
    }
}
\`\`\`

---

## 🐛 문제 해결

### Q: "Mock Data" 배지만 표시되고 실제 날씨가 안 나와요
**A**: 
1. 인터넷 연결 확인
2. `js/config.js`에 올바른 API 키 입력 확인
3. 브라우저 콘솔에서 에러 메시지 확인

### Q: Canvas가 흐릿하게 보여요
**A**: 이미 High-DPI 지원이 구현되어 있습니다. 브라우저 캐시를 지우고 새로고침하세요.

### Q: CORS 에러가 발생해요
**A**: 파일 프로토콜(`file://`)이 아닌 HTTP 서버로 실행해야 합니다. `start.bat` 또는 `npx serve` 사용.

---

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능합니다.

---

## 👨‍💻 작성자

**UI/UX Design & Architecture Development**

---

## 🙏 감사의 말

- [OpenWeatherMap](https://openweathermap.org/) - 날씨 데이터 API 제공
- Glassmorphism 디자인 트렌드 영감

---

## 📮 문의 및 기여

Issue 및 Pull Request를 환영합니다!

**Enjoy the weather with AETHER! 🌈**
