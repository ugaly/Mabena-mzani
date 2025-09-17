import axios from "axios";

const base_url = 'http://62.171.158.147:6363/api/v1'
//const base_url = 'http://0.0.0.0:6363/api/v1'


export default class API {
  static ax = axios;
}

axios.defaults.baseURL = base_url;
// axios.defaults.headers.common.Authorization = `Bearer ${sessionStorage.getItem("token")}`;

axios.interceptors.request.use((config) => {
  const source = axios.CancelToken.source();
  config.cancelToken = source.token;
  setTimeout(() => source.cancel('Timed out after 30s'), 86400000);
  return config;
});