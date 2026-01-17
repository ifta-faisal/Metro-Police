import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Header.css";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) return null;

  // Determine Home route
  let homeRoute = "/";
  let servicesLink = "/services"; // default public

  if (isAuthenticated) {
    switch (user?.role) {
      case "citizen":
        homeRoute = "/citizen/dashboard";
        servicesLink = "/citizen/dashboard#quick-actions";
        break;
      case "officer":
        homeRoute = "/officer/dashboard";
        servicesLink = "/officer/dashboard#quick-actions";
        break;
      case "admin":
        homeRoute = "/admin/dashboard";
        servicesLink = "/admin/dashboard#quick-actions";
        break;
      default:
        homeRoute = "/";
        servicesLink = "/services";
    }
  }

  return (
    <header className="header">
      <nav className="navbar">
        <div className="container navbar-container">
          {/* Logo/Home */}
          <Link to={homeRoute} className="logo">
            {/* Logo Image */}
            <img src="/logo.png" alt="Metro-Police Logo" className="logo-img" />
            {/* Text */}
            <span className="logo-text">Metro-Police</span>
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            className="menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          {/* Navigation Links */}
          <ul className={`nav-links ${mobileMenuOpen ? "mobile-open" : ""}`}>
            <li>
              <Link to={homeRoute}>Home</Link>
            </li>
            <li>
              <Link to={servicesLink}>Services</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/news">News</Link>
            </li>
            <li>
              <Link to="/contact">Contact</Link>
            </li>
          </ul>

          {/* User Menu */}
          {isAuthenticated ? (
            <div className="user-menu">
              <span className="user-name">{user?.name}</span>
              <button onClick={handleLogout} className="btn-logout">
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-login">
              Login
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
