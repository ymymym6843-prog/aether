import { mockData } from '../data/mockData.js';

export class SkyViewRenderer {
    constructor() {
        this.zodiacCanvas = document.getElementById('zodiacCanvas');
        this.zCtx = this.zodiacCanvas ? this.zodiacCanvas.getContext('2d') : null;

        this.meteorCanvas = document.getElementById('meteorCanvas');
        this.mCtx = this.meteorCanvas ? this.meteorCanvas.getContext('2d') : null;

        this.data = null;
        this.animationId = null;

        // Zodiac State
        this.zodiacState = 'CHAOS'; // CHAOS -> FORMING -> CONNECT
        this.zodiacTimer = 0;
        this.stars = [];
        this.bgStars = []; // Background stars for depth
        this.activeConstellation = null;

        // Meteor State
        this.meteors = [];
    }

    getZodiacSign() {
        const now = new Date();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const dateStr = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

        for (const sign of mockData.zodiac_data) {
            // Handle Capricorn wrap-around
            if (sign.name === 'Capricorn') {
                if (dateStr >= '12-22' || dateStr <= '01-19') return sign;
            } else {
                if (dateStr >= sign.start && dateStr <= sign.end) return sign;
            }
        }
        return mockData.zodiac_data[0]; // Fallback
    }

    init() {
        this.resize();
        this.initBackgroundStars(); // Initialize background stars
        window.addEventListener('resize', () => {
            this.resize();
            this.initBackgroundStars(); // Re-init background stars on resize
        });
        this.animate();
    }

    resize() {
        if (this.zodiacCanvas && this.zodiacCanvas.parentElement) {
            this.zodiacCanvas.width = this.zodiacCanvas.parentElement.clientWidth;
            this.zodiacCanvas.height = 200;
        }
        if (this.meteorCanvas && this.meteorCanvas.parentElement) {
            this.meteorCanvas.width = this.meteorCanvas.parentElement.clientWidth;
            this.meteorCanvas.height = 150;
        }
    }

    initBackgroundStars() {
        if (!this.zodiacCanvas) return;
        this.bgStars = [];
        const w = this.zodiacCanvas.width;
        const h = this.zodiacCanvas.height;
        const count = Math.floor(w * h / 2000); // Density based on area

        for (let i = 0; i < count; i++) {
            this.bgStars.push({
                x: Math.random() * w,
                y: Math.random() * h,
                size: Math.random() * 1.5,
                alpha: Math.random() * 0.3 + 0.1, // Faint alpha
                twinkleSpeed: Math.random() * 0.02 + 0.005,
                twinkleDir: 1
            });
        }
    }

    updateData(data) {
        this.data = data;

        // Update Text
        const sunriseEl = document.getElementById('sunriseTime');
        const sunsetEl = document.getElementById('sunsetTime');
        const moonPhaseEl = document.getElementById('moonPhaseName');
        const moonNextEl = document.getElementById('moonNextEvent');
        const meteorNameEl = document.getElementById('meteorName');
        const meteorTimeEl = document.getElementById('meteorTime');

        if (sunriseEl) sunriseEl.textContent = data.sunrise || '--:--';
        if (sunsetEl) sunsetEl.textContent = data.sunset || '--:--';
        if (moonPhaseEl) moonPhaseEl.textContent = data.moon.phase || '';
        if (moonNextEl) moonNextEl.textContent = data.moon.next || '';
        if (meteorNameEl) meteorNameEl.textContent = data.meteor.name || '';
        if (meteorTimeEl) meteorTimeEl.textContent = data.meteor.time || '';

        // Moon Glow Logic
        const moonGlow = document.querySelector('.moon-glow');
        if (moonGlow && data.moon.phase.toLowerCase().includes('full')) {
            moonGlow.classList.add('full-moon-active');
        } else if (moonGlow) {
            moonGlow.classList.remove('full-moon-active');
        }

        // Initialize Zodiac Animation with new data structure
        this.initConstellations();
    }

    // ------------------------------------------------------------------
    // Constellation Logic
    // ------------------------------------------------------------------
    initConstellations() {
        this.activeConstellation = this.getZodiacSign();

        const nameEl = document.getElementById('zodiacName');
        const descEl = document.getElementById('zodiacDesc');
        if (nameEl) nameEl.textContent = this.activeConstellation.name;
        if (descEl) descEl.textContent = `${this.activeConstellation.start} ~ ${this.activeConstellation.end}`;

        // Flatten the 2D points array to create unique star objects
        this.stars = [];
        if (this.activeConstellation && this.activeConstellation.points) {
            this.activeConstellation.points.forEach(segment => {
                segment.forEach(p => {
                    // Avoid duplicate stars
                    if (!this.stars.some(s => s.tx === p.x && s.ty === p.y)) {
                        this.stars.push({
                            tx: p.x, ty: p.y, // Target relative coordinates
                            x: (Math.random() - 0.5) * 200, // Random start pos
                            y: (Math.random() - 0.5) * 200,
                            size: Math.random() * 2 + 1.5, // Slightly larger for glow effect
                            alpha: 0
                        });
                    }
                });
            });
        }

        this.zodiacState = 'CHAOS';
        this.zodiacTimer = 0;
    }

