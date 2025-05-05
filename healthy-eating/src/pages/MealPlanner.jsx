import { useMealPlanStore } from "../store/useMealPlanStore";
import { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const days = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];
const meals = ["Завтрак", "Обед", "Ужин"];
const dailyGoals = {
  calories: 1800,
  protein: 80,
  fat: 70,
  carbs: 200,
};

const MealPlanner = () => {
  const {
    plan,
    setRecipe,
    removeRecipe,
    fetchRecipes,
    recipes,
  } = useMealPlanStore();

  const [selectedDay, setSelectedDay] = useState("");
  const [selectedMeal, setSelectedMeal] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState("");

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const handlePlan = () => {
    if (selectedDay && selectedMeal && selectedRecipe) {
      setRecipe(selectedDay, selectedMeal, +selectedRecipe);
      setSelectedDay("");
      setSelectedMeal("");
      setSelectedRecipe("");
    }
  };

  const calculateNutrients = () => {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalFat = 0;
    let totalCarbs = 0;

    Object.entries(plan).forEach(([day, meals]) => {
      Object.entries(meals).forEach(([mealType, recipeId]) => {
        const recipe = recipes.find((r) => Number(r.id) === Number(recipeId));
        if (recipe) {
          totalCalories += Number(recipe.calories) || 0;
          totalProtein += Number(recipe.protein) || 0;
          totalFat += Number(recipe.fat) || 0;
          totalCarbs += Number(recipe.carbs) || 0;
        } else {
          console.warn(`Рецепт с ID ${recipeId} не найден в списке рецептов.`);
        }
      });
    });

    return {
      totalCalories: Math.round(totalCalories),
      totalProtein: Math.round(totalProtein * 100) / 100,
      totalFat: Math.round(totalFat * 100) / 100,
      totalCarbs: Math.round(totalCarbs * 100) / 100,
    };
  };

  const { totalCalories, totalProtein, totalFat, totalCarbs } = calculateNutrients();

  const savePlanToFirestore = async () => {
    const user = auth.currentUser;
    if (!user) return alert("Сначала войдите в аккаунт.");

    try {
      const userDocRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(userDocRef);

      const existingPlans = docSnap.exists() && docSnap.data().mealPlans ? docSnap.data().mealPlans : [];

      await setDoc(userDocRef, {
        ...docSnap.data(),
        mealPlans: [...existingPlans, plan],
      });

      alert("План питания сохранён!");
    } catch (error) {
      console.error("Ошибка сохранения плана:", error);
      alert("Ошибка при сохранении.");
    }
  };

  return (
    <div className="meal-planner-container">
      <h2 className="meal-planner-title">Планировщик питания</h2>

      <div className="progress-bar">
        <p>Калории: {totalCalories} / {dailyGoals.calories} ккал</p>
        <progress value={totalCalories} max={dailyGoals.calories}></progress>
        <p>Белки: {totalProtein} / {dailyGoals.protein} г</p>
        <progress value={totalProtein} max={dailyGoals.protein}></progress>
        <p>Жиры: {totalFat} / {dailyGoals.fat} г</p>
        <progress value={totalFat} max={dailyGoals.fat}></progress>
        <p>Углеводы: {totalCarbs} / {dailyGoals.carbs} г</p>
        <progress value={totalCarbs} max={dailyGoals.carbs}></progress>
      </div>

      <div className="planner-card">
        <select value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)}>
          <option value="">Выберите день</option>
          {days.map((day) => <option key={day} value={day}>{day}</option>)}
        </select>
        <select value={selectedMeal} onChange={(e) => setSelectedMeal(e.target.value)}>
          <option value="">Выберите приём пищи</option>
          {meals.map((meal) => <option key={meal} value={meal}>{meal}</option>)}
        </select>
        <select value={selectedRecipe} onChange={(e) => setSelectedRecipe(e.target.value)}>
          <option value="">Выберите рецепт</option>
          {recipes.map((recipe) => (
            <option key={recipe.id} value={recipe.id}>{recipe.name}</option>
          ))}
        </select>
        <button onClick={handlePlan}>Запланировать</button>
      </div>

      <h3 className="meal-planner-title">📋 Ваш план:</h3>
      <button onClick={savePlanToFirestore} className="save-button">💾 Сохранить план</button>

      <div className="meal-plan-list">
        {Object.entries(plan).map(([day, meals]) => (
          <div key={day} className="meal-plan-day">
            <h4>{day}</h4>
            <div className="meal-plan-cards">
              {Object.entries(meals).map(([mealType, recipeId]) => {
                const recipe = recipes.find((r) => Number(r.id) === Number(recipeId));
                return (
                  <div key={mealType} className="meal-plan-card">
                    <div className="meal-plan-card-content">
                      <h5>{mealType}</h5>
                      <p>{recipe?.name || `ID ${recipeId}`}</p>
                    </div>
                    <button
                      className="remove-button"
                      onClick={() => removeRecipe(day, mealType)}
                    >
                      Удалить
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MealPlanner;
