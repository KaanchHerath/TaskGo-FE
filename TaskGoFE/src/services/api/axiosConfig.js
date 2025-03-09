import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2N2NkNjE2N2EzMDQ1ZDI0NDZlNzg2MWQiLCJyb2xlIjoiY3VzdG9tZXIiLCJpYXQiOjE3NDE1MTMzNzcsImV4cCI6MTc0MTU5OTc3N30.HLXm7RLRInUM55nLN549tblZCOf7-HIKgw2RhxnzqWM';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  }
});

export default axiosInstance;