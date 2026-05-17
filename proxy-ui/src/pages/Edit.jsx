import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Switch,
  message,
  Space,
  Divider,
  Modal,
  Spin,
  Typography,
  Row,
  Col
} from 'antd';
import { PlusOutlined, DeleteOutlined, ReloadOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  createProject,
  modifyProject,
  requestProjectPort,
  getProjectInfo
} from '../api/project';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const Edit = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [portLoading, setPortLoading] = useState(false);
  const [portEditable, setPortEditable] = useState(false);
  const isButtonClick = useRef(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [subConfigs, setSubConfigs] = useState([]);
  const [currentSubConfigIndex, setCurrentSubConfigIndex] = useState(null);
  const [jsonModalVisible, setJsonModalVisible] = useState(false);
  const [jsonContent, setJsonContent] = useState('');
  const [currentEditIndex, setCurrentEditIndex] = useState(null);
  const [selectedConfigIndex, setSelectedConfigIndex] = useState(0);
  const [editingJson, setEditingJson] = useState('');

  const defaultJsonTemplate = `{
  "targetAddress": "https://example.com",
  "headers": {
    "cookie": ""
  }
}`;

  useEffect(() => {
    if (subConfigs.length > 0 && selectedConfigIndex < subConfigs.length) {
      setEditingJson(JSON.stringify(subConfigs[selectedConfigIndex], null, 2));
    } else {
      setEditingJson(defaultJsonTemplate);
    }
  }, [subConfigs, selectedConfigIndex]);

  const handleJsonChange = (value) => {
    setEditingJson(value);
    try {
      const parsed = JSON.parse(value);
      const newConfigs = [...subConfigs];
      newConfigs[selectedConfigIndex] = parsed;
      setSubConfigs(newConfigs);
    } catch (e) {
    }
  };

  const handleConfigSelect = (index) => {
    setSelectedConfigIndex(index);
  };

  useEffect(() => {
    const projectId = searchParams.get('id');
    if (projectId) {
      setIsEditMode(true);
      loadProjectData(projectId);
    } else {
      setIsEditMode(false);
      initializeNewProject();
    }
  }, [searchParams]);

  const initializeNewProject = () => {
    form.setFieldsValue({
      name: '',
      port: '',
      description: '',
    });
    setSubConfigs([]);
    fetchPort();
  };

  const loadProjectData = async (projectId) => {
    try {
      setLoading(true);
      const response = await getProjectInfo({ id: projectId });
      if (response.code === 0 && response.data) {
        const projectData = response.data;
        form.setFieldsValue({
          name: projectData.name,
          port: projectData.port,
          description: projectData.description || '',
        });
        if (projectData.configs) {
          setSubConfigs(projectData.configs);
        }
      }
    } catch (error) {
      message.error('加载项目数据失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPort = async () => {
    try {
      setPortLoading(true);
      const response = await requestProjectPort({});
      if (response.code === 0 && response.data) {
        form.setFieldsValue({ port: response.data.port });
        message.success('端口获取成功');
      } else {
        message.warning('端口获取失败，使用默认端口 8000');
        form.setFieldsValue({ port: 8000 });
      }
    } catch (error) {
      message.warning('端口获取失败，使用默认端口 8000');
      form.setFieldsValue({ port: 8000 });
      console.error(error);
    } finally {
      setPortLoading(false);
    }
  };

  const togglePortEditable = () => {
    isButtonClick.current = true;
    setPortEditable((prev) => !prev);
    setTimeout(() => {
      isButtonClick.current = false;
    }, 100);
  };

  const handlePortBlur = () => {
    if (isButtonClick.current) {
      return;
    }
    if (portEditable) {
      setPortEditable(false);
    }
  };

  const addSubConfig = () => {
    const newConfig = {
      targetAddress: '',
      headers: {
        cookie: ''
      }
    };
    setSubConfigs([...subConfigs, newConfig]);
    setSelectedConfigIndex(subConfigs.length);
  };

  const deleteSubConfig = (index) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个子配置吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        const newConfigs = subConfigs.filter((_, i) => i !== index);
        setSubConfigs(newConfigs);
        if (selectedConfigIndex >= newConfigs.length && newConfigs.length > 0) {
          setSelectedConfigIndex(newConfigs.length - 1);
        }
      }
    });
  };

  const openJsonEditor = (index) => {
    setCurrentEditIndex(index);
    const config = subConfigs[index];
    const jsonStr = JSON.stringify(config, null, 2);
    setJsonContent(jsonStr);
    setJsonModalVisible(true);
  };

  const saveJsonContent = () => {
    try {
      const parsedJson = JSON.parse(jsonContent);
      const newConfigs = [...subConfigs];
      newConfigs[currentEditIndex] = parsedJson;
      setSubConfigs(newConfigs);
      setJsonModalVisible(false);
      message.success('子配置保存成功');
    } catch (error) {
      message.error('JSON 格式错误，请检查语法');
    }
  };

  const onFinish = async (values) => {
    try {
      setLoading(true);

      const submitData = {
        name: values.name,
        port: Number(values.port),
        description: values.description,
        configs: subConfigs
      };

      let response;
      if (isEditMode) {
        const projectId = searchParams.get('id');
        response = await modifyProject({ ...submitData, id: projectId });
      } else {
        response = await createProject(submitData);
      }

      if (response.code === 0) {
        navigate('/');
      }
    } catch (error) {
      message.error('操作失败，请重试');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div style={{ padding: '24px', height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
      <Spin spinning={loading}>
        <div style={{ marginBottom: '16px' }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={handleBack}
            style={{ marginBottom: '12px' }}
          >
            返回列表
          </Button>
          <Title level={3} style={{ margin: 0 }}>
            {isEditMode ? '编辑代理配置' : '新建代理配置'}
          </Title>
        </div>

        <div style={{ display: 'flex', gap: '16px', flex: 1, minHeight: 0 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Card
              title="核心配置信息"
              style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)' }}
              styles={{ body: { flex: 1 } }}
            >
              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                style={{ height: '100%' }}
              >
                <Form.Item
                  label="配置名称"
                  name="name"
                  rules={[
                    { required: true, message: '请输入配置名称' },
                    { max: 50, message: '配置名称不能超过50个字符' }
                  ]}
                >
                  <Input placeholder="请输入配置名称" />
                </Form.Item>

                <Form.Item
                  label="本地端口"
                  name="port"
                  rules={[
                    { required: true, message: '端口不能为空' },
                    { pattern: /^\d+$/, message: '请输入有效的端口号' }
                  ]}
                >
                  <Input
                    placeholder="自动生成端口"
                    readOnly={!portEditable}
                    onBlur={handlePortBlur}
                    suffix={
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Button
                          type="link"
                          icon={<ReloadOutlined />}
                          onClick={fetchPort}
                          loading={portLoading}
                          style={{ padding: 0 }}
                        >
                          重新获取端口
                        </Button>
                        <Button
                          type="link"
                          onMouseDown={togglePortEditable}
                          style={{ padding: 0 }}
                        >
                          {portEditable ? '完成修改' : '手动修改端口'}
                        </Button>
                      </div>
                    }
                  />
                </Form.Item>

                <Form.Item
                  label="配置描述"
                  name="description"
                  rules={[
                    { max: 500, message: '配置描述不能超过500个字符' }
                  ]}
                >
                  <TextArea
                    rows={3}
                    placeholder="请输入配置描述（可选）"
                    maxLength={500}
                    showCount
                  />
                </Form.Item>
              </Form>
            </Card>

            <Card
              title="子配置管理"
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={addSubConfig}
                  size="small"
                >
                  添加
                </Button>
              }
              style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)' }}
            >
              <Select
                placeholder="选择要编辑的子配置"
                value={subConfigs.length > 0 ? selectedConfigIndex : undefined}
                onChange={handleConfigSelect}
                style={{ width: '100%', marginBottom: '12px' }}
                disabled={subConfigs.length === 0}
              >
                {subConfigs.map((config, index) => (
                  <Option key={index} value={index}>
                    子配置 {index + 1}：{config.targetAddress || '未设置'}
                  </Option>
                ))}
              </Select>
              {subConfigs.length === 0 && (
                <div style={{ textAlign: 'center', color: 'rgba(0, 0, 0, 0.45)', padding: '20px 0' }}>
                  暂无子配置，点击"添加"按钮添加
                </div>
              )}
            </Card>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Card
              title={subConfigs.length > 0 ? `子配置 ${selectedConfigIndex + 1} JSON` : '子配置 JSON'}
              extra={
                subConfigs.length > 0 && (
                  <Button
                    type="link"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => deleteSubConfig(selectedConfigIndex)}
                  >
                    删除
                  </Button>
                )
              }
              style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)', height: '100%' }}
              styles={{ body: { height: 'calc(100% - 57px)', display: 'flex', flexDirection: 'column' } }}
            >
              {subConfigs.length > 0 ? (
                <TextArea
                  value={editingJson}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  style={{
                    flex: 1,
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    resize: 'none'
                  }}
                />
              ) : (
                <div style={{ textAlign: 'center', color: 'rgba(0, 0, 0, 0.45)', padding: '40px 0' }}>
                  请先添加子配置
                </div>
              )}
            </Card>
          </div>
        </div>

        <div style={{
          marginTop: '16px',
          textAlign: 'center',
          padding: '12px 0',
          borderTop: '1px solid #e8e8e8'
        }}>
          <Space size="middle">
            <Button onClick={handleBack}>
              取消
            </Button>
            <Button
              type="primary"
              onClick={() => form.submit()}
              loading={loading}
              style={{ minWidth: '120px' }}
            >
              {isEditMode ? '保存修改' : '创建配置'}
            </Button>
          </Space>
        </div>
      </Spin>

      <Modal
        title={`编辑子配置 ${currentEditIndex !== null ? currentEditIndex + 1 : ''}`}
        open={jsonModalVisible}
        onOk={saveJsonContent}
        onCancel={() => setJsonModalVisible(false)}
        width={800}
        okText="保存"
        cancelText="取消"
      >
        <div style={{ marginBottom: '16px' }}>
          <Text type="secondary">
            请输入有效的 JSON 格式，必须包含 targetAddress 和 headers 字段
          </Text>
        </div>
        <TextArea
          value={jsonContent}
          onChange={(e) => setJsonContent(e.target.value)}
          rows={20}
          style={{
            fontFamily: 'monospace',
            fontSize: '14px',
            lineHeight: '1.5'
          }}
          placeholder={`{
  "targetAddress": "https://example.com",
  "headers": {
    "cookie": ""
  }
}`}
        />
      </Modal>
    </div>
  );
};

export default Edit;