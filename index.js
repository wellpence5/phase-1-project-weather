// DOM Elements
const getWeatherBtn = document.getElementById('get-weather');
const locationDisplay = document.getElementById('location');
const currentWeather = document.getElementById('current-weather');
const weatherAdvice = document.getElementById('weather-advice');
const hourlyForecast = document.getElementById('hourly-forecast');
const printBtn = document.getElementById('print-btn');

// Event Listeners
getWeatherBtn.addEventListener('click', getLocation);
printBtn.addEventListener('click', () => window.print());

async function getLocation() {
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
    fetchWeather(position.coords.latitude, position.coords.longitude);
  } catch (error) {
    alert('Please enable location access for accurate weather');
    // Default to Nairobi,Kenya coordinates if location denied
    fetchWeather(-1.28639, 36.81722);
  }
}

async function fetchWeather(lat, lon) {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,precipitation_probability,windspeed_10m,uv_index&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&current_weather=true`
    );
    const data = await response.json();
    displayWeather(data, lat, lon);
  } catch (error) {
    console.error('Error fetching weather:', error);
  }
}

function displayWeather(data, lat, lon) {
  // Get current location
  fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
    .then(res => res.json())
    .then(locationData => {
      const city = locationData.address.city || locationData.address.town;
      const country = locationData.address.country;
      locationDisplay.textContent = `${city}, ${country}`;
    });

  // Current location's weather
  const current = data.current_weather;
  currentWeather.innerHTML = `
    <div>
      <h2>${current.temperature}°C</h2>
      <p>Wind: ${current.windspeed} km/h</p>
    </div>
  `;

  // Weather advice
  const advice = generateAdvice(current, data.daily);
  weatherAdvice.innerHTML = advice;

  // Hourly forecastssss
  hourlyForecast.innerHTML = '';
  const now = new Date();
  const currentHour = now.getHours();

  for (let i = 0; i < 24; i++) {
    const hour = (currentHour + i) % 24;
    hourlyForecast.innerHTML += `
      <div class="hour-card">
        <h3>${hour}:00</h3>
        <p>${data.hourly.temperature_2m[i]}°C</p>
        <p>Rain: ${data.hourly.precipitation_probability[i]}%</p>
        <p>Wind: ${data.hourly.windspeed_10m[i]} km/h</p>
      </div>
    `;
  }
}

function getWeatherIcon(weatherCode) {
  // Simplified weather code mapping
  if (weatherCode < 20) return '☀️';
  if (weatherCode < 40) return '🌤️';
  if (weatherCode < 60) return '🌧️';
  if (weatherCode < 80) return '❄️';
  return '🌫️';
}

function generateAdvice(current, daily) {
  let advice = '<h3>Today\'s Advice</h3><ul>';
  
  // Clothing advice
  const maxTemp = daily.temperature_2m_max[0];
  if (maxTemp > 25) advice += '<li>👕 Wear light clothing</li>';
  else if (maxTemp < 15) advice += '<li>🧥 Wear a warm jacket</li>';
  
  // Rain advice
  if (current.weathercode > 50 && current.weathercode < 70) {
    advice += '<li>☔ Bring an umbrella</li>';
  }
  
  // UV advice
  if (current.weathercode < 29) {
    advice += '<li>🧴 Apply sunscreen (UV index high)</li>';
  }
  
  advice += '</ul>';
  return advice;
}

// Initialize with default location if user doesn't share theirs
getLocation();

// Theme toggle functionality
const themeToggle = document.getElementById('theme-toggle');
const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

// Check for saved preference or system preference
function initializeTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else if (prefersDarkScheme.matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
}

////////////
// Toggle between light/dark
function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);
  
  // Update button emoji
  themeToggle.textContent = newTheme === 'dark' ? '🌔' : '🌓';
}

// Initialize
initializeTheme();

// Set initial button emoji
if (document.documentElement.getAttribute('data-theme') === 'dark') {
  themeToggle.textContent = '🌔';
}

// Event listener
themeToggle.addEventListener('click', toggleTheme);