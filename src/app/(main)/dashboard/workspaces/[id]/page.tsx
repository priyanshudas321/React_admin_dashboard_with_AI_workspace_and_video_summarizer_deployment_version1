"use client";

import React, { useState, useEffect, useRef } from "react";
import { Layout, Typography, Button, List, Input, Card, App, Spin, Upload, Empty, Avatar, Divider, Popconfirm } from "antd";
import { 
    UploadOutlined, 
    FileTextOutlined, 
    SendOutlined, 
    RobotOutlined, 
    UserOutlined, 
    LeftOutlined,
    DeleteOutlined,
    LoadingOutlined
} from "@ant-design/icons";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getWorkspaceDocuments, deleteDocument } from "@/lib/workspace-actions";
import { uploadDocument, queryWorkspace } from "@/lib/rag-actions";
import { RcFile } from "antd/es/upload";

const { Title, Text, Paragraph } = Typography;
const { Sider, Content } = Layout;
const { TextArea } = Input;

interface Document {
    id: number;
    name: string;
    createdAt: Date;
    type: string;
}

interface Message {
    role: "user" | "assistant";
    content: string;
    sources?: string[];
}

export default function WorkspaceDetailPage() {
    return (
        <App>
            <WorkspaceDetailContent />
        </App>
    );
}

