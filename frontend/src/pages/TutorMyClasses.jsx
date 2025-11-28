import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../auth/AuthContext";
import Navbar from "../components/Navbar";

export default function TutorMyClasses() {
  const { user } = useContext(AuthContext);
  const [classes, setClasses] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newClass, setNewClass] = useState({
    subject: "",
    delivery_mode: "offline",
    meeting_link: "",
    start: "",
    end: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user?.id) return;

    axios
      .get(`http://localhost:8000/tutors/${user.id}/my-classes`)
      .then((res) => {
        setClasses(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Error loading tutor classes:", err);
        setLoading(false);
      });
  }, [user]);


  const handleOpenClass = async () => {
      setError("");

      if (!newClass.subject || !newClass.start || !newClass.end) {
        setError("Please fill subject and timeslot.");
        return;
      }

      if (new Date(newClass.start) >= new Date(newClass.end)) {
        setError("Start time must be before end time.");
        return;
      }

      try {
        // Only send required fields; backend assigns ID
        const payload = {
          tutor_id: user.id,
          subject: newClass.subject,
          delivery_mode: newClass.delivery_mode,
          meeting_link: newClass.delivery_mode === "online" ? newClass.meeting_link : null,
          room: newClass.delivery_mode === "offline" ? newClass.room : null,
          timeslot: {
            start: newClass.start,
            end: newClass.end,
          },
        };

        const res = await axios.post(
          `http://localhost:8000/tutors/${user.id}/open-class`,
          payload
        );

        // Backend returns the created class with assigned ID
        setClasses((prev) => [res.data, ...prev]);
        setShowModal(false);
        setNewClass({
          subject: "",
          delivery_mode: "offline",
          meeting_link: "",
          start: "",
          end: "",
        });
      } catch (err) {
        console.error("❌ Error opening class:", err);
        let msg = "Failed to open class.";

        if (err.response?.data) {
          // Convert backend error to readable string safely
          msg = JSON.stringify(err.response.data, null, 2);
        }

        setError(msg);
      }
    };

  if (loading) return <p>Loading classes...</p>;

  return (
    <div className="tutor-classes-page">
      <Navbar />

      <div style={{ padding: "1.5rem" }}>
        <h2>My Classes</h2>

        {/* ---------------- Open new Class Button ---------------- */}
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: "8px 14px",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            marginTop: "10px",
            marginBottom: "20px",
            cursor: "pointer",
          }}
        >
          ➕ Open New Class
        </button>

        <p>All classes you’ve taught in the last 30 days.</p>

        {classes.length === 0 && <p>No classes found.</p>}

        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
          <thead>
            <tr style={{ backgroundColor: "#f4f4f4" }}>
              <th style={thStyle}>Class ID</th>
              <th style={thStyle}>Subject</th>
              <th style={thStyle}>Mode</th>
              <th style={thStyle}>Timeslot</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Room / Link</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {classes.map((cls) => {
              const isOnline = cls.delivery_mode === "online";
              const isExpanded = expanded[cls.id] === true;

              return (
                <React.Fragment key={cls.id}>
                  {/* Summary Row */}
                  <tr>
                    <td style={tdStyle}>{cls.id}</td>
                    <td style={tdStyle}>{cls.subject}</td>
                    <td style={tdStyle}>{cls.delivery_mode}</td>
                    <td style={tdStyle}>
                      {formatTime(cls.timeslot.start)} – {formatTime(cls.timeslot.end)}
                    </td>
                    <td style={tdStyle}>{cls.status}</td>
                    <td style={tdStyle}>
                      {isOnline ? cls.meeting_link || "(none)" : cls.room || "(none)"}
                    </td>
                    <td style={tdStyle}>
                      <button
                        onClick={() =>
                          setExpanded((prev) => ({
                            ...prev,
                            [cls.id]: !prev[cls.id],
                          }))
                        }
                      >
                        {isExpanded ? "Hide" : "View"}
                      </button>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr>
                      <td colSpan={6} style={{ padding: "15px", background: "#fafafa" }}>
                        <ClassDetail cls={cls} user={user} setClasses={setClasses} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h3>Open New Class</h3>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <label>Subject:</label>
            <input
              type="text"
              value={newClass.subject}
              onChange={(e) => setNewClass({ ...newClass, subject: e.target.value })}
            />

            <label>Delivery Mode:</label>
            <select
              value={newClass.delivery_mode}
              onChange={(e) => setNewClass({ ...newClass, delivery_mode: e.target.value })}
            >
              <option value="offline">Offline</option>
              <option value="online">Online</option>
            </select>

            {newClass.delivery_mode === "online" && (
              <>
                <label>Meeting Link:</label>
                <input
                  type="text"
                  value={newClass.meeting_link}
                  onChange={(e) =>
                    setNewClass({ ...newClass, meeting_link: e.target.value })
                  }
                />
              </>
            )}

            <label>Start Time:</label>
            <input
              type="datetime-local"
              value={newClass.start}
              onChange={(e) => setNewClass({ ...newClass, start: e.target.value })}
            />

            <label>End Time:</label>
            <input
              type="datetime-local"
              value={newClass.end}
              onChange={(e) => setNewClass({ ...newClass, end: e.target.value })}
            />

            <div style={{ marginTop: "1rem" }}>
              <button onClick={handleOpenClass} style={btnPrimary}>
                Open Class
              </button>
              <button onClick={() => setShowModal(false)} style={btnSecondary}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------- Class Detail Component ------------- */
function ClassDetail({ cls, user, setClasses }) {
  const [noteInputs, setNoteInputs] = useState({});
  // Define reusable styles for clarity and consistency
  const containerStyle = {
    padding: "20px",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
    backgroundColor: "#f9f9f9",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
  };

  const sectionHeaderStyle = {
    fontSize: "1.1em",
    fontWeight: "600",
    color: "#333",
    borderBottom: "1px solid #eee",
    paddingBottom: "5px",
    marginBottom: "10px",
    marginTop: "20px",
  };

  const buttonStyle = {
    padding: "8px 16px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "500",
    transition: "background-color 0.2s",
    marginTop: "15px",
  };

  const listStyle = {
    paddingLeft: "20px",
    marginTop: "5px",
  };

  // Submit progress report
  const submitReport = async (classId) => {
    const note = noteInputs[classId];
    if (!note || note.trim() === "") {
      alert("Please enter a progress note before submitting.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/tutors/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          class_id: classId,
          tutor_id: user.id,
          note: note,
        }),
      });

      if (!res.ok) throw new Error("Failed to submit report");
      const result = await res.json();

      alert("Progress submitted!");

      setClasses((prev) =>
        prev.map((c) =>
          c.id === classId
            ? {
                ...c,
                progress_notes: {
                  ...c.progress_notes,
                  [result.timestamp]: note,
                },
              }
            : c
        )
      );

      setNoteInputs((prev) => ({ ...prev, [classId]: "" }));
    } catch (err) {
      console.error(err);
      alert("Error submitting report");
    }
  };

  return (
    <div style={containerStyle}>
      <h3 style={{ fontSize: "1.5em", color: "#007bff", marginBottom: "15px" }}>
        Class Details
      </h3>

      {/* Enrolled Students Section */}
      <div style={{ marginBottom: "20px" }}>
        <p style={sectionHeaderStyle}>Enrolled Students</p>
        {cls.enrolled_students?.length > 0 ? (
          <ul style={listStyle}>
            {cls.enrolled_students.map((id) => (
              <li key={id} style={{ marginBottom: "4px" }}>
                {id}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: "#666" }}>No enrolled students.</p>
        )}
      </div>

      {/* Learning Material Button */}
      <button style={buttonStyle}>
        Manage Learning Material (Connect with DATACORE)
      </button>

      <div style={{ margin: "20px 0", height: "1px", backgroundColor: "#ddd" }} />

      {/* Progress Notes Section */}
      <div style={{ marginBottom: "20px" }}>
        <p style={sectionHeaderStyle}>Progress Notes</p>
        {cls.progress_notes && Object.keys(cls.progress_notes).length > 0 ? (
          <ul style={listStyle}>
            {Object.entries(cls.progress_notes).map(([studentId, note]) => (
              <li key={studentId} style={{ marginBottom: "6px" }}>
                <span style={{ fontWeight: "600", color: "#333" }}>{studentId}:</span>{" "}
                {note}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: "#666" }}>No progress notes yet.</p>
        )}
      </div>

      <div style={{ marginTop: "20px" }}>
        <p style={sectionHeaderStyle}>Write a new progress note</p>

        <textarea
          style={{
            width: "100%",
            minHeight: "120px",
            padding: "10px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            resize: "vertical",
            fontSize: "1em",
          }}
          placeholder="Write progress update here..."
          value={noteInputs[cls.id] || ""}
          onChange={(e) =>
            setNoteInputs((prev) => ({ ...prev, [cls.id]: e.target.value }))
          }
        />
      </div>

      {/* Submit Report Button */}
    <button
      style={{
        ...buttonStyle,
        backgroundColor: "#28a745",
        float: "right",
      }}
      onClick={() => submitReport(cls.id)}
    >
      Submit Report
    </button>
      <div style={{ clear: "both" }} /> {/* Clear the float */}

    </div>
  );
}

/* ------------- Helper Styles ------------- */
const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const modalBox = {
  background: "white",
  padding: "20px",
  width: "400px",
  borderRadius: "8px",
  display: "flex",
  flexDirection: "column",
  gap: "8px",
};

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
