export const SkyViewRenderer = {
    // ------------------------------------------------------------------
    // Data for constellations
    // ------------------------------------------------------------------
    constellations: [
        { name: 'Capricorn', start: '12-22', end: '01-19', points: [{ x: -20, y: -20 }, { x: 0, y: 0 }, { x: 20, y: 20 }, { x: 10, y: -10 }] },
        { name: 'Aquarius', start: '01-20', end: '02-18', points: [{ x: -30, y: -10 }, { x: -10, y: 0 }, { x: 10, y: -10 }, { x: 30, y: 0 }] },
        { name: 'Pisces', start: '02-19', end: '03-20', points: [{ x: -20, y: 10 }, { x: 0, y: -20 }, { x: 20, y: 10 }] },
        { name: 'Aries', start: '03-21', end: '04-19', points: [{ x: -20, y: 0 }, { x: 0, y: -20 }, { x: 20, y: 0 }] },
        { name: 'Taurus', start: '04-20', end: '05-20', points: [{ x: -20, y: -10 }, { x: 0, y: 10 }, { x: 20, y: -10 }, { x: 0, y: -20 }] },
        { name: 'Gemini', start: '05-21', end: '06-20', points: [{ x: -10, y: -20 }, { x: -10, y: 20 }, { x: 10, y: -20 }, { x: 10, y: 20 }] },
        { name: 'Cancer', start: '06-21', end: '07-22', points: [{ x: 0, y: 0 }, { x: -10, y: 10 }, { x: 10, y: 10 }, { x: -10, y: -10 }, { x: 10, y: -10 }] },
        { name: 'Leo', start: '07-23', end: '08-22', points: [{ x: -20, y: 0 }, { x: -10, y: 20 }, { x: 10, y: 10 }, { x: 20, y: -10 }, { x: 0, y: -20 }] },
        { name: 'Virgo', start: '08-23', end: '09-22', points: [{ x: -20, y: 20 }, { x: -10, y: 0 }, { x: 0, y: 20 }, { x: 10, y: 0 }, { x: 20, y: 20 }] },
        { name: 'Libra', start: '09-23', end: '10-22', points: [{ x: -20, y: 0 }, { x: 20, y: 0 }, { x: 0, y: -20 }, { x: 0, y: 10 }] },
        { name: 'Scorpio', start: '10-23', end: '11-21', points: [{ x: -20, y: -20 }, { x: -10, y: 0 }, { x: 0, y: 20 }, { x: 10, y: 0 }, { x: 20, y: -20 }] },
        { name: 'Sagittarius', start: '11-22', end: '12-21', points: [{ x: -20, y: 20 }, { x: 20, y: -20 }, { x: 0, y: 0 }, { x: -10, y: -10 }] }
    ],

    getZodiacSign() {
        const now = new Date();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const dateStr = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

        for (const sign of this.constellations) {
            // Handle Capricorn wrap-around
            if (sign.name === 'Capricorn') {
                if (dateStr >= '12-22' || dateStr <= '01-19') return sign;
            } else {
                if (dateStr >= sign.start && dateStr <= sign.end) return sign;
            }
        }
        return this.constellations[0]; // Fallback
    },

    meteors: [],

    init() {
        // 1. Constellation Canvas
        this.zCanvas = document.getElementById('zodiacCanvas');
        if (this.zCanvas) {
            this.zCtx = this.zCanvas.getContext('2d');
            this.resizeCanvas(this.zCanvas);
            this.initConstellations();
        }

        // 2. Meteor Canvas
        this.mCanvas = document.getElementById('meteorCanvas');
        if (this.mCanvas) {
            this.mCtx = this.mCanvas.getContext('2d');
            this.resizeCanvas(this.mCanvas);
        }

        // 3. Solar Arc (SVG)
        this.sunIcon = document.getElementById('sunIcon');
        this.sunriseEl = document.getElementById('sunriseTime');
        this.sunsetEl = document.getElementById('sunsetTime');

        // Handle Resize
        window.addEventListener('resize', () => {
            if (this.zCanvas) this.resizeCanvas(this.zCanvas);
            if (this.mCanvas) this.resizeCanvas(this.mCanvas);
        });

        // Start Animation Loop
        this.animate();
    },

    resizeCanvas(canvas) {
        const parent = canvas.parentElement;
        if (parent) {
            const rect = parent.getBoundingClientRect();
            canvas.width = rect.width;
            canvas.height = rect.height || 200; // Fallback height
        }
    },

    updateData(sky) {
        this.sky = sky;
        if (this.sunriseEl) this.sunriseEl.textContent = sky.sunrise || '--:--';
        if (this.sunsetEl) this.sunsetEl.textContent = sky.sunset || '--:--';

        const moonPhaseEl = document.getElementById('moonPhaseName');
        if (moonPhaseEl) moonPhaseEl.textContent = sky.moonPhase || '';

        this.updateSolarPosition();
    },

    updateSolarPosition() {
        if (!this.sky || !this.sunIcon) return;

        const { sunrise, sunset } = this.sky;
        const now = new Date();

        // Parse times (assuming HH:MM format)
        const [sh, sm] = sunrise.split(':').map(Number);
        const [eh, em] = sunset.split(':').map(Number);

        const sunriseDate = new Date();
        sunriseDate.setHours(sh, sm, 0, 0);

        const sunsetDate = new Date();
        sunsetDate.setHours(eh, em, 0, 0);

        let progress = (now - sunriseDate) / (sunsetDate - sunriseDate);
        progress = Math.max(0, Math.min(1, progress)); // Clamp 0-1

        // Calculate position on the arc
        // Arc is a semi-circle from (20,100) to (180,100)
        // Center (100, 100), Radius 80
        // Angle goes from PI (left) to 2*PI (right) - Wait, SVG coords are y-down.
        // Arc path: M 20 100 A 80 80 0 0 1 180 100
        // This is a semi-circle arching UPWARDS.
        // Angle: PI (at 20,100) -> 0 (at 180,100) ? No.
        // Parametric: x = cx + r * cos(a), y = cy + r * sin(a)
        // Start: x=20 -> cos(a)=-1 -> a=PI
        // End: x=180 -> cos(a)=1 -> a=0
        // So angle goes from PI to 0.

        const angle = Math.PI * (1 - progress); // PI -> 0
        const r = 80;
        const cx = 100;
        const cy = 100;

        const x = cx + r * Math.cos(angle); // cos(PI)=-1 -> 20, cos(0)=1 -> 180
        const y = cy - r * Math.sin(angle); // sin(PI)=0 -> 100, sin(PI/2)=1 -> 20

        this.sunIcon.setAttribute('cx', x);
        this.sunIcon.setAttribute('cy', y);
    },

    // ------------------------------------------------------------------
    // Constellation Logic
    // ------------------------------------------------------------------
    initConstellations() {
        // Dynamic Zodiac Selection
        this.activeConstellation = this.getZodiacSign();

        // Update UI Text
        const nameEl = document.getElementById('zodiacName');
        const descEl = document.getElementById('zodiacDesc');
        if (nameEl) nameEl.textContent = this.activeConstellation.name;
        if (descEl) descEl.textContent = `${this.activeConstellation.start} ~ ${this.activeConstellation.end}`;

        this.stars = this.activeConstellation.points.map(p => ({
            tx: p.x, ty: p.y, // Target relative to center
            x: (Math.random() - 0.5) * 200, // Random start
            y: (Math.random() - 0.5) * 200,
            size: Math.random() * 2 + 1,
            alpha: 0
        }));
        this.animPhase = 'scatter'; // scatter -> form -> connect
        this.animTime = 0;
    },

    drawConstellation() {
        if (!this.zCtx || !this.activeConstellation) return;

        const ctx = this.zCtx;
        const w = this.zCanvas.width;
        const h = this.zCanvas.height;
        const cx = w / 2;
        const cy = h / 2;

        ctx.clearRect(0, 0, w, h);

        // Update Phase
        this.animTime++;
        if (this.animPhase === 'scatter' && this.animTime > 50) {
            this.animPhase = 'form';
            this.animTime = 0;
        } else if (this.animPhase === 'form' && this.animTime > 100) {
            this.animPhase = 'connect';
        }

        // Draw Stars
        this.stars.forEach(s => {
            // Lerp to target
            if (this.animPhase === 'form' || this.animPhase === 'connect') {
                const targetX = cx + s.tx;
                const targetY = cy + s.ty;
                s.x += (targetX - s.x) * 0.05;
                s.y += (targetY - s.y) * 0.05;
                s.alpha += (1 - s.alpha) * 0.05;
            } else {
                s.alpha = Math.min(s.alpha + 0.01, 0.5);
            }

            ctx.beginPath();
            ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
            ctx.fill();
        });

        // Draw Lines
        if (this.animPhase === 'connect') {
            ctx.beginPath();
            ctx.strokeStyle = 'rgba(0, 242, 255, 0.3)';
            ctx.lineWidth = 1;
            this.stars.forEach((s, i) => {
                if (i === 0) ctx.moveTo(s.x, s.y);
                else ctx.lineTo(s.x, s.y);
            });
            ctx.stroke();
        }
    },

    // ------------------------------------------------------------------
    // Meteor Logic
    // ------------------------------------------------------------------
    drawMeteors() {
        if (!this.mCtx) return;
        const ctx = this.mCtx;
        const w = this.mCanvas.width;
        const h = this.mCanvas.height;

        // Fade trail
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(0, 0, w, h);

        // Spawn
        if (Math.random() < 0.05) {
            this.meteors.push({
                x: Math.random() * w,
                y: 0,
                vx: (Math.random() - 0.5) * 2,
                vy: Math.random() * 5 + 5,
                size: Math.random() * 2 + 1,
                life: 100
            });
        }

        // Update & Draw
        this.meteors.forEach((m, i) => {
            m.x += m.vx;
            m.y += m.vy;
            m.life--;

            ctx.beginPath();
            ctx.arc(m.x, m.y, m.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(188, 19, 254, ${m.life / 100})`; // Neon Purple
            ctx.fill();

            if (m.life <= 0) this.meteors.splice(i, 1);
        });
    },

    animate() {
        this.drawConstellation();
        this.drawMeteors();
        requestAnimationFrame(() => this.animate());
    }
};
