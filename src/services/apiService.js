import axios from "axios";

const API_BASE_URL = "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response || error.message);

    if (error.response?.status === 401) {
      console.warn("Unauthorized! Maybe token expired or missing.");
      localStorage.removeItem("auth_token");
    }

    return Promise.reject(error);
  }
);

// ====================== AUTH ======================
export const register = (data) => api.post("/register", data);

export const login = async (data) => {
  try {
    const response = await api.post("/login", data);
    console.log(" Login success:", response.data);

    if (response.data.token) {
      localStorage.setItem("auth_token", response.data.token);
    } else {
      console.warn("No token found in response!");
    }

    if (response.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
      console.log(" User info saved to localStorage");
    }

    return response;
  } catch (error) {
    console.error("Login error:", error.response || error.message);
    throw new Error(error.response?.data?.message || "Login failed");
  }
};

export const logout = async () => {
  try {
    await api.post("/logout");
  } catch (error) {
    console.warn("Logout failed, continuing anyway...");
  } finally {
    localStorage.removeItem("auth_token");
  }

  return { data: { message: "Logged out successfully" } };
};


export const getEntries = (page = 1, status = '', from = '', to = '') => {
  let url = `/entries?page=${page}`;
  if (status) url += `&status=${status}`;
  if (from) url += `&from=${from}`;
  if (to) url += `&to=${to}`;
  return api.get(url);
};
export const getCategories = () => api.get("/entries/categories");

export const createEntry = (data) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const entryData = {
    ...data,
    user_id: user?.id, 
    status: "pending",
    calculated_field: "Auto-calculated",
    approved_by: null,
    approved_at: null,
  };
  console.log("📝 Creating entry:", entryData);
  return api.post("/entries", entryData);
};

export const updateEntryStatus = (id, status) =>
  api.put(`/entries/${id}/status`, { status });

export const deleteEntry = (id) => api.delete(`/entries/${id}`);

export const getEntryStatistics = () => api.get("/entries/statistics");

