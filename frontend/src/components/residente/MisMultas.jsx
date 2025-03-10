import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Tag, Modal, message, Spin } from 'antd';
import { EyeOutlined, DollarOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import moment from 'moment';
import './MisMultas.css';

const MisMultas = () => {
  const [multas, setMultas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detalleVisible, setDetalleVisible] = useState(false);
  const [multaSeleccionada, setMultaSeleccionada] = useState(null);
  const [procesandoPago, setProcesandoPago] = useState(false);
  const { user, token } = useAuth();

  // Configuración de axios con el token de autenticación
  const authAxios = axios.create({
    baseURL: 'http://localhost:8000',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Configurar interceptor para actualizar el token si cambia
  useEffect(() => {
    // Crear un nuevo interceptor cada vez que el token cambie
    const interceptor = authAxios.interceptors.request.use(
      config => {
        // Actualizar el token en cada solicitud
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      error => {
        return Promise.reject(error);
      }
    );

    // Limpiar el interceptor anterior cuando el token cambie
    return () => {
      authAxios.interceptors.request.eject(interceptor);
    };
  }, [token]);

  // Cargar multas del residente desde la API
  const cargarMultas = async () => {
    if (!token) {
      message.error('No hay token de autenticación');
      return;
    }
    setLoading(true);
    try {
      const response = await authAxios.get('/api/multas/');
      setMultas(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar multas:', error);
      message.error('Error al cargar multas. Por favor, intenta de nuevo más tarde.');
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    if (token) {
      cargarMultas();
    }
  }, [token]);

  const showDetalle = (multa) => {
    setMultaSeleccionada(multa);
    setDetalleVisible(true);
  };

  const handlePagar = async (id) => {
    Modal.confirm({
      title: '¿Desea proceder con el pago de esta multa?',
      content: 'Una vez confirmado, la multa será marcada como pagada',
      okText: 'Proceder al pago',
      cancelText: 'Cancelar',
      onOk: async () => {
        setProcesandoPago(true);
        try {
          await authAxios.post(`/api/multas/${id}/marcar_como_pagada/`);
          message.success('Pago realizado con éxito');
          cargarMultas(); // Recargar la lista de multas
          setDetalleVisible(false); // Cerrar el modal de detalle si está abierto
        } catch (error) {
          console.error('Error al procesar el pago:', error);
          message.error('Error al procesar el pago. Por favor, intente nuevamente.');
        } finally {
          setProcesandoPago(false);
        }
      },
    });
  };

  const columns = [
    {
      title: 'Fecha',
      dataIndex: 'fecha_creacion',
      key: 'fecha_creacion',
      render: (fecha) => moment(fecha).format('DD/MM/YYYY'),
      sorter: (a, b) => moment(a.fecha_creacion).unix() - moment(b.fecha_creacion).unix(),
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
      render: (monto) => `$${Number(monto).toLocaleString()}`,
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
        {loading ? (
          <div className="loading-container">
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={multas}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: 'No tienes multas registradas' }}
          />
        )}
      </Card>

      <Modal
        title="Detalle de la Multa"
        open={detalleVisible}
        onCancel={() => setDetalleVisible(false)}
        footer={[
          <Button key="back" onClick={() => setDetalleVisible(false)}>
            Cerrar
          </Button>,
          multaSeleccionada?.estado === 'pendiente' && (
            <Button
              key="submit"
              type="primary"
              loading={procesandoPago}
              onClick={() => handlePagar(multaSeleccionada.id)}
            >
              Proceder al pago
            </Button>
          ),
        ]}
      >
        {multaSeleccionada && (
          <div className="detalle-multa">
            <p><strong>Fecha:</strong> {moment(multaSeleccionada.fecha_creacion).format('DD/MM/YYYY')}</p>
            <p><strong>Motivo:</strong> {multaSeleccionada.motivo}</p>
            {multaSeleccionada.descripcion && (
              <p><strong>Descripción:</strong> {multaSeleccionada.descripcion}</p>
            )}
            <p><strong>Monto:</strong> ${Number(multaSeleccionada.monto).toLocaleString()}</p>
            <p>
              <strong>Estado:</strong>{' '}
              <Tag color={multaSeleccionada.estado === 'pendiente' ? 'warning' : 'success'}>
                {multaSeleccionada.estado === 'pendiente' ? 'Pendiente' : 'Pagado'}
              </Tag>
            </p>
            {multaSeleccionada.estado === 'pagado' && multaSeleccionada.fecha_pago && (
              <p><strong>Fecha de pago:</strong> {moment(multaSeleccionada.fecha_pago).format('DD/MM/YYYY')}</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MisMultas;
