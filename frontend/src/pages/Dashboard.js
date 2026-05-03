import React from "react";
import { useNavigate } from "react-router-dom";
import "./dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    navigate("/");
    return null;
  }

  return (
    <div className="dashboard">
      <h2>Welcome {user.name}</h2>

      <div className="card-container">

        {user.role === "admin" && (
          <div className="card" onClick={() => navigate("/admin")}>
            <h3>Admin Panel</h3>
          </div>
        )}

        {user.role === "faculty" && (
          <div className="card" onClick={() => navigate("/faculty")}>
            <h3>Faculty Panel</h3>
          </div>
        )}

        {user.role === "student" && (
          <div className="card" onClick={() => navigate("/student")}>
            <h3>Student Panel</h3>
          </div>
        )}

      </div>

      <button className="logout" onClick={() => {
        localStorage.removeItem("user");
        navigate("/");
      }}>
        Logout
      </button>
    </div>
  );
}

export default Dashboard;