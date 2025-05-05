import { useState, useEffect } from "react";
import AppRoutes from "./routes";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { useAuthStore } from "./store/useAuthStore";
import { auth } from "./firebase";

function App() {
  const [isDarkTheme, setDarkTheme] = useState(() => {
    return localStorage.getItem("isDarkTheme") === "true";
  });
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);

  const toggleTheme = () => {
    const newTheme = !isDarkTheme;
    setDarkTheme(newTheme);
    localStorage.setItem("isDarkTheme", newTheme);
  };

  useEffect(() => {
    document.body.className = isDarkTheme ? "dark-theme" : "";

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        logout();
      }
    });

    return () => unsubscribe();
  }, [isDarkTheme, setUser, logout]);

  return (
    <div className="app-container">
      <Header toggleTheme={toggleTheme} />
      <main className="main-content">
        <AppRoutes />
      </main>
      <Footer />
    </div>
  );
}

export default App;