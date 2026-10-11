const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const { GoogleGenerativeAI } = require('@google/generative-ai');

// App Initialization (Yeh delete ho gaya tha aap se)
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

    // Dynamic System Prompts based on selected tool
    let systemMessage = "You are CapCraft AI, a helpful and highly intelligent AI assistant.";

    if (type === 'general') {
      systemMessage = "You are CapCraft AI, a highly advanced conversational AI like ChatGPT or Claude. Answer general queries accurately, informatively, and politely. Format your responses beautifully.";
    } 
    else if (type === 'caption') {
      systemMessage = "You are CapCraft AI, a world-class social media manager. The user will give you a topic. Write a high-converting, professional, and catchy social media caption. Include relevant emojis naturally. Keep the formatting clean.";
    } 
    else if (type === 'article') {
      systemMessage = "You are CapCraft AI, an expert content writer and SEO specialist. Write a comprehensive, engaging, and well-structured article/blog post. CRITICAL RULE: ALWAYS write in Australian English language (e.g., 'colour', 'organise', 'optimise'). CRITICAL RULE: ALWAYS write all main headings in H2 format.";
    }
    else if (type === 'hashtags') {
      systemMessage = "You are CapCraft AI, a social media growth expert. Generate a mix of 15-20 viral, trending, and niche hashtags. Output ONLY the hashtags separated by spaces (e.g., #tech #innovation).";
    }

    // Terminal log mein strict warning thi isliye hum 3.8-flash default rakhenge
    const selectedModel = modelName || "gemini-3.8-flash"; 
    
    const model = genAI.getGenerativeModel({ 
      model: selectedModel,
      systemInstruction: systemMessage 
    });
    
    // Format previous messages for Gemini API
    const formattedHistory = (history || []).map(msg => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Start a chat session with the historical memory
    const chat = model.startChat({
      history: formattedHistory
    });
    
    // Send the new prompt into the ongoing chat
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Node.js Server running on port ${PORT}`);
});