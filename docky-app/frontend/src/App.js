import React, { useState } from "react";
import UserDashboard from "./UserDashboard";
import AdminDashboard from "./AdminDashboard";
import AuthPage from "./AuthPage";

function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("auth"); // 'auth', 'dashboard', 'admindashboard'

  const handleUserLogin = (username, password, role) => {
    setUser({ username, isAdmin: false });
    setPage("dashboard");
  };

  const handleUserSignup = (username, password) => {
    setUser({ username, isAdmin: false });
    setPage("dashboard");
  };

  const handleAdminLogin = (username, password, role) => {
    setUser({ username, isAdmin: true });
    setPage("admindashboard");
  };

  if (!user) {
    return <AuthPage onUserLogin={handleUserLogin} onUserSignup={handleUserSignup} onAdminLogin={handleAdminLogin} />;
  }

  if (user.isAdmin && page === "admindashboard") {
    return (
      <div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f7faff' }}>
        <h1 style={{ color: '#1976d2', marginBottom: 32 }}>📄 Docky - Admin Dashboard</h1>
        <AdminDashboard user={user} />
      </div>
    );
  }

  return (
    <div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', background: '#f7faff' }}>
      <h1 style={{ color: '#1976d2', marginBottom: 32 }}>📄 Docky - User Dashboard</h1>
      <UserDashboard user={user} />
    </div>
  );
}

export default App;
