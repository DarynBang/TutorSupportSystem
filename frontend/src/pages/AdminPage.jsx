import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../auth/AuthContext";
import axios from "axios";
import Navbar from "../components/Navbar";

export default function AdminPage() {
  const { user } = useContext(AuthContext);

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [newRoomId, setNewRoomId] = useState("");
  const [newCapacity, setNewCapacity] = useState("");

  const [editRoomId, setEditRoomId] = useState("");
  const [editCapacity, setEditCapacity] = useState("");

  useEffect(() => {
    if (!user?.id) {
      console.error("❌ No user ID found in AuthContext.");
      return;
    }
    fetchRooms();
  }, [user]);

  // Fetch all rooms
  async function fetchRooms() {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8000/admin/rooms");
      setRooms(res.data);
    } catch (err) {
      console.error("Error loading rooms:", err);
    } finally {
      setLoading(false);
    }
  }

  // Add room
  async function handleAddRoom() {
    if (!newRoomId.trim() || !newCapacity) {
      alert("Please enter room ID and capacity.");
      return;
    }

    try {
      await axios.post("http://localhost:8000/admin/rooms", {
        room_id: newRoomId,
        capacity: parseInt(newCapacity),
      });

      alert("Room added successfully!");
      setNewRoomId("");
      setNewCapacity("");
      fetchRooms();
    } catch (err) {
      console.error(err);
      alert("Failed to add room.");
    }
  }

  // Edit room
  async function handleEditRoom() {
    if (!editRoomId || !editCapacity) {
      alert("Select a room and enter new capacity.");
      return;
    }

    try {
      await axios.put(`http://localhost:8000/admin/rooms/${editRoomId}`, {
        capacity: parseInt(editCapacity),
      });

      alert("Room updated successfully!");
      setEditRoomId("");
      setEditCapacity("");
      fetchRooms();
    } catch (err) {
      console.error(err);
      alert("Failed to update room.");
    }
  }


  if (loading) return <div>Loading admin dashboard...</div>;

  return (
    <div className="max-w-6xl mx-auto my-12 p-8 bg-white shadow-xl rounded-lg">
      <Navbar />

      {/* Welcome section */}
      <div
        className="welcome-section mb-10 rounded-lg shadow-md"
        style={{ backgroundColor: "#007bff", color: "#fff", padding: "1.5rem" }}
      >
        <h1 className="text-3xl font-bold">
          Welcome back, {user?.name || "Admin"} 👋
        </h1>
      </div>

      ---

      {/* ====================== SYSTEM STATUS SECTION ====================== */}
      <section className="mb-10 p-6 border rounded-lg shadow-sm bg-gray-50">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">⚙️ System Integrations</h2>

        <ul className="space-y-3 mb-6 text-lg">
          <li className="flex justify-between items-center">
            <span className="font-medium">HCMUT_SSO :</span>
            <span className="text-red-600 font-bold bg-red-100 px-3 py-1 rounded-full">
              Not Integrated
            </span>
          </li>
          <li className="flex justify-between items-center">
            <span className="font-medium">HCMUT_DATACORE :</span>
            <span className="text-yellow-600 font-bold bg-yellow-100 px-3 py-1 rounded-full">
              Mock
            </span>
          </li>
          <li className="flex justify-between items-center">
            <span className="font-medium">HCMUT_LIBRARY :</span>
            <span className="text-red-600 font-bold bg-red-100 px-3 py-1 rounded-full">
              Not Integrated
            </span>
          </li>
        </ul>

        <button
          style={btnSecondary} // Applied custom style
          onClick={() => alert("Roles & access management not implemented.")}
        >
          Manage System Roles & Access
        </button>
      </section>

      ---

      {/* ====================== ROOM MANAGEMENT ====================== */}
      <section className="mb-12 p-6 border rounded-lg shadow-sm">
        <h2 className="text-2xl font-bold mb-5 text-gray-800">🏢 Room Management</h2>

        {/* Add Room */}
        <div className="bg-white p-6 rounded-lg border-2 border-dashed border-blue-200 mb-8">
          <h3 className="text-xl font-semibold mb-3 text-blue-700">➕ Add New Room</h3>
          <div className="flex flex-wrap items-center space-y-3 md:space-y-0">
            <input
              type="text"
              placeholder="Room ID (e.g., A101)"
              className="border border-gray-300 p-3 rounded mr-3 w-full md:w-auto flex-grow"
              value={newRoomId}
              onChange={(e) => setNewRoomId(e.target.value)}
            />
            <input
              type="number"
              placeholder="Capacity (e.g., 30)"
              className="border border-gray-300 p-3 rounded mr-3 w-full md:w-auto flex-grow"
              value={newCapacity}
              onChange={(e) => setNewCapacity(e.target.value)}
            />
            <button
              style={btnPrimary} // Applied custom style (Green)
              onClick={handleAddRoom}
              className="w-full md:w-auto"
            >
              Add Room
            </button>
          </div>
        </div>

        {/* Edit Room */}
        <div className="bg-white p-6 rounded-lg border-2 border-dashed border-green-200 mb-10">
          <h3 className="text-xl font-semibold mb-3 text-green-700">✏️ Edit Room Capacity</h3>

          <div className="flex flex-wrap items-center space-y-3 md:space-y-0">
            <select
              className="border border-gray-300 p-3 rounded mr-3 w-full md:w-auto flex-grow"
              value={editRoomId}
              onChange={(e) => setEditRoomId(e.target.value)}
            >
              <option value="">Select Room</option>
              {rooms.map((r) => (
                <option key={r.room_id} value={r.room_id}>{r.room_id}</option>
              ))}
            </select>

            <input
              type="number"
              placeholder="New Capacity"
              className="border border-gray-300 p-3 rounded mr-3 w-full md:w-auto flex-grow"
              value={editCapacity}
              onChange={(e) => setEditCapacity(e.target.value)}
            />
            <button
              style={btnPrimary} // Applied custom style (Green)
              onClick={handleEditRoom}
              className="w-full md:w-auto"
            >
              Update Capacity
            </button>
          </div>
        </div>

        {/* Room Table */}
        <h3 className="text-xl font-semibold mb-3 text-gray-800">Current Rooms</h3>
        <div className="overflow-x-auto border rounded-lg shadow-md">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th style={thStyle}>Room ID</th>
                <th style={thStyle}>Capacity</th>
                <th style={thStyle}>Actions (for View/Delete/...)</th>
              </tr>
            </thead>

            <tbody>
              {rooms.map((room) => (
                <tr
                  key={room.room_id}
                  className="hover:bg-gray-50 transition duration-150 ease-in-out"
                >
                  <td style={tdStyle} className="font-mono text-gray-700">{room.room_id}</td>
                  <td style={tdStyle}>{room.capacity}</td>
                  <td style={tdStyle} className="space-x-2">
                    {/* Add action buttons here if needed, e.g., Delete, View */}
                    <span className="text-sm text-gray-500">N/A</span>
                  </td>
                </tr>
              ))}
              {rooms.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center p-4 text-gray-500 italic">No rooms currently added.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
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
