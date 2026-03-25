// NavigateContext.js
import { createContext, useContext, useNavigate } from 'react-router-dom';

const NavigateContext = createContext(null);

export const NavigateProvider = ({ children }) => {
  const navigate = useNavigate();
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
