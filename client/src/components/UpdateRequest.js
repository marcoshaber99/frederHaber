import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Oval } from 'react-loader-spinner';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { translations, useLanguage } from '../contexts/LanguageContext';
import { useRequest } from '../contexts/RequestContext';

const UpdateRequest = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formValues, setFormValues] = useState({
    first_name: '',
    last_name: '',
    sport: '',
    description: '',
    government_id: '',
    registration_number: '',
    phone_number: '',
    course_title: '',
    education_level: '',
    city: '',
    status: '',
  });
  const [yearOfAdmission, setYearOfAdmission] = useState(null);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [file, setFile] = useState(null);
  const { updateScholarshipRequest, fetchLatestRequestStatus } = useRequest();
  const [isLoading, setIsLoading] = useState(false);
  const { language } = useLanguage();

  const handleChange = (e) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const validateForm = () => {
    const errors = {};
    if (!formValues.first_name) {
      errors.first_name = `${translations[language].firstName} ${translations[language].isRequired}`;
    }
    if (!formValues.last_name) {
      errors.last_name = `${translations[language].lastName} ${translations[language].isRequired}`;
    }
    if (!formValues.sport) {
      errors.sport = `${translations[language].sport} ${translations[language].isRequired}`;
    }
    if (!formValues.description || formValues.description.length > 200) {
      errors.description = `${translations[language].description} ${translations[language].isRequired} & ${translations[language].maxLength.replace('{length}', '200')}`;
    }
    if (!formValues.government_id || isNaN(formValues.government_id)) {
      errors.government_id = `${translations[language].governmentId} ${translations[language].isRequired} & ${translations[language].shouldBeNumeric}`;
    }
    if (formValues.registration_number && (isNaN(formValues.registration_number))) {
      errors.registration_number = `${translations[language].registrationNumber} ${translations[language].shouldBeNumeric}`;
    }
    if (!formValues.phone_number || isNaN(formValues.phone_number)) {
      errors.phone_number = `${translations[language].phoneNumber} ${translations[language].isRequired} & ${translations[language].shouldBeNumeric}`;
    }
    if (!formValues.course_title || formValues.course_title.length > 55) {
      errors.course_title = `${translations[language].courseTitle} ${translations[language].isRequired} & ${translations[language].maxLength.replace('{length}', '55')}`;
    }
    if (!yearOfAdmission || yearOfAdmission.getFullYear() < 1950 || yearOfAdmission.getFullYear() > new Date().getFullYear()) {
      errors.year_of_admission = `${translations[language].yearOfAdmission} ${translations[language].isRequired} & ${translations[language].betweenNumeric.replace('{min}', '1950').replace('{max}', new Date().getFullYear().toString())}`;
    }
    if (!formValues.education_level || formValues.education_level === 'Select education level') {
      errors.education_level = `${translations[language].educationLevel} ${translations[language].isRequired}`;
    }
    if (!formValues.city || formValues.city === 'Select city') {
      errors.city = `${translations[language].city} ${translations[language].isRequired}`;
    }
    if (!file) {
      errors.file = 'File is required';
    }
    return errors;
  };

  const handleUpdate = async (e, status) => {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }
    setMessage('');
    const formData = new FormData();
    formValues.status = status;
    for (const key in formValues) {
      formData.append(key, formValues[key]);
    }
    formData.append('year_of_admission', yearOfAdmission ? yearOfAdmission.getFullYear().toString() : '');
    formData.append('file', file);
    setIsLoading(true);
    try {
      const { status: responseStatus } = await updateScholarshipRequest(id, formData);
      if (responseStatus === 200) {
        if (status === 'draft') {
          toast.success('Scholarship request updated and saved as a draft successfully');
        } else {
          toast.success('Scholarship request updated successfully');
        }
        setTimeout(async () => {
          await fetchLatestRequestStatus();
          navigate('/student-dashboard/view-requests');
        }, 2000);
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
        toast.error('Error updating scholarship request');
      }
    }
    setIsLoading(false);
  };

  const fetchRequest = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5001/api/scholarship/get-request/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const {
        first_name,
        last_name,
        sport,
        description,
        government_id,
        registration_number,
        phone_number,
        course_title,
        year_of_admission,
        education_level,
        city,
        status,
      } = response.data;
      setFormValues({
        first_name,
        last_name,
        sport,
        description,
        government_id,
        registration_number,
        phone_number,
        course_title,
        education_level,
        city,
        status,
      });
      setYearOfAdmission(new Date(year_of_admission));
      setLoading(false);
    } catch (error) {
      console.error("Error loading request: ", error);
      setFetchError(error);
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRequest();
  }, [id, fetchRequest]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (fetchError) {
    return (
      <div>
        <p>Error loading request details: {fetchError.message}</p>
        <button onClick={fetchRequest}>Retry</button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto mt-10 ml-16">
    <ToastContainer />
      <h2 className="text-2xl font-semibold mb-6">Update Scholarship Request</h2>
      <form className="space-y-4" onSubmit={handleUpdate}>
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
          <label htmlFor="year_of_admission" className="text-sm font-medium mb-1">
            Year Of Admission
          </label>
          <DatePicker
            selected={yearOfAdmission}
            onChange={(date) => setYearOfAdmission(date)}
            dateFormat="yyyy"
            showYearPicker
            className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-indigo-500 w-full"
            placeholderText={translations[language].selectYear}
          />
          
        </div>
        {errors.year_of_admission && (
          <p className="text-red-500 text-sm">{errors.year_of_admission}</p>
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



        <div className="flex flex-col">
          <label htmlFor="file" className="text-sm font-medium mb-1">
            Upload File:
          </label>
          <input
            id="file"
            name="file"
            type="file"
            accept=".pdf,.png,.jpg"
            onChange={handleFileChange}
          />
        </div>
        {errors.file && (
          <p className="text-red-500 text-sm">{errors.file}</p>
        )}


<div className="flex space-x-4">
          <div className="relative flex items-center">
            <div 
              className={`absolute left-[-40px] flex items-center ${isLoading ? 'visible' : 'invisible'}`}>
              <Oval type="Puff" color="#0000FF" height={30} width={30} />
            </div>
            <button
              type="submit"
              onClick={(e) => handleUpdate(e, 'submitted')}
              className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-900 transition duration-200"
              disabled={isLoading} // Disable the button while loading
            >
              {isLoading ? 'Submitting...' : 'Submit'}
            </button>
          </div>
          <button
            type="button"
            onClick={(e) => handleUpdate(e, 'draft')}
            className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-800 transition duration-200"
          >
            Save as Draft
          </button>
        </div>
      </form>
      {message && (
        <p
          className={`mt-4 ${
            message.startsWith('Scholarship request updated successfully') || message.startsWith('Scholarship request saved as a draft successfully')
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

export default UpdateRequest;
