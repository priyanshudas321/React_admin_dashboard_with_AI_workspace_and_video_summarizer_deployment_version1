"use server";

import { db } from "@/db";
import { documents, documentChunks, workspaces } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createWorkspace(name: string) {
    const session = await getSession();
    if (!session?.userId) return { error: "Unauthorized" };

    try {
        const [workspace] = await db.insert(workspaces).values({
            userId: session.userId,
            name: name,
        }).returning();
        revalidatePath("/dashboard/workspaces");
        return { success: true, workspaceId: workspace.id };
    } catch (error) {
        console.error("Create workspace error:", error);
        return { error: "Failed to create workspace" };
    }
}

export async function getWorkspaces() {
    const session = await getSession();
    if (!session?.userId) return [];

    try {
        return await db.select().from(workspaces).where(eq(workspaces.userId, session.userId)).orderBy(desc(workspaces.createdAt));
    } catch (error) {
        console.error("Error fetching workspaces:", error);
        return [];
    }
}
 
 export async function getWorkspace(workspaceId: number) {
     const session = await getSession();
     if (!session?.userId) return { error: "Unauthorized" };
 
     try {
         const [workspace] = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1);
         if (!workspace) return { error: "Workspace not found" };
         if (workspace.userId !== session.userId) return { error: "Unauthorized" };
         
         return { success: true, workspace };
     } catch (error) {
         console.error("Error fetching workspace:", error);
         return { error: "Failed to fetch workspace" };
     }
 }

export async function getWorkspaceDocuments(workspaceId: number) {
    const session = await getSession();
    if (!session?.userId) return [];

    try {
        return await db.select().from(documents).where(eq(documents.workspaceId, workspaceId));
    } catch (error) {
        console.error("Error fetching workspace documents:", error);
        return [];
    }
}

export async function deleteDocument(documentId: number) {
    const session = await getSession();
    if (!session?.userId) return { error: "Unauthorized" };

    try {
        // Verify ownership
        const [doc] = await db.select().from(documents).where(eq(documents.id, documentId)).limit(1);
        if (!doc) return { error: "Document not found" };
        if (doc.userId !== session.userId) return { error: "Unauthorized" };

        // Delete chunks based on metadata documentId
        // Correct JSONB path syntax: metadata ->> 'documentId'
        // Using sql template tag to ensure raw SQL is valid
        await db.execute(sql`DELETE FROM document_chunks WHERE (metadata->>'documentId')::int = ${documentId}`);
        
        await db.delete(documents).where(eq(documents.id, documentId));
        
        revalidatePath(`/dashboard/workspaces/${doc.workspaceId}`);
        return { success: true };
    } catch (error) {
        console.error("Delete document error:", error);
        return { error: "Failed to delete document" };
    }
}

export async function deleteWorkspace(workspaceId: number) {
    const session = await getSession();
    if (!session?.userId) return { error: "Unauthorized" };

    try {
        // Verify ownership
        const [ws] = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1);
        if (!ws) return { error: "Workspace not found" };
        if (ws.userId !== session.userId) return { error: "Unauthorized" };

        const docs = await db.select().from(documents).where(eq(documents.workspaceId, workspaceId));
        
        for (const doc of docs) {
            // Delete chunks based on metadata documentId
            await db.execute(sql`DELETE FROM document_chunks WHERE (metadata->>'documentId')::int = ${doc.id}`);
        }

        // Delete documents
        await db.delete(documents).where(eq(documents.workspaceId, workspaceId));

        // Delete workspace
        await db.delete(workspaces).where(eq(workspaces.id, workspaceId));

        revalidatePath("/dashboard/workspaces");
        return { success: true };
    } catch (error) {
        console.error("Delete workspace error:", error);
        return { error: "Failed to delete workspace" };
    }
}
