CREATE DATABASE exam_system;
USE exam_system;

-- 👤 USERS TABLE
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(100) NOT NULL,
  role ENUM('admin','faculty','student') NOT NULL
);

-- 📝 EXAMS TABLE (MISSING IN YOUR CODE ❗)
CREATE TABLE exams (
  exam_id INT AUTO_INCREMENT PRIMARY KEY,
  exam_name VARCHAR(100),
  duration INT
);

-- ❓ QUESTIONS TABLE
CREATE TABLE questions (
  question_id INT AUTO_INCREMENT PRIMARY KEY,
  exam_id INT,
  question TEXT,
  option1 TEXT,
  option2 TEXT,
  option3 TEXT,
  option4 TEXT,
  correct_answer INT,
  FOREIGN KEY (exam_id) REFERENCES exams(exam_id) ON DELETE CASCADE
);

-- 📊 RESULTS TABLE
CREATE TABLE results (
  result_id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT,
  exam_id INT,
  score INT,
  FOREIGN KEY (student_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (exam_id) REFERENCES exams(exam_id) ON DELETE CASCADE
);

localStorage.setItem("users", JSON.stringify([
  {
    name: "Admin",
    email: "admin@gmail.com",
    password: "12345",
    role: "admin"
  }
]));