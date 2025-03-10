import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Modal, Form, Input, DatePicker, Select, message, Spin, Tooltip, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, InfoCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import { useAuth } from '../../context/AuthContext';
import './Multas.css';

const { Option } = Select;
const { TextArea } = Input;

const Multas = () => {
  const [multas, setMultas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);
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

  // Cargar multas desde la API
  const cargarMultas = async () => {
    if (!token) {
      message.error('No hay token de autenticación');
      return;
    }
    setLoading(true);
    try {
      const response = await authAxios.get('/api/multas/');
      setMultas(response.data);
    } catch (error) {
      console.error('Error al cargar multas:', error);
      message.error('No se pudieron cargar las multas. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Cargar usuarios residentes desde la API
  const cargarUsuarios = async () => {
    if (!token) {
      message.error('No hay token de autenticación');
      return;
    }
    try {
      const response = await authAxios.get('/api/auth/usuarios/?rol=residente');
      setUsuarios(response.data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      message.error('No se pudieron cargar los usuarios. Por favor, intente nuevamente.');
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    if (token) {
      cargarMultas();
      cargarUsuarios();
    }
  }, [token]);

  const showModal = (record = null) => {
    if (record) {
      setEditingId(record.id);
      form.setFieldsValue({
        usuario: record.usuario,
        motivo: record.motivo,
        descripcion: record.descripcion || '',
        monto: record.monto,
        estado: record.estado,
        fecha_pago: record.fecha_pago ? moment(record.fecha_pago) : null,
      });
    } else {
      setEditingId(null);
      form.resetFields();
      form.setFieldsValue({
        estado: 'pendiente',
      });
    }
    setModalVisible(true);
  };
   
  const handleCancel = () => {
    setModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    try {
      // Formatear fecha de pago si existe
      if (values.fecha_pago) {
        values.fecha_pago = values.fecha_pago.format('YYYY-MM-DD');
      }

      if (editingId) {
        // Actualizar multa existente
        await authAxios.put(`/api/multas/${editingId}/`, values);
        message.success('Multa actualizada correctamente');
      } else {
        // Crear nueva multa
        await authAxios.post('/api/multas/', values);
        message.success('Multa creada correctamente');
      }
      
      setModalVisible(false);
      form.resetFields();
      cargarMultas(); // Recargar la lista de multas
    } catch (error) {
      console.error('Error al guardar multa:', error);
      message.error('Error al guardar la multa. Por favor, intente nuevamente.');
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: '¿Está seguro de eliminar esta multa?',
      content: 'Esta acción no se puede deshacer',
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await authAxios.delete(`/api/multas/${id}/`);
          message.success('Multa eliminada correctamente');
          cargarMultas(); // Recargar la lista de multas
        } catch (error) {
          console.error('Error al eliminar multa:', error);
          message.error('Error al eliminar la multa. Por favor, intente nuevamente.');
        }
      },
    });
  };

  const handleMarcarPagada = async (id) => {
    try {
      await authAxios.post(`/api/multas/${id}/marcar_como_pagada/`);
      message.success('Multa marcada como pagada correctamente');
      cargarMultas(); // Recargar la lista de multas
    } catch (error) {
      console.error('Error al marcar multa como pagada:', error);
      message.error('Error al marcar la multa como pagada. Por favor, intente nuevamente.');
    }
  };

  const columns = [
    {
      title: 'Residente',
      dataIndex: 'usuario_nombre',
      key: 'usuario_nombre',
      sorter: (a, b) => a.usuario_nombre.localeCompare(b.usuario_nombre),
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
      title: 'Fecha',
      dataIndex: 'fecha_creacion',
      key: 'fecha_creacion',
      render: (fecha) => moment(fecha).format('DD/MM/YYYY'),
      sorter: (a, b) => moment(a.fecha_creacion).unix() - moment(b.fecha_creacion).unix(),
    },
    {
      title: 'Acciones',
      key: 'acciones',
      render: (_, record) => (
        <Space>
          <Tooltip title='Editar'>
            <Button type='link' icon={<EditOutlined />} onClick={() => showModal(record)} />
          </Tooltip>
          <Tooltip title='Eliminar'>
            <Button type='link' danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
          </Tooltip>
          {record.estado === 'pendiente' && (
            <Tooltip title='Marcar como pagada'>
              <Button type='link' icon={<CheckCircleOutlined />} onClick={() => handleMarcarPagada(record.id)} />
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Card
      title='Multas'
      extra={
        <Button type='primary' icon={<PlusOutlined />} onClick={() => showModal()}>
          Agregar Multa
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={multas}
        loading={loading}
        rowKey='id'
        pagination={{ pageSize: 10 }}
      />
      <Modal
        open={modalVisible}
        onCancel={handleCancel}
        onOk={form.submit}
        footer={[
          <Button key='cancelar' onClick={handleCancel}>
            Cancelar
          </Button>,
          <Button key='guardar' type='primary' onClick={form.submit}>
            {editingId ? 'Actualizar' : 'Guardar'}
          </Button>,
        ]}
      >
        <Form form={form} onFinish={handleSubmit} layout='vertical'>
          <Form.Item
            name='usuario'
            label='Residente'
            rules={[{ required: true, message: 'Seleccione un residente' }]}
          >
            <Select placeholder='Seleccione un residente'>
              {usuarios.map((usuario) => (
                <Option key={usuario.id} value={usuario.id}>
                  {usuario.first_name} {usuario.last_name} - {usuario.numero_residencia || 'Sin residencia'}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name='motivo'
            label='Motivo'
            rules={[{ required: true, message: 'Ingrese el motivo' }]}
          >
            <Input placeholder='Ingrese el motivo' />
          </Form.Item>
          <Form.Item
            name='monto'
            label='Monto'
            rules={[{ required: true, message: 'Ingrese el monto' }]}
          >
            <Input type='number' prefix="$" placeholder='Ingrese el monto' min={1} />
          </Form.Item>
          <Form.Item name='descripcion' label='Descripción'>
            <TextArea rows={3} placeholder='Ingrese una descripción (opcional)' />
          </Form.Item>
          <Form.Item name='estado' label='Estado' initialValue='pendiente'>
            <Select disabled={!!editingId}>
              <Option value='pendiente'>Pendiente</Option>
              <Option value='pagado'>Pagado</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name='fecha_pago'
            label='Fecha de pago'
            dependencies={['estado']}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (getFieldValue('estado') === 'pagado' && !value) {
                    return Promise.reject('Por favor seleccione la fecha de pago');
                  }
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <DatePicker 
              style={{ width: '100%' }} 
              format="DD/MM/YYYY"
              placeholder="Seleccione fecha de pago"
              disabled={form.getFieldValue('estado') !== 'pagado'}
            />
          </Form.Item>
          <Form.Item>
            <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={handleCancel}>Cancelar</Button>
              <Button type="primary" htmlType="submit">
                {editingId ? 'Actualizar' : 'Guardar'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default Multas;
