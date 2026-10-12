import React, { useState, useEffect } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Auth from "./components/Auth"; // Path apne hisaab se check kar lein
import Dashboard from "./components/Dashboard"; // Path apne hisaab se check kar lein

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Yahan humne 'zync_user' kar diya hai taake refresh par logout na ho
    const storedUser = localStorage.getItem("zync_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Session parse error");
      }
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    // Logout par bhi sahi key remove karni hai
    localStorage.removeItem("zync_user");
    setUser(null);
  };

  return (
    // Apna Google Client ID yahan zaroor dalein
    <GoogleOAuthProvider
      clientId={
        import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID"
      }
    >
      <div className="w-full min-h-screen bg-white">
        {user ? (
          <Dashboard user={user} onLogout={handleLogout} />
        ) : (
          <Auth onLogin={handleLogin} />
        )}
      </div>
    </GoogleOAuthProvider>
  );
};

export default App;
