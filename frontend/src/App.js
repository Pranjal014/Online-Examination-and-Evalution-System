import React from "react";
import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Faculty from "./pages/Faculty";
import Student from "./pages/student";
import Exam from "./pages/Exam";
import Result from "./pages/Result";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login/:role" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/faculty" element={<Faculty />} />
      <Route path="/student" element={<Student />} />
      <Route path="/exam" element={<Exam />} />
      <Route path="/result" element={<Result />} />
    </Routes>
  );
}

export default App;