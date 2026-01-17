import React from 'react';
import './PrivacyPolicy.css';

export default function PrivacyPolicy() {
  return (
    <main className="policy-page">
      <section className="page-hero">
        <div className="container">
          <h1>Privacy Policy</h1>
          <p>We respect your privacy and are committed to protecting your personal information.</p>
        </div>
      </section>

      <section className="policy-section">
        <div className="container">
          <h2>Information We Collect</h2>
          <p>We may collect personal information such as your name, email, phone number, and account details when you register or use our services.</p>

          <h2>How We Use Information</h2>
          <p>Your information is used to provide services, improve user experience, and communicate important updates or alerts.</p>

          <h2>Data Protection</h2>
          <p>We employ industry-standard measures to ensure your data is stored securely and not shared with unauthorized third parties.</p>

          <h2>Your Rights</h2>
          <p>You can request access to your personal data, request corrections, or delete your account at any time by contacting <a href="mailto:privacy@metropolice.gov.bd">privacy@metropolice.gov.bd</a>.</p>
        </div>
      </section>
    </main>
  )
}
