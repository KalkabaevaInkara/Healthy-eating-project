const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../db");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post("/register", async (req, res) => {
  const { email, phone, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO users (email, phone, password_hash) VALUES ($1, $2, $3)",
      [email, phone, hash]
    );
    res.status(201).json({ message: "Регистрация успешна" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Ошибка при регистрации" });
  }
});

router.post("/login", async (req, res) => {
  const { identifier, password } = req.body;
  try {
    const result = await db.query(
      "SELECT * FROM users WHERE email = $1 OR phone = $1",
      [identifier]
    );
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: "Пользователь не найден" });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ error: "Неверный пароль" });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Ошибка при входе" });
  }
});

router.post("/google-login", async (req, res) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email, name } = ticket.getPayload();

    let user = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (user.rows.length === 0) {
      user = await db.query(
        "INSERT INTO users (email, name) VALUES ($1, $2) RETURNING *",
        [email, name]
      );
    }

    const jwtToken = jwt.sign({ userId: user.rows[0].id }, process.env.JWT_SECRET);
    res.json({ token: jwtToken });
  } catch (err) {
    console.error(err);
    res.status(401).json({ error: "Ошибка Google авторизации" });
  }
});

module.exports = router;
