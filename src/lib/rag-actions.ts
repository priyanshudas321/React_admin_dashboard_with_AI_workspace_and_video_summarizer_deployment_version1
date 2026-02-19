"use server";

import { db } from "@/db";
import { documents, documentChunks, workspaces } from "@/db/schema";
import { getSession } from "@/lib/auth";
import { eq, sql as drizzleSql, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Simple chunking function
function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
        let end = start + chunkSize;

        if (end < text.length) {
            const nextNewline = text.indexOf('\n', end - 100);
            if (nextNewline !== -1 && nextNewline < end + 100) {
                end = nextNewline + 1;
            } else {
                const nextPeriod = text.indexOf('. ', end - 100);
                if (nextPeriod !== -1 && nextPeriod < end + 100) {
                    end = nextPeriod + 2;
                }
            }
        }

        chunks.push(text.slice(start, end).trim());
        start = end - overlap;
        if (start < 0) start = 0;
        if (start >= text.length - overlap && chunks.length > 1) break;
    }

    return chunks.filter(c => c.length > 50);
}

// createWorkspace and getWorkspaces moved to workspace-actions.ts
 
// getWorkspace and getWorkspaceDocuments moved to workspace-actions.ts

// 1. Remove Xenova import
// import { pipeline } from "@xenova/transformers"; -> Removed

import { parsePdfBuffer } from "./pdf-utils";

async function generateEmbedding(text: string): Promise<number[] | null> {
    try {
        const model = genAI.getGenerativeModel({ model: "models/gemini-embedding-001" });
        const result = await model.embedContent(text);
        const embedding = result.embedding;
        return embedding.values;
    } catch (error) {
        console.error("Gemini Embedding Error:", error);
        throw error;
    }
}