function WorkspaceDetailContent() {
    const { message } = App.useApp();
    const params = useParams();
    const router = useRouter();
    const workspaceId = parseInt(params.id as string);

    const [documents, setDocuments] = useState<Document[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [loadingDocs, setLoadingDocs] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [thinking, setThinking] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // ... (useEffect and loadDocuments remain same but inside this component)
    useEffect(() => {
        if (!isNaN(workspaceId)) {
            fetchDocuments();
        }
    }, [workspaceId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, thinking]);

    const fetchDocuments = async () => {
        setLoadingDocs(true);
        const docs = await getWorkspaceDocuments(workspaceId);
        setDocuments(docs as Document[]);
        setLoadingDocs(false);
    };

    const handleUpload = async (file: RcFile) => {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("workspaceId", workspaceId.toString());

        const result = await uploadDocument(formData);
        
        if (result.error) {
            message.error(result.error);
        } else {
            message.success("Document uploaded successfully");
            fetchDocuments();
        }
        setUploading(false);
        return false; // Prevent auto upload by antd
    };

    const handleDeleteDocument = async (docId: number) => {
        const result = await deleteDocument(docId);
        if (result.error) {
            message.error(result.error);
        } else {
            message.success("Document deleted");
            fetchDocuments();
        }
    };

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMsg = inputValue;
        setInputValue("");
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setThinking(true);

        const result = await queryWorkspace(workspaceId, userMsg);
        setThinking(false);

        if (result.error) {
            setMessages(prev => [...prev, { role: "assistant", content: "Error: " + result.error }]);
        } else {
            setMessages(prev => [...prev, { 
                role: "assistant", 
                content: result.answer || "I couldn't generate an answer.",
                sources: result.sources
            }]);
        }
    };

    return (
        <Layout style={{ background: "transparent", height: "calc(100vh - 100px)" }}>
            <Sider 
                width={300} 
                style={{ background: "transparent", borderRight: "1px solid rgba(255,255,255,0.1)", marginRight: 24 }}
            >
                <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <div style={{ marginBottom: 16 }}>
                        <Link href="/dashboard/workspaces" style={{ color: "#a1a1aa", display: "inline-flex", alignItems: "center", marginBottom: 16 }}>
                            <LeftOutlined style={{ marginRight: 8 }} /> Back
                        </Link>
                        <Title level={4} style={{ color: "white", margin: 0 }}>Documents</Title>
                    </div>

                    <div style={{ flex: 1, overflowY: "auto", marginBottom: 16 }}>
                        {loadingDocs ? (
                            <div style={{ textAlign: 'center', padding: 20 }}><Spin /></div>
                        ) : documents.length === 0 ? (
                             <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<Text type="secondary">No documents uploaded</Text>} />
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {documents.map((doc) => (
                                    <div key={doc.id} style={{ 
                                        padding: "12px", 
                                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 12
                                    }}>
                                        <Avatar icon={<FileTextOutlined />} style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', flexShrink: 0 }} />
                                        <div style={{ overflow: 'hidden', flex: 1 }}>
                                            <Text style={{ color: "white", display: 'block' }} ellipsis>{doc.name}</Text>
                                            <Text type="secondary" style={{ fontSize: 10 }}>{new Date(doc.createdAt).toLocaleDateString()}</Text>
                                        </div>
                                        <Popconfirm
                                            title="Delete Document"
                                            description="Are you sure?"
                                            onConfirm={() => handleDeleteDocument(doc.id)}
                                            okText="Yes"
                                            cancelText="No"
                                        >
                                            <Button type="text" size="small" icon={<DeleteOutlined />} danger style={{ opacity: 0.7 }} />
                                        </Popconfirm>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <Upload 
                        beforeUpload={handleUpload} 
                        showUploadList={false} 
                        accept=".pdf,.txt"
                        disabled={uploading}
                    >
                        <Button 
                            block 
                            icon={uploading ? <LoadingOutlined /> : <UploadOutlined />} 
                            type="primary"
                            loading={uploading}
                            style={{ background: '#3b82f6', borderColor: '#3b82f6' }}
                        >
                            {uploading ? "Uploading..." : "Upload Document"}
                        </Button>
                    </Upload>
                </div>
            </Sider>

            <Content style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                <Card 
                    className="glass-card" 
                    style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}
                    styles={{ body: { flex: 1, display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" } }}
                >
                    {/* Chat Area */}
                    <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
                        {messages.length === 0 ? (
                            <div style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", opacity: 0.5 }}>
                                <RobotOutlined style={{ fontSize: 48, color: "white", marginBottom: 16 }} />
                                <Title level={4} style={{ color: "white" }}>Workspace Assistant</Title>
                                <Text type="secondary">Ask questions about your documents</Text>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                                {messages.map((msg, idx) => (
                                    <div key={idx} style={{ 
                                        display: "flex", 
                                        flexDirection: msg.role === "user" ? "row-reverse" : "row",
                                        alignItems: "flex-start",
                                        gap: 16 
                                    }}>
                                        <Avatar 
                                            icon={msg.role === "user" ? <UserOutlined /> : <RobotOutlined />} 
                                            style={{ backgroundColor: msg.role === "user" ? '#3b82f6' : '#8b5cf6', flexShrink: 0 }}
                                        />
                                        <div style={{ 
                                            background: msg.role === "user" ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                                            padding: "16px", 
                                            borderRadius: 16,
                                            maxWidth: "80%",
                                            borderTopRightRadius: msg.role === "user" ? 4 : 16,
                                            borderTopLeftRadius: msg.role === "assistant" ? 4 : 16,
                                        }}>
                                            <div style={{ color: "white", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
                                                {msg.content}
                                            </div>
                                            {msg.sources && msg.sources.length > 0 && (
                                                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                                                    <Text type="secondary" style={{ fontSize: 11, display: "block", marginBottom: 4 }}>Sources:</Text>
                                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                                                        {msg.sources.map((src, i) => (
                                                            <div key={i} style={{ 
                                                                fontSize: 10, 
                                                                padding: "2px 8px", 
                                                                background: "rgba(255,255,255,0.1)", 
                                                                borderRadius: 4,
                                                                color: "#d1d5db"
                                                            }}>
                                                                {src}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {thinking && (
                                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                        <Avatar icon={<RobotOutlined />} style={{ backgroundColor: '#8b5cf6' }} />
                                        <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: "12px 20px", borderRadius: 16, borderTopLeftRadius: 4 }}>
                                            <Spin indicator={<LoadingOutlined style={{ fontSize: 24, color: '#8b5cf6' }} spin />} />
                                        </div>
                                    </div>
                                )}
                                <div ref={scrollRef} />
                            </div>
                        )}
                    </div>

                    {/* Input Area */}
                    <div style={{ padding: 16, background: "rgba(0,0,0,0.2)", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                        <div style={{ position: "relative" }}>
                            <TextArea 
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onPressEnter={(e) => {
                                    if (!e.shiftKey) {
                                        e.preventDefault();
                                        handleSend();
                                    }
                                }}
                                placeholder="Ask a question..." 
                                autoSize={{ minRows: 1, maxRows: 4 }}
                                style={{ 
                                    paddingRight: 48, 
                                    background: "rgba(255,255,255,0.05)", 
                                    border: "1px solid rgba(255,255,255,0.1)", 
                                    color: "white",
                                    borderRadius: 12
                                }}
                            />
                            <Button 
                                type="primary" 
                                shape="circle" 
                                icon={<SendOutlined />} 
                                onClick={handleSend}
                                disabled={!inputValue.trim() || thinking}
                                style={{ 
                                    position: "absolute", 
                                    right: 8, 
                                    bottom: 8, 
                                    background: '#8b5cf6', 
                                    borderColor: '#8b5cf6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            />
                        </div>
                        <Text type="secondary" style={{ fontSize: 10, display: "block", textAlign: "center", marginTop: 8 }}>
                            AI can make mistakes. Please verify important information.
                        </Text>
                    </div>
                </Card>
            </Content>
        </Layout>
    );
}
