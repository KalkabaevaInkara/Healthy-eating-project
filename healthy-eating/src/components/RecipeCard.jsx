import { Link } from "react-router-dom";

function RecipeCard({ recipe }) {
  return (
    <div className="recipe-card">
      <h2>{recipe.name}</h2>
      <p>{recipe.description}</p>
      <Link to={`/recipe/${recipe.id}`}>Посмотреть рецепт</Link>
    </div>
  );
}

export default RecipeCard;
