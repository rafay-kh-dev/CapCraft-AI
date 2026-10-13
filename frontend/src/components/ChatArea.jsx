import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Zap,
  FileText,
  Hash,
  CheckCircle2,
  Copy,
  Loader2,
  Sparkles,
  Flame,
  Briefcase,
  Smile,
  Coffee,
  ArrowRight,
  RefreshCw,
  Type,
  Globe,
  Target,
  Link2,
  AlignLeft,
  LayoutTemplate,
  ImageIcon,
  Download,
} from "lucide-react";

const BrandInstagram = () => (
  <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);
const BrandLinkedIn = () => (
  <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);
const BrandX = () => (
  <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.95H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const BrandTikTok = () => (
  <svg className="w-[16px] h-[16px]" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.12-3.44-3.17-3.64-5.46-.22-2.39.81-4.78 2.65-6.26 1.72-1.39 4.09-1.89 6.22-1.27.02 1.44-.02 2.87.02 4.31-1.07-.3-2.22-.09-3.08.57-.86.67-1.34 1.74-1.26 2.84.05 1.18.77 2.27 1.84 2.73 1.25.54 2.83.25 3.82-.67.89-.83 1.4-2.02 1.4-3.23V.02h-1.02z" />
  </svg>
);

const ChatArea = ({
  messages,
  activeTab,
  setPrompt,
  isGenerating,
  thinkingStep,
  copiedIndex,
  copyToClipboard,
  chatEndRef,
  handleSendManual,
}) => {
  const [selectedPlatform, setSelectedPlatform] = useState("Instagram");
  const [selectedTone, setSelectedTone] = useState("Engaging");
  const [topicInput, setTopicInput] = useState("");

  const [articleTopic, setArticleTopic] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [websiteName, setWebsiteName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [articleLength, setArticleLength] = useState(
    "1500+ Words (Comprehensive)",
  );
  const [articleTone, setArticleTone] = useState("Informative");
  const [articleLanguage, setArticleLanguage] = useState("English");

  const [articleData, setArticleData] = useState(null);
  const [isArticleGenerating, setIsArticleGenerating] = useState(false);
  const [regeneratingSection, setRegeneratingSection] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const fetchAI = async (promptText) => {
    const res = await fetch(`${API_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: promptText,
        type: "article",
        history: [],
        modelName: "gemini-3.6-flash",
      }),
    });
    const data = await res.json();
    if (!data.success) throw new Error("API Limit Reached");
    return data.text;
  };

  const handleGenerateFullArticle = async () => {
    if (!articleTopic.trim()) return;
    setIsArticleGenerating(true);
    setArticleData(null);

    const prompt = `Write a highly professional, comprehensive, and SEO-optimised article. Topic: "${articleTopic}". Focus Keyword: "${focusKeyword}". Target Length: "${articleLength}". Tone: "${articleTone}". Language: "${articleLanguage}". Website Name (for internal linking): "${websiteName || "N/A"}". Website URL: "${websiteUrl || "N/A"}". Requirements: 1) The article MUST meet the exact target length requirement and be highly detailed. 2) If Website Name and URL are provided, naturally integrate contextual internal links to them. 3) Include relevant, authoritative external links to credible sources. 4) Use proper Markdown formatting with H2 and H3 headings. Return your response STRICTLY as a JSON object with exactly these three keys: "metaTitle" (string), "metaDescription" (string), "content" (string formatted in markdown). Do not include any extra conversational text or formatting blocks like \`\`\`json outside the JSON.`;

    try {
      const responseText = await fetchAI(prompt);
      const cleanJson = responseText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();
      const parsedData = JSON.parse(cleanJson);
      setArticleData({
        metaTitle: parsedData.metaTitle || "Generated Title",
        metaDescription: parsedData.metaDescription || "Generated Description",
        content: parsedData.content || "Generated Content",
      });
    } catch (error) {
      alert(
        "Failed to generate article. Please try again or check API limits.",
      );
    } finally {
      setIsArticleGenerating(false);
    }
  };

  const handleRegenerateSection = async (section) => {
    setRegeneratingSection(section);
    let prompt = "";

    if (section === "title") {
      prompt = `Generate a new, catchy, and SEO-optimised Meta Title for an article about "${articleTopic}" targeting the keyword "${focusKeyword}". Language: "${articleLanguage}". Tone: "${articleTone}". Return ONLY the raw title text without any quotes or JSON.`;
    } else if (section === "description") {
      prompt = `Generate a new SEO Meta Description (150-160 characters) for an article about "${articleTopic}" targeting the keyword "${focusKeyword}". Language: "${articleLanguage}". Tone: "${articleTone}". Return ONLY the raw description text without any quotes or JSON.`;
    } else if (section === "content") {
      prompt = `Rewrite the full article content about "${articleTopic}". Focus Keyword: "${focusKeyword}". Target Length: "${articleLength}". Tone: "${articleTone}". Language: "${articleLanguage}". Website Name: "${websiteName || "N/A"}". Website URL: "${websiteUrl || "N/A"}". Include natural internal links if website details are provided, and authoritative external links. Make it highly engaging and structured. Return ONLY the markdown formatted article body without any JSON, meta tags, or extra text.`;
    }

    try {
      const responseText = await fetchAI(prompt);
      setArticleData((prev) => ({
        ...prev,
        [section === "title"
          ? "metaTitle"
          : section === "description"
            ? "metaDescription"
            : "content"]: responseText.trim(),
      }));
    } catch (error) {
      alert("Failed to regenerate. Please try again.");
    } finally {
      setRegeneratingSection(null);
    }
  };

  // 🚀 UPDATED: Added Image Studio Content
  const getWelcomeContent = () => {
    switch (activeTab) {
      case "hashtags":
        return {
          title: "Discover Trending Hashtags",
          desc: "Enter your niche or keyword to get a mix of viral and targeted hashtags.",
        };
      case "image":
        return {
          title: "Bring Your Imagination to Life",
          desc: "Describe a scene, character, or concept, and Zync AI will paint it for you in seconds.",
        };
      default:
        return {
          title: "What are we crafting today?",
          desc: "Describe your post, target audience, and desired tone, or select a suggestion.",
        };
    }
  };

  // 🚀 UPDATED: Added Image Studio Suggestions
  const getSuggestions = () => {
    switch (activeTab) {
      case "hashtags":
        return [
          {
            icon: <Hash size={16} className="text-purple-500" />,
            text: "Find trending hashtags for fitness",
          },
          {
            icon: <Sparkles size={16} className="text-indigo-500" />,
            text: "Viral tags for aesthetic cafe photography",
          },
        ];
      case "image":
        return [
          {
            icon: <ImageIcon size={16} className="text-[#0064e0]" />,
            text: "A futuristic cyberpunk city at sunset, highly detailed",
          },
          {
            icon: <Sparkles size={16} className="text-amber-500" />,
            text: "A cute astronaut cat exploring Mars, digital art style",
          },
        ];
      default:
        return [
          {
            icon: <MessageSquare size={16} className="text-[#0064e0]" />,
            text: "Explain quantum computing in simple terms",
          },
          {
            icon: <Zap size={16} className="text-amber-500" />,
            text: "Write a high-converting LinkedIn post",
          },
          {
            icon: <FileText size={16} className="text-emerald-500" />,
            text: "Write an email to a client for a project update",
          },
          {
            icon: <Hash size={16} className="text-purple-500" />,
            text: "Find trending hashtags for digital marketing",
          },
        ];
    }
  };

  const handleGenerateCaption = () => {
    if (!topicInput.trim()) return;
    const finalPrompt = `Write a ${selectedTone.toLowerCase()} caption for ${selectedPlatform}. The post is about: ${topicInput}`;
    handleSendManual(finalPrompt);
  };

  // =====================================
  // ARTICLE WRITER STUDIO
  // =====================================
  if (activeTab === "article") {
    const lengths = [
      "500 Words (Short)",
      "1000 Words (Standard)",
      "1500+ Words (Comprehensive)",
      "2000+ Words (In-Depth Guide)",
    ];
    const tones = [
      "Informative",
      "Professional",
      "Engaging",
      "Persuasive",
      "Conversational",
      "Journalistic",
    ];
    const languages = [
      "English",
      "Urdu",
      "Hindi",
      "Spanish",
      "French",
      "Arabic",
    ];

    return (
      <motion.div
        key="article-studio"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1 w-full max-w-[900px] mx-auto py-2"
      >
        <div className="flex flex-col items-center mb-8 text-center mt-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-12 h-12 bg-[#F0F4F9] rounded-xl flex items-center justify-center mb-3"
          >
            <FileText size={24} className="text-[#0064e0]" />
          </motion.div>
          <h2 className="text-[26px] font-semibold text-[#1F1F1F] mb-1">
            Article Studio Pro
          </h2>
          <p className="text-[15px] text-[#444746] font-normal">
            Craft long-form, SEO-optimised articles with smart internal &
            external linking.
          </p>
        </div>

        <div className="bg-white border border-[#E3E3E3] rounded-[24px] p-6 shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex flex-col">
              <label className="text-[13px] font-semibold text-[#1F1F1F] uppercase mb-2 flex items-center gap-2">
                <Type size={14} className="text-[#0064e0]" /> Article Topic *
              </label>
              <input
                type="text"
                value={articleTopic}
                onChange={(e) => setArticleTopic(e.target.value)}
                placeholder="e.g. The Future of AI in Healthcare"
                className="bg-[#F0F4F9] px-4 py-3 rounded-xl outline-none text-[#1F1F1F] focus:ring-2 focus:ring-[#0064e0]/20 transition-all text-[14.5px]"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-[13px] font-semibold text-[#1F1F1F] uppercase mb-2 flex items-center gap-2">
                <Target size={14} className="text-emerald-600" /> Focus Keyword
              </label>
              <input
                type="text"
                value={focusKeyword}
                onChange={(e) => setFocusKeyword(e.target.value)}
                placeholder="e.g. healthcare ai tools"
                className="bg-[#F0F4F9] px-4 py-3 rounded-xl outline-none text-[#1F1F1F] focus:ring-2 focus:ring-[#0064e0]/20 transition-all text-[14.5px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex flex-col">
              <label className="text-[13px] font-semibold text-[#1F1F1F] uppercase mb-2 flex items-center gap-2">
                <LayoutTemplate size={14} className="text-indigo-500" /> Website
                Name (Optional)
              </label>
              <input
                type="text"
                value={websiteName}
                onChange={(e) => setWebsiteName(e.target.value)}
                placeholder="e.g. Zync AI"
                className="bg-[#F0F4F9] px-4 py-3 rounded-xl outline-none text-[#1F1F1F] focus:ring-2 focus:ring-[#0064e0]/20 transition-all text-[14.5px]"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-[13px] font-semibold text-[#1F1F1F] uppercase mb-2 flex items-center gap-2">
                <Link2 size={14} className="text-blue-500" /> Website URL
                (Optional)
              </label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="e.g. https://zync.codelume.online"
                className="bg-[#F0F4F9] px-4 py-3 rounded-xl outline-none text-[#1F1F1F] focus:ring-2 focus:ring-[#0064e0]/20 transition-all text-[14.5px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="flex flex-col">
              <label className="text-[13px] font-semibold text-[#1F1F1F] uppercase mb-2 flex items-center gap-2">
                <AlignLeft size={14} className="text-slate-600" /> Length
              </label>
              <select
                value={articleLength}
                onChange={(e) => setArticleLength(e.target.value)}
                className="bg-[#F0F4F9] px-4 py-3 rounded-xl outline-none text-[#1F1F1F] focus:ring-2 focus:ring-[#0064e0]/20 transition-all text-[14.5px] cursor-pointer"
              >
                {lengths.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-[13px] font-semibold text-[#1F1F1F] uppercase mb-2 flex items-center gap-2">
                <Flame size={14} className="text-amber-500" /> Tone
              </label>
              <select
                value={articleTone}
                onChange={(e) => setArticleTone(e.target.value)}
                className="bg-[#F0F4F9] px-4 py-3 rounded-xl outline-none text-[#1F1F1F] focus:ring-2 focus:ring-[#0064e0]/20 transition-all text-[14.5px] cursor-pointer"
              >
                {tones.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label className="text-[13px] font-semibold text-[#1F1F1F] uppercase mb-2 flex items-center gap-2">
                <Globe size={14} className="text-purple-500" /> Language
              </label>
              <select
                value={articleLanguage}
                onChange={(e) => setArticleLanguage(e.target.value)}
                className="bg-[#F0F4F9] px-4 py-3 rounded-xl outline-none text-[#1F1F1F] focus:ring-2 focus:ring-[#0064e0]/20 transition-all text-[14.5px] cursor-pointer"
              >
                {languages.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleGenerateFullArticle}
            disabled={!articleTopic.trim() || isArticleGenerating}
            className="w-full bg-[#0064e0] hover:bg-[#0057c9] disabled:bg-[#E3E3E3] disabled:text-[#444746] text-white py-3.5 rounded-xl font-medium text-[15px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
          >
            {isArticleGenerating ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Sparkles size={18} />
            )}
            {isArticleGenerating
              ? "Crafting Article..."
              : "Generate Full Article"}
          </motion.button>
        </div>

        {/* OUTPUT SECTION */}
        <AnimatePresence>
          {articleData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-6 mb-10"
            >
              <div className="bg-white border border-[#E3E3E3] rounded-[20px] overflow-hidden group">
                <div className="bg-[#F0F4F9] px-5 py-3 border-b border-[#E3E3E3] flex justify-between items-center">
                  <span className="text-[13px] font-bold text-[#1F1F1F] uppercase tracking-wide">
                    SEO Meta Title
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        copyToClipboard(articleData.metaTitle, "title")
                      }
                      className="p-1.5 text-[#444746] hover:bg-white rounded-md transition-colors"
                      title="Copy"
                    >
                      {copiedIndex === "title" ? (
                        <CheckCircle2 size={15} className="text-emerald-600" />
                      ) : (
                        <Copy size={15} />
                      )}
                    </button>
                    <button
                      onClick={() => handleRegenerateSection("title")}
                      disabled={regeneratingSection !== null}
                      className="p-1.5 text-[#0064e0] hover:bg-white rounded-md transition-colors flex items-center gap-1.5 text-[12px] font-semibold"
                    >
                      {regeneratingSection === "title" ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <RefreshCw size={14} />
                      )}{" "}
                      Regenerate
                    </button>
                  </div>
                </div>
                <div className="p-5 text-[15.5px] text-[#1F1F1F] font-medium leading-relaxed">
                  {articleData.metaTitle}
                </div>
              </div>

              <div className="bg-white border border-[#E3E3E3] rounded-[20px] overflow-hidden group">
                <div className="bg-[#F0F4F9] px-5 py-3 border-b border-[#E3E3E3] flex justify-between items-center">
                  <span className="text-[13px] font-bold text-[#1F1F1F] uppercase tracking-wide">
                    SEO Meta Description
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        copyToClipboard(articleData.metaDescription, "desc")
                      }
                      className="p-1.5 text-[#444746] hover:bg-white rounded-md transition-colors"
                      title="Copy"
                    >
                      {copiedIndex === "desc" ? (
                        <CheckCircle2 size={15} className="text-emerald-600" />
                      ) : (
                        <Copy size={15} />
                      )}
                    </button>
                    <button
                      onClick={() => handleRegenerateSection("description")}
                      disabled={regeneratingSection !== null}
                      className="p-1.5 text-[#0064e0] hover:bg-white rounded-md transition-colors flex items-center gap-1.5 text-[12px] font-semibold"
                    >
                      {regeneratingSection === "description" ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <RefreshCw size={14} />
                      )}{" "}
                      Regenerate
                    </button>
                  </div>
                </div>
                <div className="p-5 text-[15px] text-[#444746] font-normal leading-relaxed">
                  {articleData.metaDescription}
                </div>
              </div>

              <div className="bg-white border border-[#E3E3E3] rounded-[20px] overflow-hidden group">
                <div className="bg-[#F0F4F9] px-5 py-3 border-b border-[#E3E3E3] flex justify-between items-center">
                  <span className="text-[13px] font-bold text-[#1F1F1F] uppercase tracking-wide">
                    Article Body
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        copyToClipboard(articleData.content, "content")
                      }
                      className="p-1.5 text-[#444746] hover:bg-white rounded-md transition-colors"
                      title="Copy"
                    >
                      {copiedIndex === "content" ? (
                        <CheckCircle2 size={15} className="text-emerald-600" />
                      ) : (
                        <Copy size={15} />
                      )}
                    </button>
                    <button
                      onClick={() => handleRegenerateSection("content")}
                      disabled={regeneratingSection !== null}
                      className="p-1.5 text-[#0064e0] hover:bg-white rounded-md transition-colors flex items-center gap-1.5 text-[12px] font-semibold"
                    >
                      {regeneratingSection === "content" ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <RefreshCw size={14} />
                      )}{" "}
                      Regenerate Article
                    </button>
                  </div>
                </div>
                <div className="p-6 markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {articleData.content}
                  </ReactMarkdown>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  // =====================================
  // CAPTION STUDIO
  // =====================================
  if (messages.length === 0 && activeTab === "caption") {
    const platforms = [
      { name: "Instagram", icon: <BrandInstagram /> },
      { name: "LinkedIn", icon: <BrandLinkedIn /> },
      { name: "Twitter", icon: <BrandX /> },
      { name: "TikTok", icon: <BrandTikTok /> },
    ];
    const tones = [
      { name: "Engaging", icon: <Flame size={14} /> },
      { name: "Professional", icon: <Briefcase size={14} /> },
      { name: "Funny", icon: <Smile size={14} /> },
      { name: "Casual", icon: <Coffee size={14} /> },
    ];

    return (
      <motion.div
        key="caption-studio"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex-1 flex flex-col justify-center items-center py-4 w-full max-w-2xl mx-auto"
      >
        <div className="flex flex-col items-center mb-6 text-center">
          <img
            src="/favicon.svg"
            alt="Zync"
            className="w-10 h-10 rounded-[10px] shadow-sm mb-3 hover:scale-105 transition-transform duration-300"
          />
          <h2 className="text-2xl font-medium text-[#1F1F1F] mb-1">
            Caption Studio
          </h2>
          <p className="text-[14px] text-[#444746] font-normal">
            Generate viral, platform-ready captions in seconds.
          </p>
        </div>

        <div className="w-full bg-white border border-[#E3E3E3] rounded-[20px] p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="mb-6">
            <h3 className="text-[11px] font-semibold text-[#444746] uppercase mb-3 pl-1">
              1. Choose Platform
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {platforms.map((plat) => (
                <button
                  key={plat.name}
                  onClick={() => setSelectedPlatform(plat.name)}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-[12px] border transition-all duration-300 cursor-pointer active:scale-95 ${selectedPlatform === plat.name ? "border-[#0064e0] bg-[#F0F4F9] text-[#0064e0] shadow-sm" : "border-[#E3E3E3] bg-white text-[#444746] hover:bg-[#F0F4F9]"}`}
                >
                  <div
                    className={
                      selectedPlatform === plat.name &&
                      plat.name !== "Instagram" &&
                      plat.name !== "LinkedIn"
                        ? "text-[#0064e0] transition-colors"
                        : "transition-colors"
                    }
                  >
                    {plat.icon}
                  </div>
                  <span className="text-[13px] font-medium">{plat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-[11px] font-semibold text-[#444746] uppercase mb-3 pl-1">
              2. Select Tone
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {tones.map((t) => (
                <button
                  key={t.name}
                  onClick={() => setSelectedTone(t.name)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full border transition-all duration-300 cursor-pointer active:scale-95 ${selectedTone === t.name ? "border-[#0064e0] bg-[#0064e0] text-white shadow-sm font-medium" : "border-[#E3E3E3] bg-white text-[#444746] hover:bg-[#F0F4F9] font-medium"}`}
                >
                  {t.icon} <span className="text-[13px]">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold text-[#444746] uppercase mb-3 pl-1">
              3. What is the post about?
            </h3>
            <div className="relative flex flex-col bg-[#F0F4F9] rounded-[14px] border border-transparent focus-within:border-[#E3E3E3] focus-within:bg-white transition-all duration-300 overflow-hidden p-1.5 focus-within:shadow-sm">
              <textarea
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                placeholder="E.g. A new digital marketing course launch..."
                className="w-full bg-transparent px-3 py-2 text-[#1F1F1F] placeholder-[#444746] focus:outline-none resize-none text-[14px] font-normal transition-all"
                rows="2"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleGenerateCaption();
                  }
                }}
              />
              <div className="flex justify-end pt-1.5 px-1 pb-0.5">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGenerateCaption}
                  disabled={!topicInput.trim() || isGenerating}
                  className="flex items-center gap-1.5 bg-[#0064e0] hover:bg-[#0057c9] disabled:bg-[#E3E3E3] disabled:text-[#444746] text-white rounded-[10px] px-5 py-2 transition-all duration-300 font-medium text-[13px] cursor-pointer"
                >
                  {isGenerating ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    "Generate"
                  )}{" "}
                  <ArrowRight size={14} strokeWidth={2.5} />
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // =====================================
  // DEFAULT CHAT INTERFACE
  // =====================================
  const welcomeContent = getWelcomeContent();
  const activeSuggestions = getSuggestions();

  if (messages.length === 0) {
    return (
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 flex flex-col justify-center py-10"
      >
        <div className="flex flex-col items-center text-center mb-7">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center justify-center w-12 h-12 bg-white rounded-[14px] border border-[#E3E3E3] mb-5 shadow-sm"
          >
            <img src="/favicon.svg" alt="Zync" className="w-7 h-7 rounded-md" />
          </motion.div>
          <h2 className="text-2xl font-medium text-[#1F1F1F] mb-2">
            {welcomeContent.title}
          </h2>
          <p className="text-[14px] text-[#444746] font-normal max-w-md mx-auto leading-relaxed">
            {welcomeContent.desc}
          </p>
        </div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {activeSuggestions.map((item, index) => (
            <motion.button
              key={index}
              variants={{
                hidden: { opacity: 0, y: 10 },
                show: { opacity: 1, y: 0 },
              }}
              onClick={() => setPrompt(item.text)}
              className="flex items-start gap-3 p-3.5 bg-white border border-[#E3E3E3] rounded-2xl hover:bg-[#F0F4F9] transition-all duration-300 hover:shadow-sm active:scale-95 text-left group cursor-pointer"
            >
              <div className="shrink-0 bg-[#F0F4F9] p-2 rounded-xl group-hover:scale-105 transition-transform">
                {item.icon}
              </div>
              <span className="text-[13px] font-medium text-[#1F1F1F] mt-[2px]">
                {item.text}
              </span>
            </motion.button>
          ))}
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col gap-8 py-6 w-full pb-4">
      {/* 🚀 MESSAGES LIST WITH DRAMATIC POP LAYOUT */}
      <AnimatePresence mode="popLayout">
        {messages.map((msg, idx) => (
          <motion.div
            key={`msg-${idx}`}
            layout
            initial={{ opacity: 0, scale: 0.5, y: 50, filter: "blur(15px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 14,
              mass: 0.8,
            }}
            className={`flex flex-col w-full ${msg.role === "user" ? "origin-bottom-right" : "origin-top-left"}`}
          >
            {msg.role === "user" ? (
              <div className="flex gap-4 justify-end w-full">
                <div className="bg-[#F0F4F9] text-[#1F1F1F] rounded-[24px] px-5 py-3.5 max-w-[85%] md:max-w-[70%] shadow-sm">
                  <p className="text-[16px] leading-[28px] font-normal whitespace-pre-wrap">
                    {msg.content}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex gap-4 sm:gap-5 w-full items-start group">
                <div className="shrink-0 mt-1">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[#E3E3E3] flex items-center justify-center bg-white shadow-sm overflow-hidden">
                    <img
                      src="/favicon.svg"
                      alt="Zync"
                      className="w-5 h-5 sm:w-6 sm:h-6"
                    />
                  </div>
                </div>

                <div className="flex flex-col w-full pt-1.5">
                  <div className="markdown-body min-w-0">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      {/* 🚀 NEW: Check if the message is an Image */}
                      {msg.type === "image" ? (
                        <div className="relative group/img max-w-[420px] mt-2 mb-2">
                          <img
                            src={msg.content}
                            alt="Generated by Zync AI"
                            className="w-full h-auto rounded-[16px] shadow-sm border border-[#E3E3E3] transition-transform duration-300 group-hover/img:scale-[1.01]"
                          />
                          <button
                            onClick={() => {
                              const link = document.createElement("a");
                              link.href = msg.content;
                              link.download = `Zync_AI_Image_${Date.now()}.jpg`;
                              link.click();
                            }}
                            className="absolute top-3 right-3 bg-white/90 backdrop-blur-md p-2 rounded-full text-[#444746] hover:text-[#0064e0] hover:bg-white shadow-md opacity-0 group-hover/img:opacity-100 transition-all duration-300 scale-90 group-hover/img:scale-100 cursor-pointer"
                            title="Download Image"
                          >
                            <Download size={18} strokeWidth={2.5} />
                          </button>
                        </div>
                      ) : (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      )}
                    </motion.div>
                  </div>

                  {msg.type !== "image" && (
                    <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -ml-1.5">
                      <button
                        onClick={() => copyToClipboard(msg.content, idx)}
                        className="p-1.5 text-[#444746] hover:bg-[#F0F4F9] rounded-md transition-all duration-300 active:scale-90 cursor-pointer"
                        title="Copy"
                      >
                        {copiedIndex === idx ? (
                          <CheckCircle2
                            size={16}
                            className="text-emerald-600"
                          />
                        ) : (
                          <Copy
                            size={16}
                            className="hover:scale-110 transition-transform"
                          />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 🚀 GENERATING/THINKING BUBBLE WITH DRAMATIC POP */}
      <AnimatePresence>
        {isGenerating && (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.5, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.8, filter: "blur(10px)", y: -10 }}
            transition={{ type: "spring", stiffness: 150, damping: 15 }}
            className="flex gap-4 sm:gap-5 w-full items-start origin-top-left"
          >
            <div className="shrink-0 mt-1">
              <div className="w-8 h-8 rounded-full border border-[#E3E3E3] flex items-center justify-center bg-white">
                <img
                  src="/favicon.svg"
                  alt="Zync"
                  className="w-5 h-5 opacity-70 animate-pulse"
                />
              </div>
            </div>
            <div className="bg-[#F0F4F9] rounded-[18px] px-4 py-3 flex items-center gap-3 mt-1 shadow-sm">
              <Loader2 size={16} className="text-[#0064e0] animate-spin" />
              <motion.span
                initial={{ opacity: 0.3 }}
                animate={{ opacity: 1 }}
                transition={{
                  repeat: Infinity,
                  duration: 0.8,
                  repeatType: "reverse",
                }}
                className="text-[13px] font-medium text-[#444746]"
              >
                {thinkingStep}
              </motion.span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div ref={chatEndRef} />
    </div>
  );
};

export default ChatArea;
