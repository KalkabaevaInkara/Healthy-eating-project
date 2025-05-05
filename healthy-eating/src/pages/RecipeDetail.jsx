import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import OtherRecipes from "../components/OtherRecipes";


const RecipeDetail = ({ isDarkTheme }) => {
  const { id } = useParams();
  const [recipe, setRecipe] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    document.body.className = isDarkTheme ? "dark-theme" : "";

    const fetchRecipe = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/recipe/${id}`);
        if (response.status === 200) {
          setRecipe(response.data);
        } else {
          throw new Error("Рецепт не найден");
        }
      } catch (error) {
        setError(error.response?.data?.error || "Ошибка при загрузке рецепта. Попробуйте позже.");
        console.error("Error fetching recipe:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchIngredients = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/recipe/${id}/ingredients`);
        setIngredients(response.data);
      } catch (err) {
        console.error("Ошибка при получении ингредиентов:", err);
        setIngredients([]);
      }
    };

    fetchRecipe();
    fetchIngredients();
  }, [id, isDarkTheme]);

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!recipe) {
    return <div>Рецепт не найден</div>;
  }

  return (
    <div className="recipe-detail-container">
      <div className="recipe-top">
        {recipe.image_url && (
          <img
            src={recipe.image_url}
            alt={recipe.name}
            className="recipe-detail-image"
          />
        )}
        <div className="recipe-detail-content">
          <h1 className="recipe-detail-title">{recipe.name}</h1>
          <p className="recipe-description">{recipe.description}</p>
          <div className="recipe-detail-info">
            <p className="recipe-time">⏱️ {recipe.prep_time_minutes} мин</p>
            <p className="recipe-calories">🔥 {recipe.calories} ккал</p>
          </div>
          <div className="recipe-columns">
            <div className="ingredients-column">
              <h3 className="ingredients-title">Ингредиенты:</h3>
              <ul className="ingredients-list">
                {ingredients.map((item, index) => (
                  <li key={index}>{item.name}</li>
                ))}
              </ul>
            </div>
            <div className="nutrients-column">
              <h3 className="ingredients-title">Пищевая ценность:</h3>
              <ul className="ingredients-list">
                <li>Белки: {recipe.protein} г</li>
                <li>Жиры: {recipe.fat} г</li>
                <li>Углеводы: {recipe.carbs} г</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="recipe-bottom">
        <h3 className="instructions-title">Инструкции:</h3>
        <p className="recipe-instructions">{recipe.instructions}</p>
      </div>
      <OtherRecipes currentRecipeId={recipe.id} />
    </div>
  );
};

export default RecipeDetail;
