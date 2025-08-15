import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const Paywall = () => {
  const navigate = useNavigate();
  const { authToken, setPremium } = useAuth(); // add setPremium from context

  const handlePayment = async () => {
    // 🧪 Simulate payment success — in real app this is called after a gateway redirect or callback
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/api/confirm-payment/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (res.ok) {
        // 🎉 Upgrade successful — update local state
        setPremium(true);
        localStorage.setItem('premium', 'true');
        navigate('/select-template');
      } else {
        alert('Payment succeeded but server failed to confirm.');
      }
    } catch (err) {
      console.error('Payment confirmation error:', err);
      alert('Something went wrong confirming payment.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen px-4 text-center">
      <h1 className="text-3xl font-bold mb-4">Upgrade to Premium</h1>
      <p className="mb-6 text-gray-700 max-w-md">
        Unlock access to all resume templates, PDF downloads, and advanced customization.
      </p>
      <button
        onClick={handlePayment}
        className="bg-green-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-green-700 transition"
      >
        Simulate Payment
      </button>
      <p className="mt-4 text-sm text-gray-500">
        You'll be redirected to a secure payment provider in production.
      </p>
    </div>
  );
};

export default Paywall;
