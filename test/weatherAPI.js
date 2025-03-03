class WeatherAPI {
  constructor() {
    this.baseUrl = "https://api.open-meteo.com/v1";
    this.geocodeUrl = "https://geocoding-api.open-meteo.com/v1";
  }

  async getCurrentWeather(lat, lon) {
    const url = new URL(`${this.baseUrl}/forecast`);
    url.searchParams.append("latitude", lat);
    url.searchParams.append("longitude", lon);
    url.searchParams.append(
      "current",
      [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "precipitation",
        "weather_code",
        "wind_speed_10m",
        "wind_direction_10m",
        "is_day",
      ].join(",")
    );
    // Add hourly data for today
    url.searchParams.append(
      "hourly",
      [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "precipitation_probability",
        "weather_code",
        "wind_speed_10m",
      ].join(",")
    );
    url.searchParams.append("timezone", "auto");
    url.searchParams.append("forecast_days", "1"); // Just today's hourly forecast

    try {
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`Weather API error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching current weather:", error);
      throw error;
    }
  }

  async getForecast(lat, lon) {
    const url = new URL(`${this.baseUrl}/forecast`);
    url.searchParams.append("latitude", lat);
    url.searchParams.append("longitude", lon);
    url.searchParams.append(
      "daily",
      [
        "weather_code",
        "temperature_2m_max",
        "temperature_2m_min",
        "apparent_temperature_max",
        "precipitation_probability_max",
        "wind_speed_10m_max",
      ].join(",")
    );
    url.searchParams.append("timezone", "auto");
    url.searchParams.append("forecast_days", "7"); // Get 7 days forecast

    try {
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`Forecast API error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error fetching forecast:", error);
      throw error;
    }
  }

  async searchLocations(query) {
    const url = new URL(`${this.geocodeUrl}/search`);
    url.searchParams.append("name", query);
    url.searchParams.append("count", 5);
    url.searchParams.append("language", "en");
    url.searchParams.append("format", "json");

    try {
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`Geocoding API error: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.error("Error searching locations:", error);
      throw error;
    }
  }

  // Helper method to process current weather data
  processCurrentWeather(data) {
    const current = data.current;
    return {
      temperature: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      feels_like: current.apparent_temperature,
      wind_speed: current.wind_speed_10m,
      wind_direction: current.wind_direction_10m,
      weather_code: current.weather_code,
      precipitation: current.precipitation,
      time: new Date(current.time),
    };
  }

  // Helper method to convert WMO weather codes to readable descriptions
  getWeatherDescription(code) {
    const weatherCodes = {
      0: "Clear sky",
      1: "Mainly clear",
      2: "Partly cloudy",
      3: "Overcast",
      45: "Foggy",
      48: "Depositing rime fog",
      51: "Light drizzle",
      53: "Moderate drizzle",
      55: "Dense drizzle",
      56: "Light freezing drizzle",
      57: "Dense freezing drizzle",
      61: "Slight rain",
      63: "Moderate rain",
      65: "Heavy rain",
      66: "Light freezing rain",
      67: "Heavy freezing rain",
      71: "Slight snow fall",
      73: "Moderate snow fall",
      75: "Heavy snow fall",
      77: "Snow grains",
      80: "Slight rain showers",
      81: "Moderate rain showers",
      82: "Violent rain showers",
      85: "Slight snow showers",
      86: "Heavy snow showers",
      95: "Thunderstorm",
      96: "Thunderstorm with slight hail",
      99: "Thunderstorm with heavy hail",
    };
    return weatherCodes[code] || "Unknown";
  }

  // Helper method to get weather icon based on WMO code and is_day
  getWeatherIcon(code, isDay = true) {
    // Map WMO codes to Font Awesome icons
    const iconMap = {
      0: isDay ? "sun" : "moon",
      1: isDay ? "sun" : "moon",
      2: isDay ? "cloud-sun" : "cloud-moon",
      3: "cloud",
      45: "smog",
      48: "smog",
      51: "cloud-rain",
      53: "cloud-rain",
      55: "cloud-rain",
      56: "cloud-rain",
      57: "cloud-rain",
      61: "cloud-rain",
      63: "cloud-rain",
      65: "cloud-showers-heavy",
      66: "cloud-rain",
      67: "cloud-rain",
      71: "snowflake",
      73: "snowflake",
      75: "snowflake",
      77: "snowflake",
      80: "cloud-rain",
      81: "cloud-rain",
      82: "cloud-showers-heavy",
      85: "snowflake",
      86: "snowflake",
      95: "bolt",
      96: "bolt",
      99: "bolt",
    };

    const iconName = iconMap[code] || "question";
    return `fas fa-${iconName}`;
  }
}

module.exports = WeatherAPI;
