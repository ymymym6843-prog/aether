/**
 * AETHER Weather Animation Engine
 * Implements 9 weather states with Canvas particles
 * Based on WEATHER_ANIMATION_GUIDE.md specification
 */

export class WeatherEngine {
    constructor(canvasId = 'weatherCanvas') {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.warn(`Canvas #${canvasId} not found`);
            this.isValid = false;
            return;
        }
        this.isValid = true;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.currentState = 'clear';
        this.lastTime = performance.now();
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    // Start the animation loop (called from main.js)
    start() {
        if (!this.canvas || !this.isValid) {
            console.warn('WeatherEngine: Cannot start - canvas not available');
            return;
        }
        // Reset timing and begin the loop
        this.lastTime = performance.now();
        this.loop();
    }

    resize() {
        if (!this.canvas || !this.isValid) return;
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        this.w = rect.width;
        this.h = rect.height;
    }

    loop(time = performance.now()) {
        if (!this.canvas || !this.isValid || !this.ctx) return;
        const dt = Math.min((time - this.lastTime) / 1000, 0.1);
        this.lastTime = time;
        this.ctx.clearRect(0, 0, this.w, this.h);
        this.particles = this.particles.filter(p => p.isAlive());
        this.particles.forEach(p => { p.update(dt); p.draw(this.ctx); });
        this.spawnParticles();
        requestAnimationFrame(t => this.loop(t));
    }
    spawnParticles() {
        const maxParticles = window.innerWidth < 768 ? 50 : 100;
        switch (this.currentState) {
            case 'rain':
                if (this.particles.length < 80) {
                    for (let i = 0; i < 3; i++) {
                        this.particles.push(new RainParticle(Math.random() * this.w, -10, this.h));
                    }
                }
                break;
            case 'snow':
                if (this.particles.length < 60) {
                    for (let i = 0; i < 2; i++) {
                        this.particles.push(new SnowParticle(Math.random() * this.w, -10, this.h));
                    }
                }
                break;
            case 'thunder':
                if (this.particles.length < 80) {
                    for (let i = 0; i < 3; i++) {
                        this.particles.push(new RainParticle(Math.random() * this.w, -10, this.h));
                    }
                }
                if (Math.random() > 0.98) this.particles.push(new LightningFlash(this.w, this.h));
                break;
            case 'mist':
                if (this.particles.length < 40) {
                    this.particles.push(new MistParticle(Math.random() * this.w, Math.random() * this.h, this.w));
                }
                break;
            case 'sleet':
                if (this.particles.length < 70) {
                    if (Math.random() > 0.5) {
                        this.particles.push(new RainParticle(Math.random() * this.w, -10, this.h));
                    } else {
                        this.particles.push(new SleetParticle(Math.random() * this.w, -10, this.h));
                    }
                }
                break;
            case 'wind':
                if (this.particles.length < 30) {
                    this.particles.push(new WindParticle(-50, Math.random() * this.h, this.w));
                }
                break;
            case 'clouds':
                if (this.particles.length < 8) {
                    this.particles.push(new CloudParticle(Math.random() * this.w, 20 + Math.random() * (this.h * 0.3), this.w));
                }
                break;
            case 'clear':
                if (this.particles.length < 40) {
                    this.particles.push(new StarParticle(Math.random() * this.w, Math.random() * this.h));
                }
                break;
        }
    }
    setWeatherState(state) {
        if (state === this.currentState) return;
        console.log(`Weather state: ${this.currentState} → ${state}`);
        this.currentState = state.toLowerCase();
        this.particles = [];
        document.body.classList.remove(
            'weather-clear', 'weather-clouds', 'weather-rain', 'weather-snow', 'weather-thunder', 'weather-mist', 'weather-wind', 'weather-sleet', 'weather-default'
        );
        document.body.classList.add(`weather-${this.currentState}`);
        switch (this.currentState) {
            case 'clear': this.createClearParticles(); break;
            case 'clouds': this.createCloudParticles(); break;
            case 'wind': this.createWindParticles(); break;
        }
    }
    createClearParticles() { for (let i = 0; i < 40; i++) this.particles.push(new StarParticle(Math.random() * this.w, Math.random() * this.h)); }
    createCloudParticles() { for (let i = 0; i < 8; i++) this.particles.push(new CloudParticle(Math.random() * this.w, 20 + Math.random() * (this.h * 0.3), this.w)); }
    createWindParticles() { for (let i = 0; i < 30; i++) this.particles.push(new WindParticle(-50, Math.random() * this.h, this.w)); }
}

