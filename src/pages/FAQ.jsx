import './FAQ.css';

export default function FAQ() {
  const faqs = [
    {
      question: "How can I apply for a police certificate?",
      answer: "You can apply for a police certificate online through our 'Certificates' service. Simply log in and follow the instructions."
    },
    {
      question: "How do I pay my fines online?",
      answer: "Go to the 'Payments' section and select the type of fine. You can pay securely using your card."
    },
    {
      question: "How do I report a missing person?",
      answer: "Use the 'Reports & Records' service to file a missing person report. Our officers will review it promptly."
    },
    {
      question: "Can I track the status of my application?",
      answer: "Yes, you can track the status of all submitted applications in the 'Inquiries' section after logging in."
    },
    {
      question: "Who can I contact for support?",
      answer: "You can reach our support team through the 'Contact Us' page for any assistance with services."
    }
  ];

  return (
    <div className="faq-page">
      {/* HERO SECTION */}
      <section className="faq-hero">
        <h1>Frequent Questions</h1>
        <p>Find answers to common questions about Metro-Police services</p>
      </section>

      {/* FAQ SECTION */}
      <section className="faq-section">
        <div className="container">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-card">
              <div className="faq-question">{faq.question}</div>
              <div className="faq-answer">{faq.answer}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
