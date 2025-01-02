import axios from 'axios';

const appOrigin = 'flexiyo://fiyo';

const customAxios = axios.create();

customAxios.interceptors.request.use(
  config => {
    config.headers = {
      ...config.headers,
      app_origin: appOrigin,
    };
    return config;
  },
  error => Promise.reject(error),
);

export default customAxios;
