
        // API Configuration
        const API_KEY = 'b82ccdf728e229fe390011ada7610e57'; // Your API key
        const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
        const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast';
        
        // App State
        let currentUnit = 'metric';
        let currentCity = 'New York';
        
        // DOM Elements
        const cityInput = document.getElementById('city-input');
        const searchBtn = document.getElementById('search-btn');
        const weatherDisplay = document.getElementById('weather-display');
        const loading = document.getElementById('loading');
        const errorMessage = document.getElementById('error-message');
        const quickBtns = document.querySelectorAll('.quick-btn');
        const unitBtns = document.querySelectorAll('.unit-btn');
        
        // Weather elements
        const elements = {
            cityName: document.getElementById('city-name'),
            weatherDesc: document.getElementById('weather-description'),
            weatherMain: document.getElementById('weather-main'),
            temperature: document.getElementById('temperature'),
            feelsLike: document.getElementById('feels-like'),
            humidity: document.getElementById('humidity'),
            windSpeed: document.getElementById('wind-speed'),
            pressure: document.getElementById('pressure'),
            visibility: document.getElementById('visibility'),
            clouds: document.getElementById('clouds'),
            uvIndex: document.getElementById('uv-index'),
            tempMin: document.getElementById('temp-min'),
            tempMax: document.getElementById('temp-max'),
            sunrise: document.getElementById('sunrise'),
            sunset: document.getElementById('sunset'),
            weatherIcon: document.getElementById('weather-icon'),
            currentDate: document.getElementById('current-date'),
            currentTime: document.getElementById('current-time'),
            forecastCards: document.getElementById('forecast-cards'),
            weatherAlert: document.getElementById('weather-alert'),
            alertText: document.getElementById('alert-text'),
            airQuality: document.getElementById('air-quality'),
            aqiLevel: document.getElementById('aqi-level'),
            aqiDesc: document.getElementById('aqi-desc')
        };
        
        // Weather icon mapping
        const iconMap = {
            '01d': 'fas fa-sun',
            '01n': 'fas fa-moon',
            '02d': 'fas fa-cloud-sun',
            '02n': 'fas fa-cloud-moon',
            '03d': 'fas fa-cloud',
            '03n': 'fas fa-cloud',
            '04d': 'fas fa-cloud',
            '04n': 'fas fa-cloud',
            '09d': 'fas fa-cloud-rain',
            '09n': 'fas fa-cloud-rain',
            '10d': 'fas fa-cloud-sun-rain',
            '10n': 'fas fa-cloud-moon-rain',
            '11d': 'fas fa-bolt',
            '11n': 'fas fa-bolt',
            '13d': 'fas fa-snowflake',
            '13n': 'fas fa-snowflake',
            '50d': 'fas fa-smog',
            '50n': 'fas fa-smog'
        };
        
        // Weather condition colors
        const conditionColors = {
            'Clear': '#ff9800',
            'Clouds': '#757575',
            'Rain': '#2196f3',
            'Snow': '#00bcd4',
            'Thunderstorm': '#9c27b0',
            'Drizzle': '#03a9f4',
            'Mist': '#9e9e9e',
            'Smoke': '#795548',
            'Haze': '#795548',
            'Dust': '#795548',
            'Fog': '#9e9e9e',
            'Sand': '#795548',
            'Ash': '#795548',
            'Squall': '#607d8b',
            'Tornado': '#f44336'
        };
        
        // Initialize app
        document.addEventListener('DOMContentLoaded', () => {
            updateDateTime();
            fetchWeatherData(currentCity);
            setupEventListeners();
            setInterval(updateDateTime, 1000);
        });
        
        // Update date and time
        function updateDateTime() {
            const now = new Date();
            elements.currentDate.textContent = now.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            elements.currentTime.textContent = now.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            }) + ' Local Time';
        }
        
        // Setup event listeners
        function setupEventListeners() {
            // Search button
            searchBtn.addEventListener('click', () => {
                const city = cityInput.value.trim();
                if (city) {
                    fetchWeatherData(city);
                }
            });
            
            // Enter key in search
            cityInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const city = cityInput.value.trim();
                    if (city) {
                        fetchWeatherData(city);
                    }
                }
            });
            
            // Quick location buttons
            quickBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const city = btn.getAttribute('data-city');
                    cityInput.value = city;
                    fetchWeatherData(city);
                });
            });
            
            // Unit toggle buttons
            unitBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const unit = btn.getAttribute('data-unit');
                    if (unit !== currentUnit) {
                        currentUnit = unit;
                        unitBtns.forEach(b => b.classList.remove('active'));
                        btn.classList.add('active');
                        fetchWeatherData(currentCity);
                    }
                });
            });
        }
        
        // Fetch weather data
        async function fetchWeatherData(city) {
            showLoading();
            hideError();
            
            try {
                const weatherUrl = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${currentUnit}`;
                const forecastUrl = `${FORECAST_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=${currentUnit}`;
                
                // Fetch current weather and forecast in parallel
                const [weatherResponse, forecastResponse] = await Promise.all([
                    fetch(weatherUrl),
                    fetch(forecastUrl)
                ]);
                
                if (!weatherResponse.ok) {
                    throw new Error(`City not found: ${city}`);
                }
                
                const weatherData = await weatherResponse.json();
                const forecastData = forecastResponse.ok ? await forecastResponse.json() : null;
                
                currentCity = city;
                updateWeatherUI(weatherData);
                if (forecastData) {
                    updateForecastUI(forecastData);
                }
                
                showWeatherDisplay();
                
            } catch (error) {
                showError(error.message, city);
            }
        }
        
        // Update weather UI
        function updateWeatherUI(data) {
            // Basic info
            elements.cityName.textContent = `${data.name}, ${data.sys.country}`;
            elements.weatherDesc.textContent = data.weather[0].description;
            elements.weatherMain.textContent = data.weather[0].main;
            
            // Temperature and feels like
            const tempUnit = currentUnit === 'metric' ? '°C' : '°F';
            elements.temperature.textContent = Math.round(data.main.temp);
            elements.temperature.nextElementSibling.textContent = tempUnit;
            elements.feelsLike.textContent = `${Math.round(data.main.feels_like)}${tempUnit}`;
            
            // Weather details
            elements.humidity.textContent = `${data.main.humidity}%`;
            elements.windSpeed.textContent = `${data.wind.speed} ${currentUnit === 'metric' ? 'm/s' : 'mph'}`;
            elements.pressure.textContent = `${data.main.pressure} hPa`;
            elements.visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
            elements.clouds.textContent = `${data.clouds.all}%`;
            
            // Min/Max temp
            elements.tempMin.textContent = `${Math.round(data.main.temp_min)}${tempUnit}`;
            elements.tempMax.textContent = `${Math.round(data.main.temp_max)}${tempUnit}`;
            
            // Sunrise and sunset
            const sunriseTime = new Date(data.sys.sunrise * 1000);
            const sunsetTime = new Date(data.sys.sunset * 1000);
            elements.sunrise.textContent = sunriseTime.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit'
            });
            elements.sunset.textContent = sunsetTime.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit'
            });
            
            // Weather icon
            const iconCode = data.weather[0].icon;
            const condition = data.weather[0].main;
            elements.weatherIcon.innerHTML = `<i class="${iconMap[iconCode] || 'fas fa-cloud'}"></i>`;
            elements.weatherIcon.style.color = conditionColors[condition] || '#3a7bd5';
            
            // UV Index (simulated - real API requires separate call)
            const uv = Math.min(11, Math.max(1, Math.round(data.main.temp / 5)));
            elements.uvIndex.textContent = `${uv} ${getUVLevel(uv)}`;
            
            // Weather alerts
            checkWeatherAlerts(data);
            
            // Air quality (simulated)
            simulateAirQuality(data);
        }
        
        // Update forecast UI
        function updateForecastUI(data) {
            elements.forecastCards.innerHTML = '';
            
            // Get daily forecasts (every 8th item for 3-hour intervals)
            for (let i = 0; i < 40; i += 8) {
                const forecast = data.list[i];
                if (!forecast) break;
                
                const date = new Date(forecast.dt * 1000);
                const day = date.toLocaleDateString('en-US', { weekday: 'short' });
                const temp = Math.round(forecast.main.temp);
                const icon = forecast.weather[0].icon;
                const desc = forecast.weather[0].main;
                
                const forecastCard = document.createElement('div');
                forecastCard.className = 'forecast-card';
                forecastCard.innerHTML = `
                    <div class="forecast-day">${day}</div>
                    <div class="forecast-date">${date.getDate()}/${date.getMonth() + 1}</div>
                    <div class="forecast-icon">
                        <i class="${iconMap[icon] || 'fas fa-cloud'}"></i>
                    </div>
                    <div class="forecast-temp">${temp}°</div>
                    <div class="forecast-desc">${desc}</div>
                `;
                
                elements.forecastCards.appendChild(forecastCard);
            }
        }
        
        // Check for weather alerts
        function checkWeatherAlerts(data) {
            const temp = data.main.temp;
            const condition = data.weather[0].main;
            const wind = data.wind.speed;
            
            let alertMessage = '';
            
            if (temp > 35) {
                alertMessage = 'Heatwave alert! Stay hydrated and avoid outdoor activities during peak hours.';
            } else if (temp < 0) {
                alertMessage = 'Freezing temperatures! Dress warmly and be cautious of icy conditions.';
            }
            
            if (condition === 'Thunderstorm') {
                alertMessage = 'Thunderstorm warning! Stay indoors and avoid using electrical appliances.';
            } else if (condition === 'Snow' && temp < -5) {
                alertMessage = 'Heavy snow and extreme cold! Travel only if necessary.';
            }
            
            if (wind > 10) {
                alertMessage = 'High wind warning! Secure outdoor objects and avoid tall structures.';
            }
            
            if (alertMessage) {
                elements.alertText.textContent = alertMessage;
                elements.weatherAlert.style.display = 'flex';
            } else {
                elements.weatherAlert.style.display = 'none';
            }
        }
        
        // Simulate air quality
        function simulateAirQuality(data) {
            const temp = data.main.temp;
            const humidity = data.main.humidity;
            const wind = data.wind.speed;
            
            // Simple AQI calculation
            let aqi = 50; // Base
            aqi += (temp > 25 ? 20 : 0);
            aqi += (humidity > 80 ? 15 : 0);
            aqi -= (wind > 5 ? 15 : 0);
            aqi = Math.max(0, Math.min(100, aqi));
            
            let level, color;
            if (aqi <= 25) {
                level = 'Excellent';
                color = '#20c997';
            } else if (aqi <= 50) {
                level = 'Good';
                color = '#28a745';
            } else if (aqi <= 75) {
                level = 'Moderate';
                color = '#ffc107';
            } else if (aqi <= 90) {
                level = 'Poor';
                color = '#fd7e14';
            } else {
                level = 'Hazardous';
                color = '#dc3545';
            }
            
            elements.aqiLevel.textContent = level;
            elements.aqiDesc.textContent = getAQIDescription(level);
            elements.airQuality.style.display = 'block';
            elements.airQuality.style.background = `linear-gradient(to right, ${color}, ${color}dd)`;
        }
        
        // Helper functions
        function getUVLevel(uv) {
            if (uv <= 2) return 'Low';
            if (uv <= 5) return 'Moderate';
            if (uv <= 7) return 'High';
            if (uv <= 10) return 'Very High';
            return 'Extreme';
        }
        
        function getAQIDescription(level) {
            const descriptions = {
                'Excellent': 'Air quality is ideal for most individuals',
                'Good': 'Air quality is satisfactory with little risk to health',
                'Moderate': 'Acceptable air quality for most, but some may be affected',
                'Poor': 'Sensitive groups should reduce outdoor activities',
                'Hazardous': 'Health warnings - everyone should avoid outdoor exertion'
            };
            return descriptions[level] || 'Air quality data unavailable';
        }
        
        // UI state functions
        function showLoading() {
            loading.style.display = 'block';
            weatherDisplay.classList.remove('active');
            errorMessage.style.display = 'none';
        }
        
        function showWeatherDisplay() {
            loading.style.display = 'none';
            weatherDisplay.classList.add('active');
            errorMessage.style.display = 'none';
        }
        
        function showError(message, city) {
            loading.style.display = 'none';
            weatherDisplay.classList.remove('active');
            errorMessage.style.display = 'block';
            
            document.getElementById('error-title').textContent = 'Weather Data Unavailable';
            document.getElementById('error-details').textContent = 
                `Unable to fetch weather data for "${city}". ${message}. Please try another location.`;
        }
        
        function hideError() {
            errorMessage.style.display = 'none';
        }
        
        // Add mock data for demo when API fails
        async function fetchMockWeatherData(city) {
            const mockData = {
                "London": {
                    name: "London",
                    sys: { country: "GB", sunrise: 1676016000, sunset: 1676052000 },
                    weather: [{ description: "Cloudy", main: "Clouds", icon: "03d" }],
                    main: { temp: 12, feels_like: 10, humidity: 78, pressure: 1015, temp_min: 10, temp_max: 14 },
                    wind: { speed: 4.2 },
                    clouds: { all: 85 },
                    visibility: 10000
                },
                "New York": {
                    name: "New York",
                    sys: { country: "US", sunrise: 1676019600, sunset: 1676055600 },
                    weather: [{ description: "Clear sky", main: "Clear", icon: "01d" }],
                    main: { temp: 22, feels_like: 24, humidity: 65, pressure: 1013, temp_min: 18, temp_max: 26 },
                    wind: { speed: 5.5 },
                    clouds: { all: 10 },
                    visibility: 15000
                }
            };
            
            return new Promise(resolve => {
                setTimeout(() => {
                    resolve(mockData[city] || mockData["New York"]);
                }, 500);
            });
        }