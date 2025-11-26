## 📁 PART 1. Brand Identity & Design System
**Theme:** "Deep Glassmorphism & Neon Minimalism"
1.  **Logo & Branding:**
    * **Symbol:** 영문 합자 **'Æ'** SVG 심볼.(“AE”가 아님)
    * **Subtitle:** 심볼 우측에 **"AETHER"** 텍스트 표기 (Font: Ultra-thin Sans-serif, white color, Tracking: 2px).
    * **Color:** White to Cyan Linear Gradient.
2.  **Color Palette:**
    * **Background:** `radial-gradient(circle at center, #1A1B41, #2E0249)` (Deep Space).
    * **Glass Panel:** `background: rgba(255, 255, 255, 0.03)`, `backdrop-filter: blur(20px)`, `border: 1px solid rgba(255, 255, 255, 0.1)`.
    * **Accents:** Neon Cyan (`#00F2FF`) & Neon Purple (`#BC13FE`).
    * **Temp Colors:** High Temp (`#FF6B6B` - Warm), Low Temp (`#4D96FF` - Cool).
3.  **Interaction:**
    * **Hover Glow:** 모든 섹션/카드 호버 시 테두리가 Cyan/Purple 라인으로 하이라이팅(`box-shadow` + `border-color` change)되며 살짝 떠오르는(`translateY`) 효과 필수.
    * **Icons:** 모든 아이콘은 **Neon Line Style SVG**로 직접 구현 (이모지 금지).

---

## 🏗️ PART 2. System Architecture & Responsive Layout
**Stack:** Vanilla JS (ES6 Modules), HTML5, CSS3. (No External Libraries).
**Architecture:** `main.js` (Controller), `apiService.js` (Data), `mockData.js` (Fallback), `WeatherEngine.js` (Physics), `DomRenderer.js` (UI), `SkyViewRenderer.js` (Celestial).

### **Responsive Strategy**
1.  **PC/Desktop:**
    * **Constraint:** 전체 화면 채우기 금지. **중앙 플로팅 패널 (Floating Panel)** 형태 유지.
    * **Size:** `max-width: 560px`, `height: 90vh`, `border-radius: 24px`.
2.  **Mobile:**
    * **Size:** `width: 100%`, `height: 100vh`, `border-radius: 0`.
3.  **Navigation:**
    * **Sticky Bottom Bar:** 화면 하단에 절대 위치(`position: absolute`)로 고정.
    * **Padding:** 콘텐츠 영역 하단에 `padding-bottom: 120px`을 주어 스크롤 시 내용 가림 방지.
    * **Scroll:** 스크롤 기능 유지하되 `scrollbar-width: none`으로 시각적 숨김 처리.

---

## 📱 PART 3. Detailed Feature Specifications (Tab by Tab)

### **A. Header (Top Bar)**
* **Left:** **[Æ Logo]** + **[Subtitle: "AETHER"]**
* **Right:**
    * **Search Input:** 반투명 둥근 모서리 입력창 (분리됨).
    * **GPS Button:** 타겟 아이콘 SVG (분리됨). 클릭 시 'Locating...' 토스트 후 현재 위치로드.

### **B. Tab 1: Today (Main Dashboard)**
*Flow: Header → Current → Forecasts → AQI → Bio/Lifestyle → City Highlights*

1.  **Current Status:**
    * **Main:** 대형 온도 (17°), Neon 날씨 아이콘.
    * **Temp Range:** 온도 아래에 **H(최고, Warm Color) / L(최저, Cool Color)** 기온 병기.
2.  **Precipitation Alert:**
    * 1시간 내 강수 확률 시 "☔ 15분 후 비 시작" 배지 노출.
    * 클릭 시 **Canvas Bezier Curve**로 그린 상세 강수량 그래프 모달/섹션 표시.
3.  **Weather Map (Live Atmosphere을 대체):**
    * Container showing **Dark SVG Map Base** + **Neon Radar Scan Animation** + **Weather Blobs** (Clouds/Rain overlay).
4.  **Forecasts:**
    * **Hourly:** 3시간 간격 (예: 12, 15, 18...). 가로 스크롤 없이 화면 너비에 맞춰 최대 개수 등간격 배치.
    * **5-Day Trend (Graph):** Canvas Line Chart (Cyan Gradient)로 5일간 기온 변화 곡선 표현.
    * **5-Day List:** 요일, 날씨 아이콘, 강수확률(물방울 아이콘+%), H/L 기온(색상 구분) 리스트.
5.  **Advanced Air Quality (AQI):**
    * **Visual:** 종합 점수(Ring Chart 애니메이션).
    * **Details:** 5대 오염원(PM2.5, PM10, O3, CO2, Pollen) 그리드 카드. 상태 텍스트(Good/Bad) 표시.
