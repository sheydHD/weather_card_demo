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
    url.searchParams.append("daily", ["sunrise", "sunset"].join(","));
    url.searchParams.append("timezone", "auto");

    try {
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`Weather API error: ${response.status}`);
      const data = await response.json();

      // Combine current and daily data
      return {
        ...data,
        current: {
          ...data.current,
          sunrise: data.daily.sunrise[0],
          sunset: data.daily.sunset[0],
        },
      };
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
    url.searchParams.append("forecast_days", "7");

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

  async reverseGeocode(lat, lon) {
    // Try using a different geocoding service that's more reliable
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.append("lat", lat);
    url.searchParams.append("lon", lon);
    url.searchParams.append("format", "json");
    url.searchParams.append("accept-language", "en");

    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "WeatherApp/1.0",
        },
      });

      if (!response.ok)
        throw new Error(`Reverse Geocoding API error: ${response.status}`);

      const data = await response.json();

      // Format the response to match our expected structure
      return {
        results: [
          {
            name:
              data.address.city ||
              data.address.town ||
              data.address.village ||
              data.address.hamlet ||
              "Unknown",
            country: data.address.country || "",
            latitude: lat,
            longitude: lon,
          },
        ],
      };
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      throw error;
    }
  }
}

export default WeatherAPI;
