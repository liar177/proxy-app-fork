import { useState, useEffect } from 'react';
import { Card, Typography, Button, Space } from 'antd';

const { Title, Paragraph } = Typography;
// TODO1: 增加一个是否是首次进入app的接口获取判断，如果是首次进入 展示欢迎使用

const FirstEnterContent = ({ toList }) => {

  return (
    <>
      <Title level={2}>Proxy UI</Title>
      <Paragraph>
        欢迎使用Proxy UI，一个用于管理前端开发过程中代理地址的工具。
        本工具旨在解决前端开发过程中代理地址切换需重启服务的问题，
        实现本地Web前端项目启动后自动代理HTTP/HTTPS请求至目标服务器的功能。
      </Paragraph>
      <Space>
        <Button onClick={toList} type="primary">开始使用</Button>
        <Button>查看文档</Button>
      </Space>
    </>
  );
}

const ListContent = ({ back2Enter }) => {
  return (
    <>
      <div>
        代理列表内容
        <Button onClick={() => back2Enter(true)}>返回欢迎使用</Button>
      </div>
      
    </>
  );
}

const Home = () => {
  const [isFirstEnter, setIsFirstEnter] = useState(true);
  const toList = () =>{
    setIsFirstEnter(false);
  }
  useEffect(() => {
    // TODO1.1:增加接口调用
    // setIsFirstEnter(true);
    console.log("home的mounted11");
    
  }, []);
  return (
    <div style={{ padding: '24px' }}>
      <Card>
        {isFirstEnter && <FirstEnterContent toList={toList} />}
        {!isFirstEnter && <ListContent back2Enter={setIsFirstEnter} />}
      </Card>
    </div>
  );
};

export default Home;