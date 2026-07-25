import axios from 'axios';
import { toast } from 'react-toastify';

// Create axios instance with base URL and default headers
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for sending cookies with requests
  timeout: 10000, // 10 second timeout to prevent hanging
});

// Add a request interceptor to include the auth token in requests
api.interceptors.request.use(
  (config) => {
    // Get token from cookies
    const token = document.cookie
      .split('; ')
      .find((row) => row.startsWith('token='))
      ?.split('=')[1];

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response;
  },
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    const { response } = error;
    let message = 'An error occurred';

    if (response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = response;

      if (status === 401) {
        // Unauthorized - redirect to login
        if (window.location.pathname !== '/login') {
          // Only show message if not already on login page
          message = data?.error || 'Your session has expired. Please log in again.';
          toast.error(message);
          // Clear user data and redirect to login
          window.location.href = '/login';
        }
      } else if (status === 403) {
        // Forbidden - user doesn't have permission
        message = data?.error || 'You do not have permission to perform this action';
        toast.error(message);
      } else if (status === 404) {
        // Not found
        message = data?.error || 'The requested resource was not found';
        toast.error(message);
      } else if (status === 422) {
        // Validation error
        message = data?.error || 'Validation error';
        if (data?.errors) {
          // Handle validation errors from the server
          const errorMessages = Object.values(data.errors).flat();
          errorMessages.forEach((msg) => toast.error(msg));
        } else {
          toast.error(message);
        }
      } else if (status >= 500) {
        // Server error
        message = data?.error || 'Something went wrong on the server';
        toast.error(message);
      } else {
        // Other errors
        message = data?.error || 'An error occurred';
        toast.error(message);
      }
    } else if (error.request) {
      // The request was made but no response was received
      message = 'No response from server. Please check your connection.';
      toast.error(message);
    } else {
      // Something happened in setting up the request that triggered an Error
      message = error.message || 'An error occurred';
      console.error('Error:', message);
    }

    return Promise.reject(error);
  }
);

export default api;
