import React, { useState } from 'react';
import { Card, Form, Input, Button, Select, Switch } from 'antd';

const { Option } = Select;

const Settings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = (values) => {
    setLoading(true);
    // 模拟保存设置
    setTimeout(() => {
      console.log('保存设置:', values);
      setLoading(false);
    }, 1000);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card title="代理设置">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            label="目标服务器地址"
            name="targetServer"
            rules={[{ required: true, message: '请输入目标服务器地址' }]}
          >
            <Input placeholder="例如: https://api.example.com" />
          </Form.Item>

          <Form.Item
            label="本地端口"
            name="localPort"
            rules={[{ required: true, message: '请输入本地端口' }]}
          >
            <Input type="number" placeholder="例如: 3000" />
          </Form.Item>

          <Form.Item
            label="协议类型"
            name="protocol"
            initialValue="http"
          >
            <Select>
              <Option value="http">HTTP</Option>
              <Option value="https">HTTPS</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="启用自动代理"
            name="autoProxy"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              保存设置
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Settings;