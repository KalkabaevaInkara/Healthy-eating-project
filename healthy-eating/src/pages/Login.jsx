import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Вход выполнен!");
      navigate("/profile");
    } catch (err) {
      setError("Неверный email или пароль");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      alert("Успешный вход через Google!");
      navigate("/profile");
    } catch (err) {
      console.error("Ошибка входа через Google:", err);
      setError("Ошибка входа через Google");
    }
  };

  return (
    <div className="login-page">
      <div className="login-content">
        <h2>Вход</h2>
        <form onSubmit={handleEmailLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Войти</button>
          <button type="button" className="google-button" onClick={handleGoogleLogin}>
            Войти через Google
          </button>
          {error && <p className="error">{error}</p>}

          <p className="register-link">
            Нет аккаунта? <a href="/register">Зарегистрироваться</a>
          </p>
        </form>
      </div>
      <div className="login-image">
        <img src="/login_banner.jpg" alt="Healthy food banner" />
      </div>
    </div>
  );
}

export default Login;
