'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/app/(main)/layout';
import { Button, Input, Card, Typography, Space, Alert, Skeleton, Badge, Divider, Tooltip } from 'antd';
import { RobotOutlined, YoutubeOutlined, CopyOutlined, CheckOutlined, ThunderboltOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const BotIcon = ({ style, ...props }: { style?: React.CSSProperties; [key: string]: any }) => (
    <svg 
        width="1em" 
        height="1em" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        xmlns="http://www.w3.org/2000/svg"
        style={style}
        {...props}
    >
        <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" fill="none"/>
        <path d="M7 15H17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="8.5" cy="9.5" r="1.5" fill="currentColor"/>
        <circle cx="15.5" cy="9.5" r="1.5" fill="currentColor"/>
    </svg>
);

export default function AiNotesPage() {
    const router = useRouter();
    const [url, setUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [result, setResult] = useState<{
        title: string;
        videoId: string;
        notes: string;
    } | null>(null);
    const [copied, setCopied] = useState(false);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setError('');
        setResult(null);
        setLoading(true);

        try {
            const res = await fetch('/api/ai/summarize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Something went wrong');
                return;
            }

            setResult(data);
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        if (result?.notes) {
            await navigator.clipboard.writeText(result.notes);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const renderNotes = (text: string) => {
        const lines = text.split('\n');
        return lines.map((line, i) => {
            // Headers
            if (line.startsWith('## ')) {
                return <Title level={3} key={i} style={{ color: 'white', marginTop: 24, marginBottom: 16 }}>{line.replace('## ', '')}</Title>;
            }
            if (line.startsWith('### ')) {
                return <Title level={4} key={i} style={{ color: '#a1a1aa', marginTop: 20, marginBottom: 12 }}>{line.replace('### ', '')}</Title>;
            }
            // Bold text in bullets
            if (line.startsWith('- **')) {
                const match = line.match(/^- \*\*(.+?)\*\*:?\s*(.*)/);
                if (match) {
                    return (
                        <li key={i} style={{ marginLeft: 20, marginBottom: 8, color: '#d1d5db' }}>
                            <Text strong style={{ color: '#8b5cf6' }}>{match[1]}</Text>{match[2] ? `: ${match[2]}` : ''}
                        </li>
                    );
                }
            }
            // Regular bullets
            if (line.startsWith('- ')) {
                return <li key={i} style={{ marginLeft: 20, marginBottom: 8, color: '#d1d5db' }}>{line.replace('- ', '')}</li>;
            }
            // Empty lines
            if (line.trim() === '') {
                return <div key={i} style={{ height: 12 }} />;
            }
            // Regular text
            return <Paragraph key={i} style={{ color: '#d1d5db', lineHeight: 1.8 }}>{line}</Paragraph>;
        });
    };

    return (
        <DashboardLayout>
            <div style={{ maxWidth: 800, margin: '0 auto', paddingBottom: 40 }}>
                {/* Header Section */}
                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                    <div style={{ 
                        display: 'inline-flex', 
                        padding: 16, 
                        borderRadius: '24px', 
                        background: 'rgba(139, 92, 246, 0.1)', 
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        marginBottom: 24,
                        boxShadow: '0 0 20px rgba(139, 92, 246, 0.2)'
                    }}>
                        <BotIcon style={{ fontSize: 48, color: '#8b5cf6' }} />
                    </div>
                    <Title level={2} style={{ color: 'white', marginBottom: 8 }}>AI YouTube Summarizer</Title>
                    <Text type="secondary" style={{ fontSize: 16 }}>Paste a YouTube link to get structured study notes instantly.</Text>
                </div>

                {/* Input Card */}
                <Card className="glass-card animate-fade-up delay-100" style={{ marginBottom: 32 }}>
                    <div style={{ marginBottom: 8 }}>
                        <Text strong style={{ color: 'white' }}>YouTube Video URL</Text>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <Space.Compact style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <Input 
                                size="large" 
                                prefix={<YoutubeOutlined style={{ color: '#ef4444' }} />} 
                                placeholder="https://www.youtube.com/watch?v=..." 
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                disabled={loading}
                                style={{ 
                                    background: 'rgba(0,0,0,0.3)', 
                                    border: '1px solid #333', 
                                    color: 'white',
                                    height: 50,
                                    borderRadius: 8
                                }}
                            />
                            <Button 
                                type="primary" 
                                size="large" 
                                onClick={() => handleSubmit()}
                                loading={loading}
                                disabled={!url.trim()}
                                className="animate-glow"
                                style={{ 
                                    height: 50, 
                                    background: 'linear-gradient(90deg, #8b5cf6 0%, #ec4899 100%)', // Violet to Pink/Magenta as per image
                                    border: 'none',
                                    fontSize: 16,
                                    fontWeight: 600,
                                    width: '100%',
                                    borderRadius: 8
                                }}
                                icon={!loading && <ThunderboltOutlined />}
                            >
                                {loading ? 'Generating Study Notes...' : 'Generate Study Notes'}
                            </Button>
                        </Space.Compact>
                    </form>
                </Card>

                {/* Error Alert */}
                {error && (
                    <Alert
                        message="Error"
                        description={error}
                        type="error"
                        showIcon
                        className="animate-fade-up"
                        style={{ marginBottom: 24, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#fca5a5' }}
                    />
                )}

                {/* Loading State */}
                {loading && (
                    <Card className="glass-card animate-pulse" style={{ marginBottom: 32 }}>
                        <Skeleton active paragraph={{ rows: 4 }} title={false} />
                        <div style={{ textAlign: 'center', marginTop: 16 }}>
                            <Text type="secondary">Extracting transcript and generating notes... This may take a few seconds.</Text>
                        </div>
                    </Card>
                )}

                {/* Results Section */}
                {result && (
                    <div className="animate-fade-up">
                        {/* Video Info */}
                        <Card className="glass-card" style={{ marginBottom: 24 }}>
                            <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
                                <div style={{ flexShrink: 0, width: 200, borderRadius: 12, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                                    <img
                                        src={`https://img.youtube.com/vi/${result.videoId}/mqdefault.jpg`}
                                        alt={result.title}
                                        style={{ width: '100%', height: 'auto', display: 'block' }}
                                    />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <Title level={4} style={{ color: 'white', margin: 0, marginBottom: 8 }}>{result.title}</Title>
                                    <Badge status="success" text={<Text style={{ color: '#4ade80' }}>Notes Generated Successfully</Text>} />
                                </div>
                            </div>
                        </Card>

                        {/* Notes Content */}
                        <Card className="glass-card" title={<span style={{ color: 'white' }}>📝 Study Notes</span>} extra={
                            <Button 
                                type="text" 
                                icon={copied ? <CheckOutlined /> : <CopyOutlined />} 
                                onClick={handleCopy}
                                style={{ color: copied ? '#4ade80' : '#a1a1aa' }}
                            >
                                {copied ? 'Copied' : 'Copy'}
                            </Button>
                        }>
                            <div style={{ color: '#d1d5db' }}>
                                {renderNotes(result.notes)}
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
