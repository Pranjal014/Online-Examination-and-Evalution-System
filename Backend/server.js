const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const multer = require("multer");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

/* DB */
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "exam_system",
});

db.connect((err) => {
  if (err) console.log(err);
  else console.log("MySQL Connected ✅");
});

/* LOGIN */
app.post("/login", (req, res) => {
  let { email, password } = req.body;

  // 🔥 FIX: clean input
  email = String(email).trim().toLowerCase();
  password = String(password).trim();

  console.log("Login Input:", email, password);

  db.query(
    "SELECT * FROM users WHERE LOWER(email)=? AND password=?",
    [email, password],
    (err, result) => {
      if (err) return res.json({ status: "error", message: err.message });

      console.log("DB Result:", result);

      if (result.length > 0) {
        res.json({ status: "success", user: result[0] });
      } else {
        res.json({ status: "failed" });
      }
    }
  );
});

/* MULTER */
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

/* ADD USER */
app.post("/addUser", upload.single("photo"), (req, res) => {
  const { name, email, password, role } = req.body;
  const photo = req.file ? req.file.filename : "";

  db.query(
    "INSERT INTO users (name,email,password,role,photo) VALUES (?,?,?,?,?)",
    [name, email, password, role, photo],
    (err) => {
      if (err) {
        console.log("User insert error:", err);
        return res.json({ status: "error", message: err.message });
      }

      res.json({ status: "success" });
    }
  );
});

/* ADD EXAM WITH QUESTIONS */
app.post("/addExam", (req, res) => {
  console.log("Exam data received:", req.body);

  const { subject, exam_date, start_time, duration, questions } = req.body;

  if (!subject || !exam_date || !start_time || !duration) {
    return res.json({
      status: "error",
      message: "All exam fields are required",
    });
  }

  const startDateTime = new Date(`${exam_date}T${start_time}`);
  startDateTime.setMinutes(startDateTime.getMinutes() + Number(duration));

  const end_time = startDateTime.toTimeString().split(" ")[0];

  db.query(
    "INSERT INTO exams (subject, exam_date, start_time, end_time) VALUES (?, ?, ?, ?)",
    [subject, exam_date, start_time, end_time],
    (err, examResult) => {
      if (err) {
        console.log("Exam insert error:", err);
        return res.json({
          status: "error",
          message: err.message,
        });
      }

      const examId = examResult.insertId;

      if (!questions || questions.length === 0) {
        return res.json({
          status: "success",
          message: "Exam Scheduled ✅",
          examId,
          end_time,
        });
      }

      const values = questions.map((q) => [
        examId,
        q.question,
        q.options[0],
        q.options[1],
        q.options[2],
        q.options[3],
        Number(q.correct),
      ]);

      db.query(
        "INSERT INTO questions (exam_id, question, option1, option2, option3, option4, correct_answer) VALUES ?",
        [values],
        (qErr) => {
          if (qErr) {
            console.log("Question insert error:", qErr);
            return res.json({
              status: "error",
              message: qErr.message,
            });
          }

          res.json({
            status: "success",
            message: "Exam and Questions Added ✅",
            examId,
            end_time,
          });
        }
      );
    }
  );
});

/* GET EXAMS */
app.get("/getExams", (req, res) => {
  db.query(
    `SELECT 
      id,
      subject,
      DATE_FORMAT(exam_date, '%Y-%m-%d') AS exam_date,
      TIME_FORMAT(start_time, '%H:%i:%s') AS start_time,
      TIME_FORMAT(end_time, '%H:%i:%s') AS end_time
     FROM exams`,
    (err, result) => {
      if (err) return res.json({ status: "error", message: err.message });

      res.json(result);
    }
  );
});
/* GET QUESTIONS */
app.get("/getQuestions/:examId", (req, res) => {
  const examId = req.params.examId;

  db.query(
    "SELECT * FROM questions WHERE exam_id=?",
    [examId],
    (err, result) => {
      if (err) return res.json({ status: "error", message: err.message });
      res.json(result);
    }
  );
});

/* START EXAM CHECK */
app.post("/startExam", (req, res) => {
  const { examId } = req.body;

  db.query("SELECT * FROM exams WHERE id=?", [examId], (err, result) => {
    if (err) return res.json({ status: "error", message: err.message });

    if (result.length === 0) {
      return res.json({ status: "not_found" });
    }

    const exam = result[0];

    const now = new Date();
    const start = new Date(`${exam.exam_date}T${exam.start_time}`);
    const end = new Date(`${exam.exam_date}T${exam.end_time}`);

    if (now < start) {
      return res.json({ status: "not_started", exam });
    }

    if (now >= end) {
      return res.json({ status: "ended", exam });
    }

    res.json({ status: "allowed", exam });
  });
});

/* CHECK IF STUDENT ALREADY ATTEMPTED EXAM */
app.post("/checkAttempt", (req, res) => {
  const { student_id, exam_id } = req.body;

  db.query(
    "SELECT * FROM results WHERE student_id=? AND exam_id=?",
    [student_id, exam_id],
    (err, result) => {
      if (err) return res.json({ status: "error", message: err.message });

      if (result.length > 0) {
        return res.json({ status: "already_attempted" });
      }

      res.json({ status: "not_attempted" });
    }
  );
});

/* SAVE RESULT */
app.post("/saveResult", (req, res) => {
  const { student_id, exam_id, score } = req.body;

  db.query(
    "INSERT INTO results (student_id, exam_id, score) VALUES (?, ?, ?)",
    [student_id, exam_id, score],
    (err) => {
      if (err) {
        console.log("Result insert error:", err);
        return res.json({ status: "error", message: err.message });
      }

      res.json({ status: "success" });
    }
  );
});

app.listen(5000, () => {
  console.log("Server running on port 5000 🚀");
});

/* GET STUDENT RESULTS */
app.get("/getResults/:studentId", (req, res) => {
  const studentId = req.params.studentId;

  db.query(
    `SELECT results.*, exams.subject, exams.exam_date 
     FROM results 
     JOIN exams ON results.exam_id = exams.id 
     WHERE results.student_id = ? 
     ORDER BY exams.exam_date DESC`,
    [studentId],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.json({ status: "error", message: err.message });
      }

      res.json(result);
    }
  );
});