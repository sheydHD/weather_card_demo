class WeatherCard {
  constructor(container) {
    this.container = container;
  }

  render(weatherData, isCurrent = false) {
    const weatherType = this.getWeatherType(weatherData.weather_code);
    const dateStr =
      weatherData.date ||
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });

    // Check if it's night time for sunny weather
    const isNight = weatherData.is_day === 0;
    const sunMoonClass = isNight ? "moon" : "sun";

    // Different template for current weather vs forecast
    if (isCurrent) {
      return `
        <div class="weather-card ${weatherType}-card" data-weather="${weatherType}">
          <div class="card-header">
            <div class="date-info">
              <div class="date">${dateStr}</div>
              <div class="weather-title">${this.getWeatherTitle(
                weatherData.weather_code
              )}</div>
            </div>
            ${
              weatherData.sunrise
                ? `
              <div class="sun-times">
                <div><span>Sunrise:</span> ${this.formatTime(
                  weatherData.sunrise
                )}</div>
                <div><span>Sunset:</span> ${this.formatTime(
                  weatherData.sunset
                )}</div>
              </div>
            `
                : ""
            }
          </div>
          
          <div class="main-info">
            ${
              weatherType === "sun"
                ? `<div class="${sunMoonClass}"></div>`
                : this.getWeatherEffects(weatherType)
            }
            <div class="temperature">${Math.round(
              weatherData.temperature_2m
            )}°</div>
          </div>
          
          <div class="weather-details-list">
            <div class="detail-row">
              <span class="detail-label">Feels Like</span>
              <span class="detail-value">${Math.round(
                weatherData.apparent_temperature
              )}°</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Humidity</span>
              <span class="detail-value">${
                weatherData.relative_humidity_2m
              }%</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Wind Speed</span>
              <span class="detail-value">${
                weatherData.wind_speed_10m
              } km/h</span>
            </div>
            ${
              weatherData.precipitation !== undefined
                ? `
            <div class="detail-row">
              <span class="detail-label">Precipitation</span>
              <span class="detail-value">${weatherData.precipitation}mm</span>
            </div>
            `
                : ""
            }
          </div>
        </div>
      `;
    }

    // Regular forecast card template
    return `
      <div class="weather-card ${weatherType}-card" data-weather="${weatherType}">
        <div class="card-header">
          <div class="date">${dateStr}</div>
          <div class="weather-title">${this.getWeatherTitle(
            weatherData.weather_code
          )}</div>
        </div>
        
        <div class="card-content">
          <div class="main-info">
            ${
              weatherType === "sun"
                ? `<div class="${sunMoonClass}"></div>`
                : this.getWeatherEffects(weatherType)
            }
            <div class="temperature">${Math.round(
              weatherData.temperature_2m
            )}°</div>
          </div>
          
          <div class="weather-info">
            <div class="weather-details-list">
              <div class="detail-row">
                <span class="detail-label">Feels like:</span>
                <span class="detail-value">${Math.round(
                  weatherData.apparent_temperature
                )}°</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Humidity:</span>
                <span class="detail-value">${
                  weatherData.relative_humidity_2m || "N/A"
                }%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  getWeatherType(code) {
    if (code === 0 || code === 1) return "sun";
    if ([61, 63, 65, 80, 81, 82].includes(code)) return "rain";
    if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
    return "wind"; // default for cloudy/windy conditions
  }

  getWeatherTitle(code) {
    const titles = {
      0: "Clear Sky",
      1: "Mainly Clear",
      2: "Partly Cloudy",
      3: "Overcast",
      45: "Foggy",
      48: "Rime Fog",
      51: "Light Drizzle",
      53: "Moderate Drizzle",
      55: "Dense Drizzle",
      61: "Slight Rain",
      63: "Moderate Rain",
      65: "Heavy Rain",
      71: "Slight Snow",
      73: "Moderate Snow",
      75: "Heavy Snow",
      77: "Snow Grains",
      80: "Light Showers",
      81: "Moderate Showers",
      82: "Violent Showers",
      85: "Snow Showers",
      86: "Heavy Snow Showers",
      95: "Thunderstorm",
    };
    return titles[code] || "Unknown";
  }

  getWeatherEffects(type) {
    switch (type) {
      case "sun":
        return '<div class="sun"></div>';
      case "rain":
        // Create more raindrops with randomized properties
        return `
          <div class="rain-container">
            ${Array(30)
              .fill("")
              .map(() => {
                const left = Math.random() * 100;
                const delay = Math.random() * 1.5;
                const opacity = Math.random() * 0.4 + 0.6;
                return `<div class="raindrop" style="left: ${left}%; animation-delay: ${delay}s; opacity: ${opacity};"></div>`;
              })
              .join("")}
          </div>`;
      case "snow":
        // Create more snowflakes with randomized properties
        return `
          <div class="snow-container">
            ${Array(30)
              .fill("")
              .map(() => {
                const left = Math.random() * 100;
                const delay = Math.random() * 6;
                const opacity = Math.random() * 0.4 + 0.6;
                const size = Math.random() * 4 + 3;
                return `<div class="snowflake" style="left: ${left}%; animation-delay: ${delay}s; opacity: ${opacity}; width: ${size}px; height: ${size}px;"></div>`;
              })
              .join("")}
          </div>`;
      case "wind":
        // Create wind lines with randomized properties
        return `
          <div class="wind-container">
            ${Array(8)
              .fill("")
              .map((_, index) => {
                const top = 30 + index * 35;
                const width = 50 + Math.random() * 100;
                const delay = Math.random() * 2;
                return `<div class="wind-line" style="top: ${top}px; width: ${width}px; animation-delay: ${delay}s;"></div>`;
              })
              .join("")}
          </div>`;
      default:
        return "";
    }
  }

  addParticleEffect(element, type) {
    const particles = document.createElement("div");
    particles.className = "particles";

    for (let i = 0; i < 20; i++) {
      const particle = document.createElement("div");
      particle.className = "particle";
      particle.style.left = Math.random() * 100 + "%";
      particle.style.top = Math.random() * 100 + "%";
      particle.style.width = Math.random() * 4 + 2 + "px";
      particle.style.height = particle.style.width;
      particle.style.opacity = Math.random() * 0.5;
      particle.style.animation = `float${type} ${
        Math.random() * 3 + 2
      }s infinite`;
      particles.appendChild(particle);
    }

    element.appendChild(particles);
  }

  renderDetails(weatherData) {
    return `
      <div class="weather-details-panel">
        <h3>Additional Details</h3>
        <div class="detail-item">
          <span class="detail-label">Wind Direction</span>
          <span>${this.getWindDirection(weatherData.wind_direction_10m)}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Pressure</span>
          <span>${weatherData.surface_pressure || "N/A"} hPa</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Visibility</span>
          <span>${weatherData.visibility || "N/A"} km</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">UV Index</span>
          <span>${weatherData.uv_index || "N/A"}</span>
        </div>
      </div>
    `;
  }

  getWindDirection(degrees) {
    if (degrees === undefined) return "N/A";

    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  }

  formatTime(timeString) {
    return new Date(timeString).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }
}

export default WeatherCard;
