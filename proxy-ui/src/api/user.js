import http from "./http";

// 登录
export function signin(params) {
  return http.post("user/signin", params, { errorNotify: false });
}

// 登出
export function signout(params) {
  return http.post("user/signout", params);
}

// 用户信息
export function useInfo() {
  return http.post("user/userInfo");
}
