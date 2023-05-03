import axios from 'axios';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import frederickLogo from '../images/frederick-university-logo.png';

const RegisterForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await axios.post('http://localhost:5001/api/auth/register', { email, password });
      setMessage(response.data.message);
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.message);
      } else {
        setMessage('Error registering user');
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <img
        src={frederickLogo}
        alt="Frederick University Logo"
        className="w-48 mt-6 ml-6"
      />
      <div className="bg-white h-2/3 w-full">
        <div className="flex justify-center">
          <div className="bg-white py-12 px-20 rounded-lg shadow-xl mt-12 w-120">
            <h1 className="text-3xl font-semibold mb-4">Register</h1>
            <p className="text-base mb-4">
              If you already have an account,{' '}
              <Link to="/login" className="text-blue-600">
                Login here!
              </Link>
            </p>
            <div className="w-full">
              <form onSubmit={handleSubmit} className="space-y-2">
                <div>
                  <label htmlFor="email" className="block text-gray-700 font-semibold py-2">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-3 py-2 mb-4 placeholder-gray-500 border border-gray-300 rounded-md focus:outline-none focus:border-blue-400"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-gray-700 font-semibold py-2">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2 mb-4 placeholder-gray-500 border border-gray-300 rounded-md focus:outline-none focus:border-blue-400"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-blue-700 text-white font-semibold rounded-md hover:bg-blue-800 transition duration-200"
                >
                  Register
                </button>
              </form>
              {message && (
            <div className="mt-4 text-center">
              <div
                className={`text-center max-w-sm mx-auto ${
                  message.startsWith('User registered successfully')
                    ? 'text-green-600'
                    : 'text-red-500'
                }`}
              >
                {message.startsWith('User registered successfully')
                  ? message.split('. ').map((line, index) => (
                      <React.Fragment key={index}>
                        {line}
                        {index < message.split('. ').length - 1 ? <br /> : null}
                      </React.Fragment>
                    ))
                  : message}
              </div>
            </div>
              )}

            </div>
          </div>
        </div>
      </div>
      <div className="bg-blue-800 w-full h-1/3"></div>
    </div>
  );
};

export default RegisterForm;
