'use client';

import { Form, Input, Button, Card, Typography, Alert, App } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import React, { useState } from 'react';

const { Title, Text } = Typography;

export default function SignupPage() {
  const router = useRouter();
  // const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onFinish = async (values: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      // message.success('Registration successful! Please login.');
      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#000000', overflow: 'hidden' }}>
      
      {/* Background Ambience */}
      <div className="animate-float" style={{ position: 'absolute', top: '15%', left: '15%', width: 350, height: 350, background: '#3b82f6', borderRadius: '50%', filter: 'blur(120px)', opacity: 0.2, zIndex: 0 }} />
      <div className="animate-float delay-500" style={{ position: 'absolute', bottom: '15%', right: '15%', width: 300, height: 300, background: '#60a5fa', borderRadius: '50%', filter: 'blur(120px)', opacity: 0.15, zIndex: 0 }} />

      <div className="" style={{ position: 'relative', zIndex: 1, width: 400 }}>
      <Card className="premium-card animate-neon-border" style={{ width: '100%', position: 'relative' }}>
          <Link href="/" style={{ position: 'absolute', top: 20, left: 24, color: '#808191', display: 'flex', alignItems: 'center', gap: 4 }}>
             <ArrowLeftOutlined className="active-scale" /> Back
         </Link>
         <div style={{ textAlign: 'center', marginBottom: 24, marginTop: 10 }}>
          <Title level={3} className="animate-fade-up delay-100" style={{ margin: 0, fontFamily: 'var(--font-outfit)' }}>Create Account</Title>
          <Text type="secondary" className="animate-fade-up delay-200" style={{ display: 'block' }}>Sign up to get started</Text>
        </div>

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
          name="signup"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="name"
            className="animate-fade-up delay-300"
            rules={[{ required: true, message: 'Please input your Full Name!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Full Name" className="active-scale" />
          </Form.Item>

          <Form.Item
            name="email"
            className="animate-fade-up delay-300"
            rules={[{ required: true, message: 'Please input your Email!' }, { type: 'email', message: 'Invalid email!' }]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" className="active-scale" />
          </Form.Item>

          <Form.Item
            name="password"
            className="animate-fade-up delay-400"
            rules={[{ required: true, message: 'Please input your Password!' }, { min: 6, message: 'Password must be at least 6 characters' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" className="active-scale" />
          </Form.Item>

           <Form.Item
            name="confirm"
            dependencies={['password']}
            hasFeedback
            className="animate-fade-up delay-500"
            rules={[
              { required: true, message: 'Please confirm your password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('The two passwords that you entered do not match!'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" className="active-scale" />
          </Form.Item>

          <Form.Item className="animate-fade-up delay-500">
            <Button type="primary" htmlType="submit" loading={loading} block className="active-scale animate-sheen animate-glow" style={{ border: 'none', background: '#3b82f6' }}>
              Sign Up
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }} className="animate-fade-up delay-500">
            <Text>Already have an account? <Link href="/login" style={{ color: '#3b82f6' }}>Log in</Link></Text>
          </div>
        </Form>
      </Card>
      </div>
    </div>
  );
}
