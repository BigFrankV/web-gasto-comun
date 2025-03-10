import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Tag, Modal, message } from 'antd';
import { EyeOutlined, DollarOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import './MisMultas.css';

const MisMultas = () => {
  const [multas, setMultas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detalleVisible, setDetalleVisible] = useState(false);
  const [multaSeleccionada, setMultaSeleccionada] = useState(null);
  const { user } = useAuth();

  // Datos de ejemplo para multas del residente
  useEffect(() => {
    setLoading(true);
    // Simulación de carga de datos
    setTimeout(() => {
      const multasEjemplo = [
        {
          id: 1,
          motivo: 'Ruido excesivo después de las 22:00 horas',
          monto: 25000,
          fecha: '2025-02-15',
          estado: 'pendiente',
          descripcion: 'Se recibieron quejas de varios vecinos por ruidos molestos durante una reunión en su departamento que se extendió hasta altas horas de la noche.',
        },
        {
          id: 2,
          motivo: 'Estacionamiento en lugar no asignado',
          monto: 15000,
          fecha: '2025-02-20',
          estado: 'pagado',
          descripcion: 'Se verificó que su vehículo estuvo estacionado en un espacio asignado a otro residente durante más de 3 horas.',
          fechaPago: '2025-02-22',
        },
        {
          id: 3,
          motivo: 'Mascota sin supervisión en áreas comunes',
          monto: 20000,
          fecha: '2025-03-05',
          estado: 'pendiente',
          descripcion: 'Su mascota fue encontrada sin supervisión en el área de la piscina, lo cual está prohibido según el reglamento de la comunidad.',
        },
      ];
      setMultas(multasEjemplo);
      setLoading(false);
    }, 1000);
  }, []);

  const showDetalle = (multa) => {
    setMultaSeleccionada(multa);
    setDetalleVisible(true);
  };

  const handlePagar = (id) => {
    Modal.confirm({
      title: '¿Desea proceder con el pago de esta multa?',
      content: 'Será redirigido a la plataforma de pagos',
      okText: 'Proceder al pago',
      cancelText: 'Cancelar',
      onOk() {
        // Simulación de pago exitoso
        setTimeout(() => {
          setMultas(
            multas.map((multa) =>
              multa.id === id
                ? { ...multa, estado: 'pagado', fechaPago: new Date().toISOString().split('T')[0] }
                : multa
            )
          );
          message.success('Pago realizado con éxito');
        }, 1500);
      },
    });
  };

  const columns = [
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
      sorter: (a, b) => new Date(a.fecha) - new Date(b.fecha),
    },
    {
      title: 'Motivo',
      dataIndex: 'motivo',
      key: 'motivo',
      ellipsis: true,
    },
    {
      title: 'Monto',
      dataIndex: 'monto',
      key: 'monto',
      render: (monto) => `$${monto.toLocaleString()}`,
      sorter: (a, b) => a.monto - b.monto,
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado) => (
        <Tag color={estado === 'pendiente' ? 'warning' : 'success'}>
          {estado === 'pendiente' ? 'Pendiente' : 'Pagado'}
        </Tag>
      ),
      filters: [
        { text: 'Pendiente', value: 'pendiente' },
        { text: 'Pagado', value: 'pagado' },
      ],
      onFilter: (value, record) => record.estado === value,
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => showDetalle(record)}
            size="small"
          >
            Ver detalle
          </Button>
          {record.estado === 'pendiente' && (
            <Button
              type="primary"
              icon={<DollarOutlined />}
              onClick={() => handlePagar(record.id)}
              size="small"
              className="btn-pagar"
            >
              Pagar
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="mis-multas-container">
      <Card
        title="Mis Multas"
        className="mis-multas-card"
      >
        <Table
          columns={columns}
          dataSource={multas}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Detalle de la Multa"
        visible={detalleVisible}
        onCancel={() => setDetalleVisible(false)}
        footer={[
          <Button key="back" onClick={() => setDetalleVisible(false)}>
            Cerrar
          </Button>,
          multaSeleccionada?.estado === 'pendiente' && (
            <Button
              key="submit"
              type="primary"
              onClick={() => {
                setDetalleVisible(false);
                handlePagar(multaSeleccionada.id);
              }}
            >
              Proceder al pago
            </Button>
          ),
        ]}
      >
        {multaSeleccionada && (
          <div className="detalle-multa">
            <p><strong>Fecha:</strong> {multaSeleccionada.fecha}</p>
            <p><strong>Motivo:</strong> {multaSeleccionada.motivo}</p>
            <p><strong>Descripción:</strong> {multaSeleccionada.descripcion}</p>
            <p><strong>Monto:</strong> ${multaSeleccionada.monto.toLocaleString()}</p>
            <p>
              <strong>Estado:</strong>{' '}
              <Tag color={multaSeleccionada.estado === 'pendiente' ? 'warning' : 'success'}>
                {multaSeleccionada.estado === 'pendiente' ? 'Pendiente' : 'Pagado'}
              </Tag>
            </p>
            {multaSeleccionada.estado === 'pagado' && (
              <p><strong>Fecha de pago:</strong> {multaSeleccionada.fechaPago}</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MisMultas;
