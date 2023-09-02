import { css } from '@emotion/react';
import { ExclamationIcon } from '@heroicons/react/solid';
import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import ClipLoader from "react-spinners/ClipLoader";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminReviewForm from './AdminReviewForm';

const NewRequests = (props) => {
  const [newRequests, setNewRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchingRequests, setFetchingRequests] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  
  const override = css`
  display: inline-block;
  margin-left: 5px;
`;

  const fetchNewRequests = useCallback(async () => {
    setFetchingRequests(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5001/api/scholarship/get-new-requests', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      setNewRequests(response.data.requests);
    } catch (error) {
      console.error('Error fetching new requests:', error);
      setFetchError('Error fetching new requests. Please try again later.');
    }
    setFetchingRequests(false);
  }, []);

  useEffect(() => {
    fetchNewRequests();
  }, [fetchNewRequests]);

  const handleRequestSelect = (request) => {
    if (selectedRequest && selectedRequest.id === request.id) {
      setSelectedRequest(null);
    } else {
      setSelectedRequest(request);
    }
  };

  const handleRequestMoreInfoConfirmation = (request) => {
    setSelectedRequest(request);
    setConfirmModalOpen(true);
  };

  const confirmRequestMoreInfo = async () => {
    if (!selectedRequest) {
      return;
    }

    setIsLoading(true);
    setConfirmModalOpen(false);

    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:5001/api/scholarship/update-request-status/${selectedRequest.id}`, {
        status: 'requires_more_info',
      }, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success('Request for more information has been sent!', {
        position: toast.POSITION.BOTTOM_RIGHT,
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      setSelectedRequest(null);
      await fetchNewRequests();
      props.fetchNewRequestsCount();

    } catch (error) {
      console.error('Error requesting more info:', error);
      toast.error('Error requesting more info. Please try again.', {
        position: toast.POSITION.BOTTOM_RIGHT,
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }

    setIsLoading(false);
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
    <ToastContainer />
    <section className="request-list">
      <h2 className="text-2xl font-semibold mb-6">New Scholarship Requests</h2>
      {fetchingRequests ? (
        <ClipLoader color="#000000" loading={fetchingRequests} css={override} size={50} />
      ) : fetchError ? (
        <p>{fetchError}</p>
      ) : (
        <>
          {newRequests.length === 0 ? (
            <p>No new requests at the moment.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {newRequests.map((request) => (
                <div
                key={request.id}
                className={`bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition duration-200 transform hover:scale-105 cursor-pointer 
                ${selectedRequest && selectedRequest.id === request.id ? 'border-2 border-blue-500' : ''} overflow-auto`}
                onClick={() => handleRequestSelect(request)}
              >
                <h3 className="font-semibold text-lg mb-2 text-blue-500">{request.sport}</h3>
                <p className="text-gray-600 text-sm overflow-auto">
                  {request.description.substring(0, 30) + (request.description.length > 30 ? "..." : "")}
                </p>
              </div>
              ))}
            </div>
          )}
        </>
      )}
    </section>


    {confirmModalOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationIcon className="h-6 w-6 text-blue-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Confirmation
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to ask for further information?
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button type="button" onClick={confirmRequestMoreInfo} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm">
                  Yes, confirm
                </button>
                <button type="button" onClick={() => setConfirmModalOpen(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                  No, cancel
                </button>
              </div>
            </div>
          </div>
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
              <p><strong>Attached File: </strong></p>
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
            <button 
              onClick={() => handleRequestMoreInfoConfirmation(selectedRequest)} 
              className="mt-12 ml-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-200 transform hover:scale-105" 
              disabled={isLoading}
            >
              {isLoading ? <ClipLoader color="#ffffff" loading={isLoading} css={override} size={20} /> : 'Ask for further information'}
            </button>
          </div>
        </div>
      )}

      {selectedRequest && (
        <section className="admin-form mt-10">
          <h2 className="text-2xl font-semibold mb-6">Admin Review Form</h2>
          <AdminReviewForm selectedRequest={selectedRequest} fetchNewRequests={fetchNewRequests} fetchNewRequestsCount={props.fetchNewRequestsCount} requestId={selectedRequest.id} />
        </section>
      )}
    </div>
  );
};

export default NewRequests;
