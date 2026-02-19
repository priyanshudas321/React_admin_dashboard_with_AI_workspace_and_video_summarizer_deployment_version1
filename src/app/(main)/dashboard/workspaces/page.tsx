"use client";

import React, { useState, useEffect } from "react";
import { Card, Typography, Button, Row, Col, Input, Modal, App, Empty, Spin, Popconfirm } from "antd";
import { PlusOutlined, FolderOutlined, ArrowRightOutlined, DeleteOutlined } from "@ant-design/icons";
import Link from "next/link";
import { createWorkspace, getWorkspaces, deleteWorkspace } from "@/lib/workspace-actions";
import { useRouter } from "next/navigation";

const { Title, Text, Paragraph } = Typography;

interface Workspace {
    id: number;
    name: string;
    createdAt: Date;
    userId: number;
}

export default function WorkspacesPage() {
    return (
        <App>
            <WorkspacesContent />
        </App>
    );
}

function WorkspacesContent() {
    const { message } = App.useApp();
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [loading, setLoading] = useState(true);
    const [cardLoading, setCardLoading] = useState(false); // For specific card actions
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newWorkspaceName, setNewWorkspaceName] = useState("");
    const [creating, setCreating] = useState(false);
    const router = useRouter();

    useEffect(() => {
        fetchWorkspaces();
    }, []);

    const fetchWorkspaces = async () => {
        setLoading(true);
        const data = await getWorkspaces();
        setWorkspaces(data);
        setLoading(false);
    };

    const handleCreate = async () => {
        if (!newWorkspaceName.trim()) return;
        setCreating(true);
        const result = await createWorkspace(newWorkspaceName);
        setCreating(false);

        if (result.error) {
            message.open({
                type: 'error',
                content: result.error,
            });
        } else {
            message.open({
                type: 'success',
                content: "Workspace created successfully",
            });
            setIsModalOpen(false);
            setNewWorkspaceName("");
            fetchWorkspaces();
            if (result.workspaceId) {
                router.push(`/dashboard/workspaces/${result.workspaceId}`);
            }
        }
    };

    const handleDelete = async (id: number) => {
        setLoading(true);
        const result = await deleteWorkspace(id);
        if (result.error) {
            message.open({
                type: 'error',
                content: result.error,
            });
        } else {
            message.open({
                type: 'success',
                content: "Workspace deleted",
            });
            fetchWorkspaces();
        }
        setLoading(false);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div className="animate-fade-up">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                <div>
                    <Title level={2} style={{ color: "white", margin: 0, fontFamily: 'var(--font-outfit)' }}>
                        AI Workspaces
                    </Title>
                    <Text type="secondary">
                        Create workspaces and upload documents to chat with your collection.
                    </Text>
                </div>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsModalOpen(true)}
                    size="large"
                    style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)', border: 'none' }}
                >
                    New Workspace
                </Button>
            </div>

            {workspaces.length === 0 ? (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={<span style={{ color: '#a1a1aa' }}>No workspaces found. Create one to get started.</span>}
                >
                    <Button type="primary" onClick={() => setIsModalOpen(true)}>Create Workspace</Button>
                </Empty>
            ) : (
                <Row gutter={[24, 24]}>
                    {workspaces.map((ws, index) => (
                        <Col xs={24} sm={12} lg={8} key={ws.id}>
                                <div style={{ position: 'relative' }}>
                                    <Link href={`/dashboard/workspaces/${ws.id}`}>
                                        <div 
                                            className={`premium-card animate-fade-up delay-${(index % 5) * 100}`}
                                            style={{ 
                                                height: "100%", 
                                                padding: 24, 
                                                cursor: 'pointer',
                                                display: 'flex', 
                                                flexDirection: 'column',
                                                justifyContent: 'space-between',
                                                minHeight: 200
                                            }}
                                        >
                                            <div>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20 }}>
                                                    <div className="animate-float" style={{
                                                        width: 56, height: 56, borderRadius: 16,
                                                        background: 'rgba(59, 130, 246, 0.1)',
                                                        border: '1px solid rgba(59, 130, 246, 0.2)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                    }}>
                                                        <FolderOutlined style={{ fontSize: 28, color: '#60a5fa' }} />
                                                    </div>
                                                    <div onClick={(e) => e.preventDefault()}> 
                                                        <Popconfirm
                                                            title="Delete Workspace"
                                                            description="Are you sure you want to delete this workspace?"
                                                            onConfirm={(e) => {
                                                                e?.preventDefault();
                                                                handleDelete(ws.id);
                                                            }}
                                                            onCancel={(e) => e?.preventDefault()}
                                                            okText="Yes"
                                                            cancelText="No"
                                                            okButtonProps={{ danger: true }}
                                                        >
                                                            <Button 
                                                                type="text" 
                                                                danger
                                                                className="opacity-50 hover:opacity-100 transition-opacity"
                                                                icon={<DeleteOutlined />} 
                                                            />
                                                        </Popconfirm>
                                                    </div>
                                                </div>
                                                
                                                <h3 style={{ color: "white", fontSize: 20, fontWeight: 600, margin: '0 0 8px 0', fontFamily: 'var(--font-outfit)' }}>
                                                    {ws.name}
                                                </h3>
                                                
                                                <Text style={{ color: '#a1a1aa', fontSize: 13 }}>
                                                    Created {new Date(ws.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </Text>
                                            </div>
                                            
                                            <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', color: '#3b82f6', fontWeight: 600, fontSize: 14 }}>
                                                Open Workspace <ArrowRightOutlined style={{ marginLeft: 8 }} />
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            </Col>
                    ))}
                </Row>
            )}

            <Modal
                title="Create New Workspace"
                open={isModalOpen}
                onOk={handleCreate}
                onCancel={() => setIsModalOpen(false)}
                confirmLoading={creating}
                okText="Create"
                okButtonProps={{ style: { background: '#3b82f6', borderColor: '#3b82f6' } }}
            >
                <Input
                    placeholder="Workspace Name (e.g. 'Project Alpha')"
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                    onPressEnter={handleCreate}
                    autoFocus
                />
            </Modal>
        </div>
    );
}
