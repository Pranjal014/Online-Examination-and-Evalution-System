import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

const handleLogin = async () => {
  const res = await fetch("http://127.0.0.1:5000/login", {  // ✅ fixed here
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (data.status === "success") {
    localStorage.setItem("user", JSON.stringify(data.user));

    const role = data.user.role;

    if (role === "admin") navigate("/admin");
    else if (role === "faculty") navigate("/faculty");
    else navigate("/student");
  } else {
    alert("Invalid Login ❌");
  }
};

  return (
    <div>
      <h2>Login</h2>
      <input placeholder="Email" onChange={(e)=>setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e)=>setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;