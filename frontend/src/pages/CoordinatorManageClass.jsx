import React, { useContext, useState, useEffect, useCallback} from "react";
import { AuthContext } from "../auth/AuthContext";
import axios from "axios";
import Navbar from "../components/Navbar";

export default function CoordinatorManageClass() {
  const { user } = useContext(AuthContext);

  const [classes, setClasses] = useState([]);
  const [rooms, setRooms] = useState([]); // normalized array of {room_id, capacity}
  const [loading, setLoading] = useState(true);

  const [approveModal, setApproveModal] = useState({
    open: false,
    classId: null,
    deliveryMode: "",
    selectedRoom: "",
  });

  const [rejectModal, setRejectModal] = useState({
    open: false,
    classId: null,
    reason: "",
  });

  // Load pending/rejected classes + rooms
  useEffect(() => {
    if (!user?.id) return;

    async function loadData() {
      setLoading(true);
      try {
        const [classRes, roomRes] = await Promise.all([
          fetch("http://localhost:8000/coordinator/classes/pending"),
          fetch("http://localhost:8000/coordinator/rooms"),
        ]);

        const classData = await classRes.json();
        const roomData = await roomRes.json();

        console.log("Room Data:", roomData);

        // Normalize rooms to array of objects { room_id, capacity }
        let normalizedRooms = [];
        if (Array.isArray(roomData)) {
          normalizedRooms = roomData.map((r) =>
            typeof r === "string" ? { room_id: r, capacity: null } : r
          );
        } else if (roomData && typeof roomData === "object") {
          // handle { room_id: "...", capacity: ... } or other structures
          // If API returns a single room object, wrap it
          if (roomData.room_id) normalizedRooms = [roomData];
          else normalizedRooms = [];
        } else {
          normalizedRooms = [];
        }

        console.log("Loaded rooms (normalized):", normalizedRooms);

        setClasses(Array.isArray(classData) ? classData : []);
        setRooms(normalizedRooms);
      } catch (err) {
        console.error("Error loading pending/rejected classes or rooms:", err);
        setClasses([]);
        setRooms([]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [user]);

  async function refreshClasses() {
    try {
      const classRes = await fetch("http://localhost:8000/coordinator/classes/pending");
      const classData = await classRes.json();
      setClasses(Array.isArray(classData) ? classData : []);
    } catch (err) {
      console.error("Error refreshing classes:", err);
    }
  }

  // Approve
  async function handleApproveConfirm() {
    const { classId, deliveryMode, selectedRoom } = approveModal;

    if (!classId) return alert("No class selected.");

    if (deliveryMode === "offline" && !selectedRoom) {
      return alert("Assign a room for offline classes.");
    }

    try {
      const res = await fetch("http://localhost:8000/coordinator/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offering_id: classId,
          room: deliveryMode === "offline" ? selectedRoom : null,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Unknown error" }));
        alert(err.detail || JSON.stringify(err));
        return;
      }

      alert("Class approved.");
      setApproveModal({ open: false, classId: null, deliveryMode: "", selectedRoom: "" });
      await refreshClasses();
    } catch (err) {
      console.error("Approve failed:", err);
      alert("Error while approving class.");
    }
  }

  // Reject
  async function handleRejectConfirm() {
    const { classId, reason } = rejectModal;
    if (!classId) return alert("No class selected.");
    if (!reason?.trim()) return alert("Please enter rejection reason.");

    try {
      const res = await fetch("http://localhost:8000/coordinator/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offering_id: classId,
          reason,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: "Unknown error" }));
        alert(err.detail || JSON.stringify(err));
        return;
      }

      alert("Class rejected.");
      setRejectModal({ open: false, classId: null, reason: "" });
      await refreshClasses();
    } catch (err) {
      console.error("Reject failed:", err);
      alert("Error while rejecting class.");
    }
  }

  if (loading) return <p>Loading classes…</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <Navbar />

      <h2 style={{ marginTop: "20px" }}>Manage Pending / Rejected Classes</h2>

      {classes.length === 0 ? (
        <p>No pending or rejected classes.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "12px" }}>
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Subject</th>
              <th style={thStyle}>Tutor</th>
              <th style={thStyle}>Mode</th>
              <th style={thStyle}>Timeslot</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {classes.map((cls) => (
              <tr key={cls.id}>
                <td style={tdStyle}>{cls.id}</td>
                <td style={tdStyle}>{cls.subject}</td>
                <td style={tdStyle}>{cls.tutor_name || cls.tutor_id}</td>
                <td style={tdStyle}>{cls.delivery_mode}</td>
                <td style={tdStyle}>
                  {cls.timeslot?.start ? `${formatTime(cls.timeslot.start)} → ${formatTime(cls.timeslot.end)}` : "-"}
                </td>
                <td style={tdStyle}>{cls.status}</td>
                <td style={tdStyle}>
                  <button
                    style={btnPrimary}
                    onClick={() =>
                      setApproveModal({
                        open: true,
                        classId: cls.id,
                        deliveryMode: cls.delivery_mode,
                        selectedRoom: cls.room || "",
                      })
                    }
                  >
                    Approve
                  </button>

                  <button
                    style={btnSecondary}
                    onClick={() => setRejectModal({ open: true, classId: cls.id, reason: "" })}
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Approve modal */}
      {approveModal.open && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h3>Approve class: {approveModal.classId}</h3>

            {approveModal.deliveryMode === "offline" ? (
              <>
                <label style={{ display: "block", marginBottom: "8px" }}>Assign room</label>
                <select
                  value={approveModal.selectedRoom}
                  onChange={(e) => setApproveModal(prev => ({ ...prev, selectedRoom: e.target.value }))}
                >
                  <option value="">-- choose room --</option>
                  {rooms.map((r) => (
                    <option key={r.room_id} value={r.room_id}>
                      {r.room_id} {r.capacity ? ` (cap ${r.capacity})` : ""}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <p>This is an online class — no room assignment required.</p>
            )}

            <div style={{ marginTop: "12px" }}>
              <button style={btnPrimary} onClick={handleApproveConfirm}>Confirm Approve</button>
              <button style={btnSecondary} onClick={() => setApproveModal({ open: false, classId: null, deliveryMode: "", selectedRoom: "" })}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject modal */}
      {rejectModal.open && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h3>Reject class: {rejectModal.classId}</h3>

            <label style={{ display: "block", marginBottom: "6px" }}>Reason (required)</label>
            <textarea
              value={rejectModal.reason}
              onChange={(e) => setRejectModal(prev => ({ ...prev, reason: e.target.value }))}
              rows={4}
              style={{ width: "100%" }}
            />

            <div style={{ marginTop: "12px" }}>
              <button style={btnPrimary} onClick={handleRejectConfirm}>Submit Rejection</button>
              <button style={btnSecondary} onClick={() => setRejectModal({ open: false, classId: null, reason: "" })}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// modal styles
const modalOverlay = {
  position: "fixed",
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalBox = {
  background: "#fff",
  padding: "18px",
  borderRadius: "8px",
  minWidth: "320px",
  maxWidth: "600px",
  boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
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