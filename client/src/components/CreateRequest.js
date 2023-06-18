import axios from 'axios';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CreateRequest = () => {
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState({
    first_name: '',
    last_name: '',
    sport: '',
    description: '',
    government_id: '',
    registration_number: '',
    phone_number: '',
    course_title: '',
    academic_year: '',
    education_level: '',
    city: '',
  });
  const [formStatus, setFormStatus] = useState('draft');
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchLatestRequestStatus = async () => {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/scholarship/get-latest-request-status', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      setFormStatus(response.data.status);
    };

    fetchLatestRequestStatus();
  }, []);

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
    if (!formValues.description || formValues.description.length > 200) {
      errors.description = 'Description is required and should not be more than 200 characters';
    }

    if (!formValues.government_id || isNaN(formValues.government_id)) {
      errors.government_id = 'Government ID is required and should be a numeric value';
    }
    if (formValues.registration_number && (isNaN(formValues.registration_number) || formValues.registration_number.toString().length !== 5)) {
      errors.registration_number = 'Registration number should be a 5 digit numeric value';
    }
    
    if (!formValues.phone_number || isNaN(formValues.phone_number)) {
      errors.phone_number = 'Phone number is required and should be a numeric value';
    }
    if (!formValues.course_title || formValues.course_title.length > 55) {
      errors.course_title = 'Course title is required and should not be more than 55 characters';
    }
    if (!formValues.academic_year || isNaN(formValues.academic_year) || formValues.academic_year < 1 || formValues.academic_year > 4) {
      errors.academic_year = 'Academic year is required and should be a numeric value between 1 and 4';
    }
    if (!formValues.education_level || formValues.education_level === 'Select education level') {
      errors.education_level = 'Education level is required';
    }
    if (!formValues.city || formValues.city === 'Select city') {
      errors.city = 'City is required';
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

  if (formStatus === 'submitted' || formStatus === 'processing') {
    toast.error('You cannot submit a new request while your previous request is still being processed.');
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
      toast.success('Scholarship request saved as a draft successfully');
      setTimeout(() => {
        navigate('/student-dashboard/view-requests');
      }, 2000); // delay of 2 seconds
    } else {
      setFormStatus('submitted');
      toast.success('Scholarship request created successfully');
      setTimeout(() => {
        navigate('/student-dashboard/view-requests');
      }, 2000); // delay of 2 seconds
    }
  } catch (error) {
    if (error.response) {
      if (error.response.data.errors) {
        setErrors(error.response.data.errors);
        toast.error('Form errors occurred');
      } else {
        toast.error(error.response.data.message);
      }
    } else {
      toast.error('Error submitting scholarship request');
    }
  }
};



  return (
    <div className="max-w-lg mx-auto mt-10 ml-0">
          <ToastContainer />

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

        {/* For Government ID */}
        <div className="flex flex-col">
          <label htmlFor="government_id" className="text-sm font-medium mb-1">
            Government ID:
          </label>
          <input
            type="text"
            id="government_id"
            name="government_id"
            value={formValues.government_id}
            onChange={handleChange}
            className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-indigo-500"
          />
        </div>
        {errors.government_id && (
          <p className="text-red-500 text-sm">{errors.government_id}</p>
        )}

        <div className="flex flex-col">
          <label htmlFor="registration_number" className="text-sm font-medium mb-1">
            Registration Number:
          </label>
          <input
            type="text"
            id="registration_number"
            name="registration_number"
            value={formValues.registration_number}
            onChange={handleChange}
            className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-indigo-500"
          />
        </div>
        {errors.registration_number && (
          <p className="text-red-500 text-sm">{errors.registration_number}</p>
        )}

          <div className="flex flex-col">
          <label htmlFor="phone_number" className="text-sm font-medium mb-1">
            Phone Number:
          </label>
          <input
            type="tel"
            id="phone_number"
            name="phone_number"
            value={formValues.phone_number}
            onChange={handleChange}
            className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-indigo-500"
          />
          </div>
          {errors.phone_number && (
            <p className="text-red-500 text-sm">{errors.phone_number}</p>
          )}

          <div className="flex flex-col">
            <label htmlFor="course_title" className="text-sm font-medium mb-1">
              Course Title:
            </label>
            <input
              type="text"
              id="course_title"
              name="course_title"
              value={formValues.course_title}
              onChange={handleChange}
              className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-indigo-500"
            />
            </div>
            {errors.course_title && (
              <p className="text-red-500 text-sm">{errors.course_title}</p>
            )}

            <div className="flex flex-col">
              <label htmlFor="academic_year" className="text-sm font-medium mb-1">
                Academic Year:
              </label>
              <input
                type="number"
                id="academic_year"
                name="academic_year"
                value={formValues.academic_year}
                onChange={handleChange}
                className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-indigo-500"
              />
              </div>
              {errors.academic_year && (
                <p className="text-red-500 text-sm">{errors.academic_year}</p>
              )}

              <div className="flex flex-col">
                        <label htmlFor="education_level" className="text-sm font-medium mb-1">
                          Education Level:
                        </label>
                        <select
                          id="education_level"
                          name="education_level"
                          value={formValues.education_level}
                          onChange={handleChange}
                          className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-indigo-500"
                        >
                          <option value="">Select education level</option>
                          <option value="undergraduate">Undergraduate</option>
                          <option value="postgraduate">Postgraduate</option>
                        </select>
                      </div>
                      {errors.education_level && (
                        <p className="text-red-500 text-sm">{errors.education_level}</p>
                      )}
         <div className="flex flex-col">
          <label htmlFor="city" className="text-sm font-medium mb-1">
            City:
          </label>
          <select
            id="city"
            name="city"
            value={formValues.city}
            onChange={handleChange}
            className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-indigo-500"
          >
            <option value="">Select city</option>
            <option value="Limassol">Limassol</option>
            <option value="Nicosia">Nicosia</option>
          </select>
        </div>
        {errors.city && (
          <p className="text-red-500 text-sm">{errors.city}</p>
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
            disabled={formStatus === 'submitted'}
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

