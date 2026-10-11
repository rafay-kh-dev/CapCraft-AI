const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// 1. Gemini AI Import karein
const { GoogleGenerativeAI } = require('@google/generative-ai');

// 2. App Initialize karein
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// 3. Gemini AI Setup karein
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Live MongoDB Connected Successfully!'))
  .catch(err => console.log('DB Connection Error:', err));

// ==========================================
// CAPCRAFT AI GENERATOR ROUTE (GEMINI)
// ==========================================
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, type } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, message: "Prompt is required" });
    }

    let systemMessage = "You are CapCraft AI, a world-class social media manager and expert copywriter. Your goal is to help users craft highly engaging content.";

    if (type === 'generate') {
      systemMessage += " The user will give you a topic. Write a high-converting, professional, and catchy social media caption. Include relevant emojis naturally. Keep the formatting clean and easy to read.";
    } else if (type === 'hashtags') {
      systemMessage += " The user will give you a topic. Generate a mix of 15-20 viral, trending, and niche hashtags. Output ONLY the hashtags separated by spaces (e.g., #digital #marketing). Do not write any other text.";
    } else if (type === 'history') {
      systemMessage += " The user is asking about their content. Respond helpfully and professionally.";
    }

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemMessage 
    });

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    res.json({
      success: true,
      text: responseText
    });

  } catch (error) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ 
      success: false, 
      message: "AI server is currently busy or API key is invalid. Please try again." 
    });
  }
});

// ==========================================
// AAPKE PURANE AUTH ROUTES YAHAN RAHENGE
// ==========================================
// app.post('/api/signup', ...)
// app.post('/api/login', ...)
// app.post('/api/google-auth', ...)


// 4. Server Start karein
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Node.js Server running on port ${PORT}`);
});

// Google Authentication Route in server.js
app.post('/api/google-auth', async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Aap yahan User model check kar sakte hain ya create kar sakte hain
    // Example response:
    res.json({
      success: true,
      user: { name: name || "User", email: email }
    });

  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(500).json({ success: false, message: "Server error during Google auth" });
  }
});