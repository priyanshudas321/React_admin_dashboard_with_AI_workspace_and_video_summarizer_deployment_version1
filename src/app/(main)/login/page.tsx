'use client';

import { Form, Input, Button, Card, Typography, Alert, App } from 'antd';
import { UserOutlined, LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import React, { useState } from 'react';

const { Title, Text } = Typography;

export default function LoginPage() {
  const router = useRouter();
  // const { message } = App.useApp(); // Need to wrap in App to use this, falling back to standard alert or just console for now if App wrapper missing in root
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;

  React.useEffect(() => {
    if (searchParams?.get('registered') === 'true') {
      setSuccessMessage('Account created successfully. Your account is pending Admin approval. Please wait for authorization.');
    }
  }, []);

  const onFinish = async (values: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // message.success('Login successful!');
      if (data.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#000000', overflow: 'hidden' }}>
      
      {/* Background Ambience */}
      <div className="animate-float" style={{ position: 'absolute', top: '20%', left: '20%', width: 300, height: 300, background: '#3b82f6', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.2, zIndex: 0 }} />
      <div className="animate-float delay-500" style={{ position: 'absolute', bottom: '20%', right: '20%', width: 250, height: 250, background: '#60a5fa', borderRadius: '50%', filter: 'blur(100px)', opacity: 0.2, zIndex: 0 }} />

      <div className="" style={{ position: 'relative', zIndex: 1, width: 400 }}>
        <Card className="premium-card animate-neon-border" style={{ width: '100%', position: 'relative' }}>
        <Link href="/" style={{ position: 'absolute', top: 20, left: 24, color: '#808191', display: 'flex', alignItems: 'center', gap: 4 }}>
             <ArrowLeftOutlined className="active-scale" /> Back
         </Link>
        <div style={{ textAlign: 'center', marginBottom: 24, marginTop: 10 }}>
          <Title level={3} className="animate-fade-up delay-100" style={{ margin: 0, fontFamily: 'var(--font-outfit)' }}>Welcome Back</Title>
          <Text type="secondary" className="animate-fade-up delay-200" style={{ display: 'block' }}>Please sign in to continue</Text>
        </div>

        {successMessage && (
            <div className="animate-fade-up">
            <Alert
                title={<span style={{ fontWeight: 600 }}>Registration Successful</span>}
                description={successMessage}
                type="success"
                showIcon
                style={{ marginBottom: 24, background: 'rgba(74, 222, 128, 0.1)', borderColor: 'rgba(74, 222, 128, 0.2)', color: '#4ade80' }}
            />
            </div>
        )}

        {error && (
          <div className="animate-fade-up">
            <Alert
                title={<span style={{ fontWeight: 600 }}>Error</span>}
                description={error}
                type="error"
                showIcon
                style={{ marginBottom: 24 }}
            />
          </div>
        )}

        <Form
          name="login"
          initialValues={{ remember: true }}
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            className="animate-fade-up delay-300"
            rules={[{ required: true, message: 'Please input your Email!' }, { type: 'email', message: 'Invalid email!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" className="active-scale" />
          </Form.Item>

          <Form.Item
            name="password"
            className="animate-fade-up delay-400"
            rules={[{ required: true, message: 'Please input your Password!' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" className="active-scale" />
          </Form.Item>

          <Form.Item className="animate-fade-up delay-500">
            <Button type="primary" htmlType="submit" loading={loading} block className="active-scale animate-sheen animate-glow" style={{ border: 'none', background: '#3b82f6' }}>
              Log in
            </Button>
          </Form.Item>
          
          <div style={{ textAlign: 'center' }} className="animate-fade-up delay-500">
            <Text>Don't have an account? <Link href="/signup" style={{ color: '#3b82f6' }}>Sign up</Link></Text>
          </div>
        </Form>
      </Card>
      </div>
    </div>
  );
}
