import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";

function Catalog() {
  const [recipes, setRecipes] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState("");
  const [sortByCalories, setSortByCalories] = useState(false);
  const [sortAscending, setSortAscending] = useState(false);

  const [diets, setDiets] = useState([]);
  const [selectedDiet, setSelectedDiet] = useState("");

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/recipes")
      .then((response) => {
        setRecipes(response.data);
      })
      .catch((error) => console.error("Ошибка при загрузке рецептов:", error));

    axios
      .get("http://localhost:5000/api/ingredients")
      .then((response) => {
        setIngredients(response.data.map((item) => item.name));
      })
      .catch((error) => console.error("Ошибка при загрузке ингредиентов:", error));

    axios
      .get("http://localhost:5000/api/diets")
      .then((response) => {
        setDiets(response.data);
      })
      .catch((error) => console.error("Ошибка при загрузке диет:", error));
  }, []);

  const filteredRecipes = recipes
    .filter((recipe) => {
      const matchesName = recipe.recipe_name
        ? recipe.recipe_name.toLowerCase().includes(searchTerm.trim().toLowerCase())
        : false;

      const matchesIngredient = !selectedIngredient || (
        Array.isArray(recipe.ingredients) &&
        recipe.ingredients.some((ing) => {
          const ingName = typeof ing === "string" ? ing : ing?.name || "";
          return ingName.trim().toLowerCase().includes(selectedIngredient.trim().toLowerCase());
        })
      );

      const matchesDiet = !selectedDiet || (
        Array.isArray(recipe.diets) &&
        recipe.diets.some((diet) => {
          const dietName = typeof diet === "string" ? diet : diet?.name || "";
          return dietName.trim().toLowerCase() === selectedDiet.trim().toLowerCase();
        })
      );

      return matchesName && matchesIngredient && matchesDiet;
    })
    .sort((a, b) => {
      if (sortByCalories) return b.calories - a.calories;
      if (sortAscending) return a.calories - b.calories;
      return 0;
    });

  return (
    <div className="catalog-container">
      <div className="catalog-sidebar">
        <h3>Фильтры</h3>

        <div className="filter-container">
          <h4>Поиск по названию</h4>
          <input
            type="text"
            placeholder="Введите название рецепта"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-container">
          <h4>Ингредиенты</h4>
          <select
            value={selectedIngredient}
            onChange={(e) => setSelectedIngredient(e.target.value)}
          >
            <option value="">Все ингредиенты</option>
            {ingredients.length > 0 ? (
              ingredients.map((ingredient) => (
                <option key={ingredient} value={ingredient}>
                  {ingredient}
                </option>
              ))
            ) : (
              <option disabled>Ингредиенты не найдены</option>
            )}
          </select>
        </div>

        <div className="filter-container">
          <h4>Диеты</h4>
          <select
            value={selectedDiet}
            onChange={(e) => setSelectedDiet(e.target.value)}
          >
            <option value="">Все диеты</option>
            {diets.length > 0 ? (
              diets.map((diet) => (
                <option key={diet.id} value={diet.name}>
                  {diet.name}
                </option>
              ))
            ) : (
              <option disabled>Диеты не найдены</option>
            )}
          </select>
        </div>

        <div className="sort-container">
          <h4>Сортировка</h4>
          <label>
            <input
              type="checkbox"
              checked={sortByCalories}
              onChange={(e) => {
                setSortByCalories(e.target.checked);
                if (e.target.checked) setSortAscending(false);
              }}
            />
            По убыванию калорий
          </label>
          <label>
            <input
              type="checkbox"
              checked={sortAscending}
              onChange={(e) => {
                setSortAscending(e.target.checked);
                if (e.target.checked) setSortByCalories(false);
              }}
            />
            По возрастанию калорий
          </label>
        </div>
      </div>

      <div className="catalog-content content-spacing">
        <h1 className="catalog-title">Каталог рецептов</h1>
        <div className="recipe-grid">
          {filteredRecipes.map((recipe, index) => (
            <motion.div
              key={recipe.id}
              className="recipe-card"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {recipe.image_url && (
                <img
                  src={recipe.image_url}
                  alt={recipe.recipe_name}
                  className="recipe-image"
                />
              )}
              <div className="recipe-content">
                <div className="recipe-info">
                  <h2 className="recipe-content-name">{recipe.recipe_name}</h2>
                  <div className="recipe-content-type">
                    <p className="recipe-time">⏱️ {recipe.prep_time_minutes} мин</p>
                    <p className="recipe-calories">🔥 {recipe.calories} ккал</p>
                  </div>
                  <p className="recipe-content-description">{recipe.description}</p>
                </div>
                <a href={`/recipe/${recipe.id}`} className="main__button">
                  Подробнее
                </a>
              </div>
            </motion.div>
          ))}
          {filteredRecipes.length === 0 && (
            <p className="no-recipes">Рецепты не найдены для выбранных фильтров.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Catalog;
