const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch");
const mongoose = require("mongoose");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// 1. MONGODB CONNECTION
// ==========================================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Live MongoDB Connected Successfully!"))
  .catch((err) => console.log("MongoDB Connection Error: ", err));

// ==========================================
// 2. MONGOOSE SCHEMAS & MODELS
// ==========================================
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String } 
}, { timestamps: true });
const User = mongoose.model("User", userSchema);

const chatSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  title: { type: String, required: true },
  type: { type: String, default: "general" },
  messages: { type: Array, default: [] }
}, { timestamps: true });
const Chat = mongoose.model("Chat", chatSchema);

// ==========================================
// 3. AUTHENTICATION ROUTES
// ==========================================
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.json({ success: false, message: "User already exists" });
    const user = new User({ name, email, password });
    await user.save();
    res.json({ success: true, user });
  } catch (error) { res.json({ success: false, message: error.message }); }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) return res.json({ success: false, message: "Invalid email or password" });
    res.json({ success: true, user });
  } catch (error) { res.json({ success: false, message: error.message }); }
});

app.post("/api/google-auth", async (req, res) => {
  try {
    const { name, email } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ name, email });
      await user.save();
    }
    res.json({ success: true, user });
  } catch (error) { res.json({ success: false, message: error.message }); }
});

// ==========================================
// 4. CHAT HISTORY ROUTES
// ==========================================
app.get("/api/chats/:email", async (req, res) => {
  try {
    const chats = await Chat.find({ userEmail: req.params.email }).sort({ createdAt: -1 });
    res.json({ success: true, chats });
  } catch (error) { res.json({ success: false, message: error.message }); }
});

app.post("/api/chats", async (req, res) => {
  try {
    const { chatId, userEmail, title, messages, type } = req.body;
    if (chatId) {
      const chat = await Chat.findByIdAndUpdate(chatId, { messages, type }, { returnDocument: 'after' });
      res.json({ success: true, chat });
    } else {
      const chat = new Chat({ userEmail, title, messages, type });
      await chat.save();
      res.json({ success: true, chat });
    }
  } catch (error) { res.json({ success: false, message: error.message }); }
});

app.delete("/api/chats/:id", async (req, res) => {
  try {
    await Chat.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (error) { res.json({ success: false, message: error.message }); }
});

// ==========================================
// 5. ZYNC AI IMAGE GENERATION (HUGGING FACE)
// ==========================================
app.post("/api/generate-image", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ success: false, message: "Prompt is required" });

  try {
    console.log(`Generating Image: "${prompt}" via Hugging Face...`);
    const response = await fetch("https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ inputs: prompt })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("HF Error Details:", errorText);
      throw new Error("Image API Error");
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');

    res.json({
      success: true,
      provider: "Hugging Face (FLUX.1)",
      image: `data:image/jpeg;base64,${base64Image}`
    });
  } catch (error) {
    console.error("Image Gen Error:", error.message);
    res.status(500).json({ success: false, message: "Image generation failed." });
  }
});

// ==========================================
// 6. ZYNC AI FALLBACK TEXT GENERATION
// ==========================================
const ZYNC_SYSTEM_PROMPT = "You are Zync AI, an advanced AI suite developed exclusively by Rafay. You must NEVER refer to yourself as CapCraft, ChatGPT, OpenAI, or Google. Your name is strictly Zync AI. Do not use emojis under any circumstances. Write in Australian English. Keep your formatting clean and professional. Use H2 for main headings.";

const apiPool = [
  { provider: "groq", key: process.env.GROQ_API_KEY },    
  { provider: "gemini", key: process.env.GEMINI_API_KEY_1 || process.env.GEMINI_API_KEY },
  { provider: "cohere", key: process.env.COHERE_API_KEY }
];

let activeGroqModel = null;
let activeGeminiModel = null;

async function callGroq(prompt, history, key) {
  if (!activeGroqModel) {
    const res = await fetch("https://api.groq.com/openai/v1/models", { headers: { "Authorization": `Bearer ${key}` } });
    const data = await res.json();
    if (data.data && data.data.length > 0) {
      const models = data.data.map(m => m.id);
      activeGroqModel = models.find(m => m.includes("llama-3")) || models.find(m => m.includes("gemma")) || models[0];
      console.log(`✅ Auto-Discovered Groq Model: ${activeGroqModel}`);
    } else { throw new Error("No active models found in Groq"); }
  }

  const messages = [{ role: "system", content: ZYNC_SYSTEM_PROMPT }];
  history.forEach(msg => messages.push({ role: msg.role === "ai" ? "assistant" : "user", content: msg.content }));
  messages.push({ role: "user", content: prompt });

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST", headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messages: messages, model: activeGroqModel, temperature: 0.7 })
  });
  
  if (!response.ok) throw new Error("Groq API Error");
  const data = await response.json();
  return data.choices[0].message.content;
}

async function callGemini(prompt, history, key) {
  if (!activeGeminiModel) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await res.json();
    if (data.models && data.models.length > 0) {
      const models = data.models.filter(m => m.supportedGenerationMethods?.includes("generateContent")).map(m => m.name.replace("models/", ""));
      activeGeminiModel = models.find(m => m.includes("gemini-1.5-flash")) || models[0];
      console.log(`✅ Auto-Discovered Gemini Model: ${activeGeminiModel}`);
    } else { throw new Error("No active models found in Gemini"); }
  }

  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: activeGeminiModel });
  
  const chatHistory = history.map(msg => ({
    role: msg.role === "ai" ? "model" : "user",
    parts: [{ text: msg.content }]
  }));
  
  const chat = model.startChat({ history: chatHistory });
  const fullPrompt = `System Instruction: ${ZYNC_SYSTEM_PROMPT}\n\nUser Prompt: ${prompt}`;
  const result = await chat.sendMessage(fullPrompt);
  return result.response.text();
}

async function callCohere(prompt, history, key) {
  const chatHistory = history.map(msg => ({ role: msg.role === "ai" ? "CHATBOT" : "USER", message: msg.content }));
  const response = await fetch("https://api.cohere.ai/v1/chat", {
    method: "POST", headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ message: prompt, chat_history: chatHistory, preamble: ZYNC_SYSTEM_PROMPT, temperature: 0.7 })
  });
  
  if (!response.ok) throw new Error("Cohere API Error");
  const data = await response.json();
  return data.text;
}

app.post("/api/generate", async (req, res) => {
  const { prompt, history } = req.body;
  const chatHistory = history || []; 

  if (!prompt) return res.status(400).json({ success: false, message: "Prompt is required" });

  let finalResponse = null;
  let success = false;

  for (let i = 0; i < apiPool.length; i++) {
    const api = apiPool[i];
    if (!api.key) continue;
    console.log(`Trying API Provider: ${api.provider}...`);

    try {
      if (api.provider === "groq") finalResponse = await callGroq(prompt, chatHistory, api.key);
      else if (api.provider === "gemini") finalResponse = await callGemini(prompt, chatHistory, api.key);
      else if (api.provider === "cohere") finalResponse = await callCohere(prompt, chatHistory, api.key);

      if (finalResponse) {
        success = true;
        console.log(`Successfully generated using ${api.provider}`);
        break; 
      }
    } catch (error) { 
      console.error(`[FAIL] ${api.provider} failed. Skipping to next...`); 
    }
  }

  if (success && finalResponse) res.json({ success: true, text: finalResponse });
  else res.status(500).json({ success: false, text: "System is experiencing extremely high traffic. Please try again." });
});

// ==========================================
// 7. SERVER INITIALIZATION
// ==========================================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Zync AI Backend Server running on port ${PORT}`);
});