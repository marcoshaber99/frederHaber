import axios from 'axios';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

const RequestContext = createContext();
export const NewRequestCountContext = createContext(); 
export const PendingApprovalCountContext = createContext();


export function useRequest() {
    return useContext(RequestContext);
}

export function RequestContextProvider({ children }) {
    const [latestRequestStatus, setLatestRequestStatus] = useState('');
    const [loadingLatestRequestStatus, setLoadingLatestRequestStatus] = useState(true);
    const [newRequestsCount, setNewRequestsCount] = useState(null); 
    const [loadingNewRequestsCount, setLoadingNewRequestsCount] = useState(false);
    const [pendingApprovalsCount, setPendingApprovalsCount] = useState(null);
    const [loadingPendingApprovalsCount, setLoadingPendingApprovalsCount] = useState(false);


    const fetchLatestRequestStatus = useCallback(async () => {
        try {
            setLoadingLatestRequestStatus(true); 
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5001/api/scholarship/get-latest-request-status', {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            setLatestRequestStatus(response.data.status);
        } catch (error) {
            console.error('Error fetching latest request:', error);
            setLatestRequestStatus('Error'); // Error handling
        } finally {
            setLoadingLatestRequestStatus(false); // end loading
        }
    }, []);

    const updateScholarshipRequest = useCallback(async (id, requestData) => {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.put(`http://localhost:5001/api/scholarship/update-request/${id}`, requestData, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          await fetchLatestRequestStatus(); 
          return response;
        } catch (error) {
          console.error('Error updating scholarship request:', error);
          throw error; 
        }
      }, [fetchLatestRequestStatus]); 
      

    const fetchNewRequestsCount = useCallback(async () => {
        setLoadingNewRequestsCount(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5001/api/scholarship/get-new-requests-count', {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            setNewRequestsCount(response.data);
        } catch (error) {
            console.error('Error fetching new requests count:', error);
        } finally {
            setLoadingNewRequestsCount(false);
        }
    }, []);
    const fetchPendingApprovalsCount = useCallback(async () => {
        setLoadingPendingApprovalsCount(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5001/api/scholarship/get-pending-approvals-count', {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            });
            setPendingApprovalsCount(response.data);
        } catch (error) {
            console.error('Error fetching pending approvals count:', error);
        } finally {
            setLoadingPendingApprovalsCount(false);
        }
    }, []);


    useEffect(() => {
        fetchNewRequestsCount();
    }, [fetchNewRequestsCount]);

    useEffect(() => {
        const userRole = localStorage.getItem('userRole');
        if(userRole !== 'student' && userRole !== 'admin') {
            fetchPendingApprovalsCount();
        }
    }, [fetchPendingApprovalsCount]);
    


    const value = {
        latestRequestStatus,
        loadingLatestRequestStatus,
        fetchLatestRequestStatus,
        updateScholarshipRequest,
        newRequestsCount,
        loadingNewRequestsCount,
        fetchNewRequestsCount, 
        pendingApprovalsCount,
        loadingPendingApprovalsCount,
        fetchPendingApprovalsCount
    };

    return (
        <NewRequestCountContext.Provider value={{ newRequestsCount, loadingNewRequestsCount, fetchNewRequestsCount }}>
            <PendingApprovalCountContext.Provider value={{ pendingApprovalsCount, loadingPendingApprovalsCount, fetchPendingApprovalsCount }}>
                <RequestContext.Provider value={value}>
                    {children}
                </RequestContext.Provider>
            </PendingApprovalCountContext.Provider>
        </NewRequestCountContext.Provider>
    );
}
