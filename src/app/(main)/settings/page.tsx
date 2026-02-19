'use client';

import React from 'react';
import { Card, Form, Input, Button, Switch, Divider, Typography, Space, App } from 'antd';
import { SaveOutlined, UserOutlined, LockOutlined, BellOutlined } from '@ant-design/icons';

const { Title } = Typography;

export default function SettingsPage() {
    // const { message } = App.useApp();
    const [form] = Form.useForm();
    const [loading, setLoading] = React.useState(false);
    const [initialLoading, setInitialLoading] = React.useState(true);
    const [message, setMessage] = React.useState<{ type: 'success' | 'error', content: string } | null>(null);

    React.useEffect(() => {
        async function fetchUser() {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    if (data.user) {
                        form.setFieldsValue({
                            name: data.user.name,
                            email: data.user.email,
                            username: data.user.name, // Mapping username to name for the form field name from previous code
                            notifications: true,
                            theme: true
                        });
                    }
                }
            } catch (error) {
                console.error('Failed to fetch user', error);
            } finally {
                setInitialLoading(false);
            }
        }
        fetchUser();
    }, [form]);

    const onFinish = async (values: any) => {
        setLoading(true);
        setMessage(null);
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: values.username, // logic maps 'username' field to 'name'
                    email: values.email,
                    password: values.password
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to update profile');
            }

            setMessage({ type: 'success', content: 'Profile updated successfully' });
            // Optionally update global user state if using context, but for now page refresh or re-nav will fetch fresh data
            
        } catch (error: any) {
            setMessage({ type: 'error', content: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 800, margin: '0 auto' }} className="animate-fade-up">
            <Space orientation="vertical" size="large" style={{ width: '100%' }}>
                <Card variant="borderless" title={<Title level={4} style={{ color: 'white', margin: 0 }}>Profile Settings</Title>}>
                    
                    {message && ( // Simple alert replacement since App wrapper might be missing context
                        <div style={{ 
                            padding: '10px 15px', 
                            marginBottom: 20, 
                            borderRadius: 8, 
                            background: message.type === 'success' ? 'rgba(74, 222, 128, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            border: `1px solid ${message.type === 'success' ? 'rgba(74, 222, 128, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                            color: message.type === 'success' ? '#4ade80' : '#f87171'
                        }}>
                            {message.content}
                        </div>
                    )}

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        disabled={initialLoading}
                    >
                        <Form.Item label="Full Name" name="username" rules={[{ required: true, message: 'Name is required' }]}>
                            <Input prefix={<UserOutlined />} placeholder="Full Name" />
                        </Form.Item>
                        <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Email is required' }, { type: 'email', message: 'Invalid email' }]}>
                            <Input prefix={<UserOutlined />} placeholder="Email Address" />
                        </Form.Item>
                        
                        <Divider style={{ borderColor: '#272B30' }} />
                        
                        <Title level={5} style={{ color: 'white' }}>Security</Title>
                        <Form.Item label="New Password" name="password">
                            <Input.Password prefix={<LockOutlined />} placeholder="Leave empty to keep current" />
                        </Form.Item>

                        <Divider style={{ borderColor: '#272B30' }} />

                        <Title level={5} style={{ color: 'white' }}>Preferences</Title>
                        <Form.Item label="Email Notifications" name="notifications" valuePropName="checked">
                            <Switch checkedChildren={<BellOutlined />} unCheckedChildren={<BellOutlined />} />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} size="large" className="animate-glow" loading={loading} disabled={initialLoading}>
                                {initialLoading ? 'Loading...' : 'Save Changes'}
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>
            </Space>
        </div>
    );
}
