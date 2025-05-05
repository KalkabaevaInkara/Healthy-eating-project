import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

const avatarOptions = [
    "https://api.dicebear.com/6.x/pixel-art/svg?seed=BlondeGirlOne",
  "https://api.dicebear.com/6.x/pixel-art/svg?seed=BlondeGirlTwo",
  "https://api.dicebear.com/6.x/pixel-art/svg?seed=BlondeGirlThree",
      "https://api.dicebear.com/6.x/pixel-art/svg?seed=BoyOne",
    "https://api.dicebear.com/6.x/pixel-art/svg?seed=BoyTwo",
    "https://api.dicebear.com/6.x/pixel-art/svg?seed=BoyThree"
  ];
  

function CompleteProfile() {
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [avatarURL, setAvatarURL] = useState(avatarOptions[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/register");
    }
  }, [navigate]);

  const handleSubmit = async () => {
    if (!nickname) {
      setError("Пожалуйста, введите имя пользователя");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const user = auth.currentUser;
      await setDoc(doc(db, "users", user.uid), {
        nickname,
        bio,
        avatarURL,
        createdAt: Date.now()
      });

      alert("Профиль создан!");
      navigate("/profile");
    } catch (err) {
      setError("Ошибка при сохранении профиля");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="complete-profile-page">
      <div className="complete-profile-content">
        <h2>Заполни профиль</h2>

        <input
          type="text"
          placeholder="Имя пользователя"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
        />

        <textarea
          placeholder="О себе"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />

        <p>Выбери аватар:</p>
        <div className="avatar-selection">
          {avatarOptions.map((url, i) => (
            <img
              key={i}
              src={url}
              alt="avatar"
              onClick={() => setAvatarURL(url)}
              className={avatarURL === url ? "selected" : ""}
            />
          ))}
        </div>

        <button onClick={handleSubmit} disabled={loading}>
          {loading ? "Сохраняем..." : "Завершить"}
        </button>

        {error && <p className="error">{error}</p>}
      </div>

      <div className="login-image">
        <img src="/login_banner.jpg" alt="Healthy food banner" />
      </div>
    </div>
  );
}

export default CompleteProfile;
