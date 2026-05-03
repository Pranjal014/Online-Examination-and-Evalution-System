import React, { useRef, useState } from "react";
import Webcam from "react-webcam";
import "./admin.css";

function Admin() {
  const webcamRef = useRef(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student"); // 🔥 ADDED ROLE
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);

  const capture = () => {
    const imageSrc = webcamRef.current.getScreenshot();
    setPreview(imageSrc);

    fetch(imageSrc)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], "photo.jpg", {
          type: "image/jpeg",
        });
        setPhoto(file);
      });
  };

  const handleSubmit = async () => {
    if (!name || !email || !password || !role || !photo) {
      alert("Fill all fields + capture photo");
      return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("role", role); // 🔥 FIXED (dynamic role)
    formData.append("photo", photo);

    try {
      const res = await fetch("http://localhost:5000/addUser", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log(data);

      if (data.status === "success") {
        alert("User Added Successfully ✅");

        // reset form
        setName("");
        setEmail("");
        setPassword("");
        setRole("student");
        setPhoto(null);
        setPreview(null);
      } else {
        alert("Failed to add user ❌");
      }

    } catch (err) {
      console.log(err);
      alert("Server Error ❌");
    }
  };

  return (
    <div className="container">

      <h2>Admin Panel</h2>

      <input
        type="text"
        placeholder="Enter Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="email"
        placeholder="Enter Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Enter Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {/* 🔥 ROLE DROPDOWN */}
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        style={{
          width: "300px",
          padding: "10px",
          marginTop: "10px",
          borderRadius: "10px",
        }}
      >
        <option value="student">Student</option>
        <option value="faculty">Faculty</option>
        <option value="admin">Admin</option>
      </select>

      {/* Webcam */}
      <div>
        <Webcam
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          className="webcam"
        />
      </div>

      <button onClick={capture}>Capture Photo</button>

      {/* Preview */}
      {preview && (
        <div>
          <p>Preview:</p>
          <img src={preview} alt="preview" width="120" />
        </div>
      )}

      <button onClick={handleSubmit}>Add User</button>

    </div>
  );
}

export default Admin;