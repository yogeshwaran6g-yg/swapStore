import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-hot-toast";
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('admin_token');
      if (token && token !== 'undefined' && token !== 'null') {
        try {
          // If you have a profile endpoint, otherwise just trust the token for now
          const res = await authService.profile();
          setAdmin(res.data?.admin || res.data?.user || res.data || res);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Failed to fetch admin profile", error);
          localStorage.removeItem('admin_token');
          setIsAuthenticated(false);
          setAdmin(null);
        }
      } else {
        setIsAuthenticated(false);
        setAdmin(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (token, adminData) => {
    if (!token || !adminData) {
      toast.error('something went wrong');
      return
    }
    localStorage.setItem('admin_token', token);
    setAdmin(adminData);
    setIsAuthenticated(!!token);
    navigate('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    setAdmin(null);
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
