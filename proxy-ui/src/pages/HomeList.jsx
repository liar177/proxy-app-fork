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
  PlayCircleOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  getProjectlist,
  deleteProject,
  startAction,
  stopAction,
  restartAction,
} from '../api/project';

const { Title } = Typography;
const { Option } = Select;

const ProxyList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [configFilter, setConfigFilter] = useState('');

  const statusMap = {
    running: { text: '已启动', color: 'green' },
    stopped: { text: '已停止', color: 'red' },
    reloading: { text: '重载中', color: 'orange' },
  };

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
        <Tag color={statusMap[status]?.color || '#fff'}>
          {statusMap[status]?.text || '未知'}
        </Tag>
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
            icon={<PlayCircleOutlined />}
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
            icon={<PoweroffOutlined />}
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

  const loadProjectList = async (searchName = searchText) => {
    try {
      setLoading(true);
      const response = await getProjectlist({
        name: searchName || undefined,
      });
      if (response.code === 0 && response.data) {
        setData(response.data.list || response.data);
      }
    } catch (error) {
      message.error('加载项目列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjectList();
  }, [location.pathname]);

  const handleConfigChange = (value) => {
    message.success('配置已更新');
  };

  const handleToggleStatus = async (record) => {
    const action = record.status === 'running' ? stopAction : startAction;
    const newStatus = record.status === 'running' ? 'stopped' : 'running';

    try {
      setLoading(true);
      const response = await action({ id: record.id });
      if (response.code === 0) {
        setData((prevData) =>
          prevData.map((item) =>
            item.id === record.id ? { ...item, status: newStatus } : item
          )
        );
        message.success(`${record.name} 已${newStatus === 'running' ? '启动' : '停止'}`);
      }
    } catch (error) {
      message.error(`操作失败`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReload = async (record) => {
    try {
      setData((prevData) =>
        prevData.map((item) =>
          item.id === record.id ? { ...item, status: 'reloading' } : item
        )
      );

      const response = await restartAction({ id: record.id });
      if (response.code === 0) {
        setData((prevData) =>
          prevData.map((item) =>
            item.id === record.id ? { ...item, status: 'running' } : item
          )
        );
        message.success(`${record.name} 重载成功`);
      }
    } catch (error) {
      message.error('重载失败');
      console.error(error);
      setData((prevData) =>
        prevData.map((item) =>
          item.id === record.id ? { ...item, status: 'running' } : item
        )
      );
    }
  };

  const handleSettings = (record) => {
    message.info(`设置 ${record.name}`);
  };

  const handleEdit = (record) => {
    navigate(`/edit?id=${record.id}`);
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      const response = await deleteProject({ id });
      if (response.code === 0) {
        setData((prevData) => prevData.filter((item) => item.id !== id));
        message.success('删除成功');
      }
    } catch (error) {
      message.error('删除失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleAdd = () => {
    navigate('/edit');
  };

  const handleSearch = () => {
    loadProjectList();
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  return (
    <div className="proxy-list-container">
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
            onClear={() => {
              setSearchText('');
              loadProjectList('');
            }}
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
