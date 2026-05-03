import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./student.css";

function Student() {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [showExams, setShowExams] = useState(false);
  const [attempted, setAttempted] = useState({});

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetch("http://127.0.0.1:5000/getExams")
      .then((res) => res.json())
      .then(async (data) => {
        const now = new Date();

        const activeExams = data.filter((exam) => {
          const examDate = new Date(exam.exam_date);
          const dateOnly = examDate.toISOString().split("T")[0];
          const end = new Date(`${dateOnly}T${exam.end_time}`);

          return now <= end;
        });

        setExams(activeExams);

        if (user) {
          const attemptStatus = {};

          for (let exam of activeExams) {
            const res = await fetch("http://127.0.0.1:5000/checkAttempt", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                student_id: user.user_id || user.id,
                exam_id: exam.id,
              }),
            });

            const result = await res.json();
            attemptStatus[exam.id] = result.status === "already_attempted";
          }

          setAttempted(attemptStatus);
        }
      })
      .catch((err) => console.log("Exam fetch error:", err));
  }, []);

  const getExamStatus = (exam) => {
    if (attempted[exam.id]) return "attempted";

    const now = new Date();
    const examDate = new Date(exam.exam_date);
    const dateOnly = examDate.toISOString().split("T")[0];

    const start = new Date(`${dateOnly}T${exam.start_time}`);
    const end = new Date(`${dateOnly}T${exam.end_time}`);

    if (now < start) return "not_started";
    if (now > end) return "ended";
    return "running";
  };

  const startExam = async (exam) => {
    const status = getExamStatus(exam);

    if (status === "not_started") {
      alert("⏳ Exam has not started yet!");
      return;
    }

    if (status === "ended" || status === "attempted") {
      navigate("/result");
      return;
    }

    const res = await fetch("http://127.0.0.1:5000/startExam", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examId: exam.id }),
    });

    const data = await res.json();

    if (data.status === "allowed") {
      localStorage.setItem("examData", JSON.stringify(data.exam));
      navigate("/exam");
    }
  };

  return (
    <div className="student-page">
      <h1>Student Dashboard</h1>

      <div className="student-blocks">
        <div className="student-card">
          <h2>Instructions</h2>
          <ul>
            <li>The exam will start only at the scheduled time.</li>
            <li>You can attempt each exam only once.</li>
            <li>Copy, paste, and cut actions are not allowed.</li>
            <li>Tab switching is not allowed during the exam.</li>
            <li>Your camera must remain ON during the exam.</li>
            <li>If suspicious activity is detected, exam will auto-submit.</li>
            <li>Taking screenshots is not allowed.</li>
          </ul>
        </div>

        <div className="student-card" onClick={() => setShowExams(!showExams)}>
          <h2>Exam</h2>
          <p>Click here to check current/upcoming exams.</p>
        </div>

        <div className="student-card" onClick={() => navigate("/result")}>
          <h2>View Score</h2>
          <p>Click here to view scores of past exams.</p>
        </div>
      </div>

      {showExams && (
        <div className="exam-panel">
          <h2>Current / Upcoming Exams</h2>

          {exams.length === 0 ? (
            <p>No current or upcoming exam scheduled.</p>
          ) : (
            <div className="exam-list">
              {exams.map((exam) => {
                const status = getExamStatus(exam);

                return (
                  <div className="exam-box" key={exam.id}>
                    <h3>{exam.subject}</h3>
                    <p>Date: {new Date(exam.exam_date).toLocaleDateString()}</p>
                    <p>Start Time: {exam.start_time}</p>
                    <p>End Time: {exam.end_time}</p>

                    {status === "not_started" && (
                      <button className="disabled-btn" disabled>
                        Not Yet Started
                      </button>
                    )}

                    {status === "running" && (
                      <button onClick={() => startExam(exam)}>Start Exam</button>
                    )}

                    {status === "attempted" && (
                      <button className="score-btn" onClick={() => navigate("/result")}>
                        View Score
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Student;