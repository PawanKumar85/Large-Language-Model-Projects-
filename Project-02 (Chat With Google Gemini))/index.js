import express from "express";
import dotenv from "dotenv";
import { getChatbotResponse } from "./chatbot.service.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  await getChatbotResponse(message, res);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
