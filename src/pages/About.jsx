import './About.css'

export default function About() {
  const values = [
    {
      title: 'Integrity',
      description: 'Operating with honesty and transparency in all our services'
    },
    {
      title: 'Efficiency',
      description: 'Streamlining processes to save you time and effort'
    },
    {
      title: 'Accessibility',
      description: 'Ensuring equitable access to services for all citizens'
    },
    {
      title: 'Innovation',
      description: 'Continuously improving through technology and feedback'
    }
  ]

  const stats = [
    { number: '500K+', label: 'Active Users' },
    { number: '50+', label: 'Services Available' },
    { number: '99.9%', label: 'Uptime' },
    { number: '24/7', label: 'Support' }
  ]

  return (
    <main className="about-page">
      <section className="page-hero">
        <div className="container">
          <h1>About Metro-Police Services</h1>
          <p>Transforming Police services for the digital age</p>
        </div>
      </section>

      <section className="about-content">
        <div className="container">
          <section className="mission-section">
            <h2>Our Mission</h2>
            <p>
              The Metro-Police Services Portal is dedicated to making police services more accessible,
              efficient, and user-friendly. We believe that every citizen deserves easy access to the
              services they need, without unnecessary bureaucracy or delays.
            </p>
            <p>
              Through innovation and technology, we're reimagining how police services are delivered,
              making it faster and simpler for you to apply for permits, pay bills, access records, and
              connect with police agencies.
            </p>
          </section>

          <section className="values-section">
            <h2>Our Values</h2>
            <div className="values-grid">
              {values.map((value, index) => (
                <div key={index} className="value-card">
                  <h3>{value.title}</h3>
                  <p>{value.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="stats-section">
            <h2>By the Numbers</h2>
            <div className="stats-grid">
              {stats.map((stat, index) => (
                <div key={index} className="stat-card">
                  <div className="stat-number">{stat.number}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="team-section">
            <h2>Why Choose Us</h2>
            <div className="features-grid">
              <div className="feature-item">
                <div className="feature-icon">🔒</div>
                <h3>Secure</h3>
                <p>Your data is protected with industry-leading encryption and security measures</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">⚡</div>
                <h3>Fast</h3>
                <p>Process applications and requests quickly with our optimized workflows</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">📱</div>
                <h3>Mobile-Friendly</h3>
                <p>Access services anytime, anywhere from your phone or computer</p>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🆘</div>
                <h3>Support</h3>
                <p>Expert support team ready to assist you with any questions</p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
