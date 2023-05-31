import axios, { AxiosInstance } from "axios";

const api: AxiosInstance = axios.create({
  baseURL: "http://localhost:8080",
  timeout: 5000,
  headers: {
    "Content-Type": "application/json", // Type of content for applications
    // Other custom headers that you want to add
  },
});

// Application and response interceptors
api.interceptors.request.use(
  (config) => {
    // Make some modification in the application configuration
    // Before it is sent, how to add authentication tokens, etc.
    return config;
  },
  (error) => {
    // Errors management in applications
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // Make any modification in the response received
    // Before you go to your application code
    return response;
  },
  (error) => {
    // Management of errors in the answers
    return Promise.reject(error);
  }
);

export default api;
