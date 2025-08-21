import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const Paywall = () => {
  const navigate = useNavigate();
  const { authToken, setPremium } = useAuth();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(
    'Unlock all templates and premium features with a one-time payment.'
  );

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('Sending payment request to your phone...');

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/initiate-mpesa/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ phone_number: phone }),
      });

      if (res.ok) {
        setMessage('Success! Please enter your M-Pesa PIN on your phone to complete the payment.');
        // In a production app, you would start checking a payment status endpoint here.
        // For this example, we'll simulate a successful payment after a short delay.
        setTimeout(() => {
            setPremium(true);
            localStorage.setItem('premium', 'true');
            navigate('/select-template');
        }, 15000); // Simulate a 15-second wait for the user to enter their PIN
      } else {
        const errorData = await res.json();
        setMessage(`Error: ${errorData.detail || errorData.error || 'Something went wrong.'}`);
        setLoading(false);
      }
    } catch (err) {
      setMessage('A network error occurred. Please check your connection and try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen px-4 text-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-sm">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Upgrade to Premium</h1>
        <p className="mb-6 text-gray-600">{message}</p>
        
        <form onSubmit={handlePayment}>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 254712345678"
            required
            className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition w-full disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Pay with M-Pesa'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Paywall;