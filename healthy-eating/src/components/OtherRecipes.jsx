import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const OtherRecipes = ({ currentRecipeId }) => {
  const [otherRecipes, setOtherRecipes] = useState([]);

  useEffect(() => {
    const fetchOtherRecipes = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/recipe");
        if (response.status === 200) {
          const filtered = response.data.filter(
            (recipe) => recipe.id !== Number(currentRecipeId)
          );
          const shuffled = filtered.sort(() => 0.5 - Math.random());
          setOtherRecipes(shuffled.slice(0, 4));
        }
      } catch (error) {
        console.error("Ошибка при загрузке других рецептов:", error);
      }
    };

    fetchOtherRecipes();
  }, [currentRecipeId]);

  return (
    <div className="other-recipes-section">
      <h2>Другие рецепты</h2>
      <div className="other-recipes-grid">
        {otherRecipes.map((recipe) => (
          <div key={recipe.id} className="other-recipe-card">
            <Link to={`/recipe/${recipe.id}`} className="other-recipe-link">
              {recipe.image_url && (
                <img
                  src={recipe.image_url}
                  alt={recipe.name}
                  className="other-recipe-image"
                />
              )}
              <h3 className="other-recipe-name">{recipe.name}</h3>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OtherRecipes;
