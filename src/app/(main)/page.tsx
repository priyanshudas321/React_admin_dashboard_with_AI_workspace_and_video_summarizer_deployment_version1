'use client';

import React, { useState, useEffect } from 'react';
import { Button, Typography, Space, Row, Col, Card } from 'antd';
import { useRouter } from 'next/navigation';

import { RocketOutlined, SafetyCertificateOutlined, ThunderboltOutlined, TeamOutlined, LoginOutlined } from '@ant-design/icons';
import ScrollReveal from '@/components/ScrollReveal';

const { Title, Paragraph, Text } = Typography;

// Typing effect component
const TypewriterText = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text.charAt(index));
        setIndex(prev => prev + 1);
      }, 100); // Typing speed
      return () => clearTimeout(timeout);
    }
  }, [index, text]);

  return <span>{displayText}<span className="animate-blink">|</span></span>;
};

export default function Home() {
  const router = useRouter();
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

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#000000',
      backgroundImage: 'radial-gradient(circle at 50% 0%, #111315 0%, #000000 70%)',
      overflowX: 'hidden',
      position: 'relative'
    }}>
      {/* Ambient Background Blobs with Parallax */}
      <div 
        className="animate-float delay-100" 
        style={{ 
            position: 'absolute', 
            top: '10%', 
            left: '5%', 
            width: 400, 
            height: 400, 
            background: '#3b82f6', 
            borderRadius: '50%', 
            filter: 'blur(150px)', 
            opacity: 0.15, 
            pointerEvents: 'none',
            transform: `translate(${mousePos.x * -2}px, ${mousePos.y * -2}px)`
        }} 
      />
      <div 
        className="animate-float delay-300" 
        style={{ 
            position: 'absolute', 
            top: '40%', 
            right: '10%', 
            width: 500, 
            height: 500, 
            background: '#60a5fa', 
            borderRadius: '50%', 
            filter: 'blur(150px)', 
            opacity: 0.1, 
            pointerEvents: 'none',
            transform: `translate(${mousePos.x * 2}px, ${mousePos.y * 2}px)`
        }} 
      />
      <div 
        className="animate-float delay-500" 
        style={{ 
            position: 'absolute', 
            bottom: '10%', 
            left: '20%', 
            width: 300, 
            height: 300, 
            background: '#3b82f6', 
            borderRadius: '50%', 
            filter: 'blur(120px)', 
            opacity: 0.1, 
            pointerEvents: 'none',
            transform: `translate(${mousePos.x}px, ${mousePos.y}px)`
        }} 
      />

      {/* Navbar */}
      <div style={{ 
          padding: '20px 40px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          backdropFilter: 'blur(10px)',
          position: 'sticky',
          top: 0,
          zIndex: 100
      }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <RocketOutlined style={{ fontSize: 24, color: '#3b82f6' }} className="animate-wobble" />
              <Title level={4} style={{ margin: 0, color: 'white', fontFamily: 'var(--font-outfit)' }}>Gatekeeper</Title>
          </div>
          <Space>
              <Button type="text" style={{ color: '#808191' }} onClick={() => router.push('/login')}>Login</Button>
              <Button type="primary" shape="round" icon={<LoginOutlined />} className="animate-glow" onClick={() => router.push('/signup')} style={{ background: '#3b82f6', borderColor: '#3b82f6' }}>Sign Up</Button>
          </Space>
      </div>

      {/* Hero Section */}
      <div style={{ padding: '80px 20px', textAlign: 'center', position: 'relative' }}>
        <div className="animate-fade-up">
            <Title className="animate-scale" style={{ 
                color: 'white', 
                fontSize: 64, 
                fontWeight: 800, 
                letterSpacing: '-2px',
                marginBottom: 20,
                lineHeight: 1.1,
                fontFamily: 'var(--font-outfit)'
            }}>
                Secure Access <br /> 
                <span style={{ color: '#3b82f6' }}>
                    <TypewriterText text="Made Simple." />
                </span>
            </Title>
            <Paragraph style={{ color: '#808191', fontSize: 20, maxWidth: 600, margin: '0 auto 40px' }}>
                The next-generation dashboard for managing users, permissions, and enterprise security with ease.
            </Paragraph>
            <Space size="middle">
                <Button type="primary" size="large" style={{ height: 50, padding: '0 40px', fontSize: 16, background: '#3b82f6', borderColor: '#3b82f6' }} className="animate-glow" onClick={() => router.push('/signup')}>
                    Get Started
                </Button>
                <Button size="large" type="default" ghost style={{ height: 50, padding: '0 40px', fontSize: 16, borderColor: '#272B30', color: 'white' }} onClick={() => router.push('/login')}>
                    Live Demo
                </Button>
            </Space>
        </div>

        {/* Floating Visual Element */}
        <div className="animate-float" style={{ marginTop: 80, transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)` }}>
            <div style={{ 
                width: 200, 
                height: 200, 
                background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)', 
                borderRadius: '50%', 
                filter: 'blur(60px)', 
                opacity: 0.3,
                margin: '0 auto'
            }} />
        </div>
      </div>

      {/* Features Grid */}
      <div style={{ padding: '40px 20px 80px', maxWidth: 1200, margin: '0 auto' }}>
          <Row gutter={[24, 24]}>
              <Col xs={24} md={8}>
                <ScrollReveal delay={100}>
                  <Card className="premium-card card-hover" variant="borderless" style={{ height: '100%' }}>
                      <SafetyCertificateOutlined style={{ fontSize: 32, color: '#3b82f6', marginBottom: 20 }} />
                      <Title level={4} style={{ color: 'white', fontFamily: 'var(--font-outfit)' }}>Enterprise Security</Title>
                      <Paragraph style={{ color: '#808191' }}>
                          Bank-grade encryption and secure authentication flows to keep your data safe.
                      </Paragraph>
                  </Card>
                </ScrollReveal>
              </Col>
              <Col xs={24} md={8}>
                <ScrollReveal delay={300}>
                  <Card className="premium-card card-hover" variant="borderless" style={{ height: '100%' }}>
                      <ThunderboltOutlined style={{ fontSize: 32, color: '#60a5fa', marginBottom: 20 }} />
                      <Title level={4} style={{ color: 'white', fontFamily: 'var(--font-outfit)' }}>Lightning Fast</Title>
                      <Paragraph style={{ color: '#808191' }}>
                          Optimized for speed with server-side rendering and efficient database queries.
                      </Paragraph>
                  </Card>
                </ScrollReveal>
              </Col>
              <Col xs={24} md={8}>
                <ScrollReveal delay={500}>
                  <Card className="premium-card card-hover" variant="borderless" style={{ height: '100%' }}>
                      <TeamOutlined style={{ fontSize: 32, color: '#3b82f6', marginBottom: 20 }} />
                      <Title level={4} style={{ color: 'white', fontFamily: 'var(--font-outfit)' }}>Admin Control</Title>
                      <Paragraph style={{ color: '#808191' }}>
                          Comprehensive tools to manage users, approvals, and system settings.
                      </Paragraph>
                  </Card>
                </ScrollReveal>
              </Col>
          </Row>
      </div>

      {/* Footer */}
      <div style={{ padding: '40px 0', borderTop: '1px solid #272B30', textAlign: 'center' }}>
          <Text style={{ color: '#808191' }}>© 2026 Gatekeeper. All rights reserved.</Text>
      </div>
    </div>
  );
}
