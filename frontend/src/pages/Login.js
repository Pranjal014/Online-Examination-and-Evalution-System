import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password: password.trim(),
        }),
      });

      const data = await res.json();
      console.log("Login Response:", data);

      if (data.status === "success") {
        localStorage.setItem("user", JSON.stringify(data.user));

        const role = data.user.role?.trim().toLowerCase();

        if (role === "admin") navigate("/admin");
        else if (role === "faculty") navigate("/faculty");
        else if (role === "student") navigate("/student");
        else alert("Role not found ❌");
      } else {
        alert("Invalid Login ❌");
      }
    } catch (error) {
      console.log("Login error:", error);
      alert("Backend server not connected ❌");
    }
  };

  return (
    <div>
      <h2>Login</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;