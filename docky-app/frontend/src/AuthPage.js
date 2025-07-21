import React, { useState } from "react";
import Login from "./Login";
import Signup from "./Signup";
import AdminLogin from "./AdminLogin";

export default function AuthPage({ onUserLogin, onUserSignup, onAdminLogin }) {
  const [tab, setTab] = useState("user-login");
  const [signupError, setSignupError] = useState("");

  // Custom user signup handler to catch 'User exists' error
  const handleUserSignup = async (username, password) => {
    try {
      await onUserSignup(username, password);
      setSignupError("");
    } catch (err) {
      if (err.message && err.message.includes("User exists")) {
        setSignupError("User already exists. Please log in.");
        setTab("user-login");
      }
    }
  };

  // Custom admin signup handler to catch 'User exists' error
  const handleAdminSignup = async (username, password) => {
    try {
      await onAdminLogin(username, password, "admin");
      setSignupError("");
    } catch (err) {
      if (err.message && err.message.includes("User exists")) {
        setSignupError("Admin already exists. Please log in.");
        setTab("admin-login");
      }
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f7faff' }}>
      <div style={{ background: '#fff', padding: 40, borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', minWidth: 340 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <button onClick={() => setTab("user-login")}
            style={{ background: tab === "user-login" ? '#1976d2' : 'none', color: tab === "user-login" ? '#fff' : '#1976d2', border: 'none', borderRadius: 6, padding: '8px 16px', marginRight: 8, fontWeight: 'bold', cursor: 'pointer' }}>
            User Login
          </button>
          <button onClick={() => setTab("user-signup")}
            style={{ background: tab === "user-signup" ? '#1976d2' : 'none', color: tab === "user-signup" ? '#fff' : '#1976d2', border: 'none', borderRadius: 6, padding: '8px 16px', marginRight: 8, fontWeight: 'bold', cursor: 'pointer' }}>
            User Signup
          </button>
          <button onClick={() => setTab("admin-login")}
            style={{ background: tab === "admin-login" ? '#1976d2' : 'none', color: tab === "admin-login" ? '#fff' : '#1976d2', border: 'none', borderRadius: 6, padding: '8px 16px', marginRight: 8, fontWeight: 'bold', cursor: 'pointer' }}>
            Admin Login
          </button>
          <button onClick={() => setTab("admin-signup")}
            style={{ background: tab === "admin-signup" ? '#1976d2' : 'none', color: tab === "admin-signup" ? '#fff' : '#1976d2', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 'bold', cursor: 'pointer' }}>
            Admin Signup
          </button>
        </div>
        {signupError && <div style={{ color: 'red', marginBottom: 16, textAlign: 'center' }}>{signupError}</div>}
        {tab === "user-login" && <Login onLogin={onUserLogin} switchToSignup={() => setTab("user-signup")} switchToAdminLogin={() => setTab("admin-login")} />}
        {tab === "user-signup" && <Signup onSignup={handleUserSignup} switchToLogin={() => setTab("user-login")} />}
        {tab === "admin-login" && <AdminLogin onAdminLogin={onAdminLogin} switchToUserLogin={() => setTab("user-login")} showOnlyLogin />}
        {tab === "admin-signup" && <AdminLogin onAdminLogin={handleAdminSignup} switchToUserLogin={() => setTab("user-login")} showOnlySignup />}
      </div>
    </div>
  );
} 