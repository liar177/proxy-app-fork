import React from 'react';
import { Layout as AntLayout, Menu, Dropdown, Space, Divider } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {
  GlobalOutlined,
  InfoCircleOutlined,
  DownOutlined
} from '@ant-design/icons';

const { Header, Content } = AntLayout;

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

  const languageMenu = {
    items: [
      { key: 'zh', label: '中文' },
      { key: 'en', label: 'English' },
    ],
  };

  const aboutMenu = {
    items: [
      { key: 'about', label: '关于 Easy Proxy' },
      { key: 'help', label: '帮助文档' },
    ],
  };

  return (
    <AntLayout style={{ minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <Header
        style={{
          backgroundColor: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          borderBottom: '1px solid #e8e8e8',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: '#e6212a', fontSize: '20px', fontWeight: 'bold' }}>
              HIKVISION
            </span>
            <span style={{ color: '#666', fontSize: '16px', marginLeft: '8px' }}>
              Easy Proxy
            </span>
          </div>
          <Divider type="vertical" style={{ height: '24px', backgroundColor: '#d9d9d9' }} />
          <Menu
            mode="horizontal"
            selectedKeys={[currentPath]}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              lineHeight: '64px',
            }}
            items={menuItems}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Dropdown menu={languageMenu}>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              style={{ color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <GlobalOutlined />
              中文
              <DownOutlined style={{ fontSize: '10px' }} />
            </a>
          </Dropdown>
          <Dropdown menu={aboutMenu}>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              style={{ color: '#666', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <InfoCircleOutlined />
              关于
              <DownOutlined style={{ fontSize: '10px' }} />
            </a>
          </Dropdown>
        </div>
      </Header>
      <Content
        style={{
          padding: '16px 24px',
          backgroundColor: '#f0f2f5',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        {children}
      </Content>
    </AntLayout>
  );
};

export default AppLayout;
