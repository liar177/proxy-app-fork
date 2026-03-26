// NavigateContext.js
import React, { createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const NavigateContext = createContext(null);

// 全局导航实例，供工具文件使用
let globalNavigate = null;

export const setGlobalNavigate = (navigateFn) => {
  globalNavigate = navigateFn;
};

export const getGlobalNavigate = () => {
  return globalNavigate;
};

export const NavigateProvider = ({ children }) => {
  const navigate = useNavigate();
  
  // 设置全局导航实例
  React.useEffect(() => {
    setGlobalNavigate(navigate);
  }, [navigate]);
  
  return (
    <NavigateContext.Provider value={navigate}>
      {children}
    </NavigateContext.Provider>
  );
};

export const useGlobalNavigate = () => {
  const context = useContext(NavigateContext);
  if (!context) {
    throw new Error('useGlobalNavigate must be used within a NavigateProvider');
  }
  return context;
};
