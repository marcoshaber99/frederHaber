import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import frederickLogo from '../images/frederick-university-logo.png';

const ActivateAccount = () => {
  const { token } = useParams();
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const activateAccount = async () => {
      try {
        const response = await axios.post('http://localhost:5001/api/auth/activate', { token });
        setMessage(response.data.message);
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error) {
        console.error(error);
        if (error.response) {
          setMessage(error.response.data.message);
        } else {
          setMessage('Error activating account');
        }
      }
    };

    if (token) {
      activateAccount();
    }
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center relative">
      <img
        src={frederickLogo}
        alt="Logo of Frederick University"
        className="absolute top-6 left-6 h-12"
      />
      <div className="bg-white p-8 rounded-lg shadow-md w-full sm:w-96 space-y-4">
        <h1 className="text-3xl font-bold text-center mb-4">Account Activation</h1>
        {message ? (
          <div className={`text-lg text-center p-4 rounded-md ${isSuccess ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
            {message}
            {isSuccess && <p className="mt-2 text-sm text-gray-500">Redirecting to login page...</p>}
            {isSuccess && (
              <svg className="animate-spin h-5 w-5 mx-auto mt-4 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3.02 7.938l1.98-1.647z"></path>
              </svg>
            )}
          </div>
        ) : (
          <div className="flex justify-center items-center">
            <svg className="animate-spin h-5 w-5 text-blue-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3.02 7.938l1.98-1.647z"></path>
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivateAccount;
