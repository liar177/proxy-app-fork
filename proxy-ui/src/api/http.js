import axios from "axios";
import { message } from 'antd';
import { getGlobalNavigate } from "../components/NavigateComponent";

const http = axios.create({
  baseURL: "/api/",
  withCredentials: true,
  timeout: 30000,
  errorNotify: true,
  successNotify: true,
});

http.interceptors.response.use(success, error);

function success(response) {
  const navigate = getGlobalNavigate();
  console.log('全局导航实例-success',navigate);
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

function error(error) {
  const navigate = getGlobalNavigate();
  console.log('全局导航实例',navigate);
  if (error.response && (error.response.status === 401)) {
    // 使用全局导航实例进行跳转

    if (navigate) {
      navigate("/");
    } else {
      // 如果导航实例还未初始化，使用原生跳转
      window.location.href = '/';
    }
  }
  console.log(error);
  return Promise.reject(error);
}

export default http;
