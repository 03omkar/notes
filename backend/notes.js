const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const pool = require("../db");

router.post("/notes", async (req, res) => {
  const { note } = req.body;

  if (!note || note.length > 500) {
    return res.status(400).json({ error: "Note must be 1–500 characters" });
  }

  const id = crypto.randomUUID();
  const password = crypto.randomBytes(3).toString("hex");

  await pool.query(
    "INSERT INTO notes (id, note, password) VALUES ($1, $2, $3)",
    [id, note, password]
  );

  res.json({
    url: `/view.html?id=${id}`,
    password
  });
});

router.post("/notes/:id/verify", async (req, res) => {
  const { password } = req.body;
  const { id } = req.params;

  const result = await pool.query(
    "SELECT note, password FROM notes WHERE id=$1",
    [id]
  );

  if (result.rowCount === 0 || result.rows[0].password !== password) {
    return res.status(401).json({ error: "Invalid password" });
  }

  res.json({ note: result.rows[0].note });
});

module.exports = router;
