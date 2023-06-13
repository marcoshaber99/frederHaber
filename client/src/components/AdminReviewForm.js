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
  <form onSubmit={handleSubmit} className="max-w-lg mx-auto my-10 space-y-4">
    <div>
      <label htmlFor="percentage" className="block text-sm font-medium text-gray-700">Percentage *</label>
      <input id="percentage" type="number" name="percentage" value={formValues.percentage} onChange={handleAdminChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" required/>
    </div>
    <div>
      <label htmlFor="scholarshipCategory" className="block text-sm font-medium text-gray-700">Scholarship Category *</label>
      <select id="scholarshipCategory" name="scholarshipCategory" value={formValues.scholarshipCategory} onChange={handleAdminChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" required>
        <option value="">Select category</option>
        <option value="A">A</option>
        <option value="B">B</option>
        <option value="C">C</option>
        <option value="D">D</option>
      </select>
    </div>
    <div>
      <label htmlFor="otherScholarship" className="block text-sm font-medium text-gray-700">Other Scholarship</label>
      <select id="otherScholarship" name="otherScholarship" value={formValues.otherScholarship} onChange={handleAdminChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
        <option value="">Select</option>
        <option value="YES">Yes</option>
        <option value="NO">No</option>
      </select>
    </div>
    {formValues.otherScholarship === 'YES' && (
      <div>
        <label htmlFor="otherScholarshipPercentage" className="block text-sm font-medium text-gray-700">Other Scholarship Percentage *</label>
        <input id="otherScholarshipPercentage" type="number" name="otherScholarshipPercentage" value={formValues.otherScholarshipPercentage} onChange={handleAdminChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" required/>
      </div>
    )}
    <div>
      <label htmlFor="adminFullName" className="block text-sm font-medium text-gray-700">Admin Full Name *</label>
      <input id="adminFullName" type="text" name="adminFullName" value={formValues.adminFullName} onChange={handleAdminChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" required/>
    </div>
    <div>
      <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date *</label>
      <input id="date" type="date" name="date" value={formValues.date} onChange={handleAdminChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" required/>
    </div>
    <div>
      <label htmlFor="comments" className="block text-sm font-medium text-gray-700">Comments</label>
      <textarea id="comments" name="comments" value={formValues.comments} onChange={handleAdminChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50" rows="3"></textarea>
    </div>
    <button type="submit" className="w-full px-3 py-2 text-white bg-blue-500 rounded hover:bg-blue-600">Submit</button>
  </form>
);







};

export default AdminReviewForm;

