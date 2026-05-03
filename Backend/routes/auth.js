const express = require("express");
const router = express.Router();
const db = require("../db");

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email=? AND password=?",
    [email, password],
    (err, result) => {
      if (result.length > 0) {
        res.json(result[0]);
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    }
  );
});

module.exports = router;