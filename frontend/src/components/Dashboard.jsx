import React, { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  PenTool,
  Hash,
  X,
  Send,
  Zap,
  MessageSquare,
  Image as ImageIcon,
  User,
  Copy,
  CheckCircle2,
  Plus,
  Settings,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  MessageCircle,
  Sparkles,
  FileText,
  ChevronDown,
  Loader2,
} from "lucide-react";

const Dashboard = ({ user, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  const [activeTab, setActiveTab] = useState("general");
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const chatEndRef = useRef(null);

  const [recentChats, setRecentChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);

  // Dynamic Thinking State Logic
  const thinkingSteps = [
    "Analyzing your request...",
    "Gathering context...",
    "Processing logic...",
    "Crafting perfect response...",
  ];
  const [thinkingStep, setThinkingStep] = useState(thinkingSteps[0]);

  useEffect(() => {
    let interval;
    if (isGenerating) {
      let stepIndex = 0;
      interval = setInterval(() => {
        stepIndex = (stepIndex + 1) % thinkingSteps.length;
        setThinkingStep(thinkingSteps[stepIndex]);
      }, 1800); // Har 1.8 seconds ke baad text change hoga
    } else {
      setThinkingStep(thinkingSteps[0]);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // CapCraft Models List (Purane 2.5 models remove kar diye gaye hain)
  const aiModels = [
    { id: "gemini-3.8-flash", name: "CapCraft 3.8 Flash (Fast)" },
    { id: "gemini-3.8-live-extended-thinking", name: "CapCraft 3.8 Extended" },
    { id: "gemini-3.6-flash", name: "CapCraft 3.6 Flash" },
    { id: "gemini-3.5-flash-lite", name: "CapCraft 3.5 Lite" },
    { id: "gemini-3.1-pro-preview", name: "CapCraft 3.1 Pro (Smart)" },
  ];

  // Default model ab strictly 3.8-flash set karna lazmi hai
  // Default model ko 3.6 set kar dein taake direct yahi chale
  const [selectedModel, setSelectedModel] = useState("gemini-3.6-flash");
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchChats = async () => {
      if (!user?.email) return;
      try {
        const response = await fetch(`${API_URL}/api/chats/${user.email}`);
        const data = await response.json();
        if (data.success) {
          setRecentChats(data.chats);
        }
      } catch (error) {
        console.error("Failed to load chats:", error);
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

  const navItems = [
    {
      id: "general",
      label: "General Chat",
      icon: <Sparkles size={16} strokeWidth={1.5} />,
    },
    {
      id: "caption",
      label: "AI Caption Generator",
      icon: <PenTool size={16} strokeWidth={1.5} />,
    },
    {
      id: "article",
      label: "Article Writing",
      icon: <FileText size={16} strokeWidth={1.5} />,
    },
    {
      id: "hashtags",
      label: "Viral Hashtags",
      icon: <Hash size={16} strokeWidth={1.5} />,
    },
  ];

  const suggestions = [
    {
      icon: (
        <MessageSquare size={16} strokeWidth={1.5} className="text-[#0064e0]" />
      ),
      text: "Explain quantum computing in simple terms",
    },
    {
      icon: <Zap size={16} strokeWidth={1.5} className="text-amber-500" />,
      text: "Write a high-converting LinkedIn post about AI",
    },
    {
      icon: (
        <FileText size={16} strokeWidth={1.5} className="text-emerald-500" />
      ),
      text: "Write an SEO article about remote work",
    },
    {
      icon: <Hash size={16} strokeWidth={1.5} className="text-purple-500" />,
      text: "Find trending hashtags for digital marketing",
    },
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isDropdownOpen &&
        !event.target.closest(".profile-dropdown-container")
      )
        setIsDropdownOpen(false);
      if (
        isModelDropdownOpen &&
        !event.target.closest(".model-dropdown-container")
      )
        setIsModelDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen, isModelDropdownOpen]);

  const saveChatToDB = async (newMessages, chatId) => {
    if (!user?.email) return;
    try {
      const title = newMessages[0].content.substring(0, 30) + "...";
      const response = await fetch(`${API_URL}/api/chats`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: chatId,
          userEmail: user.email,
          title: chatId ? undefined : title,
          messages: newMessages,
        }),
      });
      const data = await response.json();
      if (data.success) {
        if (!chatId) {
          setCurrentChatId(data.chat._id);
          setRecentChats((prev) => [data.chat, ...prev]);
        } else {
          setRecentChats((prev) =>
            prev.map((c) => (c._id === data.chat._id ? data.chat : c)),
          );
        }
      }
    } catch (error) {
      console.error("Chat sync failed");
    }
  };

  const handleSend = async () => {
    if (!prompt.trim() || isGenerating) return;

    const userText = prompt.trim();
    setPrompt("");

    // Fixed React State Bug: Local variable mein array save kar ke bhejna zaroori hai
    const messagesWithUser = [...messages, { role: "user", content: userText }];
    setMessages(messagesWithUser);
    setIsGenerating(true);

    try {
      const response = await fetch(`${API_URL}/api/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userText,
          type: activeTab,
          history: messages,
          modelName: selectedModel,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const finalMessages = [
          ...messagesWithUser,
          { role: "ai", content: data.text },
        ];
        setMessages(finalMessages);
        saveChatToDB(finalMessages, currentChatId);
      } else {
        setMessages([
          ...messagesWithUser,
          { role: "ai", content: "Error: " + data.message },
        ]);
      }
    } catch (error) {
      setMessages([
        ...messagesWithUser,
        { role: "ai", content: "Server connection failed. Please try again." },
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const loadChat = (chat) => {
    setMessages(chat.messages);
    setCurrentChatId(chat._id);
    if (isMobile) setIsSidebarOpen(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  let placeholderText = "Message CapCraft...";
  if (activeTab === "caption")
    placeholderText = "Describe your post for a caption...";
  if (activeTab === "article")
    placeholderText = "What topic should the article be about?";
  if (activeTab === "hashtags")
    placeholderText = "Enter a keyword for hashtags...";
  if (isGenerating) placeholderText = "AI is thinking...";

  return (
    <div
      className="flex h-[100dvh] w-full bg-white overflow-hidden"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        @keyframes slideRightEnter { 0% { opacity: 0; transform: translateX(-20px); } 100% { opacity: 1; transform: translateX(0); } }
        @keyframes slideUpEnter { 0% { opacity: 0; transform: translateY(15px); } 100% { opacity: 1; transform: translateY(0); } }
        @keyframes popIn { 0% { opacity: 0; transform: scale(0.96) translateY(5px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }

        .animate-sidebar { animation: slideRightEnter 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
        .animate-workspace { opacity: 0; animation: slideUpEnter 0.6s cubic-bezier(0.2, 0.8, 0.2, 1) 0.1s forwards; }
        .animate-pop { opacity: 0; animation: popIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }

        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        * { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }

        .markdown-body { font-size: 14.5px; line-height: 1.65; color: #1e293b; }
        .markdown-body p { margin-bottom: 0.8em; }
        .markdown-body p:last-child { margin-bottom: 0; }
        .markdown-body h2, .markdown-body h3 { font-weight: 700; color: #0f172a; margin-top: 1.2em; margin-bottom: 0.6em; }
        .markdown-body h2 { font-size: 1.2em; }
        .markdown-body h3 { font-size: 1.1em; }
        .markdown-body ul { list-style-type: disc; padding-left: 1.2em; margin-bottom: 0.8em; }
        .markdown-body ol { list-style-type: decimal; padding-left: 1.2em; margin-bottom: 0.8em; }
        .markdown-body li { margin-bottom: 0.3em; }
        .markdown-body strong { font-weight: 700; color: #0f172a; }
        .markdown-body pre { background: #f8fafc; color: #0f172a; padding: 1em; border-radius: 8px; border: 1px solid #e2e8f0; overflow-x: auto; margin-bottom: 0.8em; }
      `}</style>

      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-20 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* SIDEBAR */}
      <aside
        className={`animate-sidebar fixed lg:static inset-y-0 left-0 z-30 bg-[#F9FAFB] flex flex-col transition-all duration-300 ease-in-out overflow-hidden border-slate-200/60 ${isSidebarOpen ? "w-[260px] translate-x-0 border-r" : "-translate-x-full lg:translate-x-0 lg:w-0 border-r-0"}`}
      >
        <div className="w-[260px] flex flex-col h-full">
          <div className="h-[64px] flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center group cursor-pointer">
              <img
                src="/favicon.svg"
                alt="CapCraft"
                className="w-7 h-7 mr-2.5 rounded-md shadow-sm group-hover:scale-105 transition-transform"
              />
              <span className="font-bold text-[15px] text-slate-800 tracking-tight">
                CapCraft{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0064e0] to-[#60a5fa]">
                  AI
                </span>
              </span>
            </div>
            <button
              className="text-slate-400 hover:text-slate-700 bg-transparent hover:bg-slate-200/70 p-1.5 rounded-lg cursor-pointer transition-all"
              onClick={() => setIsSidebarOpen(false)}
            >
              {isMobile ? (
                <X size={16} strokeWidth={1.5} />
              ) : (
                <PanelLeftClose size={16} strokeWidth={1.5} />
              )}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-2 px-3 flex flex-col">
            <button
              onClick={() => {
                setMessages([]);
                setCurrentChatId(null);
                setActiveTab("general");
                if (isMobile) setIsSidebarOpen(false);
              }}
              className="flex items-center gap-2.5 w-full px-3 py-2.5 mb-5 bg-white border border-slate-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:border-slate-300 rounded-xl transition-all duration-300 text-[13.5px] font-semibold text-slate-700 cursor-pointer"
            >
              <Plus size={16} strokeWidth={2.5} className="text-[#0064e0]" />{" "}
              New chat
            </button>

            <div className="flex flex-col gap-1 mb-6">
              <div className="text-[11px] font-bold text-slate-400 mb-1 px-3 uppercase tracking-wider">
                AI Tools
              </div>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    if (isMobile) setIsSidebarOpen(false);
                  }}
                  className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg transition-all duration-200 text-[13px] font-medium cursor-pointer ${activeTab === item.id ? "bg-[#EBF3FF] text-[#0064e0]" : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"}`}
                >
                  <span
                    className={`transition-colors ${activeTab === item.id ? "text-[#0064e0]" : "text-slate-400"}`}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col">
              <div className="text-[11px] font-bold text-slate-400 mb-2 px-3 uppercase tracking-wider">
                Recent History
              </div>
              <div className="flex flex-col gap-0.5">
                {recentChats.map((chat) => (
                  <button
                    key={chat._id}
                    onClick={() => loadChat(chat)}
                    className={`w-full flex items-center gap-2 text-left truncate px-3 py-2 rounded-lg text-[12.5px] font-medium transition-colors cursor-pointer ${currentChatId === chat._id ? "bg-slate-200/70 text-slate-900" : "text-slate-500 hover:bg-slate-200/50 hover:text-slate-800"}`}
                  >
                    <MessageCircle size={14} className="shrink-0 opacity-70" />
                    <span className="truncate">{chat.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-2 border-t border-slate-200/60 shrink-0 relative profile-dropdown-container">
            {isDropdownOpen && (
              <div className="absolute bottom-full left-2 right-2 mb-2 bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 z-50">
                <button
                  onClick={onLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 text-[13.5px] font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut size={16} strokeWidth={2} /> Log out
                </button>
              </div>
            )}
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between group px-2 py-2 hover:bg-slate-200/60 rounded-xl transition-all cursor-pointer select-none"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0064e0] to-[#60a5fa] text-white flex items-center justify-center font-bold text-[12px] shadow-sm shrink-0">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "R"}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-[12.5px] font-bold text-slate-800 truncate">
                    {user?.name || "Rafay"}
                  </span>
                  <span className="text-[10px] font-medium text-slate-500">
                    Pro
                  </span>
                </div>
              </div>
              <button
                className={`p-1.5 rounded-md transition-colors ${isDropdownOpen ? "bg-slate-200 text-slate-800" : "text-slate-400 group-hover:text-slate-700"}`}
              >
                <Settings size={16} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN WORKSPACE */}
      <main className="animate-workspace flex-1 flex flex-col h-full min-w-0 relative">
        <div
          className={`absolute top-5 left-5 z-20 transition-opacity duration-300 ${isSidebarOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        >
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center justify-center w-10 h-10 bg-white border border-slate-200/80 text-slate-500 hover:text-slate-800 hover:shadow-md rounded-xl shadow-sm cursor-pointer transition-all"
          >
            <PanelLeftOpen size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-4 relative z-10 scroll-smooth flex flex-col">
          <div className="max-w-[800px] mx-auto w-full h-full flex flex-col justify-between relative">
            <div className="flex-1 flex flex-col pb-4">
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col justify-center py-10 mt-10">
                  <div className="flex flex-col items-center text-center mb-7">
                    <div className="flex items-center justify-center w-12 h-12 bg-white rounded-[14px] shadow-sm border border-slate-200/60 mb-5 relative overflow-hidden group">
                      <img
                        src="/favicon.svg"
                        alt="CapCraft"
                        className="w-7 h-7 rounded-md"
                      />
                    </div>
                    <h2 className="text-[24px] sm:text-[28px] font-bold text-slate-800 mb-2 tracking-tight">
                      What are we crafting today?
                    </h2>
                    <p className="text-slate-500 text-[13px] font-medium max-w-md mx-auto leading-relaxed">
                      Describe your post, target audience, and desired tone, or
                      select a suggestion.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {suggestions.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => setPrompt(item.text)}
                        className="animate-pop flex items-start gap-3 p-3.5 bg-white border border-slate-200/70 rounded-2xl hover:bg-[#F8FAFC] hover:border-slate-300 transition-all duration-200 text-left group cursor-pointer"
                        style={{ animationDelay: `${0.2 + index * 0.08}s` }}
                      >
                        <div className="shrink-0 bg-slate-50 p-2 rounded-xl border border-transparent group-hover:border-slate-200/60">
                          {item.icon}
                        </div>
                        <span className="text-[13px] font-medium text-slate-600 group-hover:text-slate-900 mt-[2px]">
                          {item.text}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-8 py-6 pb-12 mt-4 w-full">
                  {messages.map((msg, idx) => (
                    <div key={idx} className="flex flex-col w-full">
                      {msg.role === "user" ? (
                        <div className="flex gap-4 justify-end w-full">
                          <div className="bg-[#f0f4f9] text-slate-800 rounded-[24px] px-5 py-3.5 max-w-[85%] md:max-w-[70%]">
                            <p className="text-[14.5px] leading-relaxed whitespace-pre-wrap">
                              {msg.content}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-4 sm:gap-5 w-full items-start group">
                          <div className="shrink-0 mt-1">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-slate-200 flex items-center justify-center bg-white shadow-sm overflow-hidden">
                              <img
                                src="/favicon.svg"
                                alt="AI"
                                className="w-5 h-5 sm:w-6 sm:h-6"
                              />
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row w-full gap-4 pt-1.5">
                            <div className="flex-1 markdown-body text-slate-800 min-w-0">
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>

                            <button
                              onClick={() => copyToClipboard(msg.content, idx)}
                              className="shrink-0 self-start p-2 text-slate-400 hover:text-slate-700 bg-transparent hover:bg-slate-100 rounded-full transition-all cursor-pointer opacity-0 group-hover:opacity-100 sm:flex hidden"
                              title="Copy response"
                            >
                              {copiedIndex === idx ? (
                                <CheckCircle2
                                  size={16}
                                  className="text-emerald-600"
                                />
                              ) : (
                                <Copy size={16} />
                              )}
                            </button>

                            <button
                              onClick={() => copyToClipboard(msg.content, idx)}
                              className="self-end p-2 mt-2 text-slate-500 hover:bg-slate-100 border border-slate-200 rounded-full transition-all sm:hidden flex items-center gap-2 text-[12px]"
                            >
                              {copiedIndex === idx ? (
                                <>
                                  <CheckCircle2
                                    size={14}
                                    className="text-emerald-600"
                                  />{" "}
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy size={14} /> Copy
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Advanced Dynamic Thinking Status */}
                  {isGenerating && (
                    <div className="flex gap-4 sm:gap-5 w-full items-start">
                      <div className="shrink-0 mt-1">
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-slate-200 flex items-center justify-center bg-white shadow-sm overflow-hidden">
                          <img
                            src="/favicon.svg"
                            alt="AI"
                            className="w-5 h-5 sm:w-6 sm:h-6 opacity-70"
                          />
                        </div>
                      </div>
                      <div className="bg-slate-50 border border-slate-200/60 rounded-[18px] px-4 py-3 flex items-center gap-3 w-fit mt-1">
                        <Loader2
                          size={16}
                          className="text-[#0064e0] animate-spin"
                        />
                        <span className="text-[13px] font-semibold text-slate-600 tracking-wide transition-all">
                          {thinkingStep}
                        </span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>

            {/* Gemini-Style Input Box With Integrated Model Switcher */}
            <div className="shrink-0 pt-2 pb-6 w-full mx-auto relative z-20">
              <div className="relative flex flex-col bg-[#f0f4f9] rounded-[24px] border border-transparent focus-within:border-slate-300 focus-within:bg-white focus-within:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-300 p-1.5">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholderText}
                  disabled={isGenerating}
                  className="w-full bg-transparent px-4 pt-3 pb-2 text-slate-800 placeholder-slate-500 focus:outline-none resize-none min-h-[50px] max-h-[160px] overflow-y-auto block text-[14.5px] font-medium disabled:opacity-50"
                  rows="1"
                />

                <div className="flex justify-between items-center px-2 pb-1.5 pt-1">
                  {/* Model Switcher Inside Input Area */}
                  <div className="relative model-dropdown-container">
                    <button
                      onClick={() =>
                        setIsModelDropdownOpen(!isModelDropdownOpen)
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/80 rounded-[12px] hover:bg-slate-50 transition-all text-[12px] font-semibold text-slate-600 cursor-pointer shadow-sm"
                    >
                      <Sparkles size={13} className="text-[#0064e0]" />
                      {aiModels.find((m) => m.id === selectedModel)?.name}
                      <ChevronDown
                        size={13}
                        className="text-slate-400 ml-0.5"
                      />
                    </button>

                    {isModelDropdownOpen && (
                      <div className="absolute bottom-full left-0 mb-3 w-56 bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 z-50">
                        <div className="px-3 py-2 border-b border-slate-100">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Select AI Model
                          </span>
                        </div>
                        <div className="p-1.5 flex flex-col gap-0.5">
                          {aiModels.map((model) => (
                            <button
                              key={model.id}
                              onClick={() => {
                                setSelectedModel(model.id);
                                setIsModelDropdownOpen(false);
                              }}
                              className={`w-full text-left px-3 py-2.5 text-[12.5px] rounded-lg transition-colors cursor-pointer ${selectedModel === model.id ? "text-[#0064e0] font-bold bg-[#EBF3FF]/60" : "text-slate-600 font-medium hover:bg-slate-50"}`}
                            >
                              {model.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleSend}
                    disabled={!prompt.trim() || isGenerating}
                    className="w-9 h-9 flex items-center justify-center bg-slate-800 hover:bg-slate-900 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-full transition-all duration-200 disabled:shadow-none shadow-sm active:scale-95 cursor-pointer"
                  >
                    <Send
                      size={15}
                      strokeWidth={2}
                      className="relative right-[1px] bottom-[1px] disabled:opacity-50"
                    />
                  </button>
                </div>
              </div>
              <p className="text-center text-[11.5px] text-slate-400 mt-3 font-medium tracking-wide">
                CapCraft AI can make mistakes. Consider verifying important
                info.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
