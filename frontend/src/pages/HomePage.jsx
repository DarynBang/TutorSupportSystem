import React from "react";
import Navbar from "../components/Navbar";
import "./HomePage.css";

export default function HomePage() {
  return (
    <div>
      <Navbar />

      <div className="hero">
        <div className="overlay"></div>

        <div className="hero-content">
          <h1>Share Your Knowledge<br />with the World</h1>
          <p>Reach thousands of students with our powerful tools to create,<br />
             publish, and manage your online course in minutes</p>
          <button className="primary-btn">Explore Instructor Opportunities</button>
        </div>
      </div>
    </div>
  );
}
