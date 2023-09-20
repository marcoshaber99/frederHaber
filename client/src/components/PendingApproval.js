import { css } from "@emotion/react";
import { ExclamationIcon } from '@heroicons/react/solid';
import axios from 'axios';
import { format } from 'date-fns';
import React, { useCallback, useEffect, useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import { MdGppGood } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import ClipLoader from "react-spinners/ClipLoader";

const PendingApproval = (props) => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editedRequest, setEditedRequest] = useState({ ...selectedRequest });
  const [managerComment, setManagerComment] = useState('');
  const [denyModalOpen, setDenyModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);

  

  const navigate = useNavigate();



  const override = css`
    display: inline-block;
    margin: 0 5px;
  `;

  const fetchPendingApprovalRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/scholarship/get-pending-approval', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      setRequests(response.data.requests);
    } catch (error) {
      console.error('Error fetching pending approval requests:', error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchPendingApprovalRequests();
  }, [fetchPendingApprovalRequests]);

  const handleRequestSelect = (request) => {
    setSelectedRequest(request);
    setEditedRequest({ ...request });
  };
  
  const updateField = (field, value) => {
    if (field === 'other_scholarship' && value === 'no') {
      setEditedRequest(prevState => ({
        ...prevState,
        [field]: value,
        other_scholarship_percentage: '', // Remove  percentage if "no" is selected
      }));
    } else {
      setEditedRequest(prevState => ({
        ...prevState,
        [field]: value,
      }));
    }
  };

  const handleDenyConfirmation = () => {
    setDenyModalOpen(true);
  }
  const handleApproveConfirmation = () => {
    setApproveModalOpen(true);
  }
  
  
  const confirmDeny = () => {
    handleDenial();
    setDenyModalOpen(false);
  }
  const confirmApproval = () => {
    handleApproval();
    setApproveModalOpen(false);
  }
  

  const handleApproval = async () => {
    const token = localStorage.getItem('token');
    const data = {
      requestId: selectedRequest.id,  
      editedAdminForm: editedRequest,
      managerComment: managerComment
    }
    try {
      const response = await axios.post('http://localhost:5001/api/scholarship/approve', data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        fetchPendingApprovalRequests();
        props.fetchPendingApprovalsCount(); 
        navigate('/manager-dashboard/all-requests');
      } else {
        console.error(response);
      }
      
    } catch (error) {
      console.error(error);
    }
  };
  
  const handleDenial = async () => {
    const token = localStorage.getItem('token');
    const data = {
      requestId: selectedRequest.id,  
      editedAdminForm: editedRequest,
      managerComment: managerComment
    }
    try {
      const response = await axios.post('http://localhost:5001/api/scholarship/deny', data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (response.status === 200) {
        fetchPendingApprovalRequests();
        props.fetchPendingApprovalsCount(); 

        navigate('/manager-dashboard/all-requests');
      } else {
        console.error(response);
      }
      
    } catch (error) {
      console.error(error);
    }
  };

  const downloadFile = async (key) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5001/api/scholarship/get-presigned-url/${key}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }
      });
      const presignedUrl = response.data.presignedUrl;
      window.location.href = presignedUrl;
    } catch (err) {
      console.error(err);
      alert('Failed to download file. Please try again later.');
    }
  };
  

  return (
    <div className="max-w-6xl mx-auto mt-10 p-5">
      <h2 className="text-2xl font-semibold mb-6">Pending Approval</h2>
      {isLoading ? (
        <ClipLoader color="#000000" loading={isLoading} css={override} size={50} />
      ) : (
        <>
          {requests.length === 0 ? (
            <p>No pending approvals at the moment.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className={`bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-200 transform hover:scale-105 cursor-pointer 
                  ${selectedRequest && selectedRequest.id === request.id ? 'border-2 border-blue-500' : ''}`}
                  onClick={() => handleRequestSelect(request)}
                >
                  <h3 className="font-semibold text-lg mb-2 text-blue-500">{request.sport}</h3>
                  <p className="text-gray-600 text-sm">
                    {request.description.substring(0, 30) + (request.description.length > 30 ? "..." : "")}
                  </p>
                </div>
              ))}
            </div>
          )}
          {selectedRequest && (
        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-6">Selected Request Details</h2>
          <div className="bg-white rounded-lg p-4 shadow-md">
            <h3 className="font-semibold text-lg mb-2 text-blue-500">Student's Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Personal Information */}
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="font-bold text-custom-blue mb-2">Personal Information</h3>
                <p><strong>Name:</strong> {selectedRequest.first_name} {selectedRequest.last_name}</p>
                <p> <strong>Government ID:</strong> {selectedRequest.government_id}</p>
                <p><strong>Year Of Admission:</strong> {selectedRequest.year_of_admission}</p>
              </div>
              {/* Contact Details */}
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h4 className="font-bold text-custom-blue mb-2">Contact Details</h4>
                <p><strong>City:</strong> {selectedRequest.city}</p>
                <p><strong>Phone Number:</strong> {selectedRequest.phone_number}</p>
              </div>
              {/* Academic Details */}
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="font-bold text-custom-blue mb-2">Academic Details</h3>
                <p><strong>Course Title:</strong> {selectedRequest.course_title}</p>
                <p><strong>Educational Level:</strong> {selectedRequest.education_level}</p>
              </div>
              {/* Other Information */}
              <div className="bg-white p-4 rounded-lg shadow-md">
              <h3 className="font-bold text-custom-blue mb-2">Other Information</h3>
                
                <p><strong>Sport:</strong> {selectedRequest.sport}</p>
                <p><strong>Description:</strong> {selectedRequest.description}</p>
              </div>
            </div>
            <div className="flex flex-col mt-4 ml-4">
              <p className="font-bold text-custom-blue">Attached File:</p>
              {selectedRequest.file_url && (
                <div className="mt-2">
                  <button 
                    onClick={() => downloadFile(selectedRequest.file_key)} 
                    className="flex items-center justify-center gap-2 px-4 py-2 text-white font-semibold bg-blue-800 rounded-md focus:outline-none hover:bg-blue-600"
                  >
                    <FiDownload className="w-4 h-4" />
                    Download File
                  </button>
                </div>
              )}

            </div>

                {selectedRequest.admin_full_name && (
                  <div>
                  <h3 className=" mt-10 font-bold text-xl mb-2 text-blue-600">Admin's Review</h3>

                 <div className="mt-3 mb-10 bg-gray-100 p-4 rounded-lg">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                      <div className="flex flex-col">
                        <label className="text-sm font-medium mb-1">Admin Full Name:</label>


                        <p className="border border-gray-300 px-3 py-2 rounded">{selectedRequest.admin_full_name}</p>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-medium mb-1">Percentage:</label>
                        <input 
                          type="number"
                          value={editedRequest.percentage || ''}
                          onChange={e => updateField('percentage', parseInt(e.target.value))}
                          className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-medium mb-1">Scholarship Category:</label>
                        <select
                        className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-indigo-500"
                          value={editedRequest.scholarship_category || ''}
                          onChange={e => updateField('scholarship_category', e.target.value)}
                        >
                          <option value="">Select category</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                          <option value="C">C</option>
                          <option value="D">D</option>
                        </select>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-medium mb-1">Other Scholarship:</label>
                        <select
                          value={editedRequest.other_scholarship || ''}
                          onChange={e => updateField('other_scholarship', e.target.value)}
                          className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-indigo-500"
                        >
                          <option value="YES">Yes</option>
                          <option value="NO">No</option>
                        </select>
                      </div>
                      {editedRequest.other_scholarship === 'YES' && (
                          <div className="flex flex-col">
                            <label className="text-sm font-medium mb-1">Other Scholarship Percentage:</label>
                            <input 
                              type="number"
                              step="0.1" // Allow floating-point numbers
                              value={editedRequest.other_scholarship_percentage || ''}
                              onChange={e => updateField('other_scholarship_percentage', parseFloat(e.target.value))}
                              className="border border-gray-300 px-3 py-2 rounded focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        )}
                      <div className="flex flex-col">
                        <label className="text-sm font-medium mb-1">Admin's Comments:</label>
                        <p className="border border-gray-300 px-3 py-2 rounded">{selectedRequest.comments}</p>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-sm font-medium mb-1">Date:</label>
                        <p className="border border-gray-300 px-3 py-2 rounded">
                          {format(new Date(selectedRequest.date), 'dd/MM/yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-xl mb-2 text-blue-600">Your Review</h3>
                  <textarea
                    value={managerComment}
                    onChange={e => setManagerComment(e.target.value)}
                    className="w-full p-2 mt-2 border-2 border-blue-500 rounded-lg focus:outline-none focus:border-blue-700"
                    rows="4"
                    placeholder="Manager's comments..."
                  />
                  <div className="flex mt-4 space-x-4">
                    <button 
                      onClick={handleApproveConfirmation}
                      className="bg-blue-700 text-white px-6 py-2 rounded hover:bg-blue-900 transition duration-200"
                    >
                      Approve Request
                    </button>
                    <button 
                      onClick={handleDenyConfirmation} 
                      className="bg-red-700 text-white px-6 py-2 rounded hover:bg-red-900 transition duration-200"
                    >
                      Deny Request
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      {approveModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <MdGppGood className="h-6 w-6 text-blue-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Approve Request
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to approve this request? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button type="button" onClick={confirmApproval} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
                  Confirm
                </button>
                <button type="button" onClick={() => setApproveModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {denyModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Deny Request
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to deny this request? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button type="button" onClick={confirmDeny} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
                  Confirm
                </button>
                <button type="button" onClick={() => setDenyModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
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

export default PendingApproval;

