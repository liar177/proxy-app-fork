import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { NavigateProvider } from './components/NavigateComponent';
import Layout from './components/Layout';
import HomeList from './pages/HomeList';
import Edit from './pages/Edit';
import './App.css';

function App() {
  return (
    <ConfigProvider>
      <Router>
        <NavigateProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<HomeList />} />
              <Route path="/edit" element={<Edit />} />
            </Routes>
          </Layout>
        </NavigateProvider>
      </Router>
    </ConfigProvider>
  );
}

export default App;
