"use server";

import { db } from "@/db";
import { documents, documentChunks, workspaces } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, desc } from "drizzle-orm";
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

        // Delete document (chunks will cascade if FK set, otherwise manual?)
        // Schema says: documentId: integer('document_id').references(() => documents.id, { onDelete: 'cascade' }).notNull(),
        // So chunks will be deleted automatically by Postgres if constraints enforced.
        // Assuming constraints are enforced. If not, manual delete:
        await db.delete(documentChunks).where(eq(documentChunks.documentId, documentId));
        
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

        // Get all documents to delete chunks first (if not cascading)
        const docs = await db.select().from(documents).where(eq(documents.workspaceId, workspaceId));
        
        for (const doc of docs) {
            // Check if we need to manually delete chunks? Yes, to be safe.
            await db.delete(documentChunks).where(eq(documentChunks.documentId, doc.id));
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
