'use client';

import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Card, Typography, App, Space, Row, Col, Statistic } from 'antd';
import { ReloadOutlined, ArrowUpOutlined, ArrowDownOutlined, CheckCircleOutlined, ClockCircleOutlined, UserOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from 'recharts';

const { Title, Text } = Typography;

interface User {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string; // Drizzle uses camelCase usually, map correctly in API
}

// Mock Data for Charts
const dataGrowth = [
  { name: 'Mon', users: 4 },
  { name: 'Tue', users: 7 },
  { name: 'Wed', users: 5 },
  { name: 'Thu', users: 12 },
  { name: 'Fri', users: 8 },
  { name: 'Sat', users: 16 },
  { name: 'Sun', users: 24 },
];

export default function AdminDashboard() {
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

  // Derived Statistics
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'approved').length;
  const pendingUsers = users.filter(u => u.status === 'pending').length;

  const statusData = [
      { name: 'Active', value: activeUsers },
      { name: 'Pending', value: pendingUsers },
  ];

  return (
    <div style={{ minHeight: '100vh' }}>
      <Row gutter={[24, 24]}>
        {/* Stats Cards */}
        <Col xs={24} sm={8}>
          <Card className="premium-card animate-fade-up delay-100" variant="borderless" styles={{ body: { padding: 24 } }}>
            <Statistic 
                title={<Text type="secondary" style={{ fontSize: 13, letterSpacing: '0.5px' }}>TOTAL USERS</Text>} 
                value={totalUsers} 
                prefix={
                    <div className="animate-pulse-slow" style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                        <UserOutlined style={{ color: '#3b82f6', fontSize: 20 }} />
                    </div>
                }
                styles={{ content: { color: 'white', fontWeight: 700, fontFamily: 'var(--font-outfit)', fontSize: 32 } }}
            />
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center' }}>
                 <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: 20 }}>
                    <Text style={{ color: '#10b981', fontSize: 12, fontWeight: 600 }}><ArrowUpOutlined /> 12%</Text>
                 </div>
                 <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}> vs last month</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="premium-card animate-fade-up delay-200" variant="borderless" styles={{ body: { padding: 24 } }}>
             <Statistic 
                title={<Text type="secondary" style={{ fontSize: 13, letterSpacing: '0.5px' }}>ACTIVE USERS</Text>} 
                value={activeUsers} 
                prefix={
                    <div className="animate-pulse-slow" style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                        <CheckCircleOutlined style={{ color: '#60a5fa', fontSize: 20 }} />
                    </div>
                }
                styles={{ content: { color: 'white', fontWeight: 700, fontFamily: 'var(--font-outfit)', fontSize: 32 } }}
            />
             <div style={{ marginTop: 12, display: 'flex', alignItems: 'center' }}>
                 <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: 20 }}>
                    <Text style={{ color: '#10b981', fontSize: 12, fontWeight: 600 }}><ArrowUpOutlined /> 5%</Text>
                 </div>
                 <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}> vs last month</Text>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="premium-card animate-fade-up delay-300" variant="borderless" styles={{ body: { padding: 24 } }}>
            <Statistic 
                title={<Text type="secondary" style={{ fontSize: 13, letterSpacing: '0.5px' }}>PENDING APPROVAL</Text>} 
                value={pendingUsers} 
                prefix={
                    <div className="animate-pulse-slow" style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                        <ClockCircleOutlined style={{ color: '#fbbf24', fontSize: 20 }} />
                    </div>
                }
                styles={{ content: { color: 'white', fontWeight: 700, fontFamily: 'var(--font-outfit)', fontSize: 32 } }}
            />
            <div style={{ marginTop: 12, display: 'flex', alignItems: 'center' }}>
                 <div style={{ background: 'rgba(239, 68, 68, 0.15)', padding: '2px 8px', borderRadius: 20 }}>
                     <Text style={{ color: '#ef4444', fontSize: 12, fontWeight: 600 }}><ArrowDownOutlined /> 2%</Text>
                 </div>
                 <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}> vs last month</Text>
            </div>
          </Card>
        </Col>

        {/* Charts Section */}
        <Col xs={24} lg={16} className="animate-fade-up delay-400">
            <Card variant="borderless" className="premium-card" title={<Title level={4} className="animate-scale" style={{ color: 'white', margin: 0, fontFamily: 'var(--font-outfit)' }}>User Growth</Title>}>
                <div style={{ height: 300, width: '100%' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={dataGrowth}>
                            <defs>
                                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#272B30" vertical={false} />
                            <XAxis dataKey="name" stroke="#52525b" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                            <YAxis stroke="#52525b" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#111315', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                                itemStyle={{ color: 'white' }}
                                cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
                            />
                            <Area type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>
        </Col>
        <Col xs={24} lg={8} className="animate-fade-up delay-500">
             <Card variant="borderless" className="premium-card" title={<Title level={4} className="animate-scale" style={{ color: 'white', margin: 0, fontFamily: 'var(--font-outfit)' }}>User Status</Title>}>
                <div style={{ height: 300, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={statusData}
                                innerRadius={80}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#272B30'} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#111315', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }}
                                itemStyle={{ color: 'white' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                        <div style={{ fontSize: 12, color: '#a1a1aa' }}>Total</div>
                        <div style={{ fontSize: 32, fontWeight: 700, color: 'white', fontFamily: 'var(--font-outfit)' }}>{totalUsers}</div>
                    </div>
                </div>
                 <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: -20, paddingBottom: 24 }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                         <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)' }} />
                         <Text style={{ color: '#a1a1aa', fontSize: 12 }}>Active</Text>
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                         <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#272B30' }} />
                         <Text style={{ color: '#a1a1aa', fontSize: 12 }}>Pending</Text>
                     </div>
                 </div>
            </Card>
        </Col>

      </Row>
    </div>
  );
}
