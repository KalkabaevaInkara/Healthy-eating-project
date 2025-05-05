import { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";
import { useMealPlanStore } from "../store/useMealPlanStore";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [savedPlans, setSavedPlans] = useState([]);
  const navigate = useNavigate();

  const { recipes, fetchRecipes } = useMealPlanStore();

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setProfile(data);
        setSavedPlans(data.mealPlans || []);
      }
    };

    fetchRecipes();
    fetchProfile();
  }, []);

  const handleEdit = () => {
    navigate("/complete-profile");
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login");
  };

  const handleDeletePlan = async (index) => {
    const user = auth.currentUser;
    if (!user) return alert("Сначала войдите в аккаунт.");

    try {
      const userDocRef = doc(db, "users", user.uid);
      const updatedPlans = savedPlans.filter((_, i) => i !== index);

      await setDoc(userDocRef, {
        ...profile,
        mealPlans: updatedPlans,
      });

      setSavedPlans(updatedPlans);
      alert("План успешно удалён!");
    } catch (error) {
      console.error("Ошибка при удалении плана:", error);
      alert("Ошибка при удалении.");
    }
  };

  if (!profile) return <p>Загрузка профиля...</p>;

  return (
    <div className="profile-container content-spacing">
      <div className="profile-card">
        <h2>Ваш профиль</h2>
        <img src={profile.avatarURL} alt="avatar" />
        <h3>{profile.nickname}</h3>
        <p>{profile.bio}</p>

        <button className="edit-button" onClick={handleEdit}>
          Редактировать профиль
        </button>
        <button className="logout-button" onClick={handleLogout}>
          Выйти из аккаунта
        </button>
      </div>

      <div className="saved-plans">
        <h3>Сохранённые планы питания</h3>
        {savedPlans.length === 0 ? (
          <p>Нет сохранённых планов.</p>
        ) : (
          savedPlans.map((plan, index) => (
            <div key={index} className="saved-plan">
              <h4>План #{index + 1}</h4>
              {Object.entries(plan).map(([day, meals]) => (
                <div key={day}>
                  <strong>{day}</strong>
                  <ul>
                    {Object.entries(meals).map(([meal, recipeId]) => {
                      const recipe = recipes.find(r => Number(r.id) === Number(recipeId));
                      return (
                        <li key={meal}>
                          {meal}: {recipe?.name || `ID ${recipeId}`}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
              <button
                className="delete-plan-button"
                onClick={() => handleDeletePlan(index)}
              >
                Удалить план
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
