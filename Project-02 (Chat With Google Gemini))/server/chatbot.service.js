import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const getChatbotResponse = async (userMessage, res) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    // Check if the message is coding-related
    const codingPrompt = `
  Act like you're having a casual conversation with the user. If their message is about coding 
  (e.g., asking for code examples, algorithms, or programming concepts), respond ONLY with 
  properly formatted, well-indented, and syntactically correct code—just as if you were sharing 
  a snippet with a fellow developer. Don't include any explanation or extra commentary.

  Ensure that the code responses vary slightly each time, using different approaches, function 
  names, or optimizations to keep the answers fresh and engaging.

  If the user’s message isn't related to coding, reply in a friendly and engaging manner, 
  providing a detailed response as you normally would. Keep the responses unique and 
  interesting each time.

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
