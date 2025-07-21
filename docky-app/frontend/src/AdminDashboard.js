import React, { useEffect, useState } from "react";

export default function AdminDashboard() {
  const [files, setFiles] = useState([]);
  const [notification, setNotification] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Poll for uploaded files every 5 seconds
    const fetchFiles = async () => {
      try {
        const res = await fetch("http://localhost:5000/files", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();
        if (data.length > files.length) {
          setNotification("A new file has been uploaded by a user!");
          setTimeout(() => setNotification(""), 5000);
        }
        setFiles(data);
      } catch (err) {
        setNotification("Error fetching files");
      }
    };
    fetchFiles();
    const interval = setInterval(fetchFiles, 5000);
    return () => clearInterval(interval);
  }, [files.length]);

  // Filter files by uploader's name/email
  const filteredFiles = files.filter(file =>
    file.name && file.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f7faff' }}>
      <div style={{ background: '#fff', padding: 40, borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', maxWidth: 900, minWidth: 320 }}>
        <h1 style={{ color: '#1976d2', textAlign: 'center', marginBottom: 24 }}>Admin Dashboard</h1>
        <input
          type="text"
          placeholder="Search by user email or name..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ marginBottom: 24, padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16, width: '100%' }}
        />
        {notification && (
          <div style={{ background: "#fffae6", color: "#b36b00", padding: 20, marginBottom: 20, borderRadius: 8, textAlign: 'center' }}>
            {notification}
          </div>
        )}
        <h2 style={{ color: '#1976d2', marginBottom: 16 }}>Uploaded Files</h2>
        <table style={{ width: "100%", fontSize: 20, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f0f0f0" }}>
              <th style={{ padding: 12, border: "1px solid #ccc" }}>File Name</th>
              <th style={{ padding: 12, border: "1px solid #ccc" }}>User Name</th>
              <th style={{ padding: 12, border: "1px solid #ccc" }}>Uploaded At</th>
              <th style={{ padding: 12, border: "1px solid #ccc" }}>Download/View</th>
            </tr>
          </thead>
          <tbody>
            {filteredFiles.map((file) => (
              <tr key={file.id}>
                <td style={{ padding: 12, border: "1px solid #ccc" }}>{file.originalname}</td>
                <td style={{ padding: 12, border: "1px solid #ccc" }}>{file.name}</td>
                <td style={{ padding: 12, border: "1px solid #ccc" }}>{file.uploaded_at}</td>
                <td style={{ padding: 12, border: "1px solid #ccc" }}>
                  <a href={`http://localhost:5000/uploads/${file.filename}`} target="_blank" rel="noopener noreferrer">Download/View</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 