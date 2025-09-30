import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

const Paywall = () => {
  const navigate = useNavigate();
  // We'll need updateUserCredits from the context eventually
  const { authToken, updateUserCredits } = useAuth();
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleConfirmPayment = async (e) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      setError('Please enter your M-Pesa transaction ID.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('Verifying your payment... This will take about 10 seconds.');

    try {
      // Use the environment variable for the production API URL
      const apiUrl = `${process.env.REACT_APP_API_URL}/api/manual-payment-confirm/`;
      
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ transaction_id: transactionId }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessage('Success! Credits have been added to your account.');

        // Update the global state with the new credit balance from the backend
        if (updateUserCredits) {
          updateUserCredits(data.new_credits);
        }
        
        setTimeout(() => {
          navigate('/select-template');
        }, 2000); // Wait 2 seconds so the user can see the success message
      } else {
        const errorData = await res.json();
        setError(errorData.error || 'Something went wrong. Please check the ID and try again.');
        setLoading(false);
        setMessage('');
      }
    } catch (err) {
      setError('A network error occurred. Please check your connection and try again.');
      setLoading(false);
      setMessage('');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center bg-gray-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2 text-gray-800">Buy Credits</h1>
        <p className="mb-6 text-gray-600">
          Get <strong>300 credits</strong> to download your resumes.
        </p>

        <div className="text-left bg-gray-100 p-4 rounded-lg mb-6 border border-gray-200">
            <h2 className="font-bold text-lg mb-2">Payment Instructions</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
                <li>Go to your M-Pesa Menu</li>
                <li>Select "Lipa na M-Pesa"</li>
                <li>Select "Mpesa Till"</li>
                <li>Enter Till Number: <strong>9329169</strong></li>
                <li>Enter Amount: <strong>300</strong></li>
                <li>Enter your M-Pesa PIN and confirm.</li>
                <li>Copy the transaction ID (e.g., QJ25XXXXXX) and paste it below.</li>
            </ol>
        </div>
        
        {message && <p className="text-green-600 mb-4">{message}</p>}
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        <form onSubmit={handleConfirmPayment}>
          <input
            type="text"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
            placeholder="Paste M-Pesa Transaction ID here"
            required
            className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-6 py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition w-full disabled:opacity-50 disabled:cursor-wait"
          >
            {loading ? 'Confirming...' : 'Confirm Payment'}
          </button>
        </form>
        <div className="mt-4">
            <Link to="/select-template" className="text-sm text-gray-500 hover:underline">
                Skip for now, I'll pay later
            </Link>
        </div>
      </div>
    </div>
  );
};

export default Paywall;