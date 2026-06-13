import React, { createContext, useState, useEffect, useCallback } from 'react';
import { uploadKycDocument, requestNewLoan, fetchMyLoans } from '../services/loanApiService';
import { useAuth } from '../hooks/useAuth'; // assuming there is a useAuth hook, if not we will adjust

export const LoanContext = createContext();

export const LoanProvider = ({ children }) => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuth(); // assuming user has kyc_status

  const getMyLoans = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await fetchMyLoans();
      if (data.success) {
        setLoans(data.data?.loans || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      getMyLoans();
    }
  }, [isAuthenticated, getMyLoans]);

  const uploadKyc = async (formData) => {
    setLoading(true);
    try {
      const result = await uploadKycDocument(formData);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const requestLoan = async (payload) => {
    setLoading(true);
    try {
      const result = await requestNewLoan(payload);
      if (result.success) {
        // Refresh loans after a successful request
        await getMyLoans();
      }
      return result;
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoanContext.Provider
      value={{
        loans,
        loading,
        error,
        uploadKyc,
        requestLoan,
        getMyLoans,
      }}
    >
      {children}
    </LoanContext.Provider>
  );
};
