import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./result.css";

function Result() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (!user) return;

    const studentId = user.user_id || user.id;

    fetch(`http://127.0.0.1:5000/getResults/${studentId}`)
      .then((res) => res.json())
      .then((data) => setResults(data))
      .catch((err) => console.log("Result fetch error:", err));
  }, [user]); // ✅ FIXED WARNING

  return (
    <div className="result-container">
      <div className="result-box">
        <h2>View Score</h2>

        {results.length === 0 ? (
          <p>No result available.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Subject</th>
                <th>Exam Date</th>
                <th>Score</th>
              </tr>
            </thead>

            <tbody>
              {results.map((result) => (
                <tr key={result.id}>
                  <td>{result.subject}</td>
                  <td>
                    {new Date(result.exam_date).toLocaleDateString()}
                  </td>
                  <td>{result.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <button onClick={() => navigate("/student")}>
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default Result;