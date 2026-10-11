import React, { useState } from "react";
import { PenTool, Hash, X, Sparkles, FileText, Plus, MessageCircle, Settings, LogOut, Trash2, AlertTriangle } from "lucide-react";

const Sidebar = ({
  isSidebarOpen, setIsSidebarOpen, isMobile, user, onLogout,
  activeTab, setActiveTab, recentChats, loadChat, currentChatId, startNewChat,
  isDropdownOpen, setIsDropdownOpen, onDeleteChat
}) => {
  const [chatToDelete, setChatToDelete] = useState(null);

  const navItems = [
    { id: "general", label: "General Chat", icon: <Sparkles size={16} strokeWidth={1.5} /> },
    { id: "caption", label: "AI Caption Generator", icon: <PenTool size={16} strokeWidth={1.5} /> },
    { id: "article", label: "Article Writing", icon: <FileText size={16} strokeWidth={1.5} /> },
    { id: "hashtags", label: "Viral Hashtags", icon: <Hash size={16} strokeWidth={1.5} /> },
  ];

  return (
    <>
      {isMobile && isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-30 transition-opacity animate-fade-in" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      <aside className={`animate-sidebar fixed lg:static inset-y-0 left-0 z-40 bg-[#F0F4F9] flex flex-col transition-all duration-400 ease-in-out overflow-hidden ${isSidebarOpen ? "w-[260px] translate-x-0" : "-translate-x-full lg:translate-x-0 lg:w-0"}`}>
        <div className="w-[260px] flex flex-col h-full">
          <div className="h-[64px] flex items-center justify-between px-4 shrink-0 mt-2">
            <div className="flex items-center group cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95">
              <img src="/favicon.svg" alt="CapCraft" className="w-7 h-7 mr-2.5 rounded-md shadow-sm" />
              <span className="font-medium text-[16px] text-[#1F1F1F] tracking-tight">
                CapCraft <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0064e0] to-[#60a5fa] font-bold">AI</span>
              </span>
            </div>
            <button className="text-[#444746] hover:bg-[#E1E5EA] p-1.5 rounded-full transition-all duration-300 cursor-pointer active:scale-90 hover:rotate-90" onClick={() => setIsSidebarOpen(false)}>
              <X size={18} strokeWidth={1.5} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto py-2 px-3 flex flex-col scroll-smooth">
            <button onClick={startNewChat} className="flex items-center gap-2.5 w-full px-4 py-3 mb-5 bg-[#E1E5EA] hover:bg-[#D3D7DC] rounded-full transition-all duration-300 active:scale-95 text-[14px] font-medium text-[#1F1F1F] cursor-pointer">
              <Plus size={18} strokeWidth={2} className="text-[#1F1F1F] hover:rotate-90 transition-transform duration-300" /> New chat
            </button>

            <div className="flex flex-col gap-1 mb-6">
              <div className="text-[11px] font-bold text-[#444746] mb-1 px-3 uppercase tracking-wider">AI Tools</div>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); if (isMobile) setIsSidebarOpen(false); }}
                  className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-full transition-all duration-300 text-[13.5px] font-medium cursor-pointer active:scale-95 ${activeTab === item.id ? "bg-[#D3D7DC] text-[#1F1F1F] shadow-sm" : "text-[#444746] hover:bg-[#E1E5EA]"}`}
                >
                  <span className={`transition-colors duration-300 ${activeTab === item.id ? "text-[#1F1F1F]" : "text-[#444746]"}`}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex flex-col">
              <div className="text-[11px] font-bold text-[#444746] mb-2 px-3 uppercase tracking-wider">Recent History</div>
              <div className="flex flex-col gap-0.5">
                {recentChats.map((chat) => (
                  <div key={chat._id} className={`group relative w-full flex items-center justify-between px-2 py-1.5 rounded-full transition-all duration-300 cursor-pointer active:scale-[0.98] ${currentChatId === chat._id ? "bg-[#D3D7DC] text-[#1F1F1F]" : "text-[#444746] hover:bg-[#E1E5EA]"}`}>
                    <div className="flex items-center gap-2.5 truncate flex-1 px-1 py-1" onClick={() => loadChat(chat)}>
                      <MessageCircle size={14} className="shrink-0 transition-transform group-hover:scale-110" />
                      <span className="truncate text-[13px] font-medium">{chat.title}</span>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setChatToDelete(chat._id); }}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-[#444746] hover:text-red-500 hover:bg-white rounded-full transition-all duration-300 active:scale-90 cursor-pointer shadow-sm hover:shadow"
                      title="Delete chat"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-2 shrink-0 relative profile-dropdown-container">
            {isDropdownOpen && (
              <div className="absolute bottom-full left-2 right-2 mb-2 bg-white border border-[#E3E3E3] shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl overflow-hidden z-50 animate-smooth-entry">
                <button onClick={onLogout} className="flex items-center gap-3 w-full px-4 py-3 text-[13.5px] font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer active:bg-red-100">
                  <LogOut size={16} strokeWidth={2} /> Log out
                </button>
              </div>
            )}
            <div onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center justify-between group px-3 py-2.5 hover:bg-[#E1E5EA] rounded-full transition-all duration-300 cursor-pointer active:scale-95">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0064e0] to-[#60a5fa] text-white flex items-center justify-center font-bold text-[12px] shrink-0 shadow-sm transition-transform group-hover:scale-105">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "R"}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-[13px] font-medium text-[#1F1F1F] truncate transition-colors">{user?.name || "User"}</span>
                  <span className="text-[11px] font-normal text-[#444746]">Pro</span>
                </div>
              </div>
              <button className="p-1.5 rounded-full text-[#444746] group-hover:text-[#1F1F1F] cursor-pointer transition-transform duration-300 group-hover:rotate-45">
                <Settings size={18} strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* CONFIRMATION MODAL WITH SMOOTH ANIMATION */}
      {chatToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-[24px] shadow-xl p-6 max-w-[340px] w-full animate-smooth-entry">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-110">
                <AlertTriangle size={24} />
              </div>
              <h3 className="text-[18px] font-medium text-[#1F1F1F] mb-2">Delete Chat?</h3>
              <p className="text-[14px] text-[#444746] mb-6 font-normal leading-relaxed">
                Are you sure you want to bin this chat? This action cannot be undone.
              </p>
              <div className="flex gap-3 w-full">
                <button onClick={() => setChatToDelete(null)} className="flex-1 py-2.5 rounded-full border border-[#E3E3E3] text-[#444746] font-medium hover:bg-[#F0F4F9] transition-all duration-300 active:scale-95 cursor-pointer">
                  Cancel
                </button>
                <button onClick={() => { onDeleteChat(chatToDelete); setChatToDelete(null); }} className="flex-1 py-2.5 rounded-full bg-red-500 text-white font-medium hover:bg-red-600 transition-all duration-300 active:scale-95 cursor-pointer shadow-sm">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;