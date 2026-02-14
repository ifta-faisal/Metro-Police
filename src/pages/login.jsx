import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      const role = result.user?.role;
      if (role === 'admin') navigate("/admin/dashboard");
      else if (role === 'officer') navigate("/officer/dashboard");
      else navigate("/citizen/dashboard");
    } else {
      setError(result.error || "Invalid login credentials");
    }
    
    setLoading(false);
  };

  return (
    <div className="login-page">

      {/* Background Video */}
      <video className="login-video" autoPlay loop muted playsInline>
        <source src="/login-bg.mp4" type="video/mp4" />
      </video>
      <div className="login-overlay"></div>

      {/* Login Card */}
      <div className="login-card">
        <h2>Welcome Back</h2>
        <p className="subtitle">Please login to your account</p>

        {error && <p className="error-text">{error}</p>}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-options">
            <Link to="/forgot-password" className="forgot-link">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="btn-login-submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="create-account">
          <span>Don’t have an account?</span>
          <Link to="/Register"> Create Account</Link>
        </div>
      </div>
    </div>
  );
}
