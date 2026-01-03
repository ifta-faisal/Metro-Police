import { Link } from 'react-router-dom'
import './Login.css'

export default function Login() {
  return (
    <div className="login-page">
      <div className="login-card">
        <h2>Welcome Back</h2>
        <p className="subtitle">Please login to your account</p>

        <form className="login-form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="form-options">
            <Link to="/forgot-password" className="forgot-link">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="btn-login-submit">
            Login
          </button>
        </form>

        <div className="create-account">
          <span>Don’t have an account?</span>
          <Link to="/register"> Create Account</Link>
        </div>
      </div>
    </div>
  )
}
