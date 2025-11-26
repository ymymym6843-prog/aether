export const DomRenderer = {
    renderDashboardInfo(city, timezoneOffset) {
        // Update City Name
        const cityEl = document.getElementById('dashboardCity');
        if (cityEl) cityEl.textContent = city;

        // Calculate City Local Time
        // timezoneOffset is in seconds (e.g., 32400 for KST)
        const now = new Date();
        const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
        const cityTime = new Date(utcTime + (timezoneOffset * 1000));

        const dateStr = cityTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        const timeStr = cityTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

        const dateEl = document.getElementById('dashboardDate');
        if (dateEl) dateEl.textContent = `${dateStr} • ${timeStr}`;
    },

    renderCurrent(data) {
        document.getElementById('currentTemp').textContent = `${data.current.temp}°`;

        // Color Coded H/L
        document.getElementById('maxTemp').textContent = data.current.high;
        document.getElementById('maxTemp').className = 'temp-high';

        document.getElementById('minTemp').textContent = data.current.low;
        document.getElementById('minTemp').className = 'temp-low';

        document.getElementById('weatherDesc').textContent = data.current.desc;

        // Icon Logic
        const iconMap = {
            'Clear': '☀️',
            'Rain': '🌧️',
            'Drizzle': '🌧️',
            'Clouds': '☁️',
            'Snow': '❄️',
            'Thunderstorm': '⛈️',
            'Mist': '🌫️',
            'Fog': '🌫️',
            'Haze': '🌫️'
        };
        document.getElementById('mainWeatherIcon').textContent = iconMap[data.current.condition] || '🌤️';

        // Precip Alert
        const precip = document.getElementById('precipAlert');
        const chance = data.current.precipChance;
        const precipType = data.current.precipType || (data.current.condition === 'Snow' ? 'snow' : null);
        const shouldShow = (chance != null && chance >= 30) || ['Rain', 'Thunderstorm', 'Drizzle', 'Snow'].includes(data.current.condition);

        if (shouldShow) {
            const iconEl = precip.querySelector('.icon');
            const textEl = precip.querySelector('.text');
            const isSnow = precipType === 'snow';
            const label = isSnow ? 'Snow' : 'Rain';
            iconEl.textContent = isSnow ? '❄️' : '☔';
            textEl.textContent = chance != null ? `${label} chance ${chance}%` : `${label} expected`;
            precip.classList.remove('hidden');
        } else {
            precip.classList.add('hidden');
        }
    },

    renderWeatherMap(current) {
        const map = document.getElementById('miniMap');
        if (!map) return;

        const cloudLayer = map.querySelector('.cloud-blobs');
        const windLayer = map.querySelector('.wind-lines');
        const precipLayer = map.querySelector('.precip-particles');

        const cloudiness = current.clouds ?? 0;
        const windSpeed = current.wind?.speed ?? 0;
        const windDir = current.wind?.deg ?? 0;
        const precipChance = current.precipChance ?? 0;
        const precipType = current.precipType;

        if (cloudLayer) {
            cloudLayer.innerHTML = '';
            const cloudCount = Math.min(6, Math.max(0, Math.round(cloudiness / 20)));
            for (let i = 0; i < cloudCount; i++) {
                const blob = document.createElement('span');
                blob.className = 'cloud';
                blob.style.left = `${Math.random() * 80}%`;
                blob.style.top = `${Math.random() * 60}%`;
                blob.style.animationDelay = `${Math.random() * 5}s`;
                blob.style.opacity = 0.2 + Math.random() * 0.3;
                cloudLayer.appendChild(blob);
            }
        }

        if (windLayer) {
            windLayer.innerHTML = '';
            const lineCount = windSpeed > 0 ? Math.min(12, Math.max(4, Math.round(windSpeed * 1.5))) : 3;
            for (let i = 0; i < lineCount; i++) {
                const line = document.createElement('span');
                line.className = 'wind-line';
                line.style.top = `${Math.random() * 90}%`;
                line.style.animationDelay = `${Math.random() * 3}s`;
                line.style.transform = `rotate(${windDir}deg)`;
                windLayer.appendChild(line);
            }
        }

        if (precipLayer) {
            precipLayer.innerHTML = '';
            const showPrecip = precipChance >= 20 || ['rain', 'snow'].includes(precipType);
            if (showPrecip) {
                const dropCount = Math.min(60, Math.max(10, Math.round((precipChance || 30) / 2)));
                for (let i = 0; i < dropCount; i++) {
                    const drop = document.createElement('span');
                    drop.className = `drop ${precipType === 'snow' ? 'snow' : ''}`;
                    drop.style.left = `${Math.random() * 100}%`;
                    drop.style.animationDelay = `${Math.random() * 1.5}s`;
                    drop.style.animationDuration = `${1.4 + Math.random() * 1}s`;
                    precipLayer.appendChild(drop);
                }
            }
        }
    },

    renderForecasts(forecast) {
        // Hourly
        const hourlyContainer = document.getElementById('hourlyGrid');
        hourlyContainer.innerHTML = forecast.hourly.map(h => `
            <div class="hourly-item">
                <span style="font-size:0.8rem; color:#aaa">${h.time}</span>
                <span style="font-size:1.5rem">${h.icon}</span>
                <span style="font-weight:bold">${h.temp}°</span>
            </div>
        `).join('');

        // Daily List (Equal Spacing via CSS Grid)
        const dailyContainer = document.getElementById('dailyList');
        dailyContainer.innerHTML = forecast.daily.map(d => `
            <div class="daily-item">
                <span>${d.day}</span>
                <span>${d.icon}</span>
                <span style="color:#00F2FF; font-size:0.8rem">💧${d.precip}%</span>
                <div>
                    <span class="temp-high">${d.high}°</span>
                    <span style="color:#666"> / </span>
                    <span class="temp-low">${d.low}°</span>
                </div>
            </div>
        `).join('');

        this.renderTrendChart(forecast.daily);
    },

    renderTrendChart(daily) {
        const canvas = document.getElementById('trendChart');
        const ctx = canvas.getContext('2d');
        // Ensure accurate width from parent
        const w = canvas.width = canvas.parentElement.clientWidth;
        const h = canvas.height;

        ctx.clearRect(0, 0, w, h);

        // Gradient Line
        const grad = ctx.createLinearGradient(0, 0, w, 0);
        grad.addColorStop(0, '#00F2FF');
        grad.addColorStop(1, '#BC13FE');

        // Draw High Temp Line
        ctx.beginPath();
        const step = w / (daily.length - 1);
        const maxTemp = Math.max(...daily.map(d => d.high)) + 5;
        const minTemp = Math.min(...daily.map(d => d.high)) - 5;
        const range = maxTemp - minTemp;

        daily.forEach((d, i) => {
            const x = i * step;
            const y = h - ((d.high - minTemp) / range) * h;

            // Padding for points
            const px = Math.min(Math.max(x, 5), w - 5);

            if (i === 0) ctx.moveTo(px, y);
            else ctx.lineTo(px, y);

            // Point
            ctx.fillStyle = '#fff';
            ctx.fillRect(px - 2, y - 2, 4, 4);
        });

        ctx.strokeStyle = grad;
        ctx.lineWidth = 3;
        ctx.stroke();
    },

    renderAQI(aqi) {
        document.getElementById('aqiScore').textContent = aqi.score;
        document.getElementById('aqiStatus').textContent = aqi.status;

        // Ring Chart Animation
        const ring = document.getElementById('aqiRing');
        const circumference = 2 * Math.PI * 15.9155;
        const offset = circumference - (aqi.score / 100) * circumference;
        ring.style.strokeDasharray = `${circumference} ${circumference}`;
        ring.style.strokeDashoffset = offset;

        // Details
        const details = document.getElementById('aqiDetails');
        details.innerHTML = Object.entries(aqi.details).map(([k, v]) => `
            <div class="aqi-item">
                <span class="aqi-name">${k.toUpperCase()}</span>
                <span class="aqi-val">${v}</span>
            </div>
        `).join('');
    },

    renderLifestyle(ls) {
        const grid = document.getElementById('lifestyleGrid');
        // Minimal Neon Icons (SVG or Unicode)
        const items = [
            { icon: '⚡', label: 'Run', val: ls.running.val },
            { icon: '☂️', label: 'Umbrella', val: ls.umbrella.val },
            { icon: '🚗', label: 'Drive', val: ls.driving.val },
            { icon: '👕', label: 'Laundry', val: ls.laundry.val }
        ];

        grid.innerHTML = items.map(i => `
            <div class="lifestyle-item">
                <span class="ls-icon" style="text-shadow: 0 0 10px var(--neon-cyan)">${i.icon}</span>
                <span class="ls-label">${i.label}</span>
                <span style="font-weight:bold; color:${i.val > 8 ? '#00F2FF' : '#fff'}">${i.val}/10</span>
            </div>
        `).join('');

        const outfit = document.getElementById('outfitGuide');
        outfit.innerHTML = `
            <span style="font-size:2rem; filter: drop-shadow(0 0 5px var(--neon-purple))">${ls.outfit.icon}</span>
            <div>
                <div style="font-size:0.8rem; color:#aaa">OUTFIT GUIDE</div>
                <div style="font-size:0.9rem">${ls.outfit.text}</div>
            </div>
        `;
    },

    renderHighlights(hl) {
        const container = document.getElementById('cityHighlights');

        // Render Domestic
        const domesticHTML = hl.domestic.map(c => this.createHighlightCard(c)).join('');

        // Render Global (Mock Data)
        const globalHTML = hl.global.map(c => this.createHighlightCard(c)).join('');

        container.innerHTML = `
            <div style="grid-column: span 2; font-size: 0.8rem; color: #aaa; margin-top: 5px;">Domestic</div>
            ${domesticHTML}
            <div style="grid-column: span 2; font-size: 0.8rem; color: #aaa; margin-top: 10px;">Global</div>
            ${globalHTML}
        `;
    },

    createHighlightCard(c) {
        return `
            <div class="city-card">
                <div>
                    <div style="font-weight:bold">${c.name}</div>
                    <div style="font-size:0.8rem; color:#aaa">
                        <span class="temp-high">H:${c.high}</span> 
                        <span class="temp-low">L:${c.low}</span>
                    </div>
                </div>
                <div style="text-align:right">
                    <div style="font-size:1.2rem">${c.icon}</div>
                    <div style="font-weight:bold">${c.temp}°</div>
                </div>
            </div>
        `;
    }
};
