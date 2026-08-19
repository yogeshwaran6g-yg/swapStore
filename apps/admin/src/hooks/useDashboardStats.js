import { useState, useEffect } from 'react';
import { userService } from '../services/userService';

export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    todayUsers: 0,
    totalSwaps: 0,
    todaySwaps: 0,
    totalLoans: 0,
    todayLoans: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchStats = async () => {
      try {
        const data = await userService.getDashboardStats();
        if (isMounted && data) {
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchStats();
    
    return () => {
      isMounted = false;
    };
  }, []);

  return { stats, loading };
};
