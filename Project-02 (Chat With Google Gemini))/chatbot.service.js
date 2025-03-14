import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const getChatbotResponse = async (userMessage, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    // Check if the message is coding-related
    const codingPrompt = `
      If the user's message is related to coding (like asking for code examples, algorithms, or programming concepts), 
      then respond ONLY with properly formatted and indented code. Do NOT add any explanation. 
      Use proper syntax highlighting and make sure the code is correct.

      Otherwise, provide a friendly, detailed, and engaging response as usual.
      
      User's message: "${userMessage}"
    `;

    const result = await model.generateContentStream(userMessage);

    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Transfer-Encoding", "chunked");

    let textStream = "";
    for await (const chunk of result.stream) {
      if (chunk.text) {
        textStream += chunk.text();
        res.write(chunk.text());
      }
    }

    res.end();
  } catch (error) {
    console.error("Error:", error);
    return "Oops! Something went wrong.";
  }
};







