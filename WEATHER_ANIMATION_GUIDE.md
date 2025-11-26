# Weather Animation 구현 가이드

## 🎯 목표
AETHER 앱의 배경 날씨 애니메이션을 **9가지 상태**(Clear, Clouds, Rain, Snow, Thunderstorm, Mist, Wind, Sleet, Default) 로 구현하고, **CSS + Canvas** 로 부드럽고 퍼포먼스가 좋은 효과를 제공한다.

## 📂 파일 구성
- `style-animations.css` : 각 날씨 상태별 **CSS 키프레임** (glow, shimmer, fade 등)과 `.weather-<state>` 클래스 정의.
- `weather-animations.js` : Canvas 파티클 엔진. 상태 전환 시 `setWeatherState(state)` 로 호출.
- `index.html` : `<canvas id="weather-canvas"></canvas>` 를 `app-container` 내부에 배치하고, `weather-animations.js` 를 모듈로 로드.
- `weather-api.js` : 현재 날씨 데이터를 받아 `state` 를 결정하고 `setWeatherState` 로 전달.

---

## 1️⃣ CSS 애니메이션 (style-animations.css)
```css
/* 공통 설정 */
.app-container { position: relative; overflow: hidden; }
#weather-canvas { position: absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; }

/* 9가지 날씨 상태 클래스 */
.weather-clear    { background: linear-gradient(180deg, #0a0e27, #001d4d); }
.weather-clouds   { background: linear-gradient(180deg, #5a6b8c, #2c3e50); }
.weather-rain     { background: linear-gradient(180deg, #2b3b5c, #1a2a40); }
.weather-snow     { background: linear-gradient(180deg, #cce7ff, #e6f2ff); }
.weather-thunder  { background: linear-gradient(180deg, #1a0f2b, #3b0c4d); }
.weather-mist     { background: linear-gradient(180deg, #7a7a7a, #b0b0b0); }
.weather-wind     { background: linear-gradient(180deg, #2a3b5c, #1e2b3f); }
.weather-sleet    { background: linear-gradient(180deg, #4a5b6c, #2c3d4e); }
.weather-default  { background: #111; }

/* 예시 키프레임 – Clear (별빛) */
@keyframes starTwinkle {
  0%,100% { opacity:0.8; }
  50%      { opacity:1; }
}
.weather-clear .star { animation: starTwinkle 2s infinite ease-in-out; }
```
> **Tip**: 색상 팔레트는 `Cyan / Purple` 계열을 기본으로 사용해 AETHER 고유 분위기를 유지합니다.

---

## 2️⃣ Canvas 파티클 엔진 (weather-animations.js)
### 기본 구조
```javascript
export const canvas = document.getElementById('weather-canvas');
export const ctx = canvas.getContext('2d');
let particles = [];
let currentState = 'clear';

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();
```
### 파티클 클래스 (공통)
```javascript
class Particle {
  constructor(x, y, vx, vy, size, life, color) {
    this.x = x; this.y = y; this.vx = vx; this.vy = vy;
    this.size = size; this.life = life; this.maxLife = life;
    this.color = color;
  }
  update(dt) {
    this.x += this.vx * dt; this.y += this.vy * dt; this.life -= dt;
  }
  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI*2);
    ctx.fill();
  }
  isAlive() { return this.life > 0; }
}
```
### 상태별 파티클 생성 함수 (예시)
```javascript
function createClearParticles() {
  // 작은 별 30~50개, 천천히 움직임
  for(let i=0;i<40;i++){
    const p = new Particle(
      Math.random()*canvas.width,
      Math.random()*canvas.height,
      (Math.random()-0.5)*0.02,
      (Math.random()-0.5)*0.02,
      Math.random()*1.5+0.5,
      10+Math.random()*5,
      'rgba(255,255,255,0.8)'
    );
    particles.push(p);
  }
}
function createRainParticles(){
  for(let i=0;i<80;i++){
    const p = new Particle(
      Math.random()*canvas.width,
      Math.random()*canvas.height,
      0,
      0.3+Math.random()*0.2,
      1.2,
      2+Math.random()*2,
      'rgba(180,200,255,0.6)'
    );
    particles.push(p);
  }
}
// ... snow, thunder, mist, wind, sleet 등 유사하게 구현
```
### 메인 루프 & 상태 전환
```javascript
let lastTime = performance.now();
function loop(time){
  const dt = (time - lastTime)/1000; // seconds
  lastTime = time;
  ctx.clearRect(0,0,canvas.width,canvas.height);
  // 파티클 업데이트 & 그리기
  particles = particles.filter(p=>p.isAlive());
  particles.forEach(p=>{ p.update(dt); p.draw(); });
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

export function setWeatherState(state){
  if(state===currentState) return;
  currentState = state;
  // 기존 파티클 정리
  particles = [];
  // CSS 클래스 전환
  document.body.classList.remove(...Object.keys(stateMap));
  document.body.classList.add('weather-'+state);
  // 파티클 생성
  switch(state){
    case 'clear':   createClearParticles(); break;
    case 'rain':    createRainParticles(); break;
    // case 'snow': ...
    // case 'thunder': ...
    // case 'mist': ...
    // case 'wind': ...
    // case 'sleet': ...
    default: break;
  }
}

const stateMap = {
  clear:'weather-clear', clouds:'weather-clouds', rain:'weather-rain',
  snow:'weather-snow', thunder:'weather-thunder', mist:'weather-mist',
  wind:'weather-wind', sleet:'weather-sleet', default:'weather-default'
};
```
> **Tip**: 파티클 수는 **모바일 50개, 데스크탑 100개** 이하로 제한하고, `requestAnimationFrame` 으로 GPU 가속을 활용합니다.

