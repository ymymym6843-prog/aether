/**
 * Real Zodiac Constellation Data
 * Extracted from HYG Star Catalog v4.2
 * Contains actual star positions (RA/Dec converted to x,y) and brightness values
 */

// Import this in SkyViewRenderer.js to use real astronomical data
// The data includes 12 zodiac constellations with their actual star positions
export default {
    // Constellation date ranges
    dateRanges: {
        'Capricorn': { start: '12-22', end: '01-19' },
        'Aquarius': { start: '01-20', end: '02-18' },
        'Pisces': { start: '02-19', end: '03-20' },
        'Aries': { start: '03-21', end: '04-19' },
        'Taurus': { start: '04-20', end: '05-20' },
        'Gemini': { start: '05-21', end: '06-20' },
        'Cancer': { start: '06-21', end: '07-22' },
        'Leo': { start: '07-23', end: '08-22' },
        'Virgo': { start: '08-23', end: '09-22' },
        'Libra': { start: '09-23', end: '10-22' },
        'Scorpio': { start: '10-23', end: '11-21' },
        'Sagittarius': { start: '11-22', end: '12-21' }
    },

    // Load constellation data dynamically
    async loadConstellationData() {
        const response = await fetch('./js/data/zodiac_stars.json');
        return await response.json();
    }
};
