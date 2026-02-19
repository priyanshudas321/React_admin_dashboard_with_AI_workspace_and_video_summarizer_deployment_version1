'use client';

import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Card, Typography, App, Space } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

interface User {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

export default function UsersPage() {
  const router = useRouter();
  // const { message } = App.useApp();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.status === 401 || res.status === 403) {
        router.push('/login');
        return;
      }
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
      // message.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });

      if (!res.ok) throw new Error('Failed to approve user');

      // message.success('User approved successfully');
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error(error);
      // message.error('Failed to approve user');
    }
  };

  const handleRevoke = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'pending' }), // Revoke access by setting to pending
      });

      if (!res.ok) throw new Error('Failed to revoke user access');

      fetchUsers(); // Refresh list
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleRole = async (user: User) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    try {
        const res = await fetch(`/api/admin/users/${user.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role: newRole }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to update role');

        // message.success(`User role updated to ${newRole.toUpperCase()}`);
        fetchUsers();
    } catch (error: any) {
        console.error(error);
        // message.error(error.message);
    }
  };

  const columns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text: string) => <Text strong style={{ color: 'white' }}>{text}</Text>,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const isAdmin = role === 'admin';
        return (
          <Tag 
            color={isAdmin ? 'rgba(108, 93, 211, 0.15)' : 'rgba(45, 156, 219, 0.15)'} 
            style={{ 
                color: isAdmin ? '#6C5DD3' : '#2D9CDB', 
                borderRadius: 8, 
                border: '1px solid',
                borderColor: isAdmin ? 'rgba(108, 93, 211, 0.3)' : 'rgba(45, 156, 219, 0.3)',
                fontWeight: 600,
                fontSize: 12,
                padding: '2px 10px'
            }}
          >
             {role.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'approved' ? 'rgba(117, 255, 117, 0.1)' : 'rgba(255, 117, 76, 0.1)'} style={{ color: status === 'approved' ? '#75FF75' : '#FF754C', borderRadius: 8, border: 0 }}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: User) => (
        <Space size="middle">
          {record.status === 'pending' && (
            <Button type="primary" size="small" onClick={() => handleApprove(record.id)} className="animate-glow" style={{ borderRadius: 8 }}>
              Approve
            </Button>
          )}
          {record.status === 'approved' && record.role !== 'admin' && (
            <Button size="small" onClick={() => handleRevoke(record.id)} style={{ borderRadius: 8, borderColor: '#ff4d4f', color: '#ff4d4f' }}>
              Revoke
            </Button>
          )}
          {record.email !== 'test@test.com' && (
             <Button 
                size="small" 
                onClick={() => handleToggleRole(record)}
                style={{ 
                    borderRadius: 8, 
                    borderColor: record.role === 'admin' ? '#ff4d4f' : '#6C5DD3',
                    color: record.role === 'admin' ? '#ff4d4f' : '#6C5DD3'
                }}
             >
                {record.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
             </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="animate-fade-up">
      <Card variant="borderless" title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title level={4} className="animate-scale" style={{ color: 'white', margin: 0 }}>User Management</Title>
              <Button icon={<ReloadOutlined />} onClick={fetchUsers} type="text" style={{ color: '#808191' }}>Refresh</Button>
          </div>
      }>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
}
