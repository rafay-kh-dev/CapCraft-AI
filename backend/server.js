const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const { GoogleGenerativeAI } = require('@google/generative-ai');

// App Initialization
const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Live MongoDB Connected Successfully!'))
  .catch(err => console.log('DB Connection Error:', err));

// Chat Schema for Database Sync
const chatSchema = new mongoose.Schema({
  userEmail: String,
  title: String,
  messages: Array,
  updatedAt: { type: Date, default: Date.now }
});
const Chat = mongoose.model('Chat', chatSchema);

// User Schema for Authentication
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model('UserAuth', userSchema);

// Get All Chats for a User
app.get('/api/chats/:email', async (req, res) => {
  try {
    const chats = await Chat.find({ userEmail: req.params.email }).sort({ updatedAt: -1 });
    res.json({ success: true, chats });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to load chats" });
  }
});

// Save or Update Chat
app.post('/api/chats', async (req, res) => {
  try {
    const { chatId, userEmail, title, messages } = req.body;
    
    if (chatId) {
      const updatedChat = await Chat.findByIdAndUpdate(chatId, { messages, updatedAt: Date.now() }, { new: true });
      return res.json({ success: true, chat: updatedChat });
    } else {
      const newChat = new Chat({ userEmail, title, messages });
      await newChat.save();
      return res.json({ success: true, chat: newChat });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to save chat" });
  }
});

// CapCraft AI Generator Route with Conversational Memory
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, type, modelName, history } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, message: "Prompt is required" });
    }

    // Strict Identity Override System Prompt
    let systemMessage = "You are CapCraft AI, a highly advanced AI assistant. YOUR STRICT IDENTITY RULES: 1. You were exclusively coded, designed, and developed by ONE single brilliant developer named Rafay. 2. You do NOT belong to a 'team of engineers' or any corporation. 3. You must NEVER mention Google, OpenAI, or any other company. 4. If asked 'Who created you?', 'Who is your developer?', or 'Who made you?', you must proudly and directly say: 'I was created and developed by Rafay.' and nothing else about your origins.";

    if (type === 'general') {
      systemMessage += " Answer general queries accurately, informatively, and politely. Format your responses beautifully.";
    } 
    else if (type === 'caption') {
      systemMessage += " The user will give you a topic. Write a high-converting, professional, and catchy social media caption. Include relevant emojis naturally. Keep the formatting clean.";
    } 
    else if (type === 'article') {
      systemMessage += " Write a comprehensive, engaging, and well-structured article/blog post. CRITICAL RULE: ALWAYS write in Australian English language (e.g., 'colour', 'organise'). CRITICAL RULE: ALWAYS write all main headings in H2 format.";
    }
    else if (type === 'hashtags') {
      systemMessage += " Generate a mix of 15-20 viral, trending, and niche hashtags. Output ONLY the hashtags separated by spaces (e.g., #tech #innovation).";
    }

    const selectedModel = modelName || "gemini-3.8-flash"; 
    
    const model = genAI.getGenerativeModel({ 
      model: selectedModel,
      systemInstruction: systemMessage 
    });
    
    const formattedHistory = (history || []).map(msg => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
      history: formattedHistory
    });
    
    const result = await chat.sendMessage(prompt);
    const responseText = result.response.text();

    res.json({ success: true, text: responseText });

  } catch (error) {
    console.error("Gemini API Error:", error.message);
    res.status(500).json({ 
      success: false, 
      message: error.message || "AI server is currently busy. Please try again." 
    });
  }
});

// Google Auth Route
app.post('/api/google-auth', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });
    res.json({ success: true, user: { name: name || "User", email: email } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error during Google auth" });
  }
});

// Signup Route
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    res.json({ success: true, message: "Account created successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error during signup." });
  }
});

// Login Route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ success: false, message: "User not found." });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials." });
    }
    res.json({ 
      success: true, 
      user: { name: user.name, email: user.email } 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error during login." });
  }
});

// Server Listener (Hamesha aakhir mein hona chahiye)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Node.js Server running on port ${PORT}`);
});