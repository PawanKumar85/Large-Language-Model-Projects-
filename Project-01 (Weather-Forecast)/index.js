import express from "express";
import { WeatherService } from "./weather.service.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

app.get("/api/weather", async (req, res) => {
  const { location } = req.query;
  if (!location) {
    return res.status(400).json({ error: "Location is required" });
  }

  try {
    const weatherService = new WeatherService();
    const weatherData = await weatherService.generateWeatherDescription(
      location
    );
    res.status(200).json({
      weatherData,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching weather data" });
  }
});

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "Welcome to the Weather API",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
