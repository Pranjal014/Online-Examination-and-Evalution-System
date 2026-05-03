const express = require("express");
const router = express.Router();
const db = require("../db");

// ADD QUESTION API
router.get("/getExams", (req, res) => {
  db.query(
    `SELECT 
      id,
      subject,
      DATE_FORMAT(exam_date, '%Y-%m-%d') AS exam_date,
      start_time,
      end_time
     FROM exams`,
    (err, result) => {
      if (err) return res.json({ status: "error", message: err.message });
      res.json(result);
    }
  );
});
module.exports = router;