class Particle { constructor() { this.life = 1; this.maxLife = 1; } isAlive() { return this.life > 0; } update(dt) { this.life -= dt; } draw(ctx) { } }
class StarParticle extends Particle { constructor(x, y) { super(); this.x = x; this.y = y; this.size = 0.5 + Math.random() * 1.5; this.life = Infinity; this.twinkleSpeed = 1 + Math.random() * 2; this.phase = Math.random() * Math.PI * 2; } update(dt) { this.phase += dt * this.twinkleSpeed; } draw(ctx) { const opacity = 0.5 + Math.sin(this.phase) * 0.5; ctx.fillStyle = `rgba(255,255,255,${opacity})`; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); } }
class RainParticle extends Particle { constructor(x, y, maxHeight) { super(); this.x = x; this.y = y; this.vy = 300 + Math.random() * 200; this.length = 10 + Math.random() * 5; this.life = 10; this.maxHeight = maxHeight; } update(dt) { this.y += this.vy * dt; if (this.y > this.maxHeight + 20) this.life = 0; } draw(ctx) { ctx.strokeStyle = 'rgba(180,200,255,0.6)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(this.x, this.y); ctx.lineTo(this.x - 3, this.y + this.length); ctx.stroke(); } }
class SnowParticle extends Particle { constructor(x, y, maxHeight) { super(); this.x = x; this.y = y; this.vy = 50 + Math.random() * 30; this.size = 2 + Math.random() * 3; this.life = 20; this.maxHeight = maxHeight; this.swayAngle = Math.random() * Math.PI * 2; this.swaySpeed = 1 + Math.random(); } update(dt) { this.swayAngle += dt * this.swaySpeed; this.x += Math.sin(this.swayAngle) * 0.5; this.y += this.vy * dt; if (this.y > this.maxHeight + 20) this.life = 0; } draw(ctx) { ctx.fillStyle = 'rgba(255,255,255,0.9)'; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); } }
class SleetParticle extends Particle { constructor(x, y, maxHeight) { super(); this.x = x; this.y = y; this.vy = 200 + Math.random() * 100; this.vx = (Math.random() - 0.5) * 20; this.size = 1.5 + Math.random(); this.life = 10; this.maxHeight = maxHeight; this.bounced = false; } update(dt) { this.x += this.vx * dt; this.y += this.vy * dt; if (this.y > this.maxHeight && !this.bounced) { this.vy *= -0.5; this.vx *= 0.7; this.bounced = true; } if (this.y > this.maxHeight + 50 || this.bounced) { this.life -= dt * 2; } } draw(ctx) { ctx.fillStyle = `rgba(200,220,255,${Math.min(this.life / 5, 0.8)})`; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); } }
class CloudParticle extends Particle { constructor(x, y, maxWidth) { super(); this.x = x; this.y = y; this.vx = 10 + Math.random() * 20; this.radius = 30 + Math.random() * 40; this.opacity = 0.2 + Math.random() * 0.3; this.life = Infinity; this.maxWidth = maxWidth; } update(dt) { this.x += this.vx * dt; if (this.x > this.maxWidth + this.radius * 2) this.x = -this.radius * 2; } draw(ctx) { const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius); grad.addColorStop(0, `rgba(200,220,255,${this.opacity})`); grad.addColorStop(1, 'rgba(200,220,255,0)'); ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fill(); } }
class MistParticle extends Particle { constructor(x, y, maxWidth) { super(); this.x = x; this.y = y; this.vx = 5 + Math.random() * 10; this.radius = 40 + Math.random() * 60; this.opacity = 0.1 + Math.random() * 0.2; this.life = 20 + Math.random() * 10; this.maxWidth = maxWidth; } update(dt) { this.x += this.vx * dt; this.life -= dt; if (this.x > this.maxWidth + this.radius * 2) this.life = 0; } draw(ctx) { const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius); const alpha = this.opacity * (this.life / 30); grad.addColorStop(0, `rgba(150,150,150,${alpha})`); grad.addColorStop(1, 'rgba(150,150,150,0)'); ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fill(); } }
class WindParticle extends Particle { constructor(x, y, maxWidth) { super(); this.x = x; this.y = y; this.vx = 200 + Math.random() * 100; this.length = 30 + Math.random() * 40; this.life = 10; this.maxWidth = maxWidth; } update(dt) { this.x += this.vx * dt; if (this.x > this.maxWidth + this.length) this.life = 0; } draw(ctx) { ctx.strokeStyle = 'rgba(120,200,255,0.15)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(this.x, this.y); ctx.lineTo(this.x + this.length, this.y); ctx.stroke(); } }
class LightningFlash extends Particle { constructor(w, h) { super(); this.w = w; this.h = h; this.life = 0.2; this.maxLife = 0.2; } draw(ctx) { const alpha = this.life / this.maxLife; ctx.fillStyle = `rgba(255,255,255,${alpha * 0.3})`; ctx.fillRect(0, 0, this.w, this.h); } }
