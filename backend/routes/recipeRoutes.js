const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

router.get("/recipes", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.id,
             r.name AS recipe_name,
             r.calories,
             r.prep_time_minutes,
             r.image_url,
             r.description,
             COALESCE(ARRAY_AGG(DISTINCT i.name) FILTER (WHERE i.name IS NOT NULL), '{}') AS ingredients,
             COALESCE(ARRAY_AGG(DISTINCT d.name) FILTER (WHERE d.name IS NOT NULL), '{}') AS diets
      FROM recipes r
      LEFT JOIN recipe_ingredients ri ON ri.recipe_id = r.id
      LEFT JOIN ingredients i ON i.id = ri.ingredient_id
      LEFT JOIN recipe_diets rd ON rd.recipe_id = r.id
      LEFT JOIN diets d ON d.id = rd.diet_id
      GROUP BY r.id;
    `);

    console.log("Рецепты с диетами:", result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error("Ошибка при загрузке рецептов:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.get("/recipe/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM recipes WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Рецепт не найден" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Ошибка при запросе к базе данных", err);
    res.status(500).send("Ошибка при запросе к базе данных");
  }
});

router.get("/recipe/:id/ingredients", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT i.name
       FROM recipe_ingredients ri
       JOIN ingredients i ON ri.ingredient_id = i.id
       WHERE ri.recipe_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Ингредиенты не найдены" });
    }

    res.json(result.rows);
  } catch (err) {
    console.error("Ошибка при получении ингредиентов:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.get("/ingredients", async (req, res) => {
  try {
    const result = await pool.query("SELECT DISTINCT name FROM ingredients");
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Ингредиенты не найдены" });
    }
    res.json(result.rows);
  } catch (err) {
    console.error("Ошибка при получении ингредиентов:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.get("/diets", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name FROM diets ORDER BY name");
    res.json(result.rows);
  } catch (err) {
    console.error("Ошибка при получении диет:", err);
    res.status(500).json({ error: "Ошибка при получении диет" });
  }
});

module.exports = router;