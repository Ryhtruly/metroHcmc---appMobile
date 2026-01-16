import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';

export interface ApiResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: any;
  data?: any;
  ok?: boolean; 
}

const BASE_URL = 'http://192.168.96.225:3000/api';

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

axiosClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosClient.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  (error) => {
    if (error.response && error.response.data) return error.response.data;
    return Promise.reject(error);
  }
);

export default axiosClient;