const express = require("express");
const router = express.Router();
const db = require("../db");

// Add user
router.post("/addUser", (req, res) => {
  const { name, email, password, role } = req.body;

  db.query(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    [name, email, password, role],
    () => res.json({ message: "User added" })
  );
});

// Get users
router.get("/users", (req, res) => {
  db.query("SELECT * FROM users", (err, result) => {
    res.json(result);
  });
});

module.exports = router;