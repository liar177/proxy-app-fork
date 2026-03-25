import React, { useState, useEffect } from 'react';
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
  const [isEditMode, setIsEditMode] = useState(false);
  const [subConfigs, setSubConfigs] = useState([]);
  const [currentSubConfigIndex, setCurrentSubConfigIndex] = useState(null);
  const [jsonModalVisible, setJsonModalVisible] = useState(false);
  const [jsonContent, setJsonContent] = useState('');
  const [currentEditIndex, setCurrentEditIndex] = useState(null);

  // 判断是添加还是编辑模式
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

  // 初始化新项目
  const initializeNewProject = () => {
    form.setFieldsValue({
      name: '',
      port: '',
      description: '',
    });
    setSubConfigs([]);
    // 自动获取端口
    fetchPort();
  };

  // 加载项目数据
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
        // 解析子配置
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

  // 获取端口
  const fetchPort = async () => {
    try {
      setPortLoading(true);
      const response = await requestProjectPort({});
      if (response.code === 0 && response.data) {
        form.setFieldsValue({ port: response.data.port });
        message.success('端口获取成功');
      } else {
        message.error('端口获取失败');
      }
    } catch (error) {
      message.error('端口获取失败，请重试');
      console.error(error);
    } finally {
      setPortLoading(false);
    }
  };

  // 添加子配置
  const addSubConfig = () => {
    const newConfig = {
      targetAddress: '',
      headers: {
        cookie: ''
      }
    };
    setSubConfigs([...subConfigs, newConfig]);
  };

  // 删除子配置
  const deleteSubConfig = (index) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个子配置吗？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        const newConfigs = subConfigs.filter((_, i) => i !== index);
        setSubConfigs(newConfigs);
      }
    });
  };

  // 打开 JSON 编辑器
  const openJsonEditor = (index) => {
    setCurrentEditIndex(index);
    const config = subConfigs[index];
    const jsonStr = JSON.stringify(config, null, 2);
    setJsonContent(jsonStr);
    setJsonModalVisible(true);
  };

  // 保存 JSON 内容
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

  // 表单提交
  const onFinish = async (values) => {
    try {
      setLoading(true);
      
      // 构建提交数据
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
        message.success(isEditMode ? '修改成功' : '创建成功');
        navigate('/');
      } else {
        message.error(response.msg || '操作失败');
      }
    } catch (error) {
      message.error('操作失败，请重试');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 返回列表
  const handleBack = () => {
    navigate('/');
  };

  return (
    <div style={{ padding: '24px' }}>
      <Spin spinning={loading}>
        {/* 页面头部 */}
        <div style={{ marginBottom: '24px' }}>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={handleBack}
            style={{ marginBottom: '16px' }}
          >
            返回列表
          </Button>
          <Title level={3} style={{ margin: '0 0 16px 0' }}>
            {isEditMode ? '编辑代理配置' : '新建代理配置'}
          </Title>
        </div>

        {/* 核心配置信息模块 */}
        <Card 
          title="核心配置信息"
          style={{ marginBottom: '24px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)' }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
          >
            <Row gutter={24}>
              <Col xs={24} sm={24} md={12}>
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
              </Col>

              <Col xs={24} sm={24} md={12}>
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
                    readOnly
                    suffix={
                      <Button
                        type="link"
                        icon={<ReloadOutlined />}
                        onClick={fetchPort}
                        loading={portLoading}
                        style={{ padding: 0 }}
                      >
                        重新获取端口
                      </Button>
                    }
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="配置描述"
              name="description"
              rules={[
                { max: 500, message: '配置描述不能超过500个字符' }
              ]}
            >
              <TextArea
                rows={4}
                placeholder="请输入配置描述（可选）"
                maxLength={500}
                showCount
              />
            </Form.Item>
          </Form>
        </Card>

        {/* 子配置管理模块 */}
        <Card
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>子配置管理</span>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={addSubConfig}
                size="small"
              >
                添加子配置
              </Button>
            </div>
          }
          style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)' }}
        >
          {subConfigs.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 0',
              color: 'rgba(0, 0, 0, 0.45)' 
            }}>
              暂无子配置，点击右上角"添加子配置"按钮添加
            </div>
          ) : (
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {subConfigs.map((config, index) => (
                <Card
                  key={index}
                  size="small"
                  style={{ marginBottom: '16px', backgroundColor: '#fafafa' }}
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text strong>子配置 {index + 1}</Text>
                      <Space>
                        <Button
                          type="link"
                          size="small"
                          onClick={() => openJsonEditor(index)}
                        >
                          编辑 JSON
                        </Button>
                        <Button
                          type="link"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => deleteSubConfig(index)}
                        >
                          删除
                        </Button>
                      </Space>
                    </div>
                  }
                >
                  <Row gutter={16}>
                    <Col span={24}>
                      <div style={{ marginBottom: '8px' }}>
                        <Text type="secondary">目标地址：</Text>
                        <Text code>{config.targetAddress || '未设置'}</Text>
                      </div>
                    </Col>
                    <Col span={24}>
                      <div>
                        <Text type="secondary">请求头：</Text>
                        <pre style={{ 
                          backgroundColor: '#f5f5f5', 
                          padding: '8px', 
                          borderRadius: '4px',
                          maxHeight: '100px',
                          overflow: 'auto',
                          fontSize: '12px'
                        }}>
                          {JSON.stringify(config.headers, null, 2)}
                        </pre>
                      </div>
                    </Col>
                  </Row>
                </Card>
              ))}
            </div>
          )}
        </Card>

        {/* 底部操作按钮 */}
        <div style={{ 
          marginTop: '24px', 
          textAlign: 'center',
          padding: '16px 0',
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

      {/* JSON 编辑器弹窗 */}
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
