import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";
import readline from "readline";
import dotenv from "dotenv";
import chalk from "chalk";

dotenv.config();

const GOOGLE_API = process.env.GOOGLE_API_KEY;
const GOOGLE_MODEL = process.env.GOOGLE_MODEL_NAME;

if (!GOOGLE_API || !GOOGLE_MODEL) {
  console.error(
    chalk.red(
      "Missing GOOGLE_API_KEY or GOOGLE_MODEL_NAME environment variable."
    )
  );
  process.exit(1);
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const chatModel = new ChatGoogleGenerativeAI({
  apiKey: GOOGLE_API,
  modelName: GOOGLE_MODEL,
  temperature: 0.7,
  maxOutputTokens: 2048,
  streaming: true,
});

class ChatbotWithMemory {
  constructor() {
    this.chatHistory = [];

    this.memory = new BufferMemory({
      returnMessages: true,
      memoryKey: "history",
      chatHistoryLength: 5,
    });

    this.conversationChain = new ConversationChain({
      llm: chatModel,
      memory: this.memory,
      prompt: ChatPromptTemplate.fromMessages([
        {
          role: "system",
          content:
            "You are a helpful assistant who speaks Hinglish (Hindi + English).",
        },
        { role: "human", content: "{input}" },
      ]),
    });
  }

  async chatWithManualMemory(userInput) {
    // Add user input to history
    this.chatHistory.push({ role: "human", content: userInput });

    // Create prompt including history
    const historyPrompt = ChatPromptTemplate.fromMessages([
      {
        role: "system",
        content:
          "You are a helpful assistant who speaks Hinglish (Hindi + English).",
      },
      ...this.chatHistory,
    ]);

    // Create a new chain with the updated history
    const memoryChain = historyPrompt
      .pipe(chatModel)
      .pipe(new StringOutputParser());

    try {
      const response = await memoryChain.invoke({});
      this.chatHistory.push({ role: "ai", content: response });
      return response;
    } catch (error) {
      console.error("Error:", error);
      return "Sorry, I encountered an error processing your request.";
    }
  }

  async chatWithBuiltInMemory(userInput) {
    try {
      const response = await this.conversationChain.call({ input: userInput });
      return response.response;
    } catch (error) {
      console.error("Error:", error);
      return "Sorry, I encountered an error processing your request.";
    }
  }

  async printChatHistory() {
    console.log(chalk.bgCyan("Chat History"));
    console.log("---------------------------------------");

    // Retrieve chat history from BufferMemory
    const memoryData = await this.memory.loadMemoryVariables({});
    const history = memoryData.history || [];

    if (history.length === 0) {
      console.log("No chat history available.");
    } else {
      history.forEach((message) => {
        let role = "Unknown";
        if (message._getType) {
          role = message._getType() === "human" ? "You" : "Bot";
        }
        console.log(`${role}: ${message.content}`);
      });
    }

    console.log("---------------------------------------");
    console.log("");
  }
}

async function simpleChatbot(userInput) {
  const promptTemplate = ChatPromptTemplate.fromMessages([
    {
      role: "system",
      content:
        "You are a helpful assistant who speaks Hinglish (Hindi + English).",
    },
    { role: "human", content: "{input}" },
  ]);

  const chain = promptTemplate.pipe(chatModel).pipe(new StringOutputParser());

  try {
    const response = await chain.invoke({ input: userInput });
    return response;
  } catch (error) {
    console.error("Error:", error);
    return "Sorry, I encountered an error processing your request.";
  }
}

// const userInput = "Nothing"

// simpleChatbot(userInput).then((response) => {
//   console.log(chalk.green("Bot:", response));
// });

async function runChatbot() {
  console.log(chalk.yellow("Welcome to LangChain Chatbot 👌!"));
  console.log(chalk.yellow("Type 'exit' to quit the chat"));
  console.log(chalk.bgGrey("---------------------------------------"));

  const bot = new ChatbotWithMemory();

  const askQuestion = () => {
    rl.question("You: ", async (input) => {
      const userInput = input.trim();

      if (userInput === "") {
        console.log(chalk.bgRed("Please enter a valid message."));
        askQuestion();
        return;
      }
      if (userInput.toLowerCase() === "exit") {
        console.log(chalk.bgRed("Thank you for chatting! Goodbye!"));
        rl.close();
        return;
      }
      if (userInput.toLowerCase() === "history") {
        await bot.printChatHistory();
        askQuestion();
        return;
      }
      console.log(chalk.blue("Bot is thinking..."));

      const response = await bot.chatWithBuiltInMemory(userInput);

      console.log(chalk.green("Bot:", response));
      console.log("---------------------------------------");
      askQuestion();
    });
  };

  askQuestion();
}

// Run the chatbot
runChatbot();
