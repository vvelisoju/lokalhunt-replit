import {
  createAxiosInstance,
  makeRequest,
  makeRoleAwareRequest,
} from "./axiosFactory";

// Create main authenticated API instance
const api = createAxiosInstance({
  serviceName: "Main API",
  timeout: 10000,
  withCredentials: true,
  requireAuth: true,
});

export { makeRequest };
export { makeRoleAwareRequest } from "./axiosFactory";
export default api;
