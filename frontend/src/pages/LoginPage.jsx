import React, { useState, useContext } from "react";
import api from "../api/api";
import { AuthContext } from "../auth/AuthContext";
import "./LoginPage.css";

export default function LoginPage() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");

  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", { email });
      const user = res.data;

      login(user.email, user.name, user.role, user.id);

      if (user.role === "Student")
      window.location.href = `/students/${user.id}/my-courses`;

      else if (user.role === "Tutor")
      window.location.href = `/tutors/${user.id}/dashboard`;

      else if (user.role === "Coordinator")
      window.location.href = `/coordinators/${user.id}/dashboard`;

      else if (user.role === "Admin")
      window.location.href = `/admins/${user.id}/dashboard`;

      else if (user.role === "Department Chair")
      window.location.href = `/dept_chair/${user.id}/dashboard`;

    } catch (err) {
        console.error("Login error:", err);
        alert("Invalid login. User not found.");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="left-panel">
        <img src="/assets/logo.png" className="login-logo" alt="logo" />
        <h1>Tutor Support System</h1>
      </div>

      <div className="right-panel">
        <div className="login-card">
          <h2>Enter your Username and Password Account</h2>

          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button className="login-btn" onClick={handleLogin}>
            Log In
          </button>

          <a href="#" className="forgot">Change Password?</a>
        </div>
      </div>
    </div>
  );
}
