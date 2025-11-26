import { mockData } from '../data/mockData.js';

// City timezone offsets (in seconds from UTC)
const cityTimezones = {
    'Seoul': 32400,      // UTC+9
    'Busan': 32400,      // UTC+9
    'Daegu': 32400,      // UTC+9
    'Incheon': 32400,    // UTC+9
    'Gwangju': 32400,    // UTC+9
    'Jeju': 32400,       // UTC+9
    'Tokyo': 32400,      // UTC+9
    'New York': -18000,  // UTC-5
    'London': 0,         // UTC+0
    'Paris': 3600,       // UTC+1
    'Sydney': 39600      // UTC+11
};

// 🔴 CONFIGURATION: Provide your OpenWeatherMap API key at runtime to avoid committing secrets.
// 1) Set window.AETHER_API_KEY in a separate config script injected before this bundle, or
// 2) Serve this file via a build step that injects the key from environment variables.
const API_KEY = (typeof window !== 'undefined' && window.AETHER_API_KEY) ? String(window.AETHER_API_KEY) : '';
const hasApiKey = API_KEY && API_KEY.length > 10;

export const apiService = {
    async getWeather(city) {
        // 1. Try Real API if Key is present
        if (hasApiKey) {
            try {
                return await this.fetchRealWeather(city);
            } catch (error) {
                console.warn("Real API failed/invalid, falling back to mock data.", error);
                return this.getMockWeather(city, { fallbackReason: 'Live API unavailable' });
            }
        }

        return this.getMockWeather(city, { fallbackReason: 'No API key configured' });
    },

    async getWeatherByCoords(lat, lon) {
        if (API_KEY && API_KEY.length > 10) {
            try {
                return await this.fetchRealWeatherByCoords(lat, lon);
            } catch (error) {
                console.warn("Real API by coords failed/invalid, falling back to mock data.", error);
                return this.getMockWeather('Seoul', { fallbackReason: 'GPS fallback to mock', coords: { lat, lon } });
            }
        }

        return this.getMockWeather('Seoul', { fallbackReason: 'No API key configured', coords: { lat, lon } });
    },

    async fetchRealWeather(city) {
        console.log(`Fetching real weather for ${city}...`);

        // A. Current Weather
        const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`;
        const currentRes = await fetch(currentUrl);
        if (!currentRes.ok) throw new Error('City not found');
        const current = await currentRes.json();

        // B. Forecast (5 Day / 3 Hour)
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`;
        const forecastRes = await fetch(forecastUrl);
        const forecastData = forecastRes.ok ? await forecastRes.json() : { list: [] };

        // Pass city to mapData for timezone handling
        return this.mapData(current, forecastData, city, current.timezone, current.coord);
    },

    async fetchRealWeatherByCoords(lat, lon) {
        console.log(`Fetching real weather for coords ${lat},${lon}...`);

        const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
        const currentRes = await fetch(currentUrl);
        if (!currentRes.ok) throw new Error('Coordinates not found');
        const current = await currentRes.json();

        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
        const forecastRes = await fetch(forecastUrl);
        const forecastData = await forecastRes.json();

        const cityName = current.name || 'Current Location';
        return this.mapData(current, forecastData, cityName, current.timezone, { lat, lon });
    },

    getMockWeather(city, meta = {}) {
        // Fallback to Mock Data (Simulation)
        return new Promise(resolve => {
            setTimeout(() => {
                const cityKey = Object.keys(mockData.cities).find(
                    k => k.toLowerCase() === city.toLowerCase()
                );
                const resolvedCity = cityKey || 'Seoul';
                const payload = mockData.cities[resolvedCity];
                resolve({
                    ...payload,
                    name: resolvedCity,
                    timezone: cityTimezones[resolvedCity] || 32400,
                    dataSource: 'mock',
                    meta: {
                        ...meta,
                        requested: meta?.requested || city
                    }
                });
            }, 600);
        });
    },

    mapData(current, forecast, city, timezoneOverride, coords) {
        // Adapter: Convert OpenWeatherMap response to AETHER App Schema

        const timezone = timezoneOverride ?? current.timezone ?? cityTimezones[city] ?? 32400;
        const sunrise = this.formatTime(current.sys?.sunrise, timezone);
        const sunset = this.formatTime(current.sys?.sunset, timezone);
        const moonPhase = this.calculateMoonPhase(new Date());

        const forecastList = forecast?.list ?? [];
        const firstPeriod = forecastList[0];
        const precipChance = firstPeriod?.pop != null ? Math.round(firstPeriod.pop * 100) : null;
        const precipVolume = (current.rain?.['1h'] ?? current.snow?.['1h']) || null;
        const precipType = this.resolvePrecipType(current.weather?.[0]?.main, precipVolume);

        // Calculate High/Low for today based on forecast segments
        const todaySegments = forecastList.slice(0, 8);
        const hasSegments = todaySegments.length > 0;
        const todayHigh = hasSegments ? Math.max(...todaySegments.map(i => i.main.temp_max)) : Math.round(current.main.temp);
        const todayLow = hasSegments ? Math.min(...todaySegments.map(i => i.main.temp_min)) : Math.round(current.main.temp);

        const fallbackForecast = mockData.cities['Seoul'].forecast;
        const hourlyForecast = hasSegments
            ? forecastList.slice(0, 8).map(item => ({
                time: new Date(item.dt * 1000).getHours() + 'H',
                temp: Math.round(item.main.temp),
                icon: this.getIcon(item.weather[0].main)
            }))
            : fallbackForecast.hourly;

        const dailyForecast = hasSegments ? this.aggregateDaily(forecastList) : fallbackForecast.daily;

        return {
            name: current.name || city,
            timezone,
            dataSource: 'live',
            meta: {
                requested: city,
                coords,
                fallbackReason: null
            },
            current: {
                temp: Math.round(current.main.temp),
                condition: current.weather[0].main, // 'Clear', 'Rain', etc.
                high: Math.round(todayHigh),
                low: Math.round(todayLow),
                desc: current.weather[0].description,
                clouds: current.clouds?.all ?? null,
                wind: {
                    speed: Math.round(current.wind?.speed ?? 0),
                    deg: current.wind?.deg ?? null
                },
                precipChance,
                precipVolume,
                precipType
            },
            forecast: {
                hourly: hourlyForecast,
                daily: dailyForecast
            },
            // Note: Standard Free API doesn't provide AQI, Lifestyle, or detailed Celestial data.
            // We will use Mock Data for these sections to keep the UI beautiful.
            aqi: mockData.cities['Seoul'].aqi,
            lifestyle: mockData.cities['Seoul'].lifestyle,
            highlights: mockData.cities['Seoul'].highlights,
            sky: {
                sunrise,
                sunset,
                moon: { phase: moonPhase, next: mockData.cities['Seoul'].sky.moon.next },
                zodiac: mockData.cities['Seoul'].sky.zodiac,
                meteor: mockData.cities['Seoul'].sky.meteor
            }
        };
    },

    getIcon(condition) {
        // Simple Icon Mapper
        const map = {
            'Clear': '☀️',
            'Clouds': '☁️',
            'Rain': '🌧️',
            'Drizzle': '🌧️',
            'Thunderstorm': '⛈️',
            'Snow': '❄️',
            'Mist': '🌫️',
            'Fog': '🌫️'
        };
        return map[condition] || '🌤️';
    },

    aggregateDaily(list) {
        // Process 3-hour segments into daily summaries
        const daily = [];
        const seenDates = new Set();

        for (const item of list) {
            const date = new Date(item.dt * 1000).toDateString();
            if (!seenDates.has(date)) {
                seenDates.add(date);
                daily.push({
                    day: new Date(item.dt * 1000).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' }),
                    high: Math.round(item.main.temp_max),
                    low: Math.round(item.main.temp_min),
                    icon: this.getIcon(item.weather[0].main),
                    precip: Math.round((item.pop ?? 0) * 100)
                });
            }
            if (daily.length >= 5) break;
        }
        return daily;
    },

    formatTime(unixSeconds, offsetSeconds = 0) {
        if (!unixSeconds) return '--:--';
        const utcMillis = (unixSeconds + offsetSeconds) * 1000;
        const date = new Date(utcMillis);
        return date.toUTCString().split(' ')[4].slice(0, 5);
    },

    calculateMoonPhase(date) {
        const synodicMonth = 29.53058867; // days
        const knownNewMoon = new Date('2000-01-06T18:14:00Z');
        const diffDays = (date - knownNewMoon) / (1000 * 60 * 60 * 24);
        const phase = diffDays % synodicMonth;
        const index = Math.floor((phase / synodicMonth) * 8);
        const phases = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
        return phases[index] || 'Moon';
    },

    resolvePrecipType(main, volume) {
        const normalized = (main || '').toLowerCase();
        if (['rain', 'drizzle', 'thunderstorm'].includes(normalized)) return 'rain';
        if (normalized === 'snow') return 'snow';
        if (volume && volume > 0 && !normalized) return 'rain';
        return null;
    }
};