    drawZodiac() {
        if (!this.zCtx || !this.activeConstellation) return;

        const ctx = this.zCtx;
        const w = this.zodiacCanvas.width;
        const h = this.zodiacCanvas.height;
        const cx = w / 2;
        const cy = h / 2;

        ctx.clearRect(0, 0, w, h);

        // 0. Draw Background Stars (Depth Layer)
        this.bgStars.forEach(s => {
            s.alpha += s.twinkleSpeed * s.twinkleDir;
            if (s.alpha > 0.4 || s.alpha < 0.1) s.twinkleDir *= -1;

            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
            ctx.fill();
        });

        // Update Phase
        this.zodiacTimer++;
        if (this.zodiacState === 'CHAOS' && this.zodiacTimer > 50) {
            this.zodiacState = 'FORMING';
            this.zodiacTimer = 0;
        } else if (this.zodiacState === 'FORMING' && this.zodiacTimer > 100) {
            this.zodiacState = 'CONNECT';
        }

        // 1. Draw Main Stars with Glow
        this.stars.forEach(s => {
            if (this.zodiacState === 'FORMING' || this.zodiacState === 'CONNECT') {
                const targetX = cx + s.tx;
                const targetY = cy + s.ty;
                s.x += (targetX - s.x) * 0.05;
                s.y += (targetY - s.y) * 0.05;
                s.alpha += (1 - s.alpha) * 0.05;
            } else {
                s.alpha = Math.min(s.alpha + 0.01, 0.5);
            }

            // Star Glow (Radial Gradient)
            const gradient = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 2);
            const alpha = this.zodiacState === 'CONNECT' ? s.alpha : s.alpha * 0.7;

            gradient.addColorStop(0, `rgba(255, 255, 255, ${alpha})`); // Core
            gradient.addColorStop(0.4, `rgba(200, 240, 255, ${alpha * 0.5})`); // Inner Glow
            gradient.addColorStop(1, `rgba(0, 242, 255, 0)`); // Outer Fade

            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size * 2, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();

            // Core Bright Spot
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size * 0.4, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.fill();
        });

        // 2. Draw Lines with Neon Bloom
        if (this.zodiacState === 'CONNECT') {
            // Neon Glow Layer (Thick, Colored, Low Alpha)
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(0, 242, 255, 0.15)'; // Cyan Glow
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            this.drawLinesPath(ctx);
            ctx.stroke();

            // Core Line Layer (Thin, White/Cyan, High Alpha)
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(200, 255, 255, 0.6)'; // White-Cyan Core
            ctx.lineWidth = 1.2;
            this.drawLinesPath(ctx);
            ctx.stroke();
        }
    }

    drawLinesPath(ctx) {
        this.activeConstellation.points.forEach(segment => {
            segment.forEach((p, i) => {
                const star = this.stars.find(s => s.tx === p.x && s.ty === p.y);
                if (star) {
                    if (i === 0) ctx.moveTo(star.x, star.y);
                    else ctx.lineTo(star.x, star.y);
                }
            });
        });
    }

    // ------------------------------------------------------------------
    // Meteor Logic
    // ------------------------------------------------------------------
    drawMeteors() {
        if (!this.mCtx) return;
        const ctx = this.mCtx;
        const w = this.meteorCanvas.width;
        const h = this.meteorCanvas.height;

        ctx.globalCompositeOperation = 'destination-out';
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, w, h);
        ctx.globalCompositeOperation = 'source-over';

        if (Math.random() < 0.08) {
            this.meteors.push({
                x: Math.random() * w,
                y: 0,
                vx: -5 - Math.random() * 5,
                vy: 5 + Math.random() * 5,
                size: 1 + Math.random(),
                color: Math.random() > 0.8 ? '#00F2FF' : '#BC13FE'
            });
        }

        this.meteors.forEach((m, i) => {
            m.x += m.vx;
            m.y += m.vy;

            // Meteor Head
            ctx.beginPath();
            ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
            ctx.fillStyle = m.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = m.color;
            ctx.fill();
            ctx.shadowBlur = 0;

            if (m.y > h || m.x < 0) {
                this.meteors.splice(i, 1);
            }
        });
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
}
