import React from "react";
//
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthProvider from "./auth/AuthContext"; // default import

// Components
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";

// Dashboards
import StudentMyCourses from "./pages/StudentMyCourses";
import TutorDashboard from "./pages/dashboards/TutorDashboard";
import CoordinatorDashboard from "./pages/dashboards/CoordinatorDashboard";
import StudentBrowsingPage from "./pages/StudentBrowsingPage";

import BaseProfilePage from "./pages/BaseProfilePage";

// Tutor Specific Page
import TutorMyClasses from "./pages/TutorMyClasses";

import CoordinatorManageClass from "./pages/CoordinatorManageClass";
import AdminPage from "./pages/AdminPage";
import DeptChairPage from "./pages/DeptChairPage"


function App() {
  return (
   <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />

      /* Tutor Centric Pages */
      <Route path="/tutors/:id/dashboard" element={<TutorDashboard />} />
      <Route path="/tutors/:id/profile" element={<BaseProfilePage />} />
      <Route path="/tutors/:id/my-classes" element={<TutorMyClasses />} />


      /* Student Centric Pages */
      <Route path="/students/:id/profile" element={<BaseProfilePage />} />
      <Route path="/students/:id/my-courses" element={<StudentMyCourses />} />
      <Route path="/students/:id/browse" element={<StudentBrowsingPage/>} />


      /* Coordinator Centric Pages */
      <Route path="/coordinators/:id/dashboard" element={<CoordinatorDashboard />} />
      <Route path="/coordinators/:id/profile" element={<BaseProfilePage />} />
      <Route path="/coordinators/:id/manage-classes" element={<CoordinatorManageClass/>} />


       /* Admins/DeptChair */
      <Route path="/admins/:id/dashboard" element={<AdminPage/>} />
      <Route path="/dept_chair/:id/dashboard" element={<DeptChairPage/>} />
  </Routes>
  );
}


ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);