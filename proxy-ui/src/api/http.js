import axios from "axios";
import { message } from "antd";
// import history from "src/history";
import { useGlobalNavigate } from "src/components/NavigateComponent";

const navigate = useGlobalNavigate();

const http = axios.create({
  baseURL: "/api/",
  withCredentials: true,
  timeout: 30000,
  errorNotify: true,
  successNotify: true,
});

http.interceptors.response.use(success, error);

function success(response) {
  const result = response.data;
  const config = response.config;
  const { code, msg } = result;
  if (code === 0) {
    msg && config.successNotify && message.success(msg);
  } else {
    msg && config.errorNotify && message.error(msg);
  }
  return result;
}

function error(error, config) {
  if (error.response.status === 401) {
    navigate("/login");
  }
  console.log(error);
  return Promise.reject(error);
}

export default http;
