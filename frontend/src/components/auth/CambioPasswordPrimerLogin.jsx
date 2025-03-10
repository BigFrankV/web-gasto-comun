import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Alert, Spin } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css'; // Reutilizamos los estilos del login

const { Title, Text } = Typography;

const CambioPasswordPrimerLogin = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { changePasswordFirstLogin, user } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    if (values.new_password !== values.confirm_password) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await changePasswordFirstLogin(values.old_password, values.new_password);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.detail || 
        'Error al cambiar la contraseña. Por favor, inténtalo de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <div className="login-header">
          <Title level={2}>Gastos Comunes</Title>
          <Title level={4}>Cambio de Contraseña</Title>
          <Text type="secondary">
            Este es tu primer inicio de sesión. Por seguridad, debes cambiar tu contraseña.
          </Text>
        </div>
        
        {error && <Alert message={error} type="error" showIcon className="login-alert" />}
        
        <Spin spinning={loading}>
          <Form
            name="cambioPassword"
            onFinish={onFinish}
            layout="vertical"
            className="login-form"
          >
            <Form.Item
              name="old_password"
              rules={[{ required: true, message: 'Por favor ingresa tu contraseña actual' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Contraseña actual"
                size="large"
              />
            </Form.Item>
            
            <Form.Item
              name="new_password"
              rules={[
                { required: true, message: 'Por favor ingresa tu nueva contraseña' },
                { min: 8, message: 'La contraseña debe tener al menos 8 caracteres' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Nueva contraseña"
                size="large"
              />
            </Form.Item>
            
            <Form.Item
              name="confirm_password"
              rules={[
                { required: true, message: 'Por favor confirma tu nueva contraseña' },
                { min: 8, message: 'La contraseña debe tener al menos 8 caracteres' }
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirmar nueva contraseña"
                size="large"
              />
            </Form.Item>
            
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                className="login-button"
                size="large"
                block
              >
                Cambiar Contraseña
              </Button>
            </Form.Item>
          </Form>
        </Spin>
      </Card>
    </div>
  );
};

export default CambioPasswordPrimerLogin;
