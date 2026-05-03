import React from "react";
import { useNavigate } from "react-router-dom";
import "./home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home">
      <h1>ERP Online Examination System</h1>

      <p>Select your role to continue</p>

      <div className="roles">
        <button onClick={() => navigate("/login/admin")}>
          Admin
        </button>

        <button onClick={() => navigate("/login/faculty")}>
          Faculty
        </button>

        <button onClick={() => navigate("/login/student")}>
          Student
        </button>
      </div>
    </div>
  );
}

export default Home;