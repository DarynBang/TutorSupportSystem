// src/pages/BaseProfilePage.jsx

import React, { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import Navbar from "../components/Navbar";

export default function BaseProfilePage() {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <p>Loading profile...</p>;
  }

  return (
      <div className="base-dashboard-layout">
        <Navbar />
        <div style={styles.container}>
          <h2 style={styles.header}>Profile</h2>

          <div style={styles.card}>
            <div style={styles.row}>
              <span style={styles.label}>Name:</span>
              <span style={styles.value}>{user.name}</span>
            </div>

            <div style={styles.row}>
              <span style={styles.label}>Email:</span>
              <span style={styles.value}>{user.email}</span>
            </div>

            <div style={styles.row}>
              <span style={styles.label}>Role:</span>
              <span style={styles.value}>{user.role}</span>
            </div>

            <div style={styles.row}>
              <span style={styles.label}>User ID:</span>
              <span style={styles.value}>{user.id}</span>
            </div>
          </div>

          <button style={styles.button} onClick={() => alert("Not implemented yet")}>
            Change Password
          </button>
        </div>
      </div>
  );
}

const styles = {
  container: {
    padding: "30px",
    maxWidth: "600px",
    margin: "0 auto",
  },
  header: {
    textAlign: "center",
    marginBottom: "25px",
  },
  card: {
    padding: "20px",
    borderRadius: "10px",
    backgroundColor: "#fafafa",
    border: "1px solid #e0e0e0",
    marginBottom: "20px",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 0",
  },
  label: {
    fontWeight: "bold",
    color: "#333",
  },
  value: {
    color: "#555",
  },
  button: {
    padding: "10px 15px",
    width: "100%",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#4285F4",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
  },
};
