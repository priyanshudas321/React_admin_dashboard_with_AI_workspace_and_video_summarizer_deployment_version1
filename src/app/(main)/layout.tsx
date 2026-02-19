'use client';

import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, Avatar, Typography, Space, Spin, Dropdown } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  RocketOutlined,
  ProfileOutlined,
  YoutubeOutlined,
  FolderOutlined,
} from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';

const { Header, Sider, Content } = Layout;
const { Text, Title } = Typography;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        setMousePos({
            x: (e.clientX / window.innerWidth) * 20 - 10,
            y: (e.clientY / window.innerHeight) * 20 - 10
        });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Allow public access to landing, login, signup
  const isPublicPage = ['/', '/login', '/signup'].includes(pathname);

  useEffect(() => {
    async function fetchUser() {
      if (isPublicPage) {
          setLoading(false);
          return;
      }

      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
           // If unauthorized and not public page, redirect to login
           if (!isPublicPage) router.push('/login');
        }
      } catch (error) {
        console.error('Failed to fetch user', error);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [router, pathname, isPublicPage]);

  // Fetch Workspace Name if in workspace Detail view
  const [workspaceName, setWorkspaceName] = useState<string | null>(null);
  
  useEffect(() => {
      const match = pathname.match(/\/dashboard\/workspaces\/(\d+)/);
      if (match) {
          const id = parseInt(match[1]);
          // Import dynamically to avoid server action issues if any, or just call it
          import('@/lib/workspace-actions').then(async ({ getWorkspace }) => {
              const res = await getWorkspace(id);
              if (res.success && res.workspace) {
                  setWorkspaceName(res.workspace.name);
              }
          });
      } else {
          setWorkspaceName(null);
      }
  }, [pathname]);

  // Dynamic Dashboard Link based on Role
  const dashboardPath = user?.role === 'admin' ? '/admin' : '/dashboard';

  const menuItems = [
    {
      key: dashboardPath, 
      icon: <DashboardOutlined />,
      label: <Link href={dashboardPath}>Dashboard</Link>, 
      className: `animate-fade-up delay-100 ${pathname === dashboardPath ? 'glass-card' : ''}`,
      style: { margin: '4px 0', borderRadius: 8 }
    },
    {
      key: '/dashboard/ai-notes',
      icon: <YoutubeOutlined />,
      label: <Link href="/dashboard/ai-notes">AI YouTube Summarizer</Link>,
      className: `animate-fade-up delay-150 ${pathname === '/dashboard/ai-notes' ? 'glass-card' : ''}`,
      style: { margin: '4px 0', borderRadius: 8 }
    },

    // Add more items based on role if needed
  ];

  if (user?.role === 'admin') {
      // Removed Admin Overview (replaced by main Dashboard link)
      
      menuItems.push({
          key: '/admin/users',
          icon: <UserOutlined />,
          label: <Link href="/admin/users">User Management</Link>,
          className: `animate-fade-up delay-250 ${pathname === '/admin/users' ? 'glass-card' : ''}`,
          style: { margin: '4px 0', borderRadius: 8 }
      });
  }

  menuItems.push({
      key: '/dashboard/workspaces',
      icon: <FolderOutlined />, // Using FolderOutlined for workspaces
      label: <Link href="/dashboard/workspaces">AI Workspaces</Link>,
      className: `animate-fade-up delay-200 ${pathname.includes('/dashboard/workspaces') ? 'glass-card' : ''}`,
      style: { margin: '4px 0', borderRadius: 8 }
  });

  menuItems.push({
      key: '/settings',
      icon: <SettingOutlined />,
      label: <Link href="/settings">Settings</Link>,
      className: `animate-fade-up delay-300 ${pathname === '/settings' ? 'glass-card' : ''}`,
      style: { margin: '4px 0', borderRadius: 8 }
  });

  const handleMenuClick = ({ key }: { key: string }) => {
      if (key && !key.startsWith('/')) return;
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const userMenu = {
      items: [
          {
              key: 'logout',
              label: 'Logout',
              icon: <LogoutOutlined />,
              onClick: handleLogout
          }
      ]
  };

  if (loading) {
      return (
          <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#111315' }}>
              <Space orientation="vertical" align="center">
                  <Spin size="large" />
                  <div style={{ color: '#6C5DD3', marginTop: 16, fontWeight: 500 }}>Loading Gatekeeper...</div>
              </Space>
          </div>
      )
  }

  // Render simplified layout for public pages
  if (isPublicPage) {
      return <>{children}</>;
  }

  return (
    <Layout style={{ minHeight: '100vh', background: 'transparent', position: 'relative', overflow: 'hidden' }}>
      {/* Global Background Blobs */}
      <div 
        className="animate-float"
        style={{
          position: 'fixed',
          top: mousePos.y * 0.03 - 100,
          left: mousePos.x * 0.02 - 100,
          width: '50vw',
          height: '50vw',
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, rgba(0,0,0,0) 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          zIndex: 0,
          pointerEvents: 'none',
          transition: 'top 0.5s ease-out, left 0.5s ease-out'
        }}
      />
      
      {/* Secondary ambient blob */}
      <div 
        className="animate-pulse-slow"
        style={{
          position: 'fixed',
          bottom: '-10%',
          right: '-10%',
          width: '40vw',
          height: '40vw',
          background: 'radial-gradient(circle, rgba(96, 165, 250, 0.1) 0%, rgba(0,0,0,0) 70%)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          zIndex: 0,
          pointerEvents: 'none'
        }}
      />

      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed} 
        width={250}
        style={{ 
            background: 'transparent', 
            position: 'fixed',
            height: '100vh',
            left: 0,
            zIndex: 100
        }}
      >
        <div style={{ 
            height: 80, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: collapsed ? 'center' : 'flex-start', 
            padding: collapsed ? 0 : '0 24px',
        }}>
            <RocketOutlined style={{ fontSize: 24, color: '#3b82f6' }} className="animate-scale" />
            {!collapsed && (
                <Title level={4} className="animate-scale" style={{ margin: '0 0 0 12px', color: 'white', fontWeight: 700, fontFamily: 'var(--font-outfit)' }}>
                    Gatekeeper
                </Title>
            )}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          style={{ background: 'transparent', borderRight: 0, marginTop: 24 }}
          items={menuItems}
          onClick={handleMenuClick}
        />
        <div style={{ position: 'absolute', bottom: 24, width: '100%', padding: '0 24px' }}>
            {!collapsed ? (
                <Button 
                    type="text" 
                    icon={<LogoutOutlined />} 
                    onClick={handleLogout}
                    style={{ color: '#a1a1aa', width: '100%', textAlign: 'left', paddingLeft: 0 }}
                >
                    Logout
                </Button>
            ) : (
                <Button 
                    type="text" 
                    icon={<LogoutOutlined />} 
                    onClick={handleLogout}
                    style={{ color: '#a1a1aa', width: '100%', display: 'flex', justifyContent: 'center' }}
                />
            )}
        </div>
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 250, transition: 'all 0.2s', background: 'transparent', position: 'relative', zIndex: 1 }}>
        <Header style={{ 
            padding: '0 24px', 
            background: 'rgba(5, 5, 5, 0.5)', /* Slight backdrop for readability */
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 99,
            width: '100%'
        }}>
          <Space>
            <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                style={{
                fontSize: '16px',
                width: 64,
                height: 64,
                color: 'white'
                }}
            />
            <Title level={4} className="animate-scale" style={{ margin: 0, color: 'white', fontFamily: 'var(--font-outfit)' }}>
                {pathname.includes('/admin') ? 'Admin Portal' : 
                 pathname === '/dashboard' ? 'User Dashboard' : 
                 pathname === '/dashboard/ai-notes' ? 'AI YouTube Summarizer' : 
                 workspaceName ? `Workspace / ${workspaceName}` :
                 pathname.split('/').pop()?.charAt(0).toUpperCase()! + pathname.split('/').pop()?.slice(1)!}
            </Title>
          </Space>
          <Space size="large">
            <div style={{ textAlign: 'right', lineHeight: '1.2' }}>
                <Text strong style={{ color: 'white', display: 'block' }}>{user?.name || 'User'}</Text>
                <Text type="secondary" style={{ fontSize: 12, color: '#a1a1aa' }}>{user?.email}</Text>
            </div>
            <Dropdown menu={userMenu} placement="bottomRight">
                <Avatar size="large" icon={<UserOutlined />} style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)', cursor: 'pointer', border: 'none' }} />
            </Dropdown>
          </Space>
        </Header>
        <Content
          style={{
            padding: 24,
            minHeight: 280,
            background: 'transparent',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
