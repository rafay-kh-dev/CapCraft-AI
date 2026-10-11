import React, { useState, useRef, useEffect } from "react";
import {
  PenTool,
  Hash,
  Menu,
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
} from "lucide-react";

const Dashboard = ({ user, onLogout }) => {
  // Desktop par default true, Mobile par hide ke liye logic
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  const [activeTab, setActiveTab] = useState("generate");
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const chatEndRef = useRef(null);

  // Check window size for mobile behavior
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
      id: "generate",
      label: "AI Caption Generator",
      icon: <PenTool size={16} strokeWidth={1.5} />,
    },
    {
      id: "hashtags",
      label: "Viral Hashtags",
      icon: <Hash size={16} strokeWidth={1.5} />,
    },
  ];

  const recentChats = [
    "Agli Web App Ke Ideas",
    "CodeLume React Navbar Component",
    "Building an Author Writing Platform",
    "CodeLume B2B Tech Reel Guide",
    "Login Eye Button Not Working",
    "Building Custom Apollo-like Software",
    "Tradeside.online UI/UX Design",
  ];

  const suggestions = [
    {
      icon: (
        <MessageSquare size={18} strokeWidth={1.5} className="text-[#0064e0]" />
      ),
      text: "Write a witty Instagram caption for a coffee shop",
    },
    {
      icon: <Zap size={18} strokeWidth={1.5} className="text-amber-500" />,
      text: "Generate a high-converting LinkedIn post about AI",
    },
    {
      icon: (
        <ImageIcon size={18} strokeWidth={1.5} className="text-emerald-500" />
      ),
      text: "Create TikTok hook ideas for a fitness brand",
    },
    {
      icon: <Hash size={18} strokeWidth={1.5} className="text-purple-500" />,
      text: "Find trending hashtags for digital marketing",
    },
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  const handleSend = async () => {
    if (!prompt.trim() || isGenerating) return;

    const userText = prompt.trim();
    setPrompt("");
    setMessages((prev) => [...prev, { role: "user", content: userText }]);
    setIsGenerating(true);

    try {
      const response = await fetch("http://localhost:5000/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userText, type: activeTab }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages((prev) => [...prev, { role: "ai", content: data.text }]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "ai", content: "Error: " + data.message },
        ]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: "Server connection failed. Is the backend running?",
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
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

  return (
    <div
      className="flex h-[100dvh] w-full bg-[#FAFAFA] overflow-hidden"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        * { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
        
        .typing-dot { animation: typing 1.4s infinite ease-in-out both; }
        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }
        @keyframes typing { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
      `}</style>

      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-20 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* COLLAPSIBLE SIDEBAR */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 bg-[#F5F5F5] border-r border-slate-200/80 flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarOpen
            ? "w-[260px] translate-x-0"
            : "-translate-x-full lg:-translate-x-full lg:w-0"
        }`}
      >
        <div className="h-[60px] flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center">
            <img
              src="/favicon.svg"
              alt="CapCraft"
              className="w-7 h-7 mr-2.5 rounded-md shadow-sm"
            />
            <span className="font-bold text-[15px] text-slate-800 tracking-tight">
              CapCraft{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0064e0] to-[#60a5fa]">
                AI
              </span>
            </span>
          </div>
          <button
            className="text-slate-400 hover:text-slate-600 bg-slate-200/50 hover:bg-slate-200 p-1.5 rounded-lg cursor-pointer transition-colors"
            onClick={() => setIsSidebarOpen(false)}
            title="Collapse Sidebar"
          >
            {isMobile ? (
              <X size={16} strokeWidth={1.5} />
            ) : (
              <PanelLeftClose size={16} strokeWidth={1.5} />
            )}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-3 px-3 flex flex-col">
          <button
            onClick={() => {
              setMessages([]);
              setActiveTab("generate");
              if (isMobile) setIsSidebarOpen(false);
            }}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 mb-4 bg-white hover:bg-slate-50 border border-slate-200/80 shadow-sm rounded-xl transition-all duration-200 text-[13px] font-semibold text-slate-700 cursor-pointer"
          >
            <Plus size={16} strokeWidth={2} className="text-[#0064e0]" />
            New chat
          </button>

          <div className="flex flex-col gap-0.5 mb-5">
            <button className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg transition-all duration-200 text-[13px] font-medium text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 cursor-pointer">
              <Search size={16} strokeWidth={1.5} className="text-slate-400" />{" "}
              Search chats
            </button>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (isMobile) setIsSidebarOpen(false);
                }}
                className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg transition-all duration-200 text-[13px] font-medium cursor-pointer ${activeTab === item.id ? "bg-blue-50/70 text-[#0064e0]" : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"}`}
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
            <div className="text-[11px] font-bold text-slate-400 mb-1.5 px-3">
              Recents
            </div>
            <div className="flex flex-col gap-0.5">
              {recentChats.map((chatTitle, idx) => (
                <button
                  key={idx}
                  className="w-full text-left truncate px-3 py-2 rounded-lg text-[12.5px] font-medium text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  {chatTitle}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-2 border-t border-slate-200/60 shrink-0">
          <div className="flex items-center justify-between group px-2 py-2 hover:bg-slate-200/50 rounded-lg transition-colors cursor-pointer">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0064e0] to-[#60a5fa] text-white flex items-center justify-center font-bold text-[12px] shadow-sm shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : "R"}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-[12.5px] font-bold text-slate-800 truncate">
                  {user?.name || "Rafay Outreach"}
                </span>
                <span className="text-[10px] font-medium text-slate-500">
                  Pro
                </span>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="text-slate-400 hover:text-red-500 p-1.5 rounded-md hover:bg-red-50 transition-colors"
              title="Log out"
            >
              <Settings size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN WORKSPACE (Header Removed, Full Screen) */}
      <main className="flex-1 flex flex-col h-full min-w-0 relative">
        <div
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#e2e8f0 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            opacity: 0.3,
          }}
        ></div>

        {/* Small Top Nav just for Open Sidebar Button when closed */}
        <div
          className={`absolute top-4 left-4 z-20 transition-opacity duration-300 ${isSidebarOpen ? "opacity-0 pointer-events-none" : "opacity-100"}`}
        >
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center justify-center w-10 h-10 bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl shadow-sm cursor-pointer transition-all"
            title="Open Sidebar"
          >
            <PanelLeftOpen size={18} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 relative z-10 scroll-smooth flex flex-col">
          <div className="max-w-[760px] mx-auto w-full h-full flex flex-col justify-between relative">
            <div className="flex-1 flex flex-col pb-4">
              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col justify-center animate-in fade-in duration-700 py-10 mt-10">
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="flex items-center justify-center w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-200/60 mb-4 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-tr from-[#0064e0]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <img
                        src="/favicon.svg"
                        alt="CapCraft"
                        className="w-7 h-7 rounded-lg"
                      />
                    </div>
                    <h2 className="text-[26px] sm:text-[32px] font-bold text-slate-800 mb-2 tracking-tight">
                      What are we crafting today?
                    </h2>
                    <p className="text-slate-500 text-[13.5px] font-medium max-w-lg mx-auto leading-relaxed">
                      Describe your post, target audience, and desired tone, or
                      select one of the smart suggestions below.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {suggestions.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => setPrompt(item.text)}
                        className="flex items-start gap-3 p-3.5 bg-white border border-slate-200/70 rounded-xl hover:border-[#0064e0]/30 hover:shadow-sm transition-all duration-200 text-left group cursor-pointer"
                      >
                        <div className="mt-0.5 bg-[#f8fafc] p-2 rounded-lg group-hover:bg-white transition-all">
                          {item.icon}
                        </div>
                        <span className="text-[12.5px] font-medium text-slate-600 leading-relaxed group-hover:text-slate-800 transition-colors">
                          {item.text}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-6 py-6 pb-12 mt-10">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-3.5 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <div className="shrink-0 mt-1">
                        {msg.role === "user" ? (
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-[12px]">
                            {user?.name ? (
                              user.name.charAt(0).toUpperCase()
                            ) : (
                              <User size={14} />
                            )}
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
                            <img
                              src="/favicon.svg"
                              alt="AI"
                              className="w-4 h-4"
                            />
                          </div>
                        )}
                      </div>

                      <div
                        className={`max-w-[85%] group relative ${msg.role === "user" ? "bg-[#0064e0] text-white rounded-2xl rounded-tr-sm px-4 py-3 shadow-md shadow-blue-500/10" : "bg-white border border-slate-200/80 text-slate-800 rounded-2xl rounded-tl-sm px-5 py-3.5 shadow-sm"}`}
                      >
                        <p className="text-[13.5px] leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </p>

                        {msg.role === "ai" && (
                          <button
                            onClick={() => copyToClipboard(msg.content, idx)}
                            className="absolute -right-10 top-2 p-1.5 text-slate-400 hover:text-[#0064e0] bg-white border border-slate-200 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm cursor-pointer"
                            title="Copy"
                          >
                            {copiedIndex === idx ? (
                              <CheckCircle2
                                size={14}
                                className="text-emerald-500"
                              />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {isGenerating && (
                    <div className="flex gap-3.5 flex-row mt-10">
                      <div className="shrink-0 mt-1">
                        <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
                          <img
                            src="/favicon.svg"
                            alt="AI"
                            className="w-4 h-4 animate-pulse"
                          />
                        </div>
                      </div>
                      <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1.5 h-[46px]">
                        <div className="w-1.5 h-1.5 bg-slate-300 rounded-full typing-dot"></div>
                        <div className="w-1.5 h-1.5 bg-slate-300 rounded-full typing-dot"></div>
                        <div className="w-1.5 h-1.5 bg-slate-300 rounded-full typing-dot"></div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              )}
            </div>

            <div className="shrink-0 pt-2 pb-4 bg-transparent max-w-[760px] w-full mx-auto">
              <div className="relative group bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl border border-slate-200 focus-within:border-[#0064e0]/40 focus-within:ring-4 focus-within:ring-[#0064e0]/10 transition-all duration-300">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    isGenerating
                      ? "Thinking..."
                      : "Ask CapCraft to write a caption, outline, or generate hashtags..."
                  }
                  disabled={isGenerating}
                  className="w-full bg-transparent pl-5 pr-14 py-3.5 text-slate-800 placeholder-slate-400 focus:outline-none resize-none min-h-[50px] max-h-[160px] overflow-y-auto block text-[13.5px] font-medium disabled:opacity-50"
                  rows="1"
                  style={{ lineHeight: "1.5" }}
                />
                <button
                  onClick={handleSend}
                  disabled={!prompt.trim() || isGenerating}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#0064e0] hover:bg-[#0057c9] disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-xl transition-all duration-200 disabled:shadow-none shadow-[0_4px_12px_rgba(0,100,224,0.3)] active:scale-95 cursor-pointer"
                >
                  <Send
                    size={16}
                    strokeWidth={1.5}
                    className={
                      prompt.trim() && !isGenerating
                        ? "translate-x-0.5 -translate-y-0.5"
                        : ""
                    }
                  />
                </button>
              </div>
              <p className="text-center text-[11px] text-slate-400 mt-2 font-medium">
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
