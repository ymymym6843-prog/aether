import { apiService } from './api/apiService.js';
import { WeatherEngine } from './engine/WeatherEngine.js';
import { DomRenderer } from './ui/DomRenderer.js';
import { SkyViewRenderer } from './ui/SkyViewRenderer.js';

class AetherApp {
    constructor() {
        this.state = {
            currentCity: 'Seoul',
            currentTab: 'today',
            weatherData: null,
            favorites: [],
            dataSource: 'mock',
            locationLabel: 'Manual'
        };

        this.weatherEngine = new WeatherEngine('weatherCanvas');
        this.skyRenderer = new SkyViewRenderer();

        this.init();
    }

    async init() {
        try {
            this.loadFavorites();
            this.bindEvents();
            await this.loadWeatherData(this.state.currentCity, { method: 'initial', label: 'Preset • Seoul' });
            this.weatherEngine.start();
            this.skyRenderer.init();
        } catch (error) {
            console.error('Critical Initialization Error:', error);
            this.showToast('Failed to initialize application');
        }
    }

    loadFavorites() {
        const stored = localStorage.getItem('aether_favorites');
        if (stored) {
            this.state.favorites = JSON.parse(stored);
        }
    }

    saveFavorites() {
        localStorage.setItem('aether_favorites', JSON.stringify(this.state.favorites));
        this.renderFavorites();
    }

    bindEvents() {
        // Tab Switching
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Handle SVG click bubbling
                const target = e.target.closest('.nav-btn');
                const tab = target.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Search
        const searchBtn = document.getElementById('searchBtn');
        const searchInput = document.getElementById('citySearch');

        const handleSearch = () => {
            const city = searchInput.value.trim();
            if (city) {
                this.loadWeatherData(city, { method: 'search', label: `Search • ${city}` });
                searchInput.value = '';
                // Switch to today tab on search
                this.switchTab('today');
            }
        };

        searchBtn.addEventListener('click', handleSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSearch();
        });

        // GPS Button
        document.getElementById('gpsBtn').addEventListener('click', () => {
            if (!navigator.geolocation) {
                this.showToast('Geolocation not supported');
                this.updateLocationLabel('GPS unavailable');
                return;
            }

            this.showToast('Locating...');
            navigator.geolocation.getCurrentPosition(
                ({ coords }) => {
                    this.loadWeatherByCoords(coords.latitude, coords.longitude);
                },
                () => {
                    this.showToast('Location blocked');
                    this.updateLocationLabel('GPS blocked');
                },
                { enableHighAccuracy: true, timeout: 7000, maximumAge: 0 }
            );
        });

