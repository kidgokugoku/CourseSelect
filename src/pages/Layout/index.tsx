import { EditFilled, UnorderedListOutlined } from '@ant-design/icons'
import { Layout, Menu, MenuProps } from 'antd'
import React, { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { UserDataProvider } from '../../component/UserDataContext'

const { Content, Sider } = Layout

const items: MenuProps['items'] = [
  {
    icon: <EditFilled />,
    label: <Link to="/main">选择课程</Link>,
    key: '/main',
  },
  {
    icon: <UnorderedListOutlined />,
    label: <Link to="/now">当前课程</Link>,
    key: '/now',
  },
]
const IndexLayout: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState('')

  return (
    <Layout className="layout">
      <Layout>
        <Menu
          mode="horizontal"
          className="site-layout-background"
          theme="dark"
          onSelect={() => {
            setSelectedKey(location.pathname)
          }}
          selectedKeys={[selectedKey]}
          items={items}
        ></Menu>
        <Layout className="layout-content" style={{ padding: 20 }}>
          <Content
            className="site-layout-background"
            style={{
              padding: 12,
              margin: 0,
              minHeight: 280,
            }}
          >
            <UserDataProvider>
              <Outlet />
            </UserDataProvider>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  )
}

export default IndexLayout
