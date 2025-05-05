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

router.post("/", async (req, res) => {
  const { user_id = 1, plan, diet, preferences } = req.body;

  try {
    const planResult = await pool.query(
      "INSERT INTO plans (user_id, diet, preferences) VALUES ($1, $2, $3) RETURNING id",
      [user_id, diet, preferences]
    );
    const planId = planResult.rows[0].id;

    for (const [day, meals] of Object.entries(plan)) {
      for (const [mealType, recipeId] of Object.entries(meals)) {
        await pool.query(
          "INSERT INTO meal_plans (user_id, day, meal_type, recipe_id, plan_id) VALUES ($1, $2, $3, $4, $5)",
          [user_id, day, mealType, recipeId, planId]
        );
      }
    }

    res.status(200).json({ message: "План успешно сохранён" });
  } catch (err) {
    console.error("Ошибка при сохранении плана:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.get("/user-plans/:userId", async (req, res) => {
  const userId = req.params.userId;

  try {
    const plansRes = await pool.query(
      "SELECT * FROM plans WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );

    const plans = [];

    for (const plan of plansRes.rows) {
      const mealsRes = await pool.query(
        `SELECT meal_plans.day, meal_plans.meal_type, meal_plans.recipe_id, recipes.name AS recipe_name
         FROM meal_plans
         JOIN recipes ON meal_plans.recipe_id = recipes.id
         WHERE meal_plans.plan_id = $1`,
        [plan.id]
      );

      plans.push({
        ...plan,
        meals: mealsRes.rows
      });
    }

    res.json(plans);
  } catch (err) {
    console.error("Ошибка при получении планов пользователя:", err);
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
