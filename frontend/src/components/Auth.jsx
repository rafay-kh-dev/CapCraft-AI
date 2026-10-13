import React, { useState } from "react";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useGoogleLogin, useGoogleOneTapLogin } from "@react-oauth/google";
import { motion, AnimatePresence } from "framer-motion";

const Auth = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const parseJwt = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  useGoogleOneTapLogin({
    onSuccess: async (credentialResponse) => {
      setLoading(true);
      setErrorMsg("");
      try {
        const decodedUser = parseJwt(credentialResponse.credential);
        const backendRes = await fetch(`${API_URL}/api/google-auth`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: decodedUser.name,
            email: decodedUser.email,
          }),
        });
        const data = await backendRes.json();
        if (data.success) {
          localStorage.setItem("zync_user", JSON.stringify(data.user));
          if (onLogin) onLogin(data.user);
        } else setErrorMsg(data.message);
      } catch (error) {
        setErrorMsg("Google One Tap login failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    onError: () => console.log("One Tap Login was dismissed or failed."),
  });

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setErrorMsg("");
      try {
        const userInfoRes = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          },
        );
        const googleUser = await userInfoRes.json();
        const backendRes = await fetch(`${API_URL}/api/google-auth`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: googleUser.name,
            email: googleUser.email,
          }),
        });
        const data = await backendRes.json();
        if (data.success) {
          localStorage.setItem("zync_user", JSON.stringify(data.user));
          if (onLogin) onLogin(data.user);
        } else setErrorMsg(data.message);
      } catch (error) {
        setErrorMsg("Google login failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    onError: () => setErrorMsg("Google login was cancelled or failed."),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const endpoint = isLogin ? "login" : "signup";
    const payload = isLogin ? { email, password } : { name, email, password };

    try {
      const response = await fetch(`${API_URL}/api/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (data.success) {
        if (isLogin) {
          localStorage.setItem("zync_user", JSON.stringify(data.user));
          if (onLogin) onLogin(data.user);
        } else {
          setIsLogin(true);
          setErrorMsg("Account created successfully. Please log in.");
          setPassword("");
        }
      } else {
        setErrorMsg(data.message);
      }
    } catch (error) {
      setErrorMsg("Server connection failed. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="h-[100dvh] w-full flex flex-col lg:flex-row bg-[#0064e0] lg:bg-white text-slate-900 overflow-hidden relative"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* 🚀 DESKTOP LEFT SIDE */}
      <div className="hidden lg:flex w-1/2 bg-[#f8fafc] flex-col justify-between px-12 xl:px-[10%] py-10 border-r border-slate-200/60 relative z-0">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col justify-center flex-grow max-w-[480px] relative z-10"
        >
          <motion.img
            whileHover={{ scale: 1.05, rotate: -2 }}
            src="/favicon.svg"
            alt="Zync AI"
            className="w-12 h-12 mb-10 shadow-sm rounded-xl"
          />
          <h2 className="text-4xl xl:text-[46px] font-bold leading-[1.15] tracking-tight mb-6 text-slate-900">
            Power your future with <br />
            <span className="text-[#0064e0]">intelligent AI.</span>
          </h2>
          <p className="text-[17px] text-slate-500 font-normal leading-relaxed max-w-[400px]">
            Join thousands of users leveraging Zync AI for smart conversations,
            SEO-optimised articles, and creative content generation in seconds.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative z-10"
        >
          <p className="text-[13px] text-slate-400 font-medium tracking-wide">
            Powered by{" "}
            <a
              href="https://codelume.online"
              target="_blank"
              rel="noreferrer"
              className="text-[#0064e0] font-semibold hover:underline"
            >
              codelume.online
            </a>{" "}
            | Developed by{" "}
            <a
              href="https://codelume.online/about"
              target="_blank"
              rel="noreferrer"
              className="text-[#0064e0] font-semibold hover:underline"
            >
              Rafay
            </a>
          </p>
        </motion.div>
      </div>

      {/* 🚀 MOBILE TOP HEADER (Adjusted Height) */}
      <div className="flex lg:hidden flex-col items-center justify-center h-[24dvh] min-h-[170px] relative w-full overflow-hidden bg-gradient-to-br from-[#0064e0] to-[#4384ef] shrink-0">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ repeat: Infinity, duration: 4 }}
          className="absolute top-[-20%] left-[-10%] w-40 h-40 bg-white/20 rounded-full blur-3xl"
        ></motion.div>
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ repeat: Infinity, duration: 5, delay: 1 }}
          className="absolute bottom-[-10%] right-[-10%] w-32 h-32 bg-cyan-300/30 rounded-full blur-2xl"
        ></motion.div>

        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 15, delay: 0.1 }}
          className="flex flex-col items-center z-10 mt-2"
        >
          <div className="bg-white p-1 rounded-2xl shadow-lg mb-2">
            <img
              src="/favicon.svg"
              alt="Zync AI"
              className="w-9 h-9 rounded-[10px]"
            />
          </div>
          <h1 className="text-white text-[22px] font-bold tracking-tight">
            Zync AI
          </h1>
          <p className="text-blue-100 text-[12px] mt-0.5 font-medium">
            Your intelligent assistant
          </p>
        </motion.div>
      </div>

      {/* 🚀 MAIN FORM AREA (Perfectly Compacted) */}
      <motion.div
        initial={{ y: "100%", opacity: 0.5 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 22, stiffness: 150 }}
        className="w-full lg:w-1/2 flex-1 lg:h-full bg-white rounded-t-[32px] lg:rounded-none flex flex-col items-center px-5 sm:px-10 pt-4 pb-2 lg:py-0 lg:justify-center shadow-[0_-10px_40px_rgba(0,0,0,0.15)] lg:shadow-none relative z-10 -mt-5 lg:mt-0 hide-scroll overflow-y-auto"
      >
        {/* iOS style Pull Indicator */}
        <div className="w-10 h-1.5 bg-slate-200 rounded-full mb-4 lg:hidden shrink-0"></div>

        <div className="w-full max-w-[360px] sm:max-w-[380px] flex flex-col justify-center flex-1 shrink-0">
          <div className="mb-4 text-center lg:text-left">
            {/* Desktop logo (hidden on mobile) */}
            <div className="hidden lg:flex mb-6">
              <img
                src="/favicon.svg"
                alt="Zync AI"
                className="w-12 h-12 rounded-xl shadow-sm"
              />
            </div>

            <h2 className="text-[22px] lg:text-[26px] font-bold tracking-tight mb-1 text-slate-900">
              <AnimatePresence mode="wait">
                <motion.span
                  key={isLogin ? "login" : "signup"}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="inline-block"
                >
                  {isLogin ? (
                    <>
                      Log in to Zync{" "}
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0064e0] to-[#60a5fa]">
                        AI
                      </span>
                    </>
                  ) : (
                    "Create an account"
                  )}
                </motion.span>
              </AnimatePresence>
            </h2>
            <p className="text-slate-500 text-[13px] lg:text-[14px]">
              {isLogin
                ? "Welcome back! Please enter your details."
                : "Sign up to start crafting magic."}
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.96 }}
            type="button"
            onClick={() => loginWithGoogle()}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 bg-white border border-[#E5E7EB] hover:bg-[#FAFAFA] disabled:opacity-50 text-slate-700 font-semibold py-2.5 px-4 rounded-xl transition-colors duration-200 mb-4 shadow-sm cursor-pointer"
          >
            <svg className="w-[17px] h-[17px]" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-[13.5px]">Continue with Google</span>
          </motion.button>

          <div className="text-center mb-4">
            <span className="text-[10px] lg:text-[11px] font-bold text-slate-400 uppercase tracking-widest relative px-3 lg:px-4 bg-white z-10">
              or continue with email
            </span>
            <div className="h-px bg-[#E5E7EB] w-full -mt-1.5 relative z-0"></div>
          </div>

          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -5, scale: 0.95 }}
                className={`p-2.5 rounded-xl mb-4 text-[12px] lg:text-[13px] font-medium border ${errorMsg.includes("successfully") ? "bg-emerald-50 border-emerald-100 text-emerald-700" : "bg-red-50 border-red-100 text-red-600"}`}
              >
                {errorMsg}
              </motion.div>
            )}
          </AnimatePresence>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-2.5 lg:gap-3"
          >
            <AnimatePresence initial={false}>
              {!isLogin && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="pb-1">
                    <label className="block text-[12px] lg:text-[13px] font-semibold text-slate-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-[#FAFAFA] focus:bg-white border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 lg:py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0064e0] focus:ring-[3px] focus:ring-[#0064e0]/15 transition-all duration-200 text-[13.5px] lg:text-[14.5px]"
                      placeholder="John Doe"
                      disabled={isLogin}
                      required={!isLogin}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="block text-[12px] lg:text-[13px] font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#FAFAFA] focus:bg-white border border-[#E5E7EB] rounded-xl px-3.5 py-2.5 lg:py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0064e0] focus:ring-[3px] focus:ring-[#0064e0]/15 transition-all duration-200 text-[13.5px] lg:text-[14.5px]"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[12px] lg:text-[13px] font-semibold text-slate-700">
                  Password
                </label>
                {isLogin && (
                  <button
                    type="button"
                    className="text-[11.5px] lg:text-[12.5px] font-semibold text-[#0064e0] hover:text-[#0057c9] transition-colors cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative group">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#FAFAFA] focus:bg-white border border-[#E5E7EB] rounded-xl pl-3.5 pr-10 py-2.5 lg:py-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0064e0] focus:ring-[3px] focus:ring-[#0064e0]/15 transition-all duration-200 text-[13.5px] lg:text-[14.5px]"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer p-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.96 }}
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#0064e0] hover:bg-[#0057c9] disabled:bg-[#0064e0]/70 text-white font-semibold py-2.5 lg:py-3.5 px-4 rounded-xl transition-all duration-200 shadow-[0_4px_14px_0_rgba(0,100,224,0.25)] mt-1.5 lg:mt-3 cursor-pointer"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              <span className="text-[13.5px] lg:text-[14.5px]">
                {loading
                  ? "Processing..."
                  : isLogin
                    ? "Log in"
                    : "Create Account"}
              </span>
            </motion.button>
          </form>

          <div className="mt-4 lg:mt-6 text-center flex flex-col items-center pb-2">
            <p className="text-[13px] lg:text-[14px] text-slate-500">
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setErrorMsg("");
                  setShowPassword(false);
                }}
                className="text-[#0064e0] font-semibold hover:underline cursor-pointer transition-all ml-1"
              >
                {isLogin ? "Sign up" : "Log in"}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
