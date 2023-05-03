import React from 'react';
import axios from 'axios';

const RoleSelection = ({ email, onSuccess }) => {
  const handleRoleSelection = async (role) => {
    try {
      const token = localStorage.getItem('token'); 
      console.log({ email, role }); 

      const response = await axios.post('http://localhost:5001/api/auth/role-selection', { email, role }, {
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      });
      if (response.status === 200) {
        localStorage.setItem('userRole', role);
        onSuccess(role);
      } else {
        throw new Error('Error updating user role');
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Select Your Role</h2>
      <button
        onClick={() => handleRoleSelection('admin')}
        className="mr-4 py-2 px-6 bg-blue-500 text-white font-semibold rounded-md"
      >
        Admin
      </button>
      <button
        onClick={() => handleRoleSelection('manager')}
        className="py-2 px-6 bg-blue-500 text-white font-semibold rounded-md"
      >
        Manager
      </button>
    </div>
  );
};

export default RoleSelection;