export async function uploadDocument(formData: FormData) {
    console.log("Starting uploadDocument action...");
    const session = await getSession();
    if (!session?.userId) {
        return { error: "You must be logged in to upload documents." };
    }

    const file = formData.get("file") as File;
    const workspaceIdStr = formData.get("workspaceId") as string;
    const workspaceId = parseInt(workspaceIdStr);

    if (!file) return { error: "No file provided." };
    if (isNaN(workspaceId)) return { error: "Invalid workspace ID provided." };

    try {
        console.log("Extracting file content...");
        let textContent = "";
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (file.type === "application/pdf") {
            // Use server-side utility
            textContent = await parsePdfBuffer(buffer);
        } else if (file.type === "text/plain") {
            textContent = buffer.toString("utf-8");
        } else {
            return { error: "Unsupported file type. Please upload PDF or Text files." };
        }

        if (!textContent || textContent.trim().length < 50) {
            return { error: "The document appears to be empty or a scanned image (OCR not supported). Please upload a text-searchable PDF." };
        }

        // 1. Create document record (Keep this for UI listing if needed, even if loose coupling)
        const [doc] = await db.insert(documents).values({
            userId: session.userId,
            workspaceId: workspaceId,
            name: file.name,
            type: file.type.includes("pdf") ? "pdf" : "text",
            content: textContent,
        }).returning();

        console.log(`Document created with ID: ${doc.id}, Content Length: ${textContent.length}`);

        // 2. Chunk text
        const chunks = chunkText(textContent);
        console.log(`Generated ${chunks.length} chunks from text.`);

        // 3. Generate embeddings and save chunks
        console.log("Generating embeddings for", chunks.length, "chunks...");
        const chunkValues = [];

        for (let i = 0; i < chunks.length; i++) {
            try {
                const chunk = chunks[i];
                const embedding = await generateEmbedding(chunk);

                if (embedding) {
                    chunkValues.push({
                        // New Schema: id, document_name, content, embedding, metadata, user_id
                        documentName: file.name,
                        content: chunk,
                        embedding: embedding as any,
                        userId: session.userId,
                        metadata: {
                            documentId: doc.id,
                            workspaceId: workspaceId,
                            chunkIndex: i,
                            type: file.type.includes("pdf") ? "pdf" : "text"
                        }
                    });
                }
            } catch (e) {
                console.warn(`Failed to generate embedding for chunk ${i}:`, e);
            }

            // Rate limiting check
            if (i % 5 === 0) await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        console.log(`Successfully generated embeddings for ${chunkValues.length} chunks.`);

        if (chunkValues.length > 0) {
            // Batch insert
            const BATCH_SIZE = 50;
            for (let i = 0; i < chunkValues.length; i += BATCH_SIZE) {
                await db.insert(documentChunks).values(chunkValues.slice(i, i + BATCH_SIZE));
                console.log(`Inserted batch of ${Math.min(BATCH_SIZE, chunkValues.length - i)} chunks.`);
            }
        } else {
            console.warn("No chunks were generated/saved.");
        }

        revalidatePath(`/dashboard/workspaces/${workspaceId}`);
        return { success: "Document uploaded successfully.", documentId: doc.id };
    } catch (error) {
        console.error("Upload error:", error);
        return { error: "Failed to process document. " + (error as Error).message };
    }
}

export async function queryWorkspace(workspaceId: number, question: string) {
    const session = await getSession();
    if (!session?.userId) return { error: "Unauthorized" };

    try {
        console.log(`[RAG] Generating embedding for query: "${question.substring(0, 50)}..."`);
        let queryEmbedding: number[] | null = null;
        try {
            queryEmbedding = await generateEmbedding(question);
        } catch (e) {
            console.error("[RAG] Failed to generate embedding:", e);
            return { answer: "Error: Embedding Generation Failed. " + (e as Error).message };
        }

        let relevantChunks: any[] = [];
        console.log("[RAG] Query embedding generated successfully. Converting to vector...");

        if (queryEmbedding) {
            const similarity = drizzleSql<number>`1 - (${documentChunks.embedding} <=> ${JSON.stringify(queryEmbedding)}::vector)`;

            relevantChunks = await db.select({
                content: documentChunks.content,
                documentName: documentChunks.documentName, // Already correct in previous step? Checking schema
                similarity: similarity,
            })
                .from(documentChunks)
                // Remove join with documents, query chunks directly
                // Filter by workspaceId stored in metadata
                // Fix syntax: (metadata->>'workspaceId')::int
                .where(drizzleSql`(metadata->>'workspaceId')::int = ${workspaceId} AND ${similarity} > 0.01`) 
                .orderBy(desc(similarity))
                .limit(8);
            
            console.log(`[RAG] Found ${relevantChunks.length} relevant chunks.`);
        }

        if (relevantChunks.length === 0) {
            // Fallback to recent simple search if usage is low? Or just return no info.
             return { answer: "I couldn't find any relevant information in the workspace documents to answer your question. (Debug: 0 chunks found with threshold > 0.01)" };
        }

        const context = relevantChunks.map(c => `Source: ${c.documentName}\nContent: ${c.content}`).join("\n\n---\n\n");

        // Generate Answer using Groq (if available) or Gemini
        const prompt = `
You are a helpful assistant. Answer the user's question based strictly on the provided context.
If the answer is not in the context, say that you don't know based on the provided documents.
Always cite the source document names when providing information.
Use Markdown formatting for lists and code blocks.

Context:
${context}

Question:
${question}

Answer:`;

        let answer = "";
        
        try {
            if (process.env.GROQ_API_KEY) {
                 const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                    },
                    body: JSON.stringify({
                        model: "llama-3.3-70b-versatile",
                        messages: [{ role: "user", content: prompt }],
                        temperature: 0,
                    }),
                });
                const data = await response.json();
                if (data.error) throw new Error("Groq API Error: " + data.error.message);
                answer = data.choices[0].message.content;
            } else {
                throw new Error("GROQ_API_KEY not set, using fallback.");
            }
        } catch (groqError) {
             console.warn("Groq failed or key missing, falling back to Gemini:", groqError);
             // Fallback to Gemini Chat
             const model = genAI.getGenerativeModel({ model: "gemini-pro" });
             const result = await model.generateContent(prompt);
             const response = await result.response;
             answer = response.text();
        }

        return { answer, sources: [...new Set(relevantChunks.map(c => c.documentName))] };

    } catch (error) {
        console.error("Query workspace error:", error);
        return { error: "Failed to generate answer. " + (error as Error).message };
    }
}

// deleteDocument and deleteWorkspace moved to workspace-actions.ts
