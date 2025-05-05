import { useState } from "react";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase.js";
import { useNavigate } from "react-router-dom";

function Register() {
  const [loginInput, setLoginInput] = useState(""); 
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleSignUp = async () => {
    setLoading(true);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setDoc(doc(db, "users", user.uid), {
        login: user.email,
        isPhone: false,
        avatarURL: user.photoURL,
        createdAt: Date.now(),
      });

      alert("Регистрация прошла успешно!");
navigate("/complete-profile");
    } catch (err) {
      setError(err.message || "Ошибка регистрации через Google");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    setLoading(true);

    const isPhone = /^\d{10,15}$/.test(loginInput.trim());
    const emailForAuth = isPhone ? `${loginInput}@myapp.fake` : loginInput;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, emailForAuth, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        login: loginInput,
        isPhone,
        createdAt: Date.now()
      });
      
      alert("Регистрация прошла успешно!");
      navigate("/complete-profile");
      
    } catch (err) {
      setError(err.message || "Ошибка регистрации");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-content">
        <h2>Регистрация</h2>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Email или номер телефона"
            value={loginInput}
            onChange={(e) => setLoginInput(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Подтвердите пароль"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Загрузка..." : "Зарегистрироваться"}
          </button>

          {error && <p className="error">{error}</p>}
        </form>

        <button onClick={handleGoogleSignUp} disabled={loading} className="google-signup-btn">
          {loading ? "Загрузка..." : "Зарегистрироваться через Google"}
        </button>

        <p className="register-link">
          Уже есть аккаунт? <a href="/login">Войти</a>
        </p>
      </div>

      <div className="login-image">
        <img src="/login_banner.jpg" alt="Healthy food banner" />
      </div>
    </div>
  );
}

export default Register;
