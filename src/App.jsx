import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Services from './pages/Services'
import About from './pages/About'
import News from './pages/News'
import Contact from './pages/Contact'
import Login from './pages/Login'   

export default function App() {
  return (
    <Router>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/about" element={<About />} />
        <Route path="/news" element={<News />} />
        <Route path="/contact" element={<Contact />} />

        {/* Login Route */}
        <Route path="/login" element={<Login />} />
      </Routes>

      <Footer />
    </Router>
  )
}
