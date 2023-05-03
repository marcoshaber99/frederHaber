import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import './ActivateAccount.css';

const ActivateAccount = () => {
  const { token } = useParams();

  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const activateAccount = async () => {
      try {
        const response = await axios.post('http://localhost:5001/api/auth/activate', { token });
        setMessage(response.data.message);
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full sm:w-96">
        <h1 className="text-3xl font-bold mb-4">Account Activation</h1>
        {message ? (
          <p className="text-lg">{message}</p>
        ) : (
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div>
        )}
      </div>
    </div>
  );
};

export default ActivateAccount;
