import React from 'react';
import './TermsConditions.css';

export default function TermsConditions() {
  return (
    <main className="terms-page">
      <section className="page-hero">
        <div className="container">
          <h1>Terms & Conditions</h1>
          <p>By using Metro-Police services, you agree to the following terms and conditions.</p>
        </div>
      </section>

      <section className="terms-section">
        <div className="container">
          <h2>Use of Services</h2>
          <p>All services provided by Metro-Police must be used lawfully and responsibly. Unauthorized access or misuse may result in legal action.</p>

          <h2>Account Responsibility</h2>
          <p>Users are responsible for maintaining the confidentiality of their account credentials. Metro-Police is not liable for any loss due to unauthorized access.</p>

          <h2>Service Availability</h2>
          <p>We strive to provide uninterrupted services, but cannot guarantee 100% uptime. Scheduled maintenance may occur periodically.</p>

          <h2>Limitation of Liability</h2>
          <p>Metro-Police is not liable for any indirect or consequential damages resulting from the use of our services.</p>

          <h2>Changes to Terms</h2>
          <p>We may update our terms from time to time. Users are advised to review them periodically.</p>
        </div>
      </section>
    </main>
  )
}
