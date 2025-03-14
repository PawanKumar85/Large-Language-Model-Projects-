import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export class WeatherService {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.weatherAPIKey = process.env.WEATHER_API_KEY;
  }

  async getWeatherData(location) {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${this.weatherAPIKey}&units=metric`
      );
      return response.data;
    } catch (error) {
      throw new Error("Couldn't get weather data");
    }
  }

  async generateWeatherDescription(location) {
    try {
      const weatherData = await this.getWeatherData(location);

      const weatherInfo = {
        temp: weatherData.main.temp,
        condition: weatherData.weather[0].description,
        humidity: weatherData.main.humidity,
        wind: weatherData.wind.speed,
        city: weatherData.name,
        country: weatherData.sys.country,
      };

      const prompt = `
        Respond in Hinglish
        Hey there! The weather in ${weatherInfo.city}, ${weatherInfo.country} is quite interesting today. 🌤️  
        The current temperature is ${weatherInfo.temp}°C, with ${weatherInfo.condition} in the sky.  
        Humidity levels are ${weatherInfo.humidity}%, and the wind is blowing at ${weatherInfo.wind} kph.  

        अगर बाहर जाने का प्लान है तो मौसम का ध्यान रखना! हल्की ठंडी हवा चल रही है, तो एक हल्का जैकेट पहनना सही रहेगा। 😉  
        Enjoy your day, and stay weather-ready! ☀️🌿
        `;

      const model = this.genAI.getGenerativeModel({
        model: "gemini-1.5-pro-latest",
      });
      const result = await model.generateContent(prompt);
      const descriptive = result.response.text();

      return {
        weatherInfo,
        description: descriptive,
      };
    } catch (error) {
      console.error(error);
      throw new Error("Couldn't generate weather description");
    }
  }
}
