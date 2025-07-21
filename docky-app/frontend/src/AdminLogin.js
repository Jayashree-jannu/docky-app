import React, { useState } from "react";

export default function AdminLogin({ onAdminLogin, switchToUserLogin, showOnlyLogin, showOnlySignup }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showSignup, setShowSignup] = useState(false);

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
      if (data.role !== "admin") throw new Error("Not an admin account");
      localStorage.setItem("token", data.token);
      onAdminLogin(username, password, data.role);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Signup failed");
      // Automatically log in after signup
      const loginRes = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error(loginData.error || "Login failed");
      if (loginData.role !== "admin") throw new Error("Not an admin account");
      localStorage.setItem("token", loginData.token);
      onAdminLogin(username, password, loginData.role);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f7faff' }}>
      <div style={{ background: '#fff', padding: 40, borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', minWidth: 320 }}>
        <h2 style={{ color: '#1976d2', textAlign: 'center', marginBottom: 24 }}>{showOnlySignup ? 'Admin Sign Up' : 'Admin Login'}</h2>
        {(!showSignup && !showOnlySignup) || showOnlyLogin ? (
          <>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <input
                type="text"
                placeholder="Admin Username"
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
              <button type="submit" style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: 12, fontSize: 18, cursor: 'pointer' }}>Login as Admin</button>
            </form>
            {error && <div style={{ color: "red", marginTop: 10, textAlign: 'center' }}>{error}</div>}
            {!showOnlyLogin && (
              <>
                <p style={{ textAlign: 'center', marginTop: 20 }}>
                  Not an admin?{' '}
                  <button onClick={switchToUserLogin} style={{ color: '#1976d2', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>User Login</button>
                </p>
                <p style={{ textAlign: 'center', marginTop: 10 }}>
                  <button onClick={() => setShowSignup(true)} style={{ color: '#1976d2', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Admin Sign Up</button>
                </p>
              </>
            )}
          </>
        ) : (showSignup || showOnlySignup) ? (
          <>
            <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <input
                type="text"
                placeholder="Admin Username"
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
              <button type="submit" style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: 12, fontSize: 18, cursor: 'pointer' }}>Sign Up as Admin</button>
            </form>
            {error && <div style={{ color: "red", marginTop: 10, textAlign: 'center' }}>{error}</div>}
            {!showOnlySignup && (
              <p style={{ textAlign: 'center', marginTop: 20 }}>
                Already have an admin account?{' '}
                <button onClick={() => setShowSignup(false)} style={{ color: '#1976d2', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Admin Login</button>
              </p>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
} 