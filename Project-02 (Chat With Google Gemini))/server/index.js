import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { getChatbotResponse } from "./chatbot.service.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080; // Default to 8080 if PORT is not set

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    await getChatbotResponse(message, res);
  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/", (req, res) => {
  return res.json({
    message: "Welcome to the Chatbot API!",
  });
});

// Start Server
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
