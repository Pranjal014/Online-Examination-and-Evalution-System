import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Exam.css";

function Exam() {
  const nav = useNavigate();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const mismatchCount = useRef(0);

  const storedExam = JSON.parse(localStorage.getItem("examData"));
  const user = JSON.parse(localStorage.getItem("user"));

  const [exam, setExam] = useState(storedExam);
  const [questions, setQuestions] = useState([]);
  const [stream, setStream] = useState(null);
  const [time, setTime] = useState(0);
  const [answers, setAnswers] = useState({});
  const [allowed, setAllowed] = useState(false);

  const formatTime12 = (time) => {
    if (!time) return "";

    let [hour, minute] = time.split(":");
    hour = parseInt(hour);

    const ampm = hour >= 12 ? "PM" : "AM";
    hour = hour % 12;
    hour = hour === 0 ? 12 : hour;

    return `${hour}:${minute} ${ampm}`;
  };

  const getExamDateOnly = (examDate) => {
    const d = new Date(examDate);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const formatTimer = (seconds) => {
    if (!seconds || isNaN(seconds)) return "00:00:00";

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${hrs.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const stopCamera = useCallback(() => {
    setStream((currentStream) => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      return null;
    });
  }, []);

  const submitExam = useCallback(async () => {
    if (!exam || !user) return;

    let score = 0;

    questions.forEach((q, i) => {
      if (Number(answers[i]) === Number(q.correct_answer)) {
        score++;
      }
    });

    try {
      await fetch("http://127.0.0.1:5000/saveResult", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id: user.user_id || user.id,
          exam_id: exam.id,
          score,
        }),
      });
    } catch (error) {
      console.log("Result save error:", error);
    }

    localStorage.setItem("score", score);
    localStorage.setItem("total", questions.length);

    stopCamera();
    nav("/result");
  }, [answers, exam, nav, questions, stopCamera, user]);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      console.log("Camera started ✅");

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;

        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
        };
      }

      setStream(mediaStream);
    } catch (error) {
      console.log("Camera error:", error);

      alert(
        "❌ Camera not working!\nClose other apps using camera and try again."
      );

      nav("/student");
    }
  }, [nav]);

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || video.readyState !== 4) return null;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    return canvas.toDataURL("image/png");
  };

  const verifyFace = useCallback(() => {
    if (!user?.photo) return;

    const live = capture();
    if (!live) return;

    const diff = Math.abs(live.length - user.photo.length);

    if (diff > 25000) {
      mismatchCount.current++;

      if (mismatchCount.current === 2) {
        alert("⚠️ Please sit properly in front of camera");
      }

      if (mismatchCount.current >= 4) {
        alert("🚫 Suspicious activity detected!");
        submitExam();
      }
    } else {
      mismatchCount.current = 0;
    }
  }, [submitExam, user]);

  useEffect(() => {
    const checkExam = async () => {
      if (!storedExam?.id) {
        alert("No exam selected!");
        nav("/student");
        return;
      }

      try {
        const res = await fetch("http://127.0.0.1:5000/startExam", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ examId: storedExam.id }),
        });

        const data = await res.json();

        if (data.status === "not_started") {
          alert("Exam not started yet!");
          nav("/student");
          return;
        }

        if (data.status === "ended") {
          alert("Exam already ended!");
          nav("/student");
          return;
        }

        if (data.status === "allowed") {
          console.log("Exam allowed, starting camera...");
          setExam(data.exam);
          setAllowed(true);

          const qRes = await fetch(
            `http://127.0.0.1:5000/getQuestions/${storedExam.id}`
          );

          const qData = await qRes.json();
          setQuestions(qData);
        }
      } catch (error) {
        console.log(error);
        alert("Backend not connected ❌");
        nav("/student");
      }
    };

    checkExam();
  }, [nav, storedExam?.id]);

  useEffect(() => {
    if (!allowed || !exam) return;

    const dateOnly = getExamDateOnly(exam.exam_date);
    const end = new Date(`${dateOnly}T${exam.end_time}`);

    const interval = setInterval(() => {
      const now = new Date();
      const remaining = Math.floor((end - now) / 1000);

      if (remaining <= 0) {
        clearInterval(interval);
        setTime(0);
        submitExam();
      } else {
        setTime(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [allowed, exam, submitExam]);

  useEffect(() => {
    if (!allowed) return;

    startCamera();

    return () => stopCamera();
  }, [allowed, startCamera, stopCamera]);

  useEffect(() => {
    if (!allowed) return;

    const interval = setInterval(() => {
      verifyFace();
    }, 5000);

    return () => clearInterval(interval);
  }, [allowed, verifyFace]);

  useEffect(() => {
    const disable = (e) => {
      e.preventDefault();
      alert("🚫 Copy / Paste / Cut not allowed!");
    };

    document.addEventListener("copy", disable);
    document.addEventListener("paste", disable);
    document.addEventListener("cut", disable);

    return () => {
      document.removeEventListener("copy", disable);
      document.removeEventListener("paste", disable);
      document.removeEventListener("cut", disable);
    };
  }, []);

  useEffect(() => {
    const blockScreenshot = (e) => {
      if (e.key === "PrintScreen") {
        alert("🚫 Screenshot is not allowed!");
        navigator.clipboard.writeText("");
      }
    };

    window.addEventListener("keyup", blockScreenshot);

    return () => {
      window.removeEventListener("keyup", blockScreenshot);
    };
  }, []);

  useEffect(() => {
    if (!allowed) return;

    const handle = () => {
      if (document.hidden) {
        alert("🚫 Tab switched!");
        submitExam();
      }
    };

    document.addEventListener("visibilitychange", handle);

    return () => document.removeEventListener("visibilitychange", handle);
  }, [allowed, submitExam]);

  const handleAnswer = (i, opt) => {
    setAnswers((prev) => ({
      ...prev,
      [i]: opt,
    }));
  };

  if (!exam) return <h2>No Exam Available</h2>;

  if (!allowed) return <h2>Checking Exam Schedule...</h2>;

  return (
    <div className="exam">
      <h2>{exam.subject}</h2>

      <p>Start Time: {formatTime12(exam.start_time)}</p>
      <p>End Time: {formatTime12(exam.end_time)}</p>

      <h3 className="timer-box">Time Left: {formatTimer(time)}</h3>

      <video ref={videoRef} autoPlay muted playsInline width="220" />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      {questions.map((q, i) => (
        <div className="q-box" key={q.question_id || i}>
          <p>
            {i + 1}. {q.question}
          </p>

          <button
            className={answers[i] === 1 ? "selected" : ""}
            onClick={() => handleAnswer(i, 1)}
          >
            {q.option1}
          </button>

          <button
            className={answers[i] === 2 ? "selected" : ""}
            onClick={() => handleAnswer(i, 2)}
          >
            {q.option2}
          </button>

          <button
            className={answers[i] === 3 ? "selected" : ""}
            onClick={() => handleAnswer(i, 3)}
          >
            {q.option3}
          </button>

          <button
            className={answers[i] === 4 ? "selected" : ""}
            onClick={() => handleAnswer(i, 4)}
          >
            {q.option4}
          </button>
        </div>
      ))}

      <button onClick={submitExam}>Submit Exam</button>
    </div>
  );
}

export default Exam;