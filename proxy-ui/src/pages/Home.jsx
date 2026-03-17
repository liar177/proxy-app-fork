import React from 'react';
import { Card, Typography, Button, Space } from 'antd';

const { Title, Paragraph } = Typography;

const Home = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={2}>Proxy UI</Title>
        <Paragraph>
          欢迎使用Proxy UI，一个用于管理前端开发过程中代理地址的工具。
          本工具旨在解决前端开发过程中代理地址切换需重启服务的问题，
          实现本地Web前端项目启动后自动代理HTTP/HTTPS请求至目标服务器的功能。
        </Paragraph>
        <Space>
          <Button type="primary">开始使用</Button>
          <Button>查看文档</Button>
        </Space>
      </Card>
    </div>
  );
};

export default Home;