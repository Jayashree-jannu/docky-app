// src/UserDashboard.js

import { useState, useEffect } from "react";

export default function UserDashboard({ user }) {
  const [file, setFile] = useState(null);
  const [userFiles, setUserFiles] = useState([]);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await fetch("http://localhost:5000/files", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();
        // Filter files by current user
        setUserFiles(data.filter(f => f.name === user.username));
      } catch (err) {
        setUserFiles([]);
      }
    };
    fetchFiles();
    const interval = setInterval(fetchFiles, 5000);
    return () => clearInterval(interval);
  }, [user.username]);

  const handleSubmit = async () => {
    if (!user?.username || !file) {
      alert("Please fill all fields");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", user.username);

    const token = localStorage.getItem("token");
    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      if (!response.ok) throw new Error("Upload failed");
      const data = await response.json();
      alert("Document submitted! File ID: " + data.id);
      setFile(null);
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f7faff' }}>
      <div style={{ background: '#fff', padding: 40, borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', minWidth: 320 }}>
        <h2 style={{ color: '#1976d2', textAlign: 'center', marginBottom: 24 }}>User Dashboard</h2>
        <div style={{ marginBottom: 16, fontSize: 18 }}>Welcome, <b>{user?.username}</b></div>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ marginBottom: 16 }}
        />
        <button onClick={handleSubmit} style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: 12, fontSize: 18, cursor: 'pointer', width: '100%' }}>Submit</button>
        <div style={{ marginTop: 32 }}>
          <h3 style={{ color: '#1976d2', marginBottom: 12 }}>Your Uploaded Files</h3>
          {userFiles.length === 0 ? (
            <div style={{ color: '#888' }}>No files uploaded yet.</div>
          ) : (
            <table style={{ width: '100%', fontSize: 16, borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f0f0f0' }}>
                  <th style={{ padding: 8, border: '1px solid #ccc' }}>File Name</th>
                  <th style={{ padding: 8, border: '1px solid #ccc' }}>Uploaded At</th>
                  <th style={{ padding: 8, border: '1px solid #ccc' }}>Download/View</th>
                </tr>
              </thead>
              <tbody>
                {userFiles.map(file => (
                  <tr key={file.id}>
                    <td style={{ padding: 8, border: '1px solid #ccc' }}>{file.originalname}</td>
                    <td style={{ padding: 8, border: '1px solid #ccc' }}>{file.uploaded_at}</td>
                    <td style={{ padding: 8, border: '1px solid #ccc' }}>
                      <a href={`http://localhost:5000/uploads/${file.filename}`} target="_blank" rel="noopener noreferrer">Download/View</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
