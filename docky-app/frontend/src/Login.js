import React, { useState } from "react";

export default function Login({ onLogin, switchToSignup, switchToAdminLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      localStorage.setItem("token", data.token);
      onLogin(username, password, data.role);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f7faff' }}>
      <div style={{ background: '#fff', padding: 40, borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', minWidth: 320 }}>
        <h2 style={{ color: '#1976d2', textAlign: 'center', marginBottom: 24 }}>Login</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16 }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: 10, borderRadius: 6, border: '1px solid #ccc', fontSize: 16 }}
          />
          <button type="submit" style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: 12, fontSize: 18, cursor: 'pointer' }}>Login</button>
        </form>
        {error && <div style={{ color: "red", marginTop: 10, textAlign: 'center' }}>{error}</div>}
        <p style={{ textAlign: 'center', marginTop: 20 }}>
          Don't have an account?{' '}
          <button onClick={switchToSignup} style={{ color: '#1976d2', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Sign up</button>
        </p>
        <p style={{ textAlign: 'center', marginTop: 10 }}>
          <button onClick={switchToAdminLogin} style={{ color: '#1976d2', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Admin Login</button>
        </p>
      </div>
    </div>
  );
} 