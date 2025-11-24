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

import { mockData } from '../data/mockData.js';

// 🔴 CONFIGURATION: INSERT YOUR OPENWEATHERMAP API KEY HERE
// You can get a free key at https://openweathermap.org/api
const API_KEY = "c35ac75a293fcbfe0ea2fd555b4b6eab";

export const apiService = {
    async getWeather(city) {
        // 1. Try Real API if Key is present
        if (API_KEY && API_KEY.length > 10) {
            try {
                return await this.fetchRealWeather(city);
            } catch (error) {
                console.warn("Real API failed/invalid, falling back to mock data.", error);
            }
        }

        // 2. Fallback to Mock Data (Simulation)
        await new Promise(resolve => setTimeout(resolve, 600)); // Simulate network

        // Case insensitive search
        const cityKey = Object.keys(mockData.cities).find(
            k => k.toLowerCase() === city.toLowerCase()
        );

        // Return found city or default to Seoul
        return cityKey ? mockData.cities[cityKey] : mockData.cities['Seoul'];
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
        const forecastData = await forecastRes.json();

        // Pass city to mapData for timezone handling
        return this.mapData(current, forecastData, city);
    },

    mapData(current, forecast, city) {
        // Adapter: Convert OpenWeatherMap response to AETHER App Schema

        // Calculate High/Low for today based on forecast segments
        const todaySegments = forecast.list.slice(0, 8);
        const todayHigh = Math.max(...todaySegments.map(i => i.main.temp_max));
        const todayLow = Math.min(...todaySegments.map(i => i.main.temp_min));

        return {
            timezone: cityTimezones[city] || 32400,
            current: {
                temp: Math.round(current.main.temp),
                condition: current.weather[0].main, // 'Clear', 'Rain', etc.
                high: Math.round(todayHigh),
                low: Math.round(todayLow),
                desc: current.weather[0].description
            },
            forecast: {
                hourly: forecast.list.slice(0, 8).map(item => ({
                    time: new Date(item.dt * 1000).getHours() + 'H',
                    temp: Math.round(item.main.temp),
                    icon: this.getIcon(item.weather[0].main)
                })),
                daily: this.aggregateDaily(forecast.list)
            },
            // Note: Standard Free API doesn't provide AQI, Lifestyle, or detailed Celestial data.
            // We will use Mock Data for these sections to keep the UI beautiful.
            aqi: mockData.cities['Seoul'].aqi,
            lifestyle: mockData.cities['Seoul'].lifestyle,
            highlights: mockData.cities['Seoul'].highlights,
            sky: mockData.cities['Seoul'].sky
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
                    precip: Math.round(item.pop * 100)
                });
            }
            if (daily.length >= 5) break;
        }
        return daily;
    }
};