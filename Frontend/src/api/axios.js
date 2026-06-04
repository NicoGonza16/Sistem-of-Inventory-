import axios from "axios";

const TOKEN_KEY = "token:v1";
const USER_KEY = "user:v1";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://localhost:3001/api",
});

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(
        TOKEN_KEY
      );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) =>
    Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401
    ) {
      localStorage.removeItem(
        TOKEN_KEY
      );

      localStorage.removeItem(
        USER_KEY
      );
    }

    return Promise.reject(error);
  }
);

export default api;