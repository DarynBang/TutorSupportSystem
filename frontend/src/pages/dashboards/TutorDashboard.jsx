import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../auth/AuthContext";
import axios from "axios";
import Navbar from "../../components/Navbar";

export default function TutorDashboard() {
  const { user } = useContext(AuthContext);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log("TutorDashboard mounted. User from context:", user);

  useEffect(() => {
    if (!user?.id) {
      console.error("❌ No user ID found in AuthContext.");
      return;
    }

    console.log(`Fetching dashboard for tutor ${user.id}...`);

    axios
      .get(`http://localhost:8000/tutors/${user.id}/dashboard`)
      .then((res) => {
        console.log("✔ Dashboard data received:", res.data);
        setSummary(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error loading tutor dashboard:", err);
        setLoading(false);
      });
  }, [user]);

  if (loading) return <p>Loading dashboard...</p>;
  if (!summary) return <p>Failed to load dashboard data.</p>;

  console.log("Current Summary is", summary);

  return (
    <div className="tutor-dashboard">
      {/* Role-specific navbar */}
      <Navbar />

      {/* Welcome section */}
      <div
        className="welcome-section"
        style={{ backgroundColor: "#007bff", color: "#fff", padding: "1rem" }}
      >
        <h2>Welcome back, {user?.name || "Tutor"}</h2>
      </div>

      {/* Quick stats */}
      <div className="dashboard-summary" style={{ padding: "1rem" }}>
        <h3>Quick Stats</h3>
        <div className="stats-grid" style={{ display: "flex", gap: "1rem" }}>
          <div className="stat-card" style={{ padding: "1.5rem", border: "1px solid #ccc" }}>
            <h4>Upcoming Classes</h4>
            <p>{summary?.quick_stats?.upcoming_classes || 0}</p>
          </div>
          <div className="stat-card" style={{ padding: "1.5rem", border: "1px solid #ccc" }}>
            <h4>Pending Reports</h4>
            <p>{summary?.quick_stats?.pending_reports || 0}</p>
          </div>
          <div className="stat-card" style={{ padding: "1.5rem", border: "1px solid #ccc" }}>
            <h4>Total Active Students</h4>
            <p>{summary?.quick_stats?.total_students || 0}</p>
          </div>
        </div>

        {/* Upcoming Classes List */}
        <h3 style={{ marginTop: "20px" }}>Upcoming Classes</h3>

        {summary?.upcoming_classes_detail?.length > 0 ? (
          <table
            className="upcoming-classes-table"
            style={{
              width: "90%",
              margin: "0 auto",
              borderCollapse: "separate",
              borderSpacing: "0 10px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f4f4f4" }}>
                <th style={{ padding: "10px", textAlign: "left" }}>Subject</th>
                <th style={{ padding: "10px", textAlign: "left" }}>Timeslot</th>
                <th style={{ padding: "10px", textAlign: "left" }}>Delivery</th>
                <th style={{ padding: "10px", textAlign: "left" }}>Room / Link</th>
              </tr>
            </thead>

            <tbody>
              {summary.upcoming_classes_detail.map((cls) => {
                const start = new Date(cls.timeslot.start);
                const end = new Date(cls.timeslot.end);

                const formattedDate = start.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                });

                const formattedStart = start.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                const formattedEnd = end.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <tr
                    key={cls.id}
                    style={{
                      backgroundColor: "#fff",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    <td style={{ padding: "12px" }}>{cls.subject}</td>

                    <td style={{ padding: "12px" }}>
                      {formattedDate} — {formattedStart} to {formattedEnd}
                    </td>

                    <td style={{ padding: "12px", textTransform: "capitalize" }}>
                      {cls.delivery_mode}
                    </td>

                    <td style={{ padding: "12px" }}>
                      {cls.delivery_mode === "offline" ? (
                        cls.room || ""
                      ) : (
                        cls.meeting_link || ""
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p>No upcoming classes</p>
        )}
      </div>
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