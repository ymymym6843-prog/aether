# Sky View 애니메이션 구현 가이드

## 🌌 전반적인 컨셉: "살아있는 데이터 (Living Data)"

정적인 정보가 아니라, 시간의 흐름과 우주의 움직임을 사용자가 직관적으로 느낄 수 있도록 부드럽고 몽환적인 애니메이션을 적용합니다.

---

## 섹션 1: Solar Arc (태양 궤적)

### 개요
하루 동안의 태양의 움직임을 반원형의 궤적(Arc)으로 시각화합니다.  
핵심: **"현재 시간에 동기화된 부드러운 이동"**

### 구현 방식
SVG + JavaScript (Data Sync)

### 상세 애니메이션 효과

#### 1. SVG 궤적 그리기 (The Path)
- SVG의 `<path>` 요소로 완벽한 반원 또는 완만한 곡선 그리기
- 선 스타일: 얇고 반투명한 흰색 또는 AETHER 포인트 컬러(Cyan/Purple)
- 글래스모피즘 카드 위에 은은하게 빛나게 처리
- 옵션: 궤적의 시작점(일출)과 끝점(일몰)에 작은 아이콘/텍스트 배치

#### 2. 태양 아이콘 이동 (Sun Movement)
```javascript
// 진행률 계산
const progress = (현재시간 - 일출시간) / (일몰시간 - 일출시간);

// SVG 궤적 위의 좌표 추출
const point = path.getPointAtLength(progress * path.getTotalLength());

// 태양 아이콘 이동
sunIcon.style.transform = `translate(${point.x}px, ${point.y}px)`;
```

#### 3. 시간대별 분위기 변화 (Atmosphere)
- 지평선(양 끝) 근처: 붉은색/주황색 톤 + 강한 Glow
- 정오(가운데): 밝은 노란색/흰색 톤
- 밤 시간: 불투명도 낮추거나 지평선 아래로 숨김
- CSS Transition으로 부드러운 색상 변화

---

## 섹션 2: Breathing Moon (달 위상)

### 개요
실제 달처럼 입체감이 느껴지고 은은하게 빛나는 인터랙티브 그래픽

### 구현 방식
CSS3 (Box-shadow & Animation)

### 상세 애니메이션 효과

#### 1. 현실적인 위상 표현 (Realistic Phase Shadow)
```css
.moon-sphere {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    background: radial-gradient(circle at 30% 30%, #f0f0f0, #888);
    
    /* 달 위상에 따라 동적으로 변경 */
    box-shadow: inset -20px 0px 40px rgba(0,0,0,0.8);
}
```

- 달의 나이(Moon Age)에 따라 내부 그림자의 x-offset, blur-radius 조절
- 초승달 → 반달 → 보름달 입체적으로 표현

#### 2. 숨 쉬는 빛 (Breathing Glow Animation)
```css
@keyframes breathing {
    0%, 100% {
        filter: drop-shadow(0 0 20px rgba(200,220,255,0.6));
    }
    50% {
        filter: drop-shadow(0 0 40px rgba(200,220,255,0.9));
    }
}

.moon-sphere {
    animation: breathing 5s ease-in-out infinite;
}
```

---

## 섹션 3: Constellations (별자리)

### 개요
기존 캔버스 애니메이션 유지, 섹션 내에 국한하여 실행

### 구현 방식
HTML5 Canvas + JavaScript

### 3단계 애니메이션

#### Phase 1: 부유 (Floating)
- 작은 별 입자들이 캔버스에서 무작위로 떠다님
- 속도: 매우 느림, 부드러운 움직임

#### Phase 2: 형성 (Forming)
```javascript
// 가감속 이동 (Easing)
function moveToConstellation(star, targetX, targetY) {
    const dx = targetX - star.x;
    const dy = targetY - star.y;
    const easing = 0.05;  // 부드러운 감속
    
    star.x += dx * easing;
    star.y += dy * easing;
}
```

#### Phase 3: 연결 (Connecting)
- 별들이 자리 잡으면 순차적으로 선 그리기
- 완성 시 별들이 반짝이는 강조 효과

---

## 섹션 4: Meteor Shower (유성우)

### 개요
깊은 우주 배경 + 역동적인 유성우 효과

### 구현 방식
HTML5 Canvas (독립 레이어)

### 상세 애니메이션 효과

#### 1. 깊은 우주 배경 (Deep Space Background)
```javascript
// 그라데이션 배경
const gradient = ctx.createRadialGradient(
    canvas.width/2, canvas.height/2, 0,
    canvas.width/2, canvas.height/2, canvas.width
);
gradient.addColorStop(0, '#0a0e27');
gradient.addColorStop(1, '#000000');

// 정적인 별들
for(let i = 0; i < 200; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.5})`;
    ctx.fillRect(Math.random() * width, Math.random() * height, 1, 1);
}
```

#### 2. 유성우 파티클 (Meteor Trails)
```javascript
class Meteor {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = -50;
        this.length = Math.random() * 80 + 40;
        this.speed = Math.random() * 15 + 10;
        this.angle = Math.PI / 4;
    }
    
    draw(ctx) {
        // 그라데이션 꼬리
        const gradient = ctx.createLinearGradient(
            this.x, this.y,
            this.x - this.length * Math.cos(this.angle),
            this.y - this.length * Math.sin(this.angle)
        );
        gradient.addColorStop(0, 'rgba(255,255,255,1)');  // 밝은 머리
        gradient.addColorStop(1, 'rgba(255,255,255,0)');  // 투명한 꼬리
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(
            this.x - this.length * Math.cos(this.angle),
            this.y - this.length * Math.sin(this.angle)
        );
        ctx.stroke();
    }
    
    update() {
        this.x += this.speed * Math.cos(this.angle);
        this.y += this.speed * Math.sin(this.angle);
    }
}
```

---

## 구현 우선순위

1. **Solar Arc**: SVG 기본 구조 + 실시간 동기화
2. **Breathing Moon**: CSS 애니메이션 (가장 간단)
3. **Meteor Shower**: Canvas 배경 + 파티클
4. **Constellations**: 기존 코드 리팩토링 + 3단계 애니메이션

---

## 성능 최적화 팁

- requestAnimationFrame 사용
- Canvas는 필요할 때만 다시 그리기 (Dirty Rectangle)
- CSS는 transform과 opacity만 애니메이션 (GPU 가속)
- 파티클 개수 제한 (모바일: 50개, 데스크탑: 100개)
