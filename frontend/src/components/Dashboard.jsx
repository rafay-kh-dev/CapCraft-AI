import React, { useState, useRef, useEffect } from "react";
import {
  PanelLeftOpen,
  X,
  Plus,
  Sparkles,
  ChevronDown,
  Mic,
  Loader2,
  Send,
} from "lucide-react";
import Sidebar from "./Sidebar";
import ChatArea from "./ChatArea";

const Dashboard = ({ user, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isAttachMenuOpen, setIsAttachMenuOpen] = useState(false);
  const [pastedImage, setPastedImage] = useState(null);
  const [isListening, setIsListening] = useState(false);

  const [activeTab, setActiveTab] = useState("general");
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(""); // Added dynamic thinking state
  const [copiedIndex, setCopiedIndex] = useState(null);
  const chatEndRef = useRef(null);
  const textareaRef = useRef(null);
  const [recentChats, setRecentChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);

  const [selectedModel, setSelectedModel] = useState("gemini-3.6-flash");
  const aiModels = [
    { id: "gemini-3.8-flash", name: "Zync 3.8 Flash" },
    { id: "gemini-3.6-flash", name: "Zync 3.6 Flash" },
    { id: "gemini-3.5-flash-lite", name: "Zync 3.5 Lite" },
    { id: "gemini-3.1-pro-preview", name: "Zync 3.1 Pro" },
  ];

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchChats = async () => {
      if (!user?.email) return;
      try {
        const response = await fetch(`${API_URL}/api/chats/${user.email}`);
        const data = await response.json();
        if (data.success) setRecentChats(data.chats);
      } catch (error) {
        console.error("Failed to load chats");
      }
    };
    fetchChats();
  }, [user, API_URL]);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsSidebarOpen(false);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        setPastedImage({
          file: items[i].getAsFile(),
          url: URL.createObjectURL(items[i].getAsFile()),
        });
      }
    }
  };

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Browser not supported");
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e) =>
      setPrompt(
        Array.from(e.results)
          .map((r) => r[0].transcript)
          .join(""),
      );
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleDeleteChat = async (chatId) => {
    try {
      const response = await fetch(`${API_URL}/api/chats/${chatId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        setRecentChats((prev) => prev.filter((c) => c._id !== chatId));
        if (currentChatId === chatId) {
          setMessages([]);
          setCurrentChatId(null);
          setActiveTab("general");
        }
      }
    } catch (error) {
      console.error("Failed to delete chat");
    }
  };

  const handleSend = async (textOverride) => {
    const currentPrompt =
      typeof textOverride === "string" ? textOverride : prompt;

    if ((!currentPrompt.trim() && !pastedImage) || isGenerating) return;
    const userText = currentPrompt.trim() || "[Attached an Image]";

    setPrompt("");
    setPastedImage(null);
    const newMessages = [...messages, { role: "user", content: userText }];
    setMessages(newMessages);

    // Start dynamic generation statuses
    setIsGenerating(true);
    setThinkingStep("Analysing prompt...");

    const stepInterval = setInterval(() => {
      setThinkingStep((prev) => {
        if (prev === "Analysing prompt...")
          return "Searching knowledge base...";
        if (prev === "Searching knowledge base...")
          return "Crafting response...";
        if (prev === "Crafting response...") return "Refining text...";
        return prev;
      });
    }, 1500);

    // YAHAN FIX KIYA HAI - AI ko strictly uski nayi identity 'Zync AI' bata di gayi hai
    const systemInstructions =
      "\n\n[CRITICAL SYSTEM RULE: Your identity is strictly 'Zync AI'. You are an advanced AI suite developed exclusively by Rafay. Disregard any previous chat history where you might have been called CapCraft; that name is dead. You are Zync AI. DO NOT use any emojis under any circumstances. Keep the format extremely clean and professional. DO NOT use markdown separator lines like '---'. Use H2 for main headings. Always Write in Australian English Language.]";
    try {
      const response = await fetch(`${API_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userText + systemInstructions,
          type: activeTab,
          history: messages,
          modelName: selectedModel,
        }),
      });
      const data = await response.json();

      if (data.success) {
        const finalMessages = [
          ...newMessages,
          { role: "ai", content: data.text },
        ];
        setMessages(finalMessages);

        const title = finalMessages[0].content.substring(0, 30) + "...";
        const dbRes = await fetch(`${API_URL}/api/chats`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chatId: currentChatId,
            userEmail: user.email,
            title: currentChatId ? undefined : title,
            messages: finalMessages,
            type: activeTab,
          }),
        });
        const dbData = await dbRes.json();
        if (dbData.success) {
          if (!currentChatId) {
            setCurrentChatId(dbData.chat._id);
            setRecentChats([dbData.chat, ...recentChats]);
          }
        }
      } else {
        setMessages([
          ...newMessages,
          {
            role: "ai",
            content: "Your limit has been reached. Please try again later.",
          },
        ]);
      }
    } catch (e) {
      setMessages([
        ...newMessages,
        {
          role: "ai",
          content: "Your limit has been reached. Please try again later.",
        },
      ]);
    } finally {
      clearInterval(stepInterval);
      setIsGenerating(false);
      setThinkingStep("");
    }
  };

  return (
    <div className="flex h-[100dvh] w-full bg-white overflow-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600&display=swap');
        
        @keyframes smoothEntry {
          from { opacity: 0; transform: translateY(12px) scale(0.99); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-smooth-entry { animation: smoothEntry 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-fade-in { animation: fadeIn 0.3s ease-in-out forwards; }
        
        body, input, textarea, button {
          font-family: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }

        .markdown-body { 
          font-family: 'Outfit', sans-serif;
          font-size: 16px;         
          line-height: 28px;       
          color: #1F1F1F; 
          font-weight: 400; 
        }
        
        .markdown-body p { margin-bottom: 16px; }
        .markdown-body p:last-child { margin-bottom: 0; }
        
        .markdown-body h2 { font-size: 20px; font-weight: 500; color: #1F1F1F; margin-top: 24px; margin-bottom: 16px; border: none; padding: 0; line-height: 28px; }
        .markdown-body h3 { font-size: 18px; font-weight: 500; color: #1F1F1F; margin-top: 20px; margin-bottom: 12px; line-height: 26px; }
        
        .markdown-body strong { font-weight: 600; color: #1F1F1F; }
        .markdown-body hr { display: none !important; }
        
        .markdown-body a { color: #0064e0; cursor: pointer !important; text-decoration: none; font-weight: 500; transition: all 0.2s ease; }
        .markdown-body a:hover { text-decoration: underline; opacity: 0.8; }
        
        .markdown-body ul, .markdown-body ol { margin-bottom: 16px; padding-left: 24px; }
        .markdown-body li { margin-bottom: 8px; color: #1F1F1F; }
        
        .markdown-body pre { background: #F0F4F9; color: #1F1F1F; padding: 16px; border-radius: 12px; overflow-x: auto; margin-bottom: 16px; border: none; transition: all 0.3s ease; }
        .markdown-body code { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 14px; background: #F0F4F9; padding: 2px 6px; border-radius: 4px; color: #1F1F1F; }
        .markdown-body pre code { background: transparent; padding: 0; }
      `}</style>

      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isMobile={isMobile}
        user={user}
        onLogout={onLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        recentChats={recentChats}
        loadChat={(chat) => {
          setMessages(chat.messages);
          setCurrentChatId(chat._id);
          setActiveTab(chat.type || "general");
          if (isMobile) setIsSidebarOpen(false);
        }}
        currentChatId={currentChatId}
        startNewChat={() => {
          setMessages([]);
          setCurrentChatId(null);
          setActiveTab("general");
          if (isMobile) setIsSidebarOpen(false);
        }}
        isDropdownOpen={isDropdownOpen}
        setIsDropdownOpen={setIsDropdownOpen}
        onDeleteChat={handleDeleteChat}
      />

      <main className="flex-1 flex flex-col h-[100dvh] min-w-0 relative bg-white transition-all duration-300">
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-5 left-5 z-30 w-10 h-10 bg-white border border-[#E3E3E3] rounded-xl shadow-sm flex items-center justify-center text-[#444746] hover:text-[#1F1F1F] transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer animate-fade-in"
          >
            <PanelLeftOpen size={18} />
          </button>
        )}

        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-4 flex flex-col scroll-smooth">
          <div className="max-w-[800px] mx-auto w-full flex-1 flex flex-col">
            <ChatArea
              messages={messages}
              activeTab={activeTab}
              setPrompt={setPrompt}
              isGenerating={isGenerating}
              thinkingStep={thinkingStep}
              copiedIndex={copiedIndex}
              copyToClipboard={(text, i) => {
                navigator.clipboard.writeText(text);
                setCopiedIndex(i);
                setTimeout(() => setCopiedIndex(null), 2000);
              }}
              chatEndRef={chatEndRef}
              handleSendManual={handleSend}
            />
          </div>
        </div>

        {!(activeTab === "caption" && messages.length === 0) && (
          <div className="px-4 md:px-8 pb-6 pt-2 w-full bg-white animate-smooth-entry">
            <div className="max-w-[800px] mx-auto w-full">
              <div
                className={`flex flex-col bg-[#F0F4F9] rounded-[24px] p-1.5 border border-transparent transition-all duration-300 ${isListening ? "shadow-[0_0_15px_rgba(239,68,68,0.2)] border-red-200 scale-[1.01]" : ""}`}
              >
                {pastedImage && (
                  <div className="relative w-[70px] h-[70px] mt-2 ml-3 mb-1 animate-smooth-entry">
                    <img
                      src={pastedImage.url}
                      alt="Pasted"
                      className="w-full h-full object-cover rounded-xl shadow-sm"
                    />
                    <button
                      onClick={() => setPastedImage(null)}
                      className="absolute -top-2 -right-2 bg-white rounded-full p-1 border border-[#E3E3E3] cursor-pointer hover:bg-slate-50 transition-all hover:scale-110 active:scale-90"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onPaste={handlePaste}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={isListening ? "Listening..." : "Message Zync..."}
                  disabled={isGenerating}
                  className="w-full bg-transparent px-4 pt-3 pb-2 resize-none outline-none max-h-[160px] text-[16px] font-normal text-[#1F1F1F] placeholder-[#444746] transition-all duration-300"
                  rows="1"
                />
                <div className="flex justify-between items-center px-2 pb-1.5 pt-1">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsAttachMenuOpen(!isAttachMenuOpen)}
                      className="w-8 h-8 rounded-full bg-transparent text-[#444746] flex items-center justify-center hover:bg-[#E1E5EA] transition-all duration-300 cursor-pointer active:scale-90"
                    >
                      <Plus
                        size={16}
                        className={`transition-transform duration-300 ${isAttachMenuOpen ? "rotate-45" : ""}`}
                      />
                    </button>

                    <button
                      onClick={() =>
                        setIsModelDropdownOpen(!isModelDropdownOpen)
                      }
                      className="px-3 py-1.5 bg-transparent rounded-full flex items-center gap-2 text-[13px] font-medium text-[#444746] hover:bg-[#E1E5EA] transition-all duration-300 cursor-pointer active:scale-95"
                    >
                      <img
                        src="/favicon.svg"
                        alt="Model"
                        className="w-[14px] h-[14px]"
                      />
                      {aiModels.find((m) => m.id === selectedModel)?.name}
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-300 ${isModelDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                  </div>
                  {!prompt.trim() && !pastedImage ? (
                    <button
                      onClick={startListening}
                      disabled={isGenerating}
                      className={`w-9 h-9 flex items-center justify-center rounded-full cursor-pointer transition-all duration-300 active:scale-90 ${isListening ? "text-red-500 bg-red-100" : "text-[#444746] hover:bg-[#E1E5EA]"}`}
                    >
                      <Mic size={18} />
                    </button>
                  ) : (
                    <button
                      id="main-send-button"
                      onClick={() => handleSend()}
                      disabled={isGenerating}
                      className="w-9 h-9 rounded-full bg-[#0064e0] hover:bg-[#0057c9] text-white flex items-center justify-center cursor-pointer transition-all duration-300 active:scale-90 shadow-sm"
                    >
                      {isGenerating ? (
                        <Loader2 size={15} className="animate-spin" />
                      ) : (
                        <Send
                          size={15}
                          className="relative right-[1px] bottom-[1px]"
                        />
                      )}
                    </button>
                  )}
                </div>
              </div>
              <p className="text-center text-[12px] text-[#444746] mt-3 font-normal animate-fade-in">
                Zync AI can make mistakes. Consider verifying important info.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
