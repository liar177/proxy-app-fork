import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Select,
  Input,
  message,
  Popconfirm,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  PoweroffOutlined,
  ReloadOutlined,
  SettingOutlined,
  EditOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
const { Title } = Typography;
const { Option } = Select;

// 模拟数据
const mockData = [
  { id: 1, name: 'eema', config: '50', address: 'http://localhost:1880', destination: 'https://10.42.2.50', status: 'running' },
  { id: 2, name: '现场问题排查-rmsm', config: '100', address: 'http://localhost:1301', destination: 'https://10.3.190.100/', status: 'stopped' },
  { id: 3, name: 'ctm02zptr', config: '22.10.102.104', address: 'http://localhost:20245', destination: 'https://22.10.102.104/', status: 'running' },
  { id: 4, name: '和田定制', config: '10.19.134.65', address: 'http://localhost:1040', destination: 'https://10.19.134.65/', status: 'stopped' },
  { id: 5, name: 'ermw-dual', config: '218.202.209.154', address: 'http://localhost:35196', destination: 'https://218.202.209.154:1443/', status: 'running' },
  { id: 6, name: 'pwrr', config: '曙光现场', address: 'http://localhost:53997', destination: 'https://60.171.157.198:31443', status: 'running' },
  { id: 7, name: 'imowas', config: '中宇现场 https://125.46...', address: 'http://localhost:34542', destination: 'https://125.46.21.237:7443/', status: 'running' },
  { id: 8, name: 'wad', config: 'http://10.19.134.36/', address: 'http://localhost:54724', destination: 'http://10.19.134.36/', status: 'stopped' },
  { id: 9, name: 'gais', config: 'http://10.19.134.36/', address: 'http://localhost:19509', destination: 'http://10.19.134.36/', status: 'stopped' },
  { id: 10, name: 'le-config', config: '87', address: 'http://localhost:56209', destination: 'https://10.19.189.87', status: 'stopped' },
  { id: 11, name: 'mvpl', config: '47', address: 'http://localhost:46493', destination: 'http://10.19.186.47/', status: 'stopped' },
  { id: 12, name: 'oas', config: '15', address: 'http://localhost:47274', destination: 'https://10.42.2.15', status: 'stopped' },
];

const ProxyList = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(mockData);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [configFilter, setConfigFilter] = useState('');

  // 状态映射
  const statusMap = {
    running: { text: '已启动', color: 'green' },
    stopped: { text: '已停止', color: 'red' },
    reloading: { text: '重载中', color: 'orange' },
  };

  // 表格列定义
  const columns = [
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      fixed: 'left',
      ellipsis: true,
    },
    {
      title: '配置文件',
      dataIndex: 'config',
      key: 'config',
      width: 200,
      render: (text) => (
        <Select
          value={text}
          style={{ width: '100%' }}
          onChange={(value) => handleConfigChange(value)}
          onClick={(e) => e.stopPropagation()}
        >
          <Option value={text}>{text}</Option>
        </Select>
      ),
    },
    {
      title: '地址',
      dataIndex: 'address',
      key: 'address',
      width: 220,
      ellipsis: true,
      render: (text) => (
        <a href={text} target="_blank" rel="noopener noreferrer" style={{ color: '#1890ff' }}>
          {text}
        </a>
      ),
    },
    {
      title: '目的地',
      dataIndex: 'destination',
      key: 'destination',
      width: 250,
      ellipsis: true,
      render: (text) => (
        <a href={text} target="_blank" rel="noopener noreferrer" style={{ color: '#1890ff' }}>
          {text}
        </a>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => (
        <span style={{ color: statusMap[status]?.color || '#fff' }}>
          {statusMap[status]?.text || '未知'}
        </span>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<PoweroffOutlined />}
            onClick={() => handleToggleStatus(record)}
            title={record.status === 'running' ? '停止' : '启动'}
          />
          <Button
            type="text"
            icon={<ReloadOutlined />}
            onClick={() => handleReload(record)}
            title="重载"
          />
          <Button
            type="text"
            icon={<SettingOutlined />}
            onClick={() => handleSettings(record)}
            title="设置"
          />
        </Space>
      ),
    },
    {
      title: '编辑',
      key: 'edit',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            style={{ color: '#1890ff' }}
          >
            修改
          </Button>
          <Popconfirm
            title="确定要删除吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              size="small"
              danger
              style={{ color: '#ff4d4f' }}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 处理配置变更
  const handleConfigChange = (value) => {
    message.success('配置已更新');
  };

  // 切换状态
  const handleToggleStatus = (record) => {
    const newStatus = record.status === 'running' ? 'stopped' : 'running';
    setData((prevData) =>
      prevData.map((item) =>
        item.id === record.id ? { ...item, status: newStatus } : item
      )
    );
    message.success(
      `${record.name} 已${newStatus === 'running' ? '启动' : '停止'}`
    );
  };

  // 重载
  const handleReload = (record) => {
    setData((prevData) =>
      prevData.map((item) =>
        item.id === record.id ? { ...item, status: 'reloading' } : item
      )
    );
    message.loading(`${record.name} 正在重载...`, 1.5, () => {
      setData((prevData) =>
        prevData.map((item) =>
          item.id === record.id ? { ...item, status: 'running' } : item
        )
      );
      message.success(`${record.name} 重载成功`);
    });
  };

  // 设置
  const handleSettings = (record) => {
    message.info(`设置 ${record.name}`);
  };

  // 编辑
  const handleEdit = (record) => {
    message.info(`编辑 ${record.name}`);
    navigate(`/edit?id=${record.id}`);
  };

  // 删除
  const handleDelete = (id) => {
    setData((prevData) => prevData.filter((item) => item.id !== id));
    message.success('删除成功');
  };

  // 批量删除
  const handleBatchDelete = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的项目');
      return;
    }
    setData((prevData) =>
      prevData.filter((item) => !selectedRowKeys.includes(item.id))
    );
    setSelectedRowKeys([]);
    message.success(`已删除 ${selectedRowKeys.length} 项`);
  };

  // 添加新项
  const handleAdd = () => {
    message.info('添加新代理');
    navigate('/edit?id=');
  };

  // 搜索
  const handleSearch = () => {
    message.info(`搜索：${searchText}`);
  };

  // 表格行选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  return (
    <div className="proxy-list-container">
      {/* 页面头部 */}
      <div
        style={{
          backgroundColor: '#fff',
          padding: '16px 24px',
          marginBottom: '16px',
          borderRadius: '4px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <Title level={4} style={{ margin: 0, color: '#333' }}>
            代理列表
          </Title>
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAdd}
              style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
            >
              添加
            </Button>
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={handleBatchDelete}
              disabled={selectedRowKeys.length === 0}
            >
              删除
            </Button>
          </Space>
        </div>

        {/* 搜索区域 */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          <Input
            placeholder="搜索代理名称..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 250 }}
            allowClear
          />
          <Select
            placeholder="配置文件"
            value={configFilter}
            onChange={setConfigFilter}
            style={{ width: 200 }}
            allowClear
          >
            <Option value="50">50</Option>
            <Option value="100">100</Option>
            <Option value="87">87</Option>
          </Select>
        </div>
      </div>

      {/* 表格区域 */}
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '4px',
          padding: '16px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        }}
      >
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          rowSelection={rowSelection}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            pageSizeOptions: ['10', '20', '50'],
          }}
          scroll={{ x: 1400 }}
          size="middle"
          bordered
        />
      </div>
    </div>
  );
};

export default ProxyList;
