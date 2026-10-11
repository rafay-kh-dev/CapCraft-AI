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

    const selectedModel = modelName || "gemini-1.5-flash"; 
    
    const model = genAI.getGenerativeModel({ 
      model: selectedModel,
      systemInstruction: systemMessage 
    });
    
    // Format previous messages for Gemini API (role must be 'user' or 'model')
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