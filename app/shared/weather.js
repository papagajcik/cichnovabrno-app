// shared/weather.js
// Počasí pro Brno-Komín

const WEATHER_LAT = 49.2197;
const WEATHER_LON = 16.5599;

const WEATHER_ICONS = {
    0: { icon: 'fa-sun', name: 'Jasno' },
    1: { icon: 'fa-cloud-sun', name: 'Polojasno' },
    2: { icon: 'fa-cloud-sun', name: 'Polojasno' },
    3: { icon: 'fa-cloud', name: 'Zataženo' },
    45: { icon: 'fa-smog', name: 'Mlha' },
    51: { icon: 'fa-cloud-rain', name: 'Mrholení' },
    61: { icon: 'fa-cloud-showers-heavy', name: 'Déšť' },
    71: { icon: 'fa-snowflake', name: 'Sníh' },
    95: { icon: 'fa-bolt', name: 'Bouřka' }
};

async function fetchWeather() {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${WEATHER_LAT}&longitude=${WEATHER_LON}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max&timezone=auto`;
        const response = await fetch(url);
        const data = await response.json();
        
        return {
            current: {
                temp: Math.round(data.current.temperature_2m),
                weatherCode: data.current.weather_code,
                weatherInfo: WEATHER_ICONS[data.current.weather_code] || { icon: 'fa-cloud', name: 'Oblačno' }
            },
            forecast: data.daily.time.slice(0, 4).map((date, i) => ({
                date: new Date(date),
                temp: Math.round(data.daily.temperature_2m_max[i]),
                weatherCode: data.daily.weather_code[i],
                weatherInfo: WEATHER_ICONS[data.daily.weather_code[i]] || { icon: 'fa-cloud', name: 'Oblačno' }
            }))
        };
    } catch (error) {
        console.error('Chyba načítání počasí:', error);
        return null;
    }
}

function updateWeatherDisplay(weatherData) {
    if (!weatherData) return;
    
    const tempEl = document.getElementById('weather-temp');
    const descEl = document.getElementById('weather-desc');
    const iconEl = document.getElementById('weather-icon');
    
    if (tempEl) tempEl.textContent = `${weatherData.current.temp}°`;
    if (descEl) descEl.textContent = weatherData.current.weatherInfo.name;
    if (iconEl) iconEl.className = `fas ${weatherData.current.weatherInfo.icon} text-5xl text-white/80`;
    
    const days = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];
    for (let i = 0; i < 4; i++) {
        const forecastEl = document.getElementById(`forecast-${i}`);
        if (forecastEl && weatherData.forecast[i]) {
            const f = weatherData.forecast[i];
            forecastEl.innerHTML = `
                <div class="text-xs text-slate-400">${days[f.date.getDay()]}</div>
                <i class="fas ${f.weatherInfo.icon} text-lg my-1"></i>
                <div class="font-bold">${f.temp}°</div>
            `;
        }
    }
}

async function startWeatherUpdates(intervalMs = 30000) {
    // Okamžité načtení
    const weather = await fetchWeather();
    updateWeatherDisplay(weather);
    
    // Pravidelné aktualizace
    setInterval(async () => {
        const newWeather = await fetchWeather();
        updateWeatherDisplay(newWeather);
    }, intervalMs);
}

window.fetchWeather = fetchWeather;
window.updateWeatherDisplay = updateWeatherDisplay;
window.startWeatherUpdates = startWeatherUpdates;