import WeatherAPI from "./api/weatherAPI";
import WeatherCard from "./components/WeatherCard";

class App {
  constructor() {
    this.api = new WeatherAPI();
    this.weatherCard = new WeatherCard();
    this.loadingElement = document.getElementById("loading");
    this.searchInput = document.getElementById("location-search");
    this.searchResults = document.getElementById("search-results");
    this.locationName = document.getElementById("location-name");
    this.localTime = document.getElementById("local-time");
    this.currentWeather = document.querySelector(".current-weather");
    this.weatherDetails = document.querySelector(".weather-details");
    this.forecastContainer = document.querySelector(".forecast-container");

    this.init();
    this.setupEventListeners();
    this.setupThemeToggle();
    this.updateBackgroundByTime();
    setInterval(() => this.updateBackgroundByTime(), 60000); // Check every minute
  }

  async init() {
    try {
      this.showLoading();

      // Get user's location
      const position = await this.getCurrentPosition();
      const { latitude: lat, longitude: lon } = position.coords;

      // Get weather data first
      const [weatherData, forecast] = await Promise.all([
        this.api.getCurrentWeather(lat, lon),
        this.api.getForecast(lat, lon),
      ]);

      // Try to get location name
      try {
        const locationData = await this.api.reverseGeocode(lat, lon);
        const location = locationData.results?.[0];

        if (location) {
          this.renderCurrentWeather(weatherData, location);
        } else {
          // Fallback to coordinates if no location name
          this.renderCurrentWeather(weatherData, {
            name: `Location (${lat.toFixed(2)}, ${lon.toFixed(2)})`,
            country: "",
          });
        }
      } catch (error) {
        console.error("Error getting location name:", error);
        // Still show weather even if location name fails
        this.renderCurrentWeather(weatherData, {
          name: "Current Location",
          country: "",
        });
      }

      this.renderForecast(forecast);
    } catch (error) {
      console.error("Error initializing app:", error);
      this.showError("Unable to load weather data");
    } finally {
      this.hideLoading();
    }
  }

  showLoading() {
    this.loadingElement.style.display = "flex";
  }

  hideLoading() {
    this.loadingElement.style.display = "none";
  }

  async getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported"));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }

  renderCurrentWeather(data, location) {
    if (!data.current) return;

    this.currentWeather.innerHTML = this.weatherCard.render(data.current, true);

    this.weatherDetails.innerHTML = this.weatherCard.renderDetails(
      data.current
    );

    if (location) {
      this.updateLocationInfo(location, data);
    }
  }

  renderForecast(forecast) {
    if (!forecast.daily) return;

    const forecastHtml = forecast.daily.time
      .slice(1, 6)
      .map((time, index) => {
        const weatherData = {
          temperature_2m: forecast.daily.temperature_2m_max[index],
          apparent_temperature: forecast.daily.apparent_temperature_max[index],
          weather_code: forecast.daily.weather_code[index],
          relative_humidity_2m: 0,
          date: new Date(time).toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
          }),
        };
        return this.weatherCard.render(weatherData);
      })
      .join("");

    this.forecastContainer.innerHTML = forecastHtml;
  }

  showError(message) {
    const errorHtml = `
      <div class="weather-card error-card">
        <div class="card-content">
          <div class="weather-info">
            <div class="weather-title">${message}</div>
          </div>
        </div>
      </div>
    `;
    this.currentWeather.innerHTML = errorHtml;
    this.weatherDetails.innerHTML = "";
    this.forecastContainer.innerHTML = "";
  }

  setupEventListeners() {
    let debounceTimeout;

    // Clear input on click
    this.searchInput.addEventListener("click", () => {
      this.searchInput.value = "";
      this.searchResults.style.display = "none";
    });

    this.searchInput.addEventListener("input", (e) => {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(
        () => this.handleSearch(e.target.value),
        300
      );
    });

    this.searchResults.addEventListener("click", (e) => {
      const item = e.target.closest(".search-result-item");
      if (item) {
        const { lat, lon, name, country } = item.dataset;
        this.updateWeather(parseFloat(lat), parseFloat(lon), name, country);
        this.searchResults.style.display = "none";
        this.searchInput.value = item.textContent;
      }
    });

    const clearButton = document.getElementById("clear-search");
    clearButton.addEventListener("click", () => {
      this.searchInput.value = "";
      this.searchResults.style.display = "none";
      this.searchInput.focus();
    });
  }

  setupThemeToggle() {
    const themeSwitch = document.getElementById("theme-switch");
    if (!themeSwitch) return;

    themeSwitch.addEventListener("click", () => {
      // Instead of just toggling day/night, cycle through all themes
      const themes = [
        "morning-theme",
        "day-theme",
        "evening-theme",
        "night-theme",
      ];
      let currentIndex = -1;

      // Find current theme
      themes.forEach((theme, index) => {
        if (document.body.classList.contains(theme)) {
          currentIndex = index;
        }
      });

      // Remove all themes
      themes.forEach((theme) => document.body.classList.remove(theme));

      // Add next theme in cycle
      const nextIndex = (currentIndex + 1) % themes.length;
      document.body.classList.add(themes[nextIndex]);
    });
  }

  updateLocationInfo(location, weatherData) {
    if (!location) return;

    // Clear any existing interval
    if (this.timeInterval) {
      clearInterval(this.timeInterval);
    }

    this.locationName.textContent = `${location.name}, ${location.country}`;

    const updateTime = () => {
      const date = new Date();
      const options = {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
        timeZone: weatherData.timezone,
      };
      this.localTime.textContent = date.toLocaleTimeString("en-GB", options);
    };

    updateTime();
    this.timeInterval = setInterval(updateTime, 1000);
  }

  async handleSearch(query) {
    if (!query.trim()) {
      this.searchResults.style.display = "none";
      return;
    }

    try {
      const results = await this.api.searchLocations(query);
      if (results.results?.length) {
        this.searchResults.innerHTML = results.results
          .map(
            (location) => `
            <div class="search-result-item" 
                 data-lat="${location.latitude}" 
                 data-lon="${location.longitude}"
                 data-name="${location.name}"
                 data-country="${location.country}">
              ${location.name}, ${location.country}
            </div>
          `
          )
          .join("");
        this.searchResults.style.display = "block";
      } else {
        this.searchResults.style.display = "none";
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  }

  async updateWeather(lat, lon, locationName, country) {
    try {
      this.showLoading();

      // Clear existing time interval
      if (this.timeInterval) {
        clearInterval(this.timeInterval);
      }

      const [weatherData, forecast] = await Promise.all([
        this.api.getCurrentWeather(lat, lon),
        this.api.getForecast(lat, lon),
      ]);

      const location = { name: locationName, country };
      this.renderCurrentWeather(weatherData, location);
      this.renderForecast(forecast);
    } catch (error) {
      console.error("Error updating weather:", error);
      this.showError("Unable to update weather data");
    } finally {
      this.hideLoading();
    }
  }

  updateBackgroundByTime() {
    const hour = new Date().getHours();

    // Remove all time-based classes
    document.body.classList.remove(
      "morning-theme",
      "day-theme",
      "evening-theme",
      "night-theme"
    );

    // Add appropriate class based on time
    if (hour >= 5 && hour < 10) {
      document.body.classList.add("morning-theme");
    } else if (hour >= 10 && hour < 17) {
      document.body.classList.add("day-theme");
    } else if (hour >= 17 && hour < 21) {
      document.body.classList.add("evening-theme");
    } else {
      document.body.classList.add("night-theme");
    }
  }
}

export default App;
