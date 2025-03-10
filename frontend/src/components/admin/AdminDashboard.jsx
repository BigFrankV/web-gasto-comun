import React from 'react';
import { Row, Col, Card, Statistic, Table, Typography, Button } from 'antd';
import {
  UserOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import './AdminDashboard.css';

const { Title } = Typography;

const AdminDashboard = () => {
  // Datos de ejemplo para el dashboard
  const estadisticas = [
    {
      titulo: 'Total Residentes',
      valor: 45,
      icono: <UserOutlined />,
      color: '#1890ff',
    },
    {
      titulo: 'Total Recaudado',
      valor: '$2,450,000',
      icono: <DollarOutlined />,
      color: '#52c41a',
    },
    {
      titulo: 'Pagos Pendientes',
      valor: 12,
      icono: <ClockCircleOutlined />,
      color: '#faad14',
    },
    {
      titulo: 'Pagos Completados',
      valor: 33,
      icono: <CheckCircleOutlined />,
      color: '#13c2c2',
    },
  ];

  // Datos de ejemplo para la tabla de pagos recientes
  const pagosRecientes = [
    {
      key: '1',
      residente: 'Juan Pérez',
      departamento: 'A101',
      monto: '$85,000',
      fecha: '2025-03-05',
      estado: 'Pagado',
    },
    {
      key: '2',
      residente: 'María González',
      departamento: 'B205',
      monto: '$85,000',
      fecha: '2025-03-07',
      estado: 'Pagado',
    },
    {
      key: '3',
      residente: 'Carlos Rodríguez',
      departamento: 'C310',
      monto: '$85,000',
      fecha: '2025-03-08',
      estado: 'Pagado',
    },
    {
      key: '4',
      residente: 'Ana Martínez',
      departamento: 'A102',
      monto: '$85,000',
      fecha: '2025-03-10',
      estado: 'Pagado',
    },
  ];

  // Columnas para la tabla de pagos recientes
  const columnasPagos = [
    {
      title: 'Residente',
      dataIndex: 'residente',
      key: 'residente',
    },
    {
      title: 'Departamento',
      dataIndex: 'departamento',
      key: 'departamento',
    },
    {
      title: 'Monto',
      dataIndex: 'monto',
      key: 'monto',
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado) => (
        <span className={estado === 'Pagado' ? 'estado-pagado' : 'estado-pendiente'}>
          {estado}
        </span>
      ),
    },
  ];

  // Datos de ejemplo para la tabla de residentes con pagos pendientes
  const residentesPendientes = [
    {
      key: '1',
      residente: 'Roberto Sánchez',
      departamento: 'B201',
      monto: '$85,000',
      vencimiento: '2025-03-15',
      estado: 'Pendiente',
    },
    {
      key: '2',
      residente: 'Laura Torres',
      departamento: 'C305',
      monto: '$85,000',
      vencimiento: '2025-03-15',
      estado: 'Pendiente',
    },
    {
      key: '3',
      residente: 'Pedro Díaz',
      departamento: 'A105',
      monto: '$85,000',
      vencimiento: '2025-03-15',
      estado: 'Pendiente',
    },
    {
      key: '4',
      residente: 'Sofía Vargas',
      departamento: 'B210',
      monto: '$85,000',
      vencimiento: '2025-03-15',
      estado: 'Pendiente',
    },
  ];

  // Columnas para la tabla de residentes con pagos pendientes
  const columnasPendientes = [
    {
      title: 'Residente',
      dataIndex: 'residente',
      key: 'residente',
    },
    {
      title: 'Departamento',
      dataIndex: 'departamento',
      key: 'departamento',
    },
    {
      title: 'Monto',
      dataIndex: 'monto',
      key: 'monto',
    },
    {
      title: 'Vencimiento',
      dataIndex: 'vencimiento',
      key: 'vencimiento',
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado) => (
        <span className="estado-pendiente">
          {estado}
        </span>
      ),
    },
    {
      title: 'Acción',
      key: 'accion',
      render: () => (
        <Button type="primary" size="small">
          Enviar Recordatorio
        </Button>
      ),
    },
  ];

  return (
    <div className="admin-dashboard">
      <Title level={2}>Dashboard de Administración</Title>
      
      {/* Tarjetas de estadísticas */}
      <Row gutter={[16, 16]} className="stats-row">
        {estadisticas.map((stat, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card className="stat-card">
              <Statistic
                title={stat.titulo}
                value={stat.valor}
                prefix={React.cloneElement(stat.icono, { style: { color: stat.color } })}
                valueStyle={{ color: stat.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>
      
      {/* Tabla de pagos recientes */}
      <Card
        title="Pagos Recientes"
        className="dashboard-card"
        extra={<Button type="link">Ver todos</Button>}
      >
        <Table
          dataSource={pagosRecientes}
          columns={columnasPagos}
          pagination={false}
          size="middle"
        />
      </Card>
      
      {/* Tabla de residentes con pagos pendientes */}
      <Card
        title="Pagos Pendientes"
        className="dashboard-card"
        extra={<Button type="link">Ver todos</Button>}
      >
        <Table
          dataSource={residentesPendientes}
          columns={columnasPendientes}
          pagination={false}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default AdminDashboard;