6.  **Bio-Atmosphere (Lifestyle):**
    * **Activity Grid:** Running, Umbrella, Driving, Laundry 지수 아이콘 카드.
    * **Meteo-Info:** 습도(Humidity), 풍향/풍속(Wind), 자외선(UV), 기압(Pressure) 인포그래픽.
    * **Outfit Guide:** 날씨별 옷차림 아이콘(실제 추천아이템) + 추천 문구 (예: "Wear a warm padded jacket.").
7.  **City Highlights:**
    * **Domestic:** 서울, 부산, 대구, 제주 (현재기온, H/L, 아이콘).
    * **Global:** 뉴욕, 런던, 파리, 도쿄 (현재기온, H/L, 아이콘).

### **C. Tab 2: Favorites**
* **UI:** Glass Card List.
* **Content:** 도시명, 현재기온, 날씨 아이콘, **H(Warm)/L(Cool) 기온**.
* **Action:** 리스트 클릭 시 Today 탭으로 이동하여 해당 도시 날씨 로드. 우측 상단 '×' 버튼으로 삭제.

### **D. Tab 3: Sky View (Celestial Animations)**
* **Concept:** "Living Data" & Description.
1.  **Solar Arc:**
    * **Animation:** SVG Arc 궤적. `(현재시간-일출)/(일몰-일출)` 비율로 태양 아이콘 이동. 색상 변화(Red→Yellow→Orange).
    * **Info:** 일출/일몰 시간 표기. "Current sun position..." 설명 병기.
2.  **Breathing Moon:**
    * **Visual:** 고해상도 달 그래픽 (CSS `box-shadow: inset`으로 위상 표현).
    * **Animation:** 달의 Glow가 4초 주기로 숨 쉬듯(Breathing) 커졌다 작아짐.
    * **Info:** 위상 이름, 다음 보름달/초승달까지 남은 일수(D-Day) 표기.
3.  **Constellations (Zodiac):**
    * **Logic:** 황도 12궁(Zodiac) 날짜 기반으로 현재 별자리(예: Leo) 표시.
    * **Animation (Canvas):**
        * State A (Chaos): 별들이 랜덤 부유.
        * State B (Forming): 제자리로 부드럽게 이동 (Easing).
        * State C (Connect): 선이 순차적으로 연결되며 별자리 완성. **(부자연스럽지 않게 부드러운 속도 조절 필수)**.
    * **Info:** 별자리 이름 및 설명 병기. 예. 7th.Libra (Sep. 24 ~ Oct. 22)
4.  **Meteor Shower Forecast:**
    * **Content:** 유성우 예보 텍스트 (예: "Perseids: Aug 12 Night, 100/hr").
    * **Visual:** 보라색 네온 카드 + 배경에 유성 파티클 효과 강화.

---

## 🌧️ PART 4. The Atmosphere Engine (Animation Guide Reflection)
**File:** `js/engine/WeatherEngine.js`
**Reflect:** `WEATHER_ANIMATION_GUIDE.md` 내용을 완벽 구현.
**Method:** `requestAnimationFrame`, HTML5 Canvas.

1.  **Clear:** Twinkling Stars + Shooting Stars (Long tail, fast diagonal).
2.  **Rain:** Fast vertical lines + Wind angle (`x += wind_speed`).
3.  **Snow:** **Sway Physics:** `x += Math.sin(angle) * sway_factor`. Hexagon(❄️) & Circle particles.
4.  **Sleet:** Rain + Ice Circles. **Bounce Physics:** If `y > height`, `vy *= -0.5`.
5.  **Mist:** Large, low-opacity (0.05) radial gradient circles drifting slowly (`speed < 0.5`).
6.  **Wind:** Long horizontal streamlines (opacity 0.1) moving very fast (`speed > 25`).
7.  **Thunderstorm:** Rain + Random Full-screen Flash (`ctx.fillRect` White/Purple).
8.  **Clouds:** No particles (CSS Gradient only).
9.  **Default:** Clear.

---

## 🛠️ PART 5. Implementation Plan (Python Generator)
**Generate `deploy_aether_final.py`** that creates:
1.  `index.html`: Full semantic structure including Header(Subtitle/Split Search/GPS), Tabs, Canvas.
2.  `css/style.css`: All variables, Neon Glow, Animations, Responsive Rules.
3.  `js/main.js`: App init, Event Listeners (Search, Tabs, GPS).
4.  `js/api/apiService.js`: Async API simulation with delay.
5.  `js/data/mockData.js`: **Full JSON** (Cities Highlights, Meteo-Info, Lifestyle, Zodiac Data).
6.  `js/engine/WeatherEngine.js`: 9-State Physics Engine.
7.  `js/ui/DomRenderer.js`: Render logic for Highlights, Charts, H/L Colors.
8.  `js/ui/SkyViewRenderer.js`: Solar, Moon, **Constellation Logic (Date-based)**.

**Note:** Ensure the Python script uses UTF-8 encoding and writes complete, functional code with detailed comments explaining the logic.