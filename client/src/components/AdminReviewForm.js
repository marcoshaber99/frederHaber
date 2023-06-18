import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AdminReviewForm = (props) => {
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState({
    percentage: '',
    scholarshipCategory: '',
    otherScholarship: '',
    otherScholarshipPercentage: '',
    adminFullName: '',
    date: '',
    comments: '',
  });
  const [errors, setErrors] = useState({});
  const [requestId, setRequestId] = useState(props.requestId);


  const handleAdminChange = (e) => {
    setFormValues({
      ...formValues,
      [e.target.name]: e.target.value,
    });
  };
  

  const validateForm = () => {
    const errors = {};

    if (!formValues.percentage || isNaN(formValues.percentage) || formValues.percentage < 1 || formValues.percentage > 100) {
      errors.percentage = 'Percentage is required and should be a numeric value between 1 and 100';
    }
    if (!formValues.scholarshipCategory || formValues.scholarshipCategory === 'Select category') {
      errors.scholarshipCategory = 'Scholarship Category is required';
    }
    if (!formValues.otherScholarship || (formValues.otherScholarship !== 'YES' && formValues.otherScholarship !== 'NO')) {
      errors.otherScholarship = 'Field for other scholarship is required and should be either YES or NO';
    }
    if (formValues.otherScholarship === 'YES' && (!formValues.otherScholarshipPercentage || isNaN(formValues.otherScholarshipPercentage) || formValues.otherScholarshipPercentage < 1 || formValues.otherScholarshipPercentage > 100)) {
      errors.otherScholarshipPercentage = 'If other scholarship is YES, percentage for other scholarship is required and should be a numeric value between 1 and 100';
    }
    if (!formValues.adminFullName || formValues.adminFullName.length > 100) {
      errors.adminFullName = 'Admin Full Name is required and should not be more than 100 characters';
    }
    if (!formValues.date || isNaN(Date.parse(formValues.date))) {
      errors.date = 'Date is required and should be a valid date';
    }
    if (!formValues.comments || formValues.comments.length > 500) {
      errors.comments = 'Comments are required and should not be more than 500 characters';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5001/api/scholarship/admin-review`,
        { ...formValues, requestId },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      

      toast.success('Review submitted successfully');
      setTimeout(() => {
        navigate('/admin-dashboard/open-requests');
      }, 2000); // delay of 2 seconds

    } catch (error) {
      console.log(error.response.data.errors)
      if (error.response) {
        if (error.response.data.errors) {
          setErrors(error.response.data.errors);
          toast.error('Form errors occurred');
        } else {
          toast.error(error.response.data.message);
        }
      } else if (error.request) {
        toast.error('Network error');
      } else {
        toast.error('An unknown error occurred');
      }
    }
  };


  return (
    <div className="max-w-6xl mx-auto p-5">
      <form onSubmit={handleSubmit} className="mx-auto space-y-4">
        {/* Percentage Input */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="percentage">
            Percentage *
          </label>
          <input 
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
            id="percentage" 
            type="number" 
            name="percentage"
            value={formValues.percentage} 
            onChange={handleAdminChange}
            required
          />
          {errors.percentage && (
            <p className="text-red-500 text-xs italic">{errors.percentage}</p>
          )}
        </div>
  
        {/* Scholarship Category Select */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="scholarshipCategory">
            Scholarship Category *
          </label>
          <select 
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
            id="scholarshipCategory"
            name="scholarshipCategory" 
            value={formValues.scholarshipCategory} 
            onChange={handleAdminChange}
            required
          >
            {/* Options */}
            <option value="">Select category</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>
          {errors.scholarshipCategory && (
            <p className="text-red-500 text-xs italic">{errors.scholarshipCategory}</p>
          )}
        </div>
  
        {/* Other Scholarship Select */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="otherScholarship">
            Other Scholarship
          </label>
          <select 
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
            id="otherScholarship" 
            name="otherScholarship" 
            value={formValues.otherScholarship} 
            onChange={handleAdminChange}
          >
            {/* Options */}
            <option value="">Select</option>
            <option value="YES">Yes</option>
            <option value="NO">No</option>
          </select>
          {errors.otherScholarship && (
            <p className="text-red-500 text-xs italic">{errors.otherScholarship}</p>
          )}
        </div>
  
        {/* Other Scholarship Percentage Input */}
        {formValues.otherScholarship === 'YES' && (
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="otherScholarshipPercentage">
              Other Scholarship Percentage *
            </label>
            <input 
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
              id="otherScholarshipPercentage" 
              type="number" 
              name="otherScholarshipPercentage"
              value={formValues.otherScholarshipPercentage} 
              onChange={handleAdminChange}
              required
            />
            {errors.otherScholarshipPercentage && (
              <p className="text-red-500 text-xs italic">{errors.otherScholarshipPercentage}</p>
            )}
          </div>
        )}
  
        {/* Admin Full Name Input */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="adminFullName">
            Admin Full Name *
          </label>
          <input 
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
            id="adminFullName" 
            type="text" 
            name="adminFullName"
            value={formValues.adminFullName} 
            onChange={handleAdminChange}
            required
          />
          {errors.adminFullName && (
            <p className="text-red-500 text-xs italic">{errors.adminFullName}</p>
          )}
        </div>
  
        {/* Date Input */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
            Date *
          </label>
          <input 
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
            id="date" 
            type="date" 
            name="date"
            value={formValues.date} 
            onChange={handleAdminChange}
            required
          />
          {errors.date && (
            <p className="text-red-500 text-xs italic">{errors.date}</p>
          )}
        </div>
  
        {/* Comments Textarea */}
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="comments">
            Comments
          </label>
          <textarea 
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" 
            id="comments" 
            name="comments"
            value={formValues.comments} 
            onChange={handleAdminChange}
            rows="3"
          />
          {errors.comments && (
            <p className="text-red-500 text-xs italic">{errors.comments}</p>
          )}
        </div>
  
        {/* Submit Button */}
        <div className="flex items-center justify-between">
          <button 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            type="submit"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
  

};

export default AdminReviewForm;

