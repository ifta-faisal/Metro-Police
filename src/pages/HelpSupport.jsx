import React from 'react';
import './HelpSupport.css';

export default function HelpSupport() {
  return (
    <main className="help-page">
      <section className="page-hero">
        <div className="container">
          <h1>Help & Support</h1>
          <p>Need assistance? Our support team is here to help you with any queries.</p>
        </div>
      </section>

      <section className="help-section">
        <div className="container">
          <h2>How Can We Help?</h2>
          <p>If you are experiencing issues with our services or have questions, please explore the options below:</p>

          <div className="help-cards">
            <div className="help-card">
              <h3>Technical Support</h3>
              <p>For any technical issues, errors, or bugs on our website or portal, contact our technical team at <a href="mailto:techsupport@metropolice.gov.bd">techsupport@metropolice.gov.bd</a>.</p>
            </div>

            <div className="help-card">
              <h3>Account & Login</h3>
              <p>For help with creating accounts, login issues, or password resets, reach us at <a href="mailto:support@metropolice.gov.bd">support@metropolice.gov.bd</a>.</p>
            </div>

            <div className="help-card">
              <h3>General Inquiries</h3>
              <p>For questions about our services, applications, or policies, contact <a href="mailto:info@metropolice.gov.bd">info@metropolice.gov.bd</a> or call 01799999999.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
