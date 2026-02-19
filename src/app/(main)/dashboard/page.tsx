'use client';

import React from 'react';
import { Card, Typography, Row, Col, Button, Tooltip, Avatar } from 'antd';
import { 
    RocketOutlined,
    FileTextOutlined,
    ArrowRightOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Paragraph, Text } = Typography;

export default function UserDashboard() {
  const router = useRouter();
  const [user, setUser] = React.useState<{ name: string; email: string; status: string; role: string } | null>(null);

  React.useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Failed to fetch user', error);
      }
    }
    fetchUser();
  }, []);

  return (
    <div style={{ padding: '0 20px 40px', minHeight: '100vh', position: 'relative', zIndex: 10 }}>
        
      {/* Header / Welcome Section */}
      <div className="animate-fade-up" style={{ marginBottom: 40, marginTop: 10 }}>
        <Row justify="space-between" align="middle">
            <Col>
                <div style={{ fontFamily: 'var(--font-outfit)' }}>
                   <span style={{ fontSize: 'clamp(1.5rem, 2vw, 2rem)', fontWeight: 500, color: '#a1a1aa' }}>
                       Welcome Back,
                   </span>
                   <br />
                   <h1 className="text-gradient animate-sheen" style={{ 
                       fontSize: 'clamp(2.5rem, 4vw, 3.5rem)', 
                       fontWeight: 700, 
                       margin: 0,
                       letterSpacing: '-0.03em',
                       lineHeight: 1.1,
                       display: 'inline-block'
                   }}>
                     {user?.name || 'Dashboard'}
                   </h1>
                </div>
            </Col>

        </Row>
      </div>

      <Row gutter={[24, 24]}>
          
          {/* LEFT COLUMN - Identity & Status */}
          <Col xs={24} lg={8}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24, height: '100%' }}>
                  
                  {/* Identity Card */}
                  <div className="premium-card animate-fade-up delay-100" style={{ padding: 32, flex: 1, minHeight: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <div className="animate-float" style={{ 
                          width: 80, height: 80, 
                          borderRadius: '50%', 
                          background: 'var(--accent-gradient)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: '0 0 40px rgba(59, 130, 246, 0.4)',
                          marginBottom: 24,
                          fontSize: 32, fontWeight: 700, color: 'white'
                      }}>
                          {user?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      
                      <Text style={{ color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '2px', fontSize: 12, marginBottom: 4 }}>OPERATOR IDENTITY</Text>
                      <Text style={{ fontSize: 24, fontWeight: 600, color: 'white', fontFamily: 'var(--font-outfit)' }}>{user?.email}</Text>
                      
                      <div style={{ marginTop: 32, padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                           <Row justify="space-between">
                               <Col>
                                   <Text style={{ color: '#71717a', fontSize: 12 }}>ROLE ACCESS</Text>
                                   <div style={{ color: '#3b82f6', fontWeight: 600 }}>{user?.role?.toUpperCase() || 'USER'}</div>
                               </Col>
                               <Col>
                                   <Text style={{ color: '#71717a', fontSize: 12 }}>STATUS</Text>
                                   <div style={{ color: '#10b981', fontWeight: 600 }}>{user?.status?.toUpperCase() || 'ACTIVE'}</div>
                               </Col>
                           </Row>
                      </div>
                  </div>



              </div>
          </Col>

          {/* RIGHT COLUMN - Tools & Workspaces */}
          <Col xs={24} lg={16}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  
                  {/* AI Study Tool (Hero Feature) */}
                  <div className="premium-card animate-fade-up delay-200" style={{ 
                      padding: 40, 
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(5, 5, 5, 0) 100%)',
                      border: '1px solid rgba(59, 130, 246, 0.2)'
                  }}>
                      <Row align="middle" gutter={[24, 24]}>
                          <Col xs={24} md={16}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                  <RocketOutlined style={{ color: '#3b82f6', fontSize: 20 }} />
                                  <Text style={{ color: '#60a5fa', fontWeight: 600, letterSpacing: '1px' }}>AI STUDY TOOL</Text>
                              </div>
                              <h2 style={{ fontSize: 28, fontWeight: 700, color: 'white', marginBottom: 12, fontFamily: 'var(--font-outfit)' }}>
                                  YouTube to Knowledge. Instantly.
                              </h2>
                              <Paragraph style={{ color: '#a1a1aa', fontSize: 16, maxWidth: 500 }}>
                                  Transform any video into structured study notes, summaries, and quizzes using our advanced neural engine.
                              </Paragraph>
                              <Button 
                                type="primary" 
                                size="large" 
                                className="animate-glow"
                                style={{ height: 48, padding: '0 32px', borderRadius: 24, fontSize: 16, fontWeight: 600, border: 'none', background: '#3b82f6' }}
                                icon={<ArrowRightOutlined />}
                                onClick={() => router.push('/dashboard/ai-notes')}
                              >
                                  Launch Tool
                              </Button>
                          </Col>
                          <Col xs={24} md={8} style={{ display: 'flex', justifyContent: 'center' }}>
                               {/* Abstract Graphic Placeholder */}
                               <div className="animate-float" style={{ 
                                   width: 140, height: 140, 
                                   background: 'conic-gradient(from 180deg at 50% 50%, #3b82f6 0deg, #60a5fa 180deg, #3b82f6 360deg)',
                                   borderRadius: '40%',
                                   filter: 'blur(40px)',
                                   opacity: 0.6
                               }} />
                          </Col>
                      </Row>
                  </div>

                  {/* Document Workspaces */}
                   <div className="premium-card animate-fade-up delay-300" style={{ padding: 32, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'relative', zIndex: 2 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                                <FileTextOutlined style={{ color: '#60a5fa', fontSize: 20 }} />
                                <Text style={{ color: '#93c5fd', fontWeight: 600, letterSpacing: '1px' }}>DOCUMENT WORKSPACES</Text>
                            </div>
                            <h3 style={{ fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 8 }}>Knowledge Base</h3>
                            <Paragraph style={{ color: '#71717a' }}>
                                Manage PDF collections and query your documents with semantic search.
                            </Paragraph>
                            <Button 
                                ghost 
                                style={{ marginTop: 16, borderColor: '#3b82f6', color: '#60a5fa' }}
                                onClick={() => router.push('/dashboard/workspaces')}
                            >
                                Access Workspaces <ArrowRightOutlined />
                            </Button>
                        </div>
                        <div style={{ 
                            position: 'absolute', right: -20, bottom: -20, 
                            width: 150, height: 150, 
                            background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, rgba(0,0,0,0) 70%)', 
                            borderRadius: '50%' 
                        }} />
                   </div>
              </div>
          </Col>
      </Row>
    </div>
  );
}

