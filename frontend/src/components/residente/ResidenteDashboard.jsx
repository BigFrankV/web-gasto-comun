import React from 'react';
import { Row, Col, Card, Statistic, Table, Typography, Button, Tag, Descriptions } from 'antd';
import {
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CreditCardOutlined,
} from '@ant-design/icons';
import './ResidenteDashboard.css';

const { Title } = Typography;

const ResidenteDashboard = () => {
  // Datos de ejemplo para el dashboard
  const estadisticas = [
    {
      titulo: 'Pago Actual',
      valor: '$85,000',
      icono: <DollarOutlined />,
      color: '#1890ff',
    },
    {
      titulo: 'Estado',
      valor: 'Pendiente',
      icono: <ClockCircleOutlined />,
      color: '#faad14',
    },
    {
      titulo: 'Fecha Vencimiento',
      valor: '15/03/2025',
      icono: <CreditCardOutlined />,
      color: '#13c2c2',
    },
    {
      titulo: 'Pagos al Día',
      valor: '11/12',
      icono: <CheckCircleOutlined />,
      color: '#52c41a',
    },
  ];

  // Datos de ejemplo para la tabla de historial de pagos
  const historialPagos = [
    {
      key: '1',
      periodo: 'Febrero 2025',
      monto: '$85,000',
      fechaPago: '2025-02-10',
      estado: 'Pagado',
    },
    {
      key: '2',
      periodo: 'Enero 2025',
      monto: '$85,000',
      fechaPago: '2025-01-12',
      estado: 'Pagado',
    },
    {
      key: '3',
      periodo: 'Diciembre 2024',
      monto: '$80,000',
      fechaPago: '2024-12-08',
      estado: 'Pagado',
    },
    {
      key: '4',
      periodo: 'Noviembre 2024',
      monto: '$80,000',
      fechaPago: '2024-11-10',
      estado: 'Pagado',
    },
  ];

  // Columnas para la tabla de historial de pagos
  const columnasPagos = [
    {
      title: 'Periodo',
      dataIndex: 'periodo',
      key: 'periodo',
    },
    {
      title: 'Monto',
      dataIndex: 'monto',
      key: 'monto',
    },
    {
      title: 'Fecha de Pago',
      dataIndex: 'fechaPago',
      key: 'fechaPago',
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado) => (
        <Tag color={estado === 'Pagado' ? 'green' : 'orange'}>
          {estado}
        </Tag>
      ),
    },
    {
      title: 'Acción',
      key: 'accion',
      render: (_, record) => (
        <Button type="link" size="small">
          Ver Comprobante
        </Button>
      ),
    },
  ];

  // Datos de ejemplo para la información del residente
  const infoResidente = {
    nombre: 'Juan Pérez',
    departamento: 'A101',
    telefono: '+56 9 1234 5678',
    email: 'juan.perez@example.com',
  };

  return (
    <div className="residente-dashboard">
      <Title level={2}>Mi Dashboard</Title>
      
      {/* Información del residente */}
      <Card className="info-card">
        <Descriptions title="Información Personal" bordered>
          <Descriptions.Item label="Nombre" span={3}>{infoResidente.nombre}</Descriptions.Item>
          <Descriptions.Item label="Departamento">{infoResidente.departamento}</Descriptions.Item>
          <Descriptions.Item label="Teléfono">{infoResidente.telefono}</Descriptions.Item>
          <Descriptions.Item label="Email">{infoResidente.email}</Descriptions.Item>
        </Descriptions>
      </Card>
      
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
              {index === 0 && (
                <Button type="primary" className="pagar-button">
                  Pagar Ahora
                </Button>
              )}
            </Card>
          </Col>
        ))}
      </Row>
      
      {/* Tabla de historial de pagos */}
      <Card
        title="Historial de Pagos"
        className="dashboard-card"
        extra={<Button type="link">Ver todos</Button>}
      >
        <Table
          dataSource={historialPagos}
          columns={columnasPagos}
          pagination={false}
          size="middle"
        />
      </Card>
      
      {/* Información adicional */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Próximos Eventos" className="dashboard-card">
            <p>No hay eventos programados próximamente.</p>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Notificaciones" className="dashboard-card">
            <p>No tienes notificaciones nuevas.</p>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ResidenteDashboard;
