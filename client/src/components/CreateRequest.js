import axios from 'axios';
import { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCity, FaFileAlt, FaGraduationCap, FaIdCard, FaPhoneAlt, FaRegCalendarAlt, FaUpload, FaUser } from 'react-icons/fa';
import { MdSports } from 'react-icons/md';
import { Oval } from 'react-loader-spinner';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { translations, useLanguage } from '../contexts/LanguageContext';
import { useRequest } from '../contexts/RequestContext';

const CreateRequest = () => {
  const navigate = useNavigate();
  const { fetchLatestRequestStatus } = useRequest();
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
  });
  const [yearOfAdmission, setYearOfAdmission] = useState(null);
  const [formStatus, setFormStatus] = useState('draft');
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { language, toggleLanguage } = useLanguage();
  const [isToggled, setIsToggled] = useState(language === 'en' ? false : true);
  

  useEffect(() => {
    fetchLatestRequestStatus();
  }, [fetchLatestRequestStatus]);

  const handleChange = (e) => {
    if (e.target.name !== 'year_of_admission') {
      setFormValues({ ...formValues, [e.target.name]: e.target.value });
    }
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
    if (formValues.description && formValues.description.length > 200) {
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

      //file upload
      if (!file) {
        errors.file = 'File is required';
      }

    return errors;
};



const ToggleButton = ({ isToggled, onToggle }) => {
  return (
    <div className="flex items-center space-x-2 cursor-pointer">
      <span className="text-sm font-bold text-gray-700 align-middle">EN</span>
      <div
        onClick={onToggle}
        className={`relative flex items-center w-16 h-8 rounded-full transition-all duration-300 ease-in-out ${isToggled ? 'bg-green-400' : 'bg-gray-300'}`}
      >
        <div
          className={`absolute w-8 h-8 rounded-full bg-white shadow-md transition-all duration-300 ease-in-out transform scale-100 ${isToggled ? 'translate-x-8 scale-110' : 'translate-x-0 scale-100'}`}
        />
        <div
          className={`absolute w-full h-full rounded-full transition-all duration-300 ease-in-out ${isToggled ? 'bg-green-300 opacity-50' : 'opacity-0'}`}
        />
      </div>
      <span className="text-sm font-bold text-gray-700 align-middle">GR</span>
    </div>
  );
};


const handleToggle = () => {
  setIsToggled(!isToggled);
  toggleLanguage();
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
  setIsLoading(true);

  try {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    for (const key in formValues) {
      formData.append(key, formValues[key]);
    }
    formData.append('year_of_admission', yearOfAdmission ? yearOfAdmission.getFullYear().toString() : '');
    formData.append('status', status);
    formData.append('file', file);

    await axios.post(
      `http://localhost:5001/api/scholarship/create-request`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (status === 'draft') {
      toast.success('Scholarship request saved as a draft successfully');
      setTimeout(() => {
        navigate('/student-dashboard/view-requests');
      }, 2000);
    } else {
      setFormStatus('submitted');
      toast.success('Scholarship request created successfully');
      setTimeout(() => {
        fetchLatestRequestStatus();
        navigate('/student-dashboard/view-requests');
      }, 2000);
    }
  } catch (error) {
    if (error.response && error.response.status === 403) {
      setMessage('Your session has expired. Please log in again.');
    } else {
      setMessage('An error occurred while creating the scholarship request. Please try again.');
    }
  } finally {
    setIsLoading(false);
  }
};

const handleFileChange = (e) => {
  setFile(e.target.files[0]);
};




  return (
    <div className="flex justify-center items-start mt-8 w-full">
    <div className="max-w-lg w-full">
    
      <ToastContainer />

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Create Scholarship Request</h2>
        <ToggleButton isToggled={isToggled} onToggle={handleToggle} />
      </div>



      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="flex flex-col">
          <label htmlFor="first_name" className="text-sm font-medium mb-1">
          {translations[language].firstName}:
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
          {translations[language].lastName}:
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
            {translations[language].governmentId}:
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
            {translations[language].registrationNumber}:
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
            {translations[language].phoneNumber}:
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
              {translations[language].courseTitle}:
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

      <div className="flex flex-col relative">
          <label htmlFor="year_of_admission" className="text-sm font-medium mb-1">
            {translations[language].yearOfAdmission}:
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
                          {translations[language].educationLevel}:
                        </label>
                        <select
                          id="education_level"
                          name="education_level"
                          value={formValues.education_level}
                          onChange={handleChange}
                          className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-indigo-500"
                        >
                          <option value="">{translations[language].selectEducationLevel}</option>
                          <option value="undergraduate">{translations[language].undergraduate}</option>
                          <option value="postgraduate">{translations[language].postgraduate}</option>
                        </select>
                      </div>
                      {errors.education_level && (
                        <p className="text-red-500 text-sm">{errors.education_level}</p>
                      )}
            <div className="flex flex-col">
              <label htmlFor="city" className="text-sm font-medium mb-1">
                {translations[language].city}:
              </label>
              <select
                id="city"
                name="city"
                value={formValues.city}
                onChange={handleChange}
                className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-indigo-500"
              >
                <option value="">{translations[language].selectCity}</option>
                <option value="Limassol">{translations[language].Limassol}</option>
                <option value="Nicosia">{translations[language].Nicosia}</option>
              </select>
            </div>
            {errors.city && (
              <p className="text-red-500 text-sm">{errors.city}</p>
            )}

            <div className="flex flex-col">
            <label htmlFor="sport" className="text-sm font-medium mb-1">
              {translations[language].sport}:
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
                {translations[language].description}:
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

<div className="flex flex-col space-y-2">
  <label htmlFor="file" className="text-sm font-medium mb-1">
    {translations[language].uploadFile}:
  </label>
  <div className="flex items-center justify-between bg-white p-4 border-2 border-gray-300 rounded-md">
    <div className="text-sm text-gray-500">
      {file ? file.name : "No file chosen"}
    </div>

    <label
      htmlFor="file"
      className="cursor-pointer bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-900 transition duration-200"
    >

      Select File
    </label>
    <input
      id="file"
      name="file"
      type="file"
      accept=".pdf,.png,.jpg"
      onChange={handleFileChange}
      className="hidden" // Hide the default file input
    />
  </div>
  {errors.file && <p className="text-red-500 text-sm">{errors.file}</p>}
  <span className="text-xs text-gray-500">Allowed file types: .pdf, .png, .jpg</span>
</div>


              <div className="flex space-x-4">
                  <div className="relative flex items-center">
                    <div 
                      className={`absolute left-[-40px] flex items-center ${isLoading ? 'visible' : 'invisible'}`}>
                      <Oval type="Puff" color="#0000FF" height={30} width={30} />
                    </div>
                    <button
                      type="submit"
                      onClick={(e) => handleSubmit(e, 'submitted')}
                      className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-900 transition duration-200"
                      disabled={formStatus === 'submitted' || isLoading} // disable the button while loading
                    >
                      {isLoading ?  `${translations[language].submit}...` : `${translations[language].submit}`}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => handleSubmit(e, 'draft')}
                    className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-800 transition duration-200"
                  >
                    {translations[language].saveAsDraft}
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
  </div>
);
};

export default CreateRequest;