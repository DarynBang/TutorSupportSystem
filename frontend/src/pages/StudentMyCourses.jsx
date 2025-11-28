import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../auth/AuthContext";
import axios from "axios";
import Navbar from "../components/Navbar";

export default function StudentDashboard() {
  const { user } = useContext(AuthContext);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [evalInputs, setEvalInputs] = useState({});
const [showEvalBox, setShowEvalBox] = useState({});


  console.log("StudentDashboard mounted. User from context:", user);

  const fetchCourses = async () => {
    if (!user || !user.id) {
      setError("User data not available.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8000/students/${user.id}/my-courses`
      );
      console.log("✔Student Data received:", response.data);
      setCourses(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching classes:", err);
      setError("Unable to load your courses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [user]);

  // Leave class logic
  async function handleLeaveClass(classId) {
    const confirmLeave = window.confirm(
      "Are you sure you want to leave this class? This action cannot be undone."
    );
    if (!confirmLeave) return;

    try {
      setLoading(true);

      const res = await fetch("http://localhost:8000/students/leave", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: user.id,
          class_id: classId,
        }),
      });

      if (!res.ok) {
        alert("Failed to leave class. Please try again.");
        return;
      }

      // Refresh UI immediately
      setCourses((prev) => prev.filter((cls) => cls.class_id !== classId));

      // Optionally reload from backend
      await fetchCourses();

      alert("You have successfully left the class.");
    } catch (err) {
      console.error(err);
      alert("Error leaving class. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // ------------------------- Submit Evaluation -------------------------
async function handleEvaluate(classObj) {
  const note = evalInputs[classObj.class_id];

  if (!note || note.trim() === "") {
    alert("Please type your evaluation before submitting.");
    return;
  }

  try {
    const res = await fetch("http://localhost:8000/students/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        class_id: classObj.class_id,
        tutor_id: classObj.tutor_id,
        student_id: user.id,
        content: note,
      }),
    });

    if (!res.ok) throw new Error("Failed to submit evaluation");

    alert("Thank you for your evaluation!");

    // Clear textbox + close panel
    setEvalInputs((prev) => ({ ...prev, [classObj.class_id]: "" }));
    setShowEvalBox((prev) => ({ ...prev, [classObj.class_id]: false }));
  } catch (err) {
    console.error(err);
    alert("Error submitting evaluation.");
  }
}

  if (loading) return <div>Loading your courses...</div>;

  return (
    <div>
      <Navbar role="student" />

      <div className="max-w-6xl mx-auto mt-10 px-6">
        <h1 className="text-2xl font-semibold mb-6">My Courses</h1>

        {courses.length === 0 ? (
          <p className="text-gray-600">You are not enrolled in any classes yet.</p>
        ) : (
          <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "20px",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#f4f4f4" }}>
                  <th style={thStyle}>Class ID</th>
                  <th style={thStyle}>Tutor Name</th>
                  <th style={thStyle}>Subject</th>
                  <th style={thStyle}>Mode</th>
                  <th style={thStyle}>Timeslot</th>
                  <th style={thStyle}>Status</th>
                  <th style={thStyle}>Room / Link</th>
                  <th style={thStyle}>Learning Material</th>
                  <th style={thStyle}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {courses.map((cls) => {
                  const isOnline = cls.delivery_mode === "online";

                  return (
                    <tr key={cls.class_id}>
                      <td style={tdStyle}>{cls.class_id}</td>

                      <td style={tdStyle}>{cls.tutor_name}</td>

                      <td style={tdStyle}>{cls.subject}</td>

                      <td style={tdStyle}>{cls.delivery_mode}</td>

                      <td style={tdStyle}>
                        {formatTime(cls.timeslot.start)} – {formatTime(cls.timeslot.end)}
                      </td>

                      <td style={tdStyle}>
                        <span
                          style={{
                            padding: "4px 8px",
                            borderRadius: "4px",
                            backgroundColor:
                              cls.status === "Enrolled" ? "#28a745" : "#6c757d",
                            color: "white",
                          }}
                        >
                          {cls.status}
                        </span>
                      </td>

                      <td style={tdStyle}>
                        {isOnline ? cls.meeting_link || "(none)" : cls.room || "(none)"}
                      </td>

                      {/* ---------------- Learning Material Button ---------------- */}
                      <td style={tdStyle}>
                        <button
                          style={{
                            padding: "6px 10px",
                            backgroundColor: "#007bff",
                            color: "white",
                            border: "none",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            // TODO: Learning material unimplemented
                            console.log("Learning material clicked");
                          }}
                        >
                          View Material
                        </button>
                      </td>

                      {/* ---------------- Actions Dropdown ---------------- */}
                      <td style={tdStyle}>
                        <details>
                          <summary
                            style={{
                              cursor: "pointer",
                              padding: "4px 8px",
                              backgroundColor: "#ddd",
                              borderRadius: "4px",
                              width: "fit-content",
                            }}
                          >
                            Actions
                          </summary>

                          <div style={{ padding: "8px", background: "#f9f9f9" }}>
                            <button
                                style={actionBtnStyle}
                                onClick={() =>
                                  setShowEvalBox((prev) => ({
                                    ...prev,
                                    [cls.class_id]: !prev[cls.class_id],
                                  }))
                                }
                              >
                              Evaluate Class
                            </button>

                            {showEvalBox[cls.class_id] && (
                            <div style={{ marginTop: "10px" }}>
                              <textarea
                                rows={3}
                                placeholder="Write your evaluation..."
                                value={evalInputs[cls.class_id] || ""}
                                onChange={(e) =>
                                  setEvalInputs((prev) => ({
                                    ...prev,
                                    [cls.class_id]: e.target.value,
                                  }))
                                }
                                style={{
                                  width: "100%",
                                  padding: "8px",
                                  borderRadius: "6px",
                                  border: "1px solid #ccc",
                                  marginBottom: "10px",
                                }}
                              />

                              <button
                                style={{
                                  padding: "6px 12px",
                                  backgroundColor: "#28a745",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "4px",
                                  cursor: "pointer",
                                  marginBottom: "10px",
                                }}
                                onClick={() => handleEvaluate(cls)}
                              >
                                Submit Evaluation
                              </button>
                            </div>
                          )}

                            <button
                              style={{
                                ...actionBtnStyle,
                                backgroundColor: "#dc3545",
                                color: "white",
                                opacity: loading ? 0.6 : 1,
                                cursor: loading ? "not-allowed" : "pointer",
                              }}
                              disabled={loading}
                              onClick={() => handleLeaveClass(cls.class_id)}
                            >
                              Leave Class
                            </button>
                          </div>
                        </details>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
        )}
      </div>
    </div>
  );
}

const actionBtnStyle = {
  display: "block",
  width: "100%",
  padding: "6px 10px",
  margin: "4px 0",
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  cursor: "pointer",
  textAlign: "left",
};

const thStyle = {
  padding: "10px",
  borderBottom: "2px solid #ddd",
  textAlign: "left",
};

const tdStyle = {
  padding: "10px",
  borderBottom: "1px solid #eee",
};

function formatTime(iso) {
  const date = new Date(iso);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}