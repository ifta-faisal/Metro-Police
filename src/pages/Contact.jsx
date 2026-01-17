import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Contact.css'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    alert('Thank you for contacting us. We will respond shortly.')
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    })
  }

  const contactInfo = [
    {
      title: 'General Inquiries',
      phone: '01799999999',
      email: 'metropolice.gov.bd',
      hours: 'Sat - Fri: 24/7'
    },
    {
      title: 'Emergency Support',
      phone: '01799999999',
      email: 'metropolice.gov.bd',
      hours: '24/7'
    },
    {
      title: 'Technical Support',
      phone: '01799999999',
      email: 'metropolice.gov.bd',
      hours: 'Mon - Sat: 9:00 AM - 6:00 PM'
    }
  ]

  return (
    <main className="contact-page">
      <section className="page-hero">
        <div className="container">
          <h1>Contact Us</h1>
          <p>We're here to help. Get in touch with us today.</p>
        </div>
      </section>

      <section className="contact-section">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-form-wrapper">
              <h2>Send us a Message</h2>
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="phone">Phone</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject *</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                <button type="submit" className="submit-btn">
                  Send Message
                </button>
              </form>
            </div>

            <div className="contact-info-wrapper">
              <h2>Contact Information</h2>
              <div className="contact-info-cards">
                {contactInfo.map((info, index) => (
                  <div key={index} className="info-card">
                    <h3>{info.title}</h3>
                    <p><strong>Phone:</strong> <a href={`tel:${info.phone.replace(/[^\d]/g, '')}`}>{info.phone}</a></p>
                    <p><strong>Email:</strong> <a href={`mailto:${info.email}`}>{info.email}</a></p>
                    <p><strong>Hours:</strong> {info.hours}</p>
                  </div>
                ))}
              </div>

              <div className="faq-box">
                <h3>Frequently Asked Questions</h3>
                <p>Have questions? Check our FAQ section for quick answers.</p>
                {/* Updated link to FAQ page */}
                <Link to="/faq" className="faq-link">View FAQ</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
