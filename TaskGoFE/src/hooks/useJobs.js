import { useState, useEffect } from 'react';
import { getTasks } from '../services/api/taskService';
import { jobService } from '../services/api/jobService';

/**
 * Unified hook for managing jobs - can fetch single job or multiple jobs
 * @param {Object|string} options - Either a job ID (string) or options object for multiple jobs
 * @returns {Object} - Returns different data based on usage:
 *   - Single job: { job, loading, error, refetch }
 *   - Multiple jobs: { jobs, pagination, loading, error, refetch, setParams }
 */
export const useJobs = (options) => {
  // Determine if this is a single job fetch (string ID) or multiple jobs fetch (object)
  const isSingleJob = typeof options === 'string';
  const jobId = isSingleJob ? options : null;
  const initialParams = isSingleJob ? {} : (options || {});

  // Single job state
  const [job, setJob] = useState(null);
  
  // Multiple jobs state
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });
  const [params, setParams] = useState(initialParams);
  
  // Common state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch single job
  const fetchSingleJob = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await jobService.getJobById(jobId);
      // Handle nested response structure
      const jobData = response.data || response;
      setJob(jobData);
    } catch (err) {
      setError(err.message || 'Failed to fetch job');
    } finally {
      setLoading(false);
    }
  };

  // Fetch multiple jobs
  const fetchMultipleJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTasks(params);
      setJobs(response.data || []);
      setPagination(response.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        pages: 1
      });
    } catch (err) {
      setError(err.message || 'Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  };

  // Main fetch function
  const fetchJobs = async () => {
    if (isSingleJob) {
      await fetchSingleJob();
    } else {
      await fetchMultipleJobs();
    }
  };

  useEffect(() => {
    if (isSingleJob) {
      if (jobId) {
        fetchSingleJob();
      }
    } else {
      fetchMultipleJobs();
    }
  }, [isSingleJob, jobId, params]);

  // Return different data based on usage
  if (isSingleJob) {
    return { 
      job, 
      loading, 
      error, 
      refetch: fetchSingleJob 
    };
  }

  return { 
    jobs, 
    pagination,
    loading, 
    error, 
    refetch: fetchMultipleJobs,
    setParams 
  };
};

// Legacy exports for backward compatibility
export const useJob = (id) => useJobs(id);