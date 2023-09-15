import React, { useState } from 'react';
import axios from 'axios';
import { ExclamationIcon } from '@heroicons/react/solid';

const RoleSelection = ({ email, onSuccess }) => {
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [pendingRole, setPendingRole] = useState(null);

  const handleRoleSelection = async () => {
    try {
      setConfirmModalOpen(false);
      const token = localStorage.getItem('token');
      
      const response = await axios.post('http://localhost:5001/api/auth/role-selection', { email, role: pendingRole }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.status === 200) {
        localStorage.setItem('userRole', pendingRole);
        onSuccess(pendingRole);
      } else {
        throw new Error('Error updating user role');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const openModal = (role) => {
    setPendingRole(role);
    setConfirmModalOpen(true);
  }

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Select Your Role</h2>
      <button
        onClick={() => openModal('admin')}
        className="mr-4 py-2 px-6 bg-blue-500 text-white font-semibold rounded-md"
      >
        Admin
      </button>
      <button
        onClick={() => openModal('manager')}
        className="py-2 px-6 bg-blue-500 text-white font-semibold rounded-md"
      >
        Manager
      </button>

      {confirmModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
        <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                  <ExclamationIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Confirmation
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to select this role? This action is final.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button type="button" onClick={handleRoleSelection} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
                Confirm
              </button>
              <button type="button" onClick={() => setConfirmModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default RoleSelection;
