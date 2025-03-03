// Import the WeatherAPI class
const WeatherAPI = require("./weatherAPI.js");

const weatherAPI = new WeatherAPI();

async function testAPI() {
  console.log("Testing Open-Meteo API...");

  try {
    // Test with London coordinates
    const lat = 51.5074;
    const lon = -0.1278;

    console.log("\n1. Testing getCurrentWeather...");
    const currentWeather = await weatherAPI.getCurrentWeather(lat, lon);
    console.log("✅ Current weather data:");
    console.log(currentWeather);

    // Access the correct properties based on Open-Meteo's structure
    if (currentWeather.current) {
      console.log("Temperature:", currentWeather.current.temperature_2m + "°C");
      console.log(
        "Humidity:",
        currentWeather.current.relative_humidity_2m + "%"
      );
      console.log(
        "Feels like:",
        currentWeather.current.apparent_temperature + "°C"
      );
      console.log(
        "Weather:",
        weatherAPI.getWeatherDescription(currentWeather.current.weather_code)
      );
    }

    console.log("\n2. Testing getForecast...");
    const forecast = await weatherAPI.getForecast(lat, lon);
    console.log("✅ Forecast data received:");
    if (forecast.daily) {
      console.log(
        "Daily forecast available for",
        forecast.daily.time.length,
        "days"
      );
    }

    console.log("\n3. Testing searchLocations...");
    const locations = await weatherAPI.searchLocations("London");
    console.log("✅ Location search results:");
    if (locations.results) {
      locations.results.forEach((loc, index) => {
        console.log(`${index + 1}. ${loc.name}, ${loc.country}`);
        console.log(`   Coordinates: ${loc.latitude}, ${loc.longitude}`);
      });
    }
  } catch (error) {
    console.error("❌ API Test failed!");
    console.error("Error details:", error);
  }
}

// Run all tests
testAPI();
