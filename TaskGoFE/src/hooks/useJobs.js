import { useState, useEffect } from 'react';
import { getTasks } from '../services/api/taskService';

export const useJobs = (initialParams = {}) => {
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await getTasks(params);
      setJobs(response.data || []);
      setPagination(response.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        pages: 1
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [params]);

  return { 
    jobs, 
    pagination,
    loading, 
    error, 
    refetch: fetchJobs,
    setParams 
  };
};