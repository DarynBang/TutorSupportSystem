import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const userId = user?.id || "";

  // Role-based navigation menus
  const roleMenus = {
    Student: [
      { name: "Courses", path: `/students/${userId}/my-courses` },
      { name: "Browse", path: `/students/${userId}/browse` },
      { name: "Profile", path: `/students/${userId}/profile` },
    ],
    Tutor: [
      { name: "Dashboard", path: `/tutors/${userId}/dashboard` },
      { name: "My Classes", path: `/tutors/${userId}/my-classes` },
      { name: "Profile", path: `/tutors/${userId}/profile` },
    ],
    Coordinator: [
      { name: "Dashboard", path: `/coordinators/${userId}/dashboard` },
      { name: "Manage Classes", path: `/coordinators/${userId}/manage-classes` },
      { name: "Reports", path: `/coordinators/${userId}/reports` },
    ],
  };

  const handleLogout = () => {
    logout();
    navigate("/"); // redirect to homepage
  };

  return (
    <nav className={`navbar ${user ? "logged-in" : ""}`}>

      <div className="left">
        {/* Adjusted logo path assumption to /logo.png if placed in public folder */}
        <img src="/assets/logo.png" alt="logo" className="logo" />
        <h2 className="brand">Tutor Support System</h2>
      </div>

      {/* 🌟 REMOVED THE CODE BLOCK DELIMITERS (```) HERE 🌟 */}
      <div className="center">
        {!user && (
          <Link to="/" className="nav-link">
            Home Page
          </Link>
        )}
        {user &&
          roleMenus[user.role]?.map((item) => (
            <Link key={item.name} to={item.path} className="nav-link">
              {item.name}
            </Link>
          ))}
      </div>

      <div className="right">
        {!user && (
          <>
            <Link to="/login" className="btn">
              Sign in
            </Link>
            <button className="btn-outline">User Manual</button>
          </>
        )}
        {user && (
          <>
            <span className="user-role">{user.role}</span>
            <button className="btn-outline" onClick={handleLogout}>
              Log out
            </button>
          </>
        )}
      </div>
    </nav>
  );
}