---

## 3️⃣ 통합 흐름
1. **날씨 API** (`weather-api.js`) 에서 현재 날씨 코드를 받아 `state` 로 변환.
2. `setWeatherState(state)` 를 호출해 CSS 클래스와 Canvas 파티클을 동기화.
3. 페이지 로드 시 `initWeatherAnimation()` 으로 초기 상태를 설정하고, 5분마다 API 재요청 후 `setWeatherState` 로 업데이트.

```javascript
import { setWeatherState } from './weather-animations.js';
import { fetchCurrentWeather } from './weather-api.js';

async function initWeatherAnimation(){
  const data = await fetchCurrentWeather();
  const state = mapWeatherCodeToState(data.weather[0].main); // 예: "Clear" → "clear"
  setWeatherState(state);
  setInterval(async()=>{
    const d = await fetchCurrentWeather();
    setWeatherState(mapWeatherCodeToState(d.weather[0].main));
  }, 5*60*1000);
}
initWeatherAnimation();
```

---

## 4️⃣ 성능 최적화 팁
- **Dirty‑rectangle**: 파티클이 화면 전체를 그릴 필요가 없을 경우, `ctx.clearRect(p.x‑size, p.y‑size, size*2, size*2)` 로 영역만 지우기.
- **Particle 재활용**: `ParticlePool` 배열을 만들어 `new Particle` 대신 재사용.
- **GPU 가속**: CSS 변환(`transform`)만 사용하고, Canvas는 `2d` 컨텍스트이지만 `requestAnimationFrame` 으로 프레임 동기화.
- **모바일**: `window.devicePixelRatio` 를 고려해 캔버스 해상도 조절 (`canvas.width = innerWidth*ratio`).

---

## 5️⃣ 디버깅·오류 대응 체크리스트
| 상황 | 원인 예시 | 해결 방안 |
|------|----------|----------|
| Canvas가 보이지 않음 | `#weather-canvas` 가 `z-index` 로 가려짐 | CSS `z-index: 0;` 확인, `position:absolute` 유지 |
| 파티클이 멈춤 | `requestAnimationFrame` 호출이 중단됨 | 콘솔에 `Uncaught` 오류가 있는지 확인, `loop` 함수가 정상 반환되는지 점검 |
| 상태 전환 시 색상 안 바뀜 | `body` 에 클래스가 추가되지 않음 | `setWeatherState` 에서 `document.body.classList` 로 정확히 `weather-<state>` 가 적용되는지 확인 |
| 모바일에서 프레임 저하 | 파티클 수 과다 | `MAX_PARTICLES_MOBILE = 50` 로 제한, `ParticlePool` 사용 |

---

## 6️⃣ 확장 아이디어 (선택 사항)
- **밤/낮 전환**: `weather-clear-night` 라는 별도 클래스를 만들어 별빛을 더 어둡게.
- **풍향 표시**: 바람(`wind`) 상태에 `wind-direction` 아이콘을 회전시켜 실제 풍향을 시각화.
- **사용자 설정**: UI 토글로 애니메이션 켜·끄기 옵션 제공.

---

## 📚 참고 자료
- MDN Canvas API – <https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API>
- CSS `animation` & `transform` – <https://developer.mozilla.org/en-US/docs/Web/CSS/animation>
- OpenWeatherMap Weather Codes – <https://openweathermap.org/weather-conditions>

---

**이 가이드를 프로젝트 루트(`e:/vibecoding/AETHER_NEW/AETHER_New`)에 `WEATHER_ANIMATION_GUIDE.md` 로 저장하고, 구현 중 오류가 발생하면 해당 섹션을 참고해 수정 요청해 주세요.**
