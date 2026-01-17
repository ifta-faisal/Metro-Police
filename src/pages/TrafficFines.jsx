// Traffic Fine Check & Payment
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './TrafficFines.css';

export default function TrafficFines() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [vehicleNumber, setVehicleNumber] = useState('');
  const [fines, setFines] = useState([]);
  const [myFines, setMyFines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const checkFines = async () => {
    if (!vehicleNumber) {
      setMessage('Please enter vehicle number');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      const res = await api.post('/traffic-fines/check', {
        vehicle_number: vehicleNumber
      });
      setFines(res.data.fines || []);
      if (res.data.fines.length === 0) {
        setMessage('No pending fines found for this vehicle');
      }
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error checking fines');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyFines = async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const res = await api.get('/traffic-fines/my-fines');
      setMyFines(res.data.fines || []);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error fetching fines');
    } finally {
      setLoading(false);
    }
  };

  // 🔐 PROTECTED PAYMENT (REDIRECT TO PAYMENT PAGE)
  const payFine = (fine) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    navigate('/payment-method', {
      state: { fine }
    });
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMyFines();
    }
  }, [isAuthenticated]);

  return (
    <div className="traffic-fines">
      <h1>Traffic Fine Check & Payment</h1>

      {/* CHECK FINES (PUBLIC) */}
      <div className="fine-check-section">
        <h2>Check Fines by Vehicle Number</h2>

        <div className="check-form">
          <input
            type="text"
            placeholder="Enter vehicle number (e.g., DHAKA-12345)"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value)}
          />
          <button onClick={checkFines} disabled={loading}>
            {loading ? 'Checking...' : 'Check Fines'}
          </button>
        </div>

        {message && <div className="message">{message}</div>}

        {fines.length > 0 && (
          <div className="fines-list">
            <h3>Pending Fines</h3>
            {fines.map((fine) => (
              <div key={fine.id} className="fine-card">
                <div className="fine-info">
                  <p><strong>Violation:</strong> {fine.violation_type}</p>
                  <p><strong>Location:</strong> {fine.violation_location}</p>
                  <p><strong>Date:</strong> {new Date(fine.violation_date).toLocaleDateString()}</p>
                  <p><strong>Amount:</strong> ৳{fine.fine_amount}</p>
                </div>

                {fine.status === 'pending' && (
                  <button
                    onClick={() => payFine(fine)}
                    className="pay-btn"
                  >
                    Pay Now
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MY FINES (AUTH ONLY) */}
      {isAuthenticated && (
        <div className="my-fines-section">
          <h2>My Fines</h2>
          <button onClick={fetchMyFines} className="refresh-btn">
            Refresh
          </button>

          {myFines.length > 0 ? (
            <div className="fines-list">
              {myFines.map((fine) => (
                <div key={fine.id} className={`fine-card ${fine.status}`}>
                  <div className="fine-info">
                    <p><strong>Vehicle:</strong> {fine.vehicle_number}</p>
                    <p><strong>Violation:</strong> {fine.violation_type}</p>
                    <p><strong>Location:</strong> {fine.violation_location}</p>
                    <p><strong>Date:</strong> {new Date(fine.violation_date).toLocaleDateString()}</p>
                    <p><strong>Amount:</strong> ৳{fine.fine_amount}</p>
                    <p>
                      <strong>Status:</strong>{' '}
                      <span className={`status ${fine.status}`}>
                        {fine.status}
                      </span>
                    </p>
                    {fine.payment_transaction_id && (
                      <p>
                        <strong>Transaction ID:</strong> {fine.payment_transaction_id}
                      </p>
                    )}
                  </div>

                  {fine.status === 'pending' && (
                    <button
                      onClick={() => payFine(fine)}
                      className="pay-btn"
                    >
                      Pay Now
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p>No fines found</p>
          )}
        </div>
      )}
    </div>
  );
}
