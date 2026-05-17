import { useState, useEffect } from 'react';
import { Switch, Tooltip, Tag } from 'antd';
import { mockConfig } from '../mock/mockConfig';

const MockToggle = () => {
  const [mockMode, setMockMode] = useState(mockConfig.getMockMode());

  useEffect(() => {
    const unsubscribe = mockConfig.addListener((newMode) => {
      setMockMode(newMode);
    });
    return unsubscribe;
  }, []);

  const handleChange = (checked) => {
    mockConfig.setMockMode(checked);
    setMockMode(checked);
  };

  return (
    <Tooltip
      title={mockMode ? '当前为假数据模式，点击关闭' : '点击开启假数据模式'}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 12px',
          backgroundColor: mockMode ? 'rgba(24, 144, 255, 0.1)' : 'transparent',
          borderRadius: '20px',
        }}
      >
        <Tag color={mockMode ? 'blue' : 'default'}>
          {mockMode ? '假数据' : '真实接口'}
        </Tag>
        <Switch
          checked={mockMode}
          onChange={handleChange}
          checkedChildren="ON"
          unCheckedChildren="OFF"
          size="small"
        />
      </div>
    </Tooltip>
  );
};

export default MockToggle;
