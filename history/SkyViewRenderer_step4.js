export class SkyViewRenderer {
    constructor() {
        this.zodiacCanvas = document.getElementById('zodiacCanvas');
        this.zCtx = this.zodiacCanvas.getContext('2d');

        this.meteorCanvas = document.getElementById('meteorCanvas');
        this.mCtx = this.meteorCanvas.getContext('2d');

        this.data = null;
        this.animationId = null;

        // Zodiac State
        this.zodiacState = 'CHAOS'; // CHAOS -> FORMING -> CONNECT
        this.zodiacTimer = 0;
        this.stars = [];

        // Meteor State
        this.meteors = [];
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        if (this.zodiacCanvas) {
            this.zodiacCanvas.width = this.zodiacCanvas.parentElement.clientWidth;
            this.zodiacCanvas.height = 200;
        }
        if (this.meteorCanvas) {
            this.meteorCanvas.width = this.meteorCanvas.parentElement.clientWidth;
            this.meteorCanvas.height = 150;
        }
    }

    updateData(data) {
        this.data = data;

        // Update Text
        document.getElementById('sunriseTime').textContent = data.sunrise;
        document.getElementById('sunsetTime').textContent = data.sunset;
        document.getElementById('moonPhaseName').textContent = data.moon.phase;
        document.getElementById('moonNextEvent').textContent = data.moon.next;
        document.getElementById('zodiacName').textContent = data.zodiac.name;
        document.getElementById('zodiacDesc').textContent = data.zodiac.desc;
        document.getElementById('meteorName').textContent = data.meteor.name;
        document.getElementById('meteorTime').textContent = data.meteor.time;

        // Moon Glow Logic
        const moonGlow = document.querySelector('.moon-glow');
        if (data.moon.phase.toLowerCase().includes('full')) {
            moonGlow.classList.add('full-moon-active');
        } else {
            moonGlow.classList.remove('full-moon-active');
        }

        // Reset Zodiac Animation
        this.initZodiacStars();
    }

    initZodiacStars() {
        // Leo Constellation (Centered)
        // Normalized coordinates (0-1)
        const points = [
            { x: 0.35, y: 0.4 }, { x: 0.4, y: 0.3 }, { x: 0.45, y: 0.25 }, // Head
            { x: 0.5, y: 0.3 }, { x: 0.5, y: 0.6 }, // Body
            { x: 0.6, y: 0.55 }, { x: 0.65, y: 0.7 }, { x: 0.55, y: 0.7 } // Tail
        ];

        const w = this.zodiacCanvas.width;
        const h = this.zodiacCanvas.height;

        this.stars = points.map(p => ({
            tx: p.x * w, // Target X
            ty: p.y * h, // Target Y
            cx: Math.random() * w, // Current X
            cy: Math.random() * h, // Current Y
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            size: 2 + Math.random() * 2
        }));

        this.zodiacState = 'CHAOS';
        this.zodiacTimer = 0;
    }

    animate() {
        if (this.animationId) cancelAnimationFrame(this.animationId);

        const loop = () => {
            this.drawZodiac();
            this.drawMeteors();
            this.animationId = requestAnimationFrame(loop);
        };
        loop();
    }

    drawZodiac() {
        if (!this.zCtx) return;
        const w = this.zodiacCanvas.width;
        const h = this.zodiacCanvas.height;

        this.zCtx.clearRect(0, 0, w, h);
        this.zCtx.fillStyle = '#fff';
        this.zCtx.strokeStyle = 'rgba(0, 242, 255, 0.5)';
        this.zCtx.lineWidth = 1;

        // State Logic
        this.zodiacTimer++;
        if (this.zodiacState === 'CHAOS' && this.zodiacTimer > 100) {
            this.zodiacState = 'FORMING';
            this.zodiacTimer = 0;
        } else if (this.zodiacState === 'FORMING' && this.zodiacTimer > 100) {
            this.zodiacState = 'CONNECT';
        }

        // Draw Stars
        this.stars.forEach((s, i) => {
            if (this.zodiacState === 'CHAOS') {
                s.cx += s.vx;
                s.cy += s.vy;
                // Bounce
                if (s.cx < 0 || s.cx > w) s.vx *= -1;
                if (s.cy < 0 || s.cy > h) s.vy *= -1;
            } else if (this.zodiacState === 'FORMING') {
                // Lerp to Target
                s.cx += (s.tx - s.cx) * 0.05;
                s.cy += (s.ty - s.cy) * 0.05;
            }

            // Draw Star
            this.zCtx.beginPath();
            this.zCtx.arc(s.cx, s.cy, s.size, 0, Math.PI * 2);
            this.zCtx.shadowBlur = 10;
            this.zCtx.shadowColor = '#fff';
            this.zCtx.fill();
            this.zCtx.shadowBlur = 0;
        });

        // Draw Connections
        if (this.zodiacState === 'CONNECT' || (this.zodiacState === 'FORMING' && this.zodiacTimer > 50)) {
            this.zCtx.beginPath();
            this.stars.forEach((s, i) => {
                if (i === 0) this.zCtx.moveTo(s.cx, s.cy);
                else this.zCtx.lineTo(s.cx, s.cy);
            });
            this.zCtx.stroke();
        }
    }

    drawMeteors() {
        if (!this.mCtx) return;
        const w = this.meteorCanvas.width;
        const h = this.meteorCanvas.height;

        // Trail Effect (Destination Out to reveal CSS background)
        this.mCtx.globalCompositeOperation = 'destination-out';
        this.mCtx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.mCtx.fillRect(0, 0, w, h);

        // Reset Composite for Drawing
        this.mCtx.globalCompositeOperation = 'source-over';

        // Spawn
        if (Math.random() < 0.08) { // Increased rate slightly
            this.meteors.push({
                x: Math.random() * w,
                y: 0,
                vx: -5 - Math.random() * 5,
                vy: 5 + Math.random() * 5,
                size: 1 + Math.random(),
                color: Math.random() > 0.8 ? '#00F2FF' : '#BC13FE' // Occasional Cyan meteor
            });
        }

        this.meteors.forEach((m, i) => {
            m.x += m.vx;
            m.y += m.vy;

            this.mCtx.beginPath();
            this.mCtx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
            this.mCtx.fillStyle = m.color;
            this.mCtx.shadowBlur = 5;
            this.mCtx.shadowColor = m.color;
            this.mCtx.fill();
            this.mCtx.shadowBlur = 0;

            // Remove off-screen
            if (m.y > h || m.x < 0) {
                this.meteors.splice(i, 1);
            }
        });
    }
}
