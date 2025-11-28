import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../auth/AuthContext";
import axios from "axios";
import Navbar from "../../components/Navbar";

export default function CoordinatorDashboard() {
  const { user } = useContext(AuthContext);

  const [classes, setClasses] = useState([]);
  const [coverage, setCoverage] = useState({});
  const [expandedRows, setExpandedRows] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    async function fetchData() {
      try {
        const classRes = await fetch("http://localhost:8000/coordinator/classes");
        const classData = await classRes.json();

        const covRes = await fetch("http://localhost:8000/coordinator/coverage");
        const covData = await covRes.json();

        setClasses(classData);
        setCoverage(covData);
      } catch (err) {
        console.error("Error fetching coordinator data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  function toggleRow(classId) {
    setExpandedRows((prev) => ({
      ...prev,
      [classId]: !prev[classId],
    }));
  }

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div>
      <Navbar />

      <div
        className="welcome-section"
        style={{ backgroundColor: "#007bff", color: "#fff", padding: "1rem" }}
      >
        <h2>Welcome back, {user?.name || "Coordinator"}</h2>
      </div>

      {/* Coverage section */}
      <h2 style={{ marginTop: "20px" }}>Subject Coverage</h2>
      <ul>
        {Object.entries(coverage).map(([subject, count]) => (
          <li key={subject}>
            {subject}: {count} class(es)
          </li>
        ))}
      </ul>

      {/* Classes Table */}
      <h2 style={{ marginTop: "30px" }}>All Approved Classes</h2>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
        <thead>
          <tr>
            <th style={thStyle}>ID</th>
            <th style={thStyle}>Subject</th>
            <th style={thStyle}>Tutor</th>
            <th style={thStyle}>Mode</th>
            <th style={thStyle}>Room / Meeting Link</th>
            <th style={thStyle}>Timeslot</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Students</th>
          </tr>
        </thead>

        <tbody>
          {classes.map((cls) => (
            <>
              {/* Main Row */}
              <tr key={cls.id}>
                <td style={tdStyle}>{cls.id}</td>
                <td style={tdStyle}>{cls.subject}</td>
                <td style={tdStyle}>{cls.tutor_name}</td>
                <td style={tdStyle}>{cls.delivery_mode}</td>
                <td style={tdStyle}>{cls.room || "-"}</td>

                <td style={tdStyle}>
                  {cls.timeslot
                    ? `${formatTime(cls.timeslot.start)} → ${formatTime(cls.timeslot.end)}`
                    : "-"}
                </td>

                <td style={tdStyle}>{cls.status}</td>

                {/* Expand Students */}
                <td style={tdStyle}>
                  <button style={btnSecondary} onClick={() => toggleRow(cls.id)}>
                    {expandedRows[cls.id] ? "Hide" : "View"}
                  </button>
                </td>
              </tr>

              {/* Expanded Student List */}
                {expandedRows[cls.id] && (
                  <tr>
                    <td colSpan="9" style={{ padding: "10px", background: "#fafafa" }}>
                      <strong>Enrolled Students:</strong>

                      {cls.enrolled_students.length === 0 ? (
                        <p style={{ marginTop: "5px" }}>No students enrolled.</p>
                      ) : (
                        <ul style={{ marginTop: "5px" }}>
                          {cls.enrolled_students.map((stu) => (
                            <li key={stu.id}>
                              {stu.id} — {stu.name}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const btnPrimary = {
  padding: "8px 12px",
  background: "#28a745",
  color: "white",
  border: "none",
  cursor: "pointer",
  marginRight: "10px",
};

const btnSecondary = {
  padding: "8px 12px",
  background: "#6c757d",
  color: "white",
  border: "none",
  cursor: "pointer",
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