import { Link } from 'react-router-dom'
import './Home.css'

export default function Home() {
  const services = [
    {
      id: 1,
      title: 'Permits & Licenses',
      description: 'Apply for business permits, vehicle licenses, and other official permits.',
      icon: '📋',
      path: '/services'
    },
    {
      id: 2,
      title: 'Certificates',
      description: 'Request official certificates including background checks and clearances.',
      icon: '🎖️',
      path: '/services'
    },
    {
      id: 3,
      title: 'Reports & Records',
      description: 'Access incident reports, property records, and document verification.',
      icon: '📄',
      path: '/services'
    },
    {
      id: 4,
      title: 'Payments',
      description: 'Pay fines, fees, and other government charges online securely.',
      icon: '💳',
      path: '/services'
    },
    {
      id: 5,
      title: 'Inquiries',
      description: 'Check status of applications and submit inquiries to government agencies.',
      icon: '🔍',
      path: '/services'
    },
    {
      id: 6,
      title: 'Community Programs',
      description: 'Explore volunteer opportunities and community engagement initiatives.',
      icon: '🤝',
      path: '/services'
    }
  ]

  const highlights = [
    {
      title: 'Digital First',
      description: 'Fast, secure online access to all services 24/7'
    },
    {
      title: 'Simple Process',
      description: 'Clear step-by-step guidance through every service'
    },
    {
      title: 'Expert Support',
      description: 'Dedicated support team ready to help you'
    }
  ]

  return (
    <main className="home">
      <section className="hero">
        <div className="hero-content">
          <h1>Welcome to Civic Services</h1>
          <p>Your gateway to efficient government services</p>
          <Link to="/services" className="btn-primary">
            Explore Services
          </Link>
        </div>
        <div className="hero-background"></div>
      </section>

      <section className="highlights">
        <div className="container">
          <div className="highlights-grid">
            {highlights.map(item => (
              <div key={item.title} className="highlight-card">
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="services-overview" id="services">
        <div className="container">
          <div className="section-header">
            <h2>Our Services</h2>
            <p>Access a wide range of government services online</p>
          </div>

          <div className="services-grid">
            {services.map(service => (
              <div key={service.id} className="service-card">
                <div className="service-icon">{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
                <Link to={service.path} className="service-link">
                  Learn more →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Need Help?</h2>
            <p>Our support team is available to assist you with any questions about our services.</p>
            <div className="cta-buttons">
              <Link to="/contact" className="btn-primary">
                Contact Us
              </Link>
              <a href="#faq" className="btn-secondary">
                View FAQ
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
