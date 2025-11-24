export const mockData = {
    cities: {
        'Seoul': {
            current: { temp: 17, condition: 'Clear', high: 22, low: 12, desc: 'Clear Sky' },
            forecast: {
                hourly: [
                    { time: '12PM', temp: 18, icon: '☀️' },
                    { time: '3PM', temp: 21, icon: '☀️' },
                    { time: '6PM', temp: 19, icon: '🌤️' },
                    { time: '9PM', temp: 15, icon: '🌙' },
                    { time: '12AM', temp: 13, icon: '🌙' },
                    { time: '3AM', temp: 11, icon: '🌙' },
                    { time: '6AM', temp: 11, icon: '🌅' },
                    { time: '9AM', temp: 15, icon: '☀️' }
                ],
                daily: [
                    { day: 'Mon', high: 22, low: 12, icon: '☀️', precip: 0 },
                    { day: 'Tue', high: 20, low: 11, icon: '🌤️', precip: 10 },
                    { day: 'Wed', high: 18, low: 10, icon: '☁️', precip: 20 },
                    { day: 'Thu', high: 19, low: 11, icon: '☀️', precip: 0 },
                    { day: 'Fri', high: 21, low: 13, icon: '☀️', precip: 0 }
                ]
            },
            aqi: {
                score: 85, status: 'Good',
                details: { pm25: 12, pm10: 25, o3: 30, co2: 400, pollen: 'Low' }
            },
            lifestyle: {
                running: { val: 9, label: 'Perfect' },
                umbrella: { val: 1, label: 'No Need' },
                driving: { val: 10, label: 'Good' },
                laundry: { val: 10, label: 'Great' },
                meteo: { humidity: '45%', wind: '3m/s NW', uv: 'Moderate', pressure: '1013hPa' },
                outfit: { icon: '👕', text: 'Light jacket & Sunglasses' }
            },
            highlights: {
                domestic: [
                    { name: 'Busan', temp: 19, high: 23, low: 15, icon: '☀️' },
                    { name: 'Daegu', temp: 20, high: 25, low: 13, icon: '☀️' },
                    { name: 'Jeju', temp: 21, high: 24, low: 16, icon: '🌤️' },
                    { name: 'Incheon', temp: 16, high: 20, low: 11, icon: '☀️' }
                ],
                global: [
                    { name: 'New York', temp: 12, high: 15, low: 8, icon: '🌧️' },
                    { name: 'London', temp: 10, high: 13, low: 7, icon: '☁️' },
                    { name: 'Paris', temp: 14, high: 18, low: 9, icon: '🌤️' },
                    { name: 'Tokyo', temp: 18, high: 22, low: 14, icon: '🌧️' }
                ]
            },
            sky: {
                sunrise: '06:12', sunset: '19:45',
                moon: { phase: 'Waxing Gibbous', next: 'Full Moon in 2 days' },
                zodiac: { name: 'Leo', desc: 'The Lion', date: 'Jul 23 - Aug 22' },
                meteor: { name: 'Perseids', time: 'Aug 12 Night, 100/hr' }
            }
        },
        'Jeju': {
            current: { temp: 21, condition: 'Rain', high: 24, low: 18, desc: 'Light Rain' },
            forecast: {
                hourly: [
                    { time: '12PM', temp: 21, icon: '🌧️' },
                    { time: '3PM', temp: 22, icon: '🌧️' },
                    { time: '6PM', temp: 20, icon: '☁️' },
                    { time: '9PM', temp: 19, icon: '☁️' },
                    { time: '12AM', temp: 18, icon: '☁️' },
                    { time: '3AM', temp: 17, icon: '☁️' },
                    { time: '6AM', temp: 17, icon: '☁️' },
                    { time: '9AM', temp: 19, icon: '🌤️' }
                ],
                daily: [
                    { day: 'Mon', high: 24, low: 18, icon: '🌧️', precip: 60 },
                    { day: 'Tue', high: 23, low: 17, icon: '☁️', precip: 30 },
                    { day: 'Wed', high: 22, low: 16, icon: '🌤️', precip: 10 },
                    { day: 'Thu', high: 23, low: 17, icon: '☀️', precip: 0 },
                    { day: 'Fri', high: 24, low: 18, icon: '☀️', precip: 0 }
                ]
            },
            aqi: {
                score: 95, status: 'Excellent',
                details: { pm25: 5, pm10: 10, o3: 25, co2: 380, pollen: 'Low' }
            },
            lifestyle: {
                running: { val: 4, label: 'Slippery' },
                umbrella: { val: 10, label: 'Required' },
                driving: { val: 6, label: 'Caution' },
                laundry: { val: 2, label: 'Dryer' },
                meteo: { humidity: '85%', wind: '8m/s SE', uv: 'Low', pressure: '1008hPa' },
                outfit: { icon: '🧥', text: 'Raincoat & Boots' }
            },
            highlights: {
                domestic: [
                    { name: 'Seoul', temp: 17, high: 22, low: 12, icon: '☀️' },
                    { name: 'Busan', temp: 19, high: 23, low: 15, icon: '☀️' },
                    { name: 'Daegu', temp: 20, high: 25, low: 13, icon: '☀️' },
                    { name: 'Gwangju', temp: 18, high: 22, low: 14, icon: '☁️' }
                ],
                global: [
                    { name: 'New York', temp: 12, high: 15, low: 8, icon: '🌧️' },
                    { name: 'London', temp: 10, high: 13, low: 7, icon: '☁️' },
                    { name: 'Paris', temp: 14, high: 18, low: 9, icon: '🌤️' },
                    { name: 'Tokyo', temp: 18, high: 22, low: 14, icon: '🌧️' }
                ]
            },
            sky: {
                sunrise: '06:20', sunset: '19:30',
                moon: { phase: 'Waxing Gibbous', next: 'Full Moon in 2 days' },
                zodiac: { name: 'Leo', desc: 'The Lion', date: 'Jul 23 - Aug 22' },
                meteor: { name: 'Perseids', time: 'Aug 12 Night, 100/hr' }
            }
        }
    }
};