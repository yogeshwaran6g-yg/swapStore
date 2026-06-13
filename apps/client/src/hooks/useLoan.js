import { useContext } from 'react';
import { LoanContext } from '../context/LoanContext';

export const useLoan = () => {
  const context = useContext(LoanContext);
  if (!context) {
    throw new Error('useLoan must be used within a LoanProvider');
  }
  return context;
};
