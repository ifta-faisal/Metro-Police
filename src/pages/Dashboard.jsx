import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AdminDashboard from "./AdminDashboard";
import OfficerDashboard from "./OfficerDashboard";
import CitizenDashboard from "./CitizenDashboard";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/Login");
    } else if (isAuthenticated && user) {
      // Redirect to role-based dashboard
      if (user.role === 'admin') {
        navigate("/admin/dashboard");
      } else if (user.role === 'officer') {
        navigate("/officer/dashboard");
      } else {
        navigate("/citizen/dashboard");
      }
    }
  }, [isAuthenticated, loading, navigate, user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  // Route to appropriate dashboard based on user role
  if (user?.role === 'admin') {
    return <AdminDashboard />;
  } else if (user?.role === 'officer') {
    return <OfficerDashboard />;
  }

  return <CitizenDashboard />;
}

const styles = {
  container: { 
    display: "flex", 
    justifyContent: "center", 
    alignItems: "center",
    padding: "40px", 
    backgroundColor: "#f4f7f6", 
    minHeight: "100vh" 
  },
  card: { 
    backgroundColor: "white", 
    padding: "40px", 
    borderRadius: "12px", 
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)", 
    width: "100%", 
    maxWidth: "700px",
    textAlign: "left"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  badge: {
    backgroundColor: "#10b981",
    color: "white",
    padding: "5px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "bold"
  },
  divider: {
    margin: "20px 0",
    border: "0",
    borderTop: "1px solid #eee"
  },
  userInfo: {
    marginBottom: "30px"
  },
  statsGrid: { 
    display: "grid", 
    gridTemplateColumns: "1fr 1fr", 
    gap: "20px", 
    margin: "20px 0" 
  },
  statBox: { 
    padding: "20px", 
    border: "1px solid #eef2f3", 
    borderRadius: "8px", 
    textAlign: "center",
    backgroundColor: "#f9fbfb"
  },
  statNumber: {
    fontSize: "28px",
    fontWeight: "bold",
    color: "#2c3e50",
    margin: "10px 0 0 0"
  },
  logoutBtn: { 
    backgroundColor: "#e74c3c", 
    color: "white", 
    border: "none", 
    padding: "12px 25px", 
    borderRadius: "6px", 
    cursor: "pointer", 
    fontSize: "16px", 
    fontWeight: "600",
    marginTop: "20px",
    width: "100%"
  }
};