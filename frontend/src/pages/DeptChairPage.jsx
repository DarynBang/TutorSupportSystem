import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../auth/AuthContext";
import axios from "axios";
import Navbar from "../components/Navbar";

export default function DeptChairPage() {
  const { user } = useContext(AuthContext);

  const [progressNotes, setProgressNotes] = useState([]);
  const [studentEvals, setStudentEvals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Automatically fetch on mount
  useEffect(() => {
    if (!user?.id) {
      console.error("❌ No department chair ID found in AuthContext.");
      return;
    }

    console.log(`Fetching Department Chair Dashboard for ${user.id}...`);
    loadDashboard();
  }, [user]);

  async function loadDashboard() {
    try {
      const [progressRes, evalRes] = await Promise.all([
        fetch("http://localhost:8000/dept_chair/progress-notes"),
        fetch("http://localhost:8000/dept_chair/student-evaluations")
      ]);

      const progressData = await progressRes.json();
      const evalData = await evalRes.json();

      console.log("Progress notes:", progressData);
      console.log("Student evals:", evalData);

      setProgressNotes(progressData);
      setStudentEvals(evalData);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p>Loading dashboard...</p>;

  // ------------------------------------------------------------------
  // Group Progress Notes by CLASS then SUBJECT
  // ------------------------------------------------------------------
  function groupProgressNotes() {
    const groups = {};

    progressNotes.forEach(note => {
      const subject = note.class_id; // For now you only have class_id, not subject name

      if (!groups[subject]) groups[subject] = [];
      groups[subject].push(note);
    });

    return groups;
  }

  const groupedProgress = groupProgressNotes();

  return (
    <div>
      <Navbar />
      {/* Welcome section */}
      <div
        className="welcome-section mb-10 rounded-lg shadow-md"
        style={{ backgroundColor: "#007bff", color: "#fff", padding: "1.5rem" }}
      >
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.name || "deparment chair"} 👋
        </h1>
      </div>
      <hr />

      {/* System Buttons */}
<div style={{ marginBottom: "30px", padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
  <h3 style={{ fontSize: '1.1rem', marginBottom: '15px', color: '#495057' }}>Administrative Tools</h3>
  <div style={{ display: 'flex', gap: '15px' }}>
      <button
          disabled
          style={{
              padding: '10px 15px',
              borderRadius: '5px',
              border: '1px solid #ced4da',
              backgroundColor: '#e9ecef',
              color: '#6c757d',
              cursor: 'not-allowed',
              fontWeight: '600',
              opacity: 0.8
          }}
      >
          Manage New Tutors (Coming Soon)
      </button>

      <button
          disabled
          style={{
              padding: '10px 15px',
              borderRadius: '5px',
              border: '1px solid #ced4da',
              backgroundColor: '#e9ecef',
              color: '#6c757d',
              cursor: 'not-allowed',
              fontWeight: '600',
              opacity: 0.8
          }}
      >
          Manage Learning Material (Mock)
      </button>
  </div>
</div>

<hr style={{ border: 'none', borderTop: '1px solid #e9ecef', marginBottom: '30px' }} />

{/* ----------------- TUTOR PROGRESS NOTES ----------------- */}
<section style={{ marginBottom: "40px" }}>
    <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#343a40', marginBottom: '20px' }}>📝 Tutor Progress Notes</h2>

    {Object.keys(groupedProgress).length === 0 && (
      <p style={{ padding: '15px', backgroundColor: '#fff', border: '1px solid #dee2e6', borderRadius: '6px' }}>No tutor progress notes available.</p>
    )}

    {Object.entries(groupedProgress).map(([classId, notes]) => (
      <div
          key={classId}
          style={{
              marginBottom: "30px",
              padding: "20px",
              backgroundColor: '#fff',
              borderRadius: '8px',
              boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e9ecef'
          }}
      >
        <h3 style={{
            fontSize: '1.3rem',
            fontWeight: '600',
            borderBottom: '2px solid #007bff',
            paddingBottom: '8px',
            marginBottom: '20px',
            color: '#007bff'
        }}>
            Class: {classId}
        </h3>

        {notes.map((n, index) => (
          <div
            key={index}
            style={{
              padding: "15px",
              marginBottom: "10px",
              border: "1px solid #ced4da",
              borderRadius: "6px",
              backgroundColor: '#f8f9fa'
            }}
          >
            <p style={{ marginBottom: '5px', fontSize: '0.95rem' }}>
                <strong>Tutor:</strong> <span style={{ float: 'right' }}>{n.tutor_id}</span>
            </p>
            <p style={{ marginBottom: '8px', fontSize: '0.95rem' }}>
                <strong>Time:</strong> <span style={{ float: 'right' }}>{n.timestamp}</span>
            </p>
            <div style={{ borderTop: '1px dashed #ced4da', paddingTop: '8px', marginTop: '8px' }}>
                <p style={{ fontWeight: '600', marginBottom: '5px' }}>Progress Details:</p>
                <p style={{ margin: '0', paddingLeft: '10px', color: '#495057' }}>{n.content}</p>
            </div>
          </div>
        ))}
      </div>
    ))}
</section>

<hr style={{ border: 'none', borderTop: '1px solid #e9ecef', marginBottom: '30px' }} />

{/* ----------------- STUDENT EVALUATIONS ----------------- */}
<section>
    <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: '#343a40', marginBottom: '20px' }}>⭐ Student Class Evaluations</h2>

    {studentEvals.length === 0 && (
        <p style={{ padding: '15px', backgroundColor: '#fff', border: '1px solid #dee2e6', borderRadius: '6px' }}>No student evaluations available.</p>
    )}

    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
        {studentEvals.map((evalItem, index) => (
          <div
            key={index}
            style={{
              padding: "20px",
              marginBottom: "0", /* Removed bottom margin since grid handles spacing */
              border: "1px solid #dee2e6",
              borderRadius: "8px",
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              backgroundColor: '#fff'
            }}
          >
            <p style={{ marginBottom: '5px', fontSize: '0.95rem' }}>
                <strong>Class:</strong> <span style={{ float: 'right', fontWeight: 'normal' }}>{evalItem.class_id}</span>
            </p>
            <p style={{ marginBottom: '5px', fontSize: '0.95rem' }}>
                <strong>Tutor:</strong> <span style={{ float: 'right', fontWeight: 'normal' }}>{evalItem.tutor_id}</span>
            </p>
            <p style={{ marginBottom: '15px', fontSize: '0.95rem' }}>
                <strong>Date:</strong> <span style={{ float: 'right', fontWeight: 'normal' }}>{evalItem.date}</span>
            </p>

            <div style={{ borderTop: '1px dashed #adb5bd', paddingTop: '10px' }}>
                <p style={{ fontWeight: '600', color: '#343a40', marginBottom: '5px' }}>Evaluation Feedback:</p>
                {/* DO NOT DISPLAY STUDENT NAME */}
                <blockquote style={{
                    margin: '0',
                    paddingLeft: '15px',
                    borderLeft: '4px solid #ffc107',
                    color: '#495057',
                    fontStyle: 'italic',
                    fontSize: '0.9rem'
                }}>
                    {evalItem.content}
                </blockquote>
            </div>
          </div>
            ))}
    </div>
</section>
      <hr />
    </div>
  );
}