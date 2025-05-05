const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

pool.connect((err) => {
  if (err) {
    console.error("❌ Ошибка подключения к базе данных", err);
  } else {
    console.log("✅ Подключение к базе данных успешно!");
  }
});

app.post("/api/register", async (req, res) => {
  const { username, email, password, full_name, phone } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Все поля обязательны для заполнения" });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (username, email, password_hash, full_name, phone) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, full_name, phone",
      [username, email, hashedPassword, full_name, phone]
    );
    res.status(201).json({ message: "Пользователь создан", user: result.rows[0] });
  } catch (err) {
    console.error("Ошибка при регистрации пользователя", err);
    res.status(500).json({ error: "Ошибка при регистрации пользователя" });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Все поля обязательны для заполнения" });
  }
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Неверный email или пароль" });
    }
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: "Неверный email или пароль" });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  } catch (err) {
    console.error("Ошибка при авторизации пользователя", err);
    res.status(500).json({ error: "Ошибка при авторизации пользователя" });
  }
});

app.get("/api/recipe", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        r.id,
        r.name,
        r.description,
        r.calories,
        r.prep_time_minutes,
        r.image_url,
        r.instructions,
        COALESCE(json_agg(DISTINCT jsonb_build_object('name', i.name)) 
                 FILTER (WHERE i.name IS NOT NULL), '[]') AS ingredients,
        COALESCE(array_agg(DISTINCT t.name) 
                 FILTER (WHERE t.name IS NOT NULL), '{}') AS tags
      FROM recipes r
      LEFT JOIN recipe_ingredients ri ON r.id = ri.recipe_id
      LEFT JOIN ingredients i ON ri.ingredient_id = i.id
      LEFT JOIN recipe_tags rt ON rt.recipe_id = r.id
      LEFT JOIN tags t ON t.id = rt.tag_id
      GROUP BY r.id
    `);

    console.log("Рецепты, возвращённые сервером:", result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error("Ошибка при загрузке рецептов:", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

app.get("/api/recipe/:id/ingredients", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT i.name
       FROM ingredients i
       JOIN recipe_ingredients ri ON i.id = ri.ingredient_id
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

app.get("/api/recipe/:id", async (req, res) => {
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

app.post("/api/recipe", async (req, res) => {
  const { name, description, instructions } = req.body;
  if (!name || !description || !instructions) {
    return res.status(400).json({ error: "Все поля обязательны для заполнения" });
  }
  try {
    const result = await pool.query(
      "INSERT INTO recipes (name, description, instructions) VALUES ($1, $2, $3) RETURNING *",
      [name, description, instructions]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Ошибка при добавлении рецепта", err);
    res.status(500).send("Ошибка при добавлении рецепта");
  }
});

app.post("/api/meal-planner", async (req, res) => {
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

app.get("/api/user-plans/:userId", async (req, res) => {
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

app.get("/api/profile/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT id, username, email, full_name, phone, created_at FROM users WHERE id = $1",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Ошибка при получении профиля пользователя", err);
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

app.post("/api/google-login", async (req, res) => {
  const { email, full_name } = req.body;

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: "2h" });
      return res.json({ message: "Успешный вход", token, user });
    }

    const newUser = await pool.query(
      "INSERT INTO users (email, full_name) VALUES ($1, $2) RETURNING *",
      [email, full_name]
    );
    const token = jwt.sign({ userId: newUser.rows[0].id }, process.env.JWT_SECRET, { expiresIn: "2h" });
    res.status(201).json({ message: "Пользователь создан через Google", token, user: newUser.rows[0] });
  } catch (err) {
    console.error("Ошибка входа через Google:", err);
    res.status(500).json({ error: "Ошибка входа через Google" });
  }
});

const mealPlannerRoutes = require("./routes/mealPlannerRoutes");
app.use("/api/meal-plan", mealPlannerRoutes);

const recipeRoutes = require("./routes/recipeRoutes");
app.use("/api", recipeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
});