        // Favorites Toggle
        document.getElementById('favBtn').addEventListener('click', () => {
            this.toggleFavorite();
        });
    }

    switchTab(tabName) {
        // Update State
        this.state.currentTab = tabName;

        // UI Updates
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        document.querySelectorAll('.tab-section').forEach(section => {
            section.classList.remove('active');
            if (section.id === `tab-${tabName}`) {
                section.classList.add('active');
            }
        });

        // Trigger Tab Specific Renders
        if (tabName === 'skyview') {
            // Force resize calculation when tab becomes visible
            this.skyRenderer.resize();
        } else if (tabName === 'favorites') {
            this.renderFavorites();
        }
    }

    async loadWeatherData(city, meta = { method: 'search' }) {
        try {
            const data = await apiService.getWeather(city);
            this.applyWeatherData(data, { ...meta, fallbackCity: city });
        } catch (error) {
            console.error('Failed to load weather:', error);
            this.showToast('City not found');
        }
    }

    async loadWeatherByCoords(lat, lon) {
        try {
            const data = await apiService.getWeatherByCoords(lat, lon);
            const locationLabel = data.name ? `GPS • ${data.name}` : 'GPS fix';
            this.applyWeatherData(data, { method: 'gps', label: locationLabel });
            this.switchTab('today');
        } catch (error) {
            console.error('Failed to load GPS weather:', error);
            this.showToast('Unable to fetch location weather');
        }
    }

    applyWeatherData(data, meta) {
        this.state.weatherData = data;
        this.state.currentCity = data.name || meta?.fallbackCity || this.state.currentCity;
        this.state.dataSource = data.dataSource || 'mock';

        const usingMockFallback = data.meta?.fallbackReason && data.dataSource === 'mock';
        const labelBase = meta?.label || (meta?.method === 'gps' ? 'GPS' : 'Manual');
        this.state.locationLabel = usingMockFallback && labelBase ? `${labelBase} • Mock` : labelBase;

        if (usingMockFallback) {
            this.showToast(data.meta.fallbackReason);
        }

        DomRenderer.renderDashboardInfo(this.state.currentCity, data.timezone ?? 32400);
        DomRenderer.renderCurrent(data);
        DomRenderer.renderForecasts(data.forecast);
        DomRenderer.renderAQI(data.aqi);
        DomRenderer.renderLifestyle(data.lifestyle);
        DomRenderer.renderHighlights(data.highlights);
        DomRenderer.renderWeatherMap(data.current);

        const engineState = this.mapConditionToState(data.current.condition, data.current.clouds);
        this.weatherEngine.setWeatherState(engineState);
        this.skyRenderer.updateData(data.sky);

        this.updateFavBtnState();
        this.updateDataBadges();
    }

    toggleFavorite() {
        if (!this.state.weatherData) return;

        const city = this.state.currentCity;
        const existsIndex = this.state.favorites.findIndex(f => f.name === city);

        if (existsIndex >= 0) {
            this.state.favorites.splice(existsIndex, 1);
            this.showToast(`Removed ${city} from Favorites`);
        } else {
            // Add minimal data for card
            this.state.favorites.push({
                name: city,
                temp: this.state.weatherData.current.temp,
                high: this.state.weatherData.current.high,
                low: this.state.weatherData.current.low,
                condition: this.state.weatherData.current.condition,
                icon: document.getElementById('mainWeatherIcon').textContent // Grab rendered icon
            });
            this.showToast(`Added ${city} to Favorites`);
        }

        this.saveFavorites();
        this.updateFavBtnState();
    }

    updateFavBtnState() {
        const btn = document.getElementById('favBtn');
        const isFav = this.state.favorites.some(f => f.name === this.state.currentCity);

        if (isFav) {
            btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="#00F2FF" stroke="#00F2FF" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
        } else {
            btn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>`;
        }
    }

    updateDataBadges() {
        const sourceBadge = document.getElementById('dataSourceBadge');
        if (sourceBadge) {
            const isLive = this.state.dataSource === 'live';
            sourceBadge.textContent = isLive ? 'Live API' : 'Mock Data';
            sourceBadge.classList.toggle('pill-live', isLive);
            sourceBadge.classList.toggle('pill-mock', !isLive);
        }

        this.updateLocationLabel(this.state.locationLabel);
    }

    updateLocationLabel(label) {
        this.state.locationLabel = label;
        const badge = document.getElementById('locationStatus');
        if (badge) {
            badge.textContent = label;
        }
    }

    renderFavorites() {
        const container = document.getElementById('favoritesList');
        if (this.state.favorites.length === 0) {
            container.innerHTML = '<div style="text-align:center; color:#666; margin-top:50px;">No favorites added yet.</div>';
            return;
        }

        container.innerHTML = this.state.favorites.map(city => `
            <div class="fav-card" onclick="window.app.loadFavorite('${city.name}')">
                <button class="fav-delete" onclick="event.stopPropagation(); window.app.removeFavorite('${city.name}')">×</button>
                <div class="fav-card-content">
                    <div class="fav-info">
                        <span class="fav-city">${city.name}</span>
                        <span class="fav-temp-hl"><span class="temp-high">H:${city.high}°</span> <span class="temp-low">L:${city.low}°</span></span>
                    </div>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <span style="font-size:2rem">${city.icon}</span>
                        <span class="fav-temp-main">${city.temp}°</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    loadFavorite(city) {
        this.loadWeatherData(city, { method: 'favorite', label: `Favorite • ${city}` });
        this.switchTab('today');
    }

    removeFavorite(city) {
        const index = this.state.favorites.findIndex(f => f.name === city);
        if (index >= 0) {
            this.state.favorites.splice(index, 1);
            this.saveFavorites();
            // If current city is removed, update button state
            if (this.state.currentCity === city) {
                this.updateFavBtnState();
            }
            this.renderFavorites();
        }
    }

    mapConditionToState(condition, clouds = 0) {
        const normalized = (condition || '').toLowerCase();
        const map = {
            'clear': 'clear',
            'sunny': 'clear',
            'clouds': 'clouds',
            'few clouds': 'clouds',
            'scattered clouds': 'clouds',
            'broken clouds': 'clouds',
            'overcast clouds': 'clouds',
            'rain': 'rain',
            'drizzle': 'rain',
            'thunderstorm': 'thunder',
            'snow': 'snow',
            'mist': 'mist',
            'fog': 'mist',
            'haze': 'mist',
            'smoke': 'mist',
            'dust': 'mist',
            'squall': 'wind',
            'tornado': 'wind'
        };

        const fallback = map[normalized];
        if (fallback) return fallback;

        // Use cloud cover as a heuristic if condition string is unknown
        if (clouds >= 60) return 'clouds';
        if (clouds <= 15) return 'clear';

        return 'default';
    }
    showToast(msg) {
        // Create toast element
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 242, 255, 0.2);
            backdrop-filter: blur(10px);
            border: 1px solid #00F2FF;
            color: #fff;
            padding: 10px 20px;
            border-radius: 20px;
            z-index: 1000;
            animation: fadeIn 0.3s ease;
        `;
        toast.textContent = msg;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AetherApp();
});
