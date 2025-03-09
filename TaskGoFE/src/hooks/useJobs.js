import { useState, useEffect } from 'react';
import { jobService } from '../services/api/jobService';

export const useJobs = (initialParams = {}) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [params, setParams] = useState(initialParams);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const data = await jobService.getJobs(params);
      setJobs(data);
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
    loading, 
    error, 
    refetch: fetchJobs,
    setParams 
  };
};