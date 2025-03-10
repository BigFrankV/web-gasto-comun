import React, { useState, useEffect } from 'react';
import { Layout, Menu, Dropdown, Avatar, Typography, Divider } from 'antd';
import {
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  HomeOutlined,
  UserOutlined,
  LogoutOutlined,
  DollarOutlined,
  BellOutlined,
  SettingOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './DashboardLayout.css';
import './SideMenu.css';

const { Header, Sider, Content } = Layout;
const { Title, Text } = Typography;

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedKey, setSelectedKey] = useState('dashboard');

  // Actualizar la clave seleccionada basada en la ruta actual
  useEffect(() => {
    const path = location.pathname.split('/')[1] || 'dashboard';
    setSelectedKey(path);
  }, [location]);

  const toggle = () => {
    setCollapsed(!collapsed);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="1" icon={<UserOutlined />} onClick={() => navigate('/perfil')}>
        Mi Perfil
      </Menu.Item>
      <Menu.Item key="2" icon={<SettingOutlined />} onClick={() => navigate('/cambio-password')}>
        Cambiar Contraseña
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="3" icon={<LogoutOutlined />} onClick={handleLogout}>
        Cerrar Sesión
      </Menu.Item>
    </Menu>
  );

  // Menú para administradores
  const adminMenuItems = [
    {
      key: 'dashboard',
      icon: <HomeOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/dashboard'),
    },
    {
      key: 'usuarios',
      icon: <UserOutlined />,
      label: 'Usuarios',
      onClick: () => navigate('/usuarios'),
    },
    {
      key: 'gastos',
      icon: <DollarOutlined />,
      label: 'Gastos Comunes',
      onClick: () => navigate('/gastos'),
    },
    {
      key: 'notificaciones',
      icon: <BellOutlined />,
      label: 'Notificaciones',
      onClick: () => navigate('/notificaciones'),
    },
    {
      key: 'reportes',
      icon: <FileTextOutlined />,
      label: 'Reportes',
      onClick: () => navigate('/reportes'),
    },
  ];

  // Menú para residentes
  const residenteMenuItems = [
    {
      key: 'dashboard',
      icon: <HomeOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/dashboard'),
    },
    {
      key: 'mis-gastos',
      icon: <DollarOutlined />,
      label: 'Mis Gastos',
      onClick: () => navigate('/mis-gastos'),
    },
    {
      key: 'mis-notificaciones',
      icon: <BellOutlined />,
      label: 'Notificaciones',
      onClick: () => navigate('/mis-notificaciones'),
    },
  ];

  return (
    <Layout className="dashboard-layout">
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed} 
        className="dashboard-sider"
        width={200}
      >
        <div className="logo">
          {!collapsed && <span>Gastos Comunes</span>}
          {collapsed && <span>GC</span>}
        </div>
        <div className="menu-container">
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]}
            items={isAdmin ? adminMenuItems : residenteMenuItems}
            className="main-menu"
          />
          <div className="menu-footer">
            <Menu
              theme="dark"
              mode="inline"
              selectable={false}
              className="logout-menu"
              items={[
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: 'Cerrar Sesión',
                  onClick: handleLogout,
                  className: 'logout-menu-item',
                }
              ]}
            />
          </div>
        </div>
      </Sider>
      <Layout className={`site-layout ${collapsed ? 'sidebar-closed' : 'sidebar-open'}`}>
        <Header className="dashboard-header">
          <div className="header-left">
            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              className: 'trigger',
              onClick: toggle,
            })}
            <Title level={4} className="header-title">
              {isAdmin ? 'Panel de Administración' : 'Portal de Residentes'}
            </Title>
          </div>
          <div className="header-right">
            <div className="welcome-message">
              <Text className="welcome-text">
                Bienvenido, {isAdmin ? 'Administrador' : 'Residente'} {user?.username}
              </Text>
            </div>
            <Dropdown overlay={userMenu} placement="bottomRight" arrow>
              <div className="user-info">
                <Avatar icon={<UserOutlined />} />
                <span className="user-name">{user?.username}</span>
              </div>
            </Dropdown>
          </div>
        </Header>
        <Content className="dashboard-content">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
