import React, { useContext, useState, useEffect, useCallback} from "react";
import { AuthContext } from "../auth/AuthContext";
import axios from "axios";
import Navbar from "../components/Navbar";

export default function StudentBrowsingPage() {
  const { user } = useContext(AuthContext);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const thStyle = { padding: "8px", textAlign: "left", borderBottom: "1px solid #ddd" };
  const tdStyle = { padding: "8px", borderBottom: "1px solid #ddd" };

  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTutor, setSelectedTutor] = useState("");


  const fetchClasses = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/students/${user.id}/browse`);
      console.log("✔ Browsing classes:", res.data);

      const flatClasses = [];

      for (const [subject, tutors] of Object.entries(res.data || {})) {
        for (const [tutorId, tutorBlock] of Object.entries(tutors || {})) {

          const tutorInfo = tutorBlock?.tutor_info ?? tutorBlock?.tutorInfo ?? null;
          const classesArray = Array.isArray(tutorBlock?.classes) ? tutorBlock.classes : [];

          classesArray.forEach((cls) => {
            flatClasses.push({
              ...cls,
              subject,
              tutorId,
              tutor_name: tutorInfo?.tutor_name ?? tutorInfo?.name ?? null,
            });
          });
        }
      }

      setClasses(flatClasses);
      setError(null);
    } catch (err) {
      console.error("Failed to load classes:", err);
      setError("Unable to load classes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  // Check for user ID existence before proceeding
  if (!user?.id) {
    setError("User data not available for fetching classes.");
    setLoading(false);
    return;
  }

      fetchClasses();
    }, [user]);

    const filteredClasses = classes.filter(c =>
      (selectedSubject === "" || c.subject === selectedSubject) &&
      (selectedTutor === "" || c.tutorId === selectedTutor)
    );

    // Group by subject AFTER filtering
    const groupedBySubject = filteredClasses.reduce((acc, cls) => {
      if (!acc[cls.subject]) acc[cls.subject] = [];
      acc[cls.subject].push(cls);
      return acc;
    }, {});

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto mt-10 px-6">
        <p className="text-gray-600">Loading classes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto mt-10 px-6">
        <p className="text-red-600 font-semibold">Error: {error}</p>
      </div>
    );
  }

  const handleJoin = async (classId) => {
      if (!user?.id) {
        alert("User not logged in.");
        return;
      }

      try {
        const response = await fetch("http://localhost:8000/students/join", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            student_id: user.id,
            class_id: classId,
          }),
        });

        if (!response.ok) {
          const err = await response.json();
          alert(err.detail || "Failed to join class.");
          return;
        }

        // Successful join
        alert("Successfully joined the class!");

        // Refresh: fetch classes again
        fetchClasses();
      } catch (error) {
        console.error("Join class error:", error);
        alert("Error joining class.");
      }
    };

  return (

    <div className="max-w-6xl mx-auto mt-10 px-6">
      <Navbar role="student" />
      <h1 className="text-2xl font-semibold mb-6">Browse Classes</h1>

      {/* FILTER BAR */}
        <div className="flex gap-4 mb-6">
          {/* Subject filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="">All Subjects</option>
            {[...new Set(classes.map(c => c.subject))].map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>

          {/* Tutor filter */}
          <select
            value={selectedTutor}
            onChange={(e) => setSelectedTutor(e.target.value)}
            className="border px-3 py-2 rounded"
          >
            <option value="">All Tutors</option>
            {[...new Set(classes.map(c => c.tutorId))].map(tutorId => {
              const name = classes.find(c => c.tutorId === tutorId)?.tutor_name ?? tutorId;
              return (
                <option key={tutorId} value={tutorId}>{name}</option>
              );
            })}
          </select>
        </div>

      {classes.length === 0 ? (
        <p className="text-gray-600">No available classes at the moment.</p>
      ) : (
        <>
          {/* Group classes by subject */}
          {Object.entries(
            filteredClasses.reduce((acc, cls) => {
              if (!acc[cls.subject]) acc[cls.subject] = [];
              acc[cls.subject].push(cls);
              return acc;
            }, {})
          ).map(([subject, subjectClasses]) => (
            <div key={subject} className="mb-10">
              <h2 className="text-xl font-semibold mb-4">{subject}</h2>

              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10px" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f4f4f4" }}>
                    <th style={thStyle}>Class ID</th>
                    <th style={thStyle}>Tutor</th>
                    <th style={thStyle}>Mode</th>
                    <th style={thStyle}>Timeslot</th>
                    <th style={thStyle}>Room / Link</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {subjectClasses
                    .slice()
                    .sort((a, b) => {
                      const ta = a.timeslot?.start ? new Date(a.timeslot.start).getTime() : 0;
                      const tb = b.timeslot?.start ? new Date(b.timeslot.start).getTime() : 0;
                      return ta - tb;
                    })
                    .map((cls) => (
                      <tr key={cls.class_id}>
                        <td style={tdStyle}>{cls.class_id}</td>
                        <td style={tdStyle}>{cls.tutor_name || cls.tutorId || "Unknown"}</td>
                        <td style={tdStyle}>{cls.delivery_mode}</td>
                        <td style={tdStyle}>
                          {formatTime(cls.timeslot.start)} – {formatTime(cls.timeslot.end)}
                        </td>
                        <td style={tdStyle}>
                          {cls.delivery_mode === "online"
                            ? cls.meeting_link || "(none)"
                            : cls.room || "(none)"}
                        </td>
                        <td style={tdStyle}>
                          <span
                            style={{
                              padding: "4px 8px",
                              borderRadius: "4px",
                              backgroundColor: cls.status === "Approved" ? "#28a745" : "#6c757d",
                              color: "white"
                            }}
                          >
                            {cls.status}
                          </span>
                        </td>
                        <td style={tdStyle}>
                          <button
                            style={{
                              padding: "6px 12px",
                              backgroundColor: "#007bff",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer"
                            }}
                            onClick={() => handleJoin(cls.class_id)}
                          >
                            Join Class
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ))}
        </>
      )}
    </div>
  );
}


function formatTime(iso) {
  const date = new Date(iso);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}