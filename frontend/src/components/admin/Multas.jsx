import React, { useState, useEffect } from 'react';
import { Table, Card, Button, Space, Modal, Form, Input, DatePicker, Select, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import './Multas.css';

const { Option } = Select;

const Multas = () => {
  const [multas, setMultas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState(null);

  // Datos de ejemplo para multas
  useEffect(() => {
    setLoading(true);
    // Simulación de carga de datos
    setTimeout(() => {
      const multasEjemplo = [
        {
          id: 1,
          residente: 'Juan Pérez',
          motivo: 'Ruido excesivo',
          monto: 25000,
          fecha: '2025-02-15',
          estado: 'pendiente',
        },
        {
          id: 2,
          residente: 'María González',
          motivo: 'Estacionamiento indebido',
          monto: 15000,
          fecha: '2025-02-20',
          estado: 'pagado',
        },
        {
          id: 3,
          residente: 'Carlos Rodríguez',
          motivo: 'Daños a áreas comunes',
          monto: 50000,
          fecha: '2025-03-01',
          estado: 'pendiente',
        },
        {
          id: 4,
          residente: 'Ana Martínez',
          motivo: 'Mascota sin supervisión',
          monto: 20000,
          fecha: '2025-03-05',
          estado: 'pendiente',
        },
      ];
      setMultas(multasEjemplo);
      setLoading(false);
    }, 1000);
  }, []);

  const showModal = (record = null) => {
    if (record) {
      setEditingId(record.id);
      form.setFieldsValue({
        residente: record.residente,
        motivo: record.motivo,
        monto: record.monto,
        fecha: record.fecha,
        estado: record.estado,
      });
    } else {
      setEditingId(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  const handleCancel = () => {
    setModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = (values) => {
    if (editingId) {
      // Actualizar multa existente
      setMultas(
        multas.map((multa) =>
          multa.id === editingId
            ? { ...multa, ...values }
            : multa
        )
      );
      message.success('Multa actualizada correctamente');
    } else {
      // Crear nueva multa
      const newMulta = {
        id: Math.max(...multas.map((m) => m.id), 0) + 1,
        ...values,
      };
      setMultas([...multas, newMulta]);
      message.success('Multa creada correctamente');
    }
    setModalVisible(false);
    form.resetFields();
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: '¿Está seguro de eliminar esta multa?',
      content: 'Esta acción no se puede deshacer',
      okText: 'Sí, eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk() {
        setMultas(multas.filter((multa) => multa.id !== id));
        message.success('Multa eliminada correctamente');
      },
    });
  };

  const columns = [
    {
      title: 'Residente',
      dataIndex: 'residente',
      key: 'residente',
      sorter: (a, b) => a.residente.localeCompare(b.residente),
    },
    {
      title: 'Motivo',
      dataIndex: 'motivo',
      key: 'motivo',
    },
    {
      title: 'Monto',
      dataIndex: 'monto',
      key: 'monto',
      render: (monto) => `$${monto.toLocaleString()}`,
      sorter: (a, b) => a.monto - b.monto,
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
      sorter: (a, b) => new Date(a.fecha) - new Date(b.fecha),
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      key: 'estado',
      render: (estado) => (
        <span className={`estado-${estado}`}>
          {estado === 'pendiente' ? 'Pendiente' : 'Pagado'}
        </span>
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
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
            size="small"
          >
            Editar
          </Button>
          <Button
            type="danger"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            size="small"
          >
            Eliminar
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="multas-container">
      <Card
        title="Gestión de Multas"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            Nueva Multa
          </Button>
        }
        className="multas-card"
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
        title={editingId ? 'Editar Multa' : 'Nueva Multa'}
        visible={modalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="residente"
            label="Residente"
            rules={[{ required: true, message: 'Por favor ingrese el nombre del residente' }]}
          >
            <Input placeholder="Nombre del residente" />
          </Form.Item>
          <Form.Item
            name="motivo"
            label="Motivo"
            rules={[{ required: true, message: 'Por favor ingrese el motivo de la multa' }]}
          >
            <Input.TextArea placeholder="Motivo de la multa" rows={3} />
          </Form.Item>
          <Form.Item
            name="monto"
            label="Monto"
            rules={[{ required: true, message: 'Por favor ingrese el monto de la multa' }]}
          >
            <Input
              type="number"
              prefix="$"
              placeholder="Monto de la multa"
              min={1}
            />
          </Form.Item>
          <Form.Item
            name="fecha"
            label="Fecha"
            rules={[{ required: true, message: 'Por favor seleccione la fecha' }]}
          >
            <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item
            name="estado"
            label="Estado"
            rules={[{ required: true, message: 'Por favor seleccione el estado' }]}
          >
            <Select placeholder="Seleccione un estado">
              <Option value="pendiente">Pendiente</Option>
              <Option value="pagado">Pagado</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={handleCancel}>Cancelar</Button>
              <Button type="primary" htmlType="submit">
                {editingId ? 'Actualizar' : 'Crear'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Multas;
