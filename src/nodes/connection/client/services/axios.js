import axios from 'axios';
import axiosRetry from 'axios-retry';
import { v4 as uuidv4 } from 'uuid';

export function createAxiosInstance(baseURL, headers, timeout, maxRedirects) {
  const axiosInstance = axios.create({
    baseURL,
    headers,
    timeout,
    maxRedirects,
  });

  axiosInstance.interceptors.request.use((config) => {
    const axiosId = uuidv4();

    console.debug('outbound request', {
      baseUrl: config.baseURL,
      method: config.method,
      data: config.data,
      params: config.params,
      url: config.url,
      headers: config.headers,
      axiosId,
    });
    config.metadata = {
      axiosId,
    };

    return config;
  });

  axiosInstance.interceptors.response.use(
    (response) => {
      console.debug('outbound response success', {
        baseUrl: response.config.baseURL,
        url: response.config.url,
        status: `${response.status}:${response.statusText}`,
        headers: response.headers,
        body: response.data,
        axiosId: response.config?.metadata?.axiosId,
      });

      return response;
    },
    async (error) => {
      console.debug('outbound response failure', {
        baseUrl: error.response?.config.baseURL,
        url: error.response?.config.url,
        status: error.response?.status,
        headers: error.response?.headers,
        body: error.response?.data,
        axiosId: error.response?.config?.metadata?.axiosId,
      });

      return await Promise.reject(error);
    },
  );

  axiosRetry(axiosInstance);

  return axiosInstance;
}
