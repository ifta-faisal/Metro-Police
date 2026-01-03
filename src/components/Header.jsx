import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Header.css'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="header">
      <div className="header-top">
        <div className="container">
          <div className="header-top-content">
            <p>Serving our community with excellence and integrity</p>
            <select className="language-selector">
              <option value="en">English</option>
              <option value="es">Bangla</option>
              {/* <option value="fr">Français</option> */}
            </select>
          </div>
        </div>
      </div>

      <nav className="navbar">
        <div className="container navbar-container">
          <Link to="/" className="logo">
            <span className="logo-icon">◆</span>
            <span className="logo-text">Metro-Police</span>
          </Link>

          <button
            className="menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <ul className={`nav-links ${mobileMenuOpen ? 'mobile-open' : ''}`}>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/services">Services</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/news">News</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>

          <button className="btn-login">Login</button>
        </div>
      </nav>
    </header>
  )
}
