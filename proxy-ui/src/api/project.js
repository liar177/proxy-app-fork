/*
 * @Descripttion: 
 * @version: 
 * @Author: xieshaohui
 * @Date: 2022-09-05 17:22:38
 * @LastEditors: xieshaohui
 * @LastEditTime: 2022-09-13 20:07:48
 */
import http from "./http";

export function getProjectInfo(params) {
  return http.post("project/info", params);
}

export function getProjectlist(params) {
  return http.post("project/list", params);
}

export function createProject(params) {
  return http.post("project/create", params);
}

export function modifyProject(params) {
  return http.post("project/modify", params);
}

export function deleteProject(params) {
  return http.post("project/delete", params);
}

export function checkProjectName(params) {
  return http.post("project/checkProjectName", params);
}

export function requestProjectPort(params) {
  return http.post("project/requestProjectPort", params);
}

export function switchConfig(params) {
  return http.post("project/switchConfig", params);
}

export function startAction(params) {
  return http.post("project/action/start", params);
}

export function stopAction(params) {
  return http.post("project/action/stop", params);
}

export function getProjectCookie(params) {
  return http.post("project/action/getCookie", params);
}

export function restartAction(params) {
  return http.post("project/action/restart", params);
}
