import axios from 'axios';
import React, { useState } from 'react';

const CreateRequest = () => {
  const [formValues, setFormValues] = useState({
    first_name: '',
    last_name: '',
    sport: '',
    description: '',
  });
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    const errors = {};

    if (!formValues.first_name) {
      errors.first_name = 'First name is required';
    }
    if (!formValues.last_name) {
      errors.last_name = 'Last name is required';
    }
    if (!formValues.sport) {
      errors.sport = 'Sport is required';
    }
    if (!formValues.description) {
      errors.description = 'Description is required';
    }

    return errors;
  };

  const handleSubmit = async (e, status = 'submitted') => {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5001/api/scholarship/create-request`,
        { ...formValues, status },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (status === 'draft') {
        setMessage('Scholarship request saved as a draft successfully');
      } else {
        setMessage('Scholarship request created successfully');
      }
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.message);
      } else {
        setMessage('Error submitting scholarship request');
      }
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 ml-0">
      <h2 className="text-2xl font-semibold mb-6">Create Scholarship Request</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="flex flex-col">
          <label htmlFor="first_name" className="text-sm font-medium mb-1">
            First Name:
          </label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formValues.first_name}
            onChange={handleChange}
            className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-indigo-500"
          />
        </div>
        {errors.first_name && (
          <p className="text-red-500 text-sm">{errors.first_name}</p>
        )}

        <div className="flex flex-col">
          <label htmlFor="last_name" className="text-sm font-medium mb-1">
            Last Name:
          </label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={formValues.last_name}
            onChange={handleChange}
            className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-indigo-500"
          />
        </div>
        {errors.last_name && (
          <p className="text-red-500 text-sm">{errors.last_name}</p>
        )}

        <div className="flex flex-col">
        <label htmlFor="sport" className="text-sm font-medium mb-1">
            Sport:
          </label>
          <input
            type="text"
            id="sport"
            name="sport"
            value={formValues.sport}
            onChange={handleChange}
            className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-indigo-500"
          />
        </div>
        {errors.sport && (
          <p className="text-red-500 text-sm">{errors.sport}</p>
        )}

        <div className="flex flex-col">
          <label htmlFor="description" className="text-sm font-medium mb-1">
            Description:
          </label>
          <textarea
            id="description"
            name="description"
            value={formValues.description}
            onChange={handleChange}
            className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-indigo-500 h-32"
          />
        </div>
        {errors.description && (
          <p className="text-red-500 text-sm">{errors.description}</p>
        )}

        <div className="flex space-x-4">
          <button
            type="submit"
            onClick={(e) => handleSubmit(e, 'submitted')}
            className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-900 transition duration-200"
          >
            Submit
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, 'draft')}
            className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-800 transition duration-200"
          >
            Save as Draft
          </button>
        </div>
      </form>
      {message && (
        <p
          className={`mt-4 ${
            message.startsWith('Scholarship request created successfully') || message.startsWith('Scholarship request saved as a draft successfully')
              ? 'text-green-600'
              : 'text-red-500'
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
};

export default CreateRequest;

