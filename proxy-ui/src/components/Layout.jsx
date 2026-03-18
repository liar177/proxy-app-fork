import React from 'react';
import { Layout as AntLayout, Menu } from 'antd';
import { Link, useLocation } from 'react-router-dom';

const { Header, Content, Sider } = AntLayout;

const AppLayout = ({ children }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const menuItems = [
    {
      key: '/',
      label: <Link to="/">首页</Link>,
    },
    {
      key: '/edit',
      label: <Link to="/edit">编辑</Link>,
    },
  ];

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header style={{ backgroundColor: '#fff', display: 'flex', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '18px', color: '#1890ff' }}>Proxy UI</h1>
      </Header>
      <AntLayout>
        <Sider width={200} style={{ backgroundColor: '#fff' }}>
          <Menu
            mode="inline"
            selectedKeys={[currentPath]}
            style={{ height: '100%', borderRight: 0 }}
            items={menuItems}
          />
        </Sider>
        <Content style={{ padding: '24px', backgroundColor: '#f0f2f5' }}>
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default AppLayout;