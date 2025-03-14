import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testAPI() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: "Hello! How are you?" }] }],
    });

    console.log(result.response.text()); // Get response
  } catch (error) {
    console.error("Error:", error);
  }
}

testAPI();
