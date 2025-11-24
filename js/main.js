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
            favorites: []
        };

        this.weatherEngine = new WeatherEngine('weatherCanvas');
        this.skyRenderer = SkyViewRenderer;

        this.init();
    }

    async init() {
        this.loadFavorites();
        this.bindEvents();
        await this.loadWeatherData(this.state.currentCity);
        this.weatherEngine.start();
        this.skyRenderer.init();
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
                this.loadWeatherData(city);
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
            this.showToast('Locating...');
            setTimeout(() => {
                this.loadWeatherData('Jeju');
            }, 1000);
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
            this.skyRenderer.animate();
        } else if (tabName === 'favorites') {
            this.renderFavorites();
        }
    }

    async loadWeatherData(city) {
        try {
            const data = await apiService.getWeather(city);
            this.state.weatherData = data;
            this.state.currentCity = data.name || city; // Use returned name if available

            // Render UI
            DomRenderer.renderDashboardInfo(this.state.currentCity, data.timezone);
            DomRenderer.renderCurrent(data);
            DomRenderer.renderForecasts(data.forecast);
            DomRenderer.renderAQI(data.aqi);
            DomRenderer.renderLifestyle(data.lifestyle);
            DomRenderer.renderHighlights(data.highlights);

            // Update Engine
            this.weatherEngine.setWeatherState(data.current.condition);

            // Update SkyView Data
            this.skyRenderer.updateData(data.sky);

            // Update Favorite Button State
            this.updateFavBtnState();

        } catch (error) {
            console.error('Failed to load weather:', error);
            this.showToast('City not found');
        }
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
                        <span class="fav-temp-hl">H:${city.high}° L:${city.low}°</span>
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
        this.loadWeatherData(city);
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
        }
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
