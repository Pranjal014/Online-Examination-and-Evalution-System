import React, { useState } from "react";
import "./faculty.css";

function Faculty() {
  const [exam, setExam] = useState({
    subject: "",
    exam_date: "",
    start_time: "",
    duration: "",
    questions: [],
  });

  const [qData, setQData] = useState({
    question: "",
    options: ["", "", "", ""],
    correct: "",
  });

  const handleOptionChange = (index, value) => {
    const newOptions = [...qData.options];
    newOptions[index] = value;
    setQData({ ...qData, options: newOptions });
  };

  const addQuestion = () => {
    if (!qData.question || qData.options.some((o) => !o) || !qData.correct) {
      alert("Fill all question fields!");
      return;
    }

    setExam({
      ...exam,
      questions: [...exam.questions, qData],
    });

    setQData({
      question: "",
      options: ["", "", "", ""],
      correct: "",
    });
  };

  const saveExam = async () => {
    if (
      !exam.subject ||
      !exam.exam_date ||
      !exam.start_time ||
      !exam.duration ||
      exam.questions.length === 0
    ) {
      alert("Complete exam details and add questions!");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:5000/addExam", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: exam.subject,
          exam_date: exam.exam_date,
          start_time: exam.start_time,
          duration: exam.duration,
          questions: exam.questions,
        }),
      });

      const data = await res.json();

      if (data.status === "success") {
        alert(`Exam Scheduled Successfully ✅ Ends at ${data.end_time}`);

        setExam({
          subject: "",
          exam_date: "",
          start_time: "",
          duration: "",
          questions: [],
        });
      } else {
        alert("Failed to schedule exam ❌");
      }
    } catch (error) {
      console.log(error);
      alert("Backend not connected ❌");
    }
  };

  return (
    <div className="faculty-container">
      <h2>Faculty Panel</h2>

      <input
        placeholder="Subject / Exam Name"
        value={exam.subject}
        onChange={(e) => setExam({ ...exam, subject: e.target.value })}
      />

      <input
        type="date"
        value={exam.exam_date}
        onChange={(e) => setExam({ ...exam, exam_date: e.target.value })}
      />

      <input
        type="time"
        value={exam.start_time}
        onChange={(e) => setExam({ ...exam, start_time: e.target.value })}
      />

      <input
        type="number"
        placeholder="Duration in minutes"
        value={exam.duration}
        onChange={(e) => setExam({ ...exam, duration: e.target.value })}
      />

      <div className="q-form">
        <h3>Add Question</h3>

        <input
          placeholder="Question"
          value={qData.question}
          onChange={(e) => setQData({ ...qData, question: e.target.value })}
        />

        {qData.options.map((opt, i) => (
          <input
            key={i}
            placeholder={`Option ${i + 1}`}
            value={opt}
            onChange={(e) => handleOptionChange(i, e.target.value)}
          />
        ))}

        <select
          value={qData.correct}
          onChange={(e) => setQData({ ...qData, correct: e.target.value })}
        >
          <option value="">Select Correct Answer</option>
          {qData.options.map((opt, i) => (
            <option key={i} value={i + 1}>
              Option {i + 1}: {opt}
            </option>
          ))}
        </select>

        <button onClick={addQuestion}>Add Question</button>
      </div>

      <div className="preview">
        <h3>Questions Added:</h3>
        {exam.questions.map((q, i) => (
          <div key={i}>
            <p>
              {i + 1}. {q.question}
            </p>
          </div>
        ))}
      </div>

      <button onClick={saveExam}>Save Exam</button>
    </div>
  );
}

export default Faculty;