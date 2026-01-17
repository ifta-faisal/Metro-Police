import { useLocation, useNavigate } from 'react-router-dom'
import './PaymentMethod.css'

export default function PaymentMethod() {
  const navigate = useNavigate()
  const location = useLocation()
  const { fine } = location.state || {}

  if (!fine) {
    navigate('/traffic-fines')
    return null
  }

  const handleSelect = (method) => {
    alert(`Payment method selected: ${method}`)
    // later you will redirect to real gateway
  }

  return (
    <div className="payment-method">
      <h1>Select Payment Method</h1>

      <div className="fine-summary">
        <p><strong>Violation:</strong> {fine.violation_type}</p>
        <p><strong>Amount:</strong> ৳{fine.fine_amount}</p>
      </div>

      <div className="payment-section">
        <h2>Mobile Wallet</h2>
        <div className="payment-options">
          <button onClick={() => handleSelect('bKash')}>bKash</button>
          <button onClick={() => handleSelect('Nagad')}>Nagad</button>
          <button onClick={() => handleSelect('Rocket')}>Rocket</button>
        </div>
      </div>

      <div className="payment-section">
        <h2>Card</h2>
        <div className="payment-options">
          <button onClick={() => handleSelect('Card')}>
            Debit / Credit Card
          </button>
        </div>
      </div>
    </div>
  )
}
