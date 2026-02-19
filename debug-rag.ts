import { db } from "./src/db/index";
import { documents, documentChunks, workspaces } from "./src/db/schema";
import { eq, sql } from "drizzle-orm";
import * as dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config({ path: ".env.local" });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function generateEmbedding(text: string): Promise<number[] | null> {
    try {
        const model = genAI.getGenerativeModel({ model: "models/embedding-001" });
        const result = await model.embedContent(text);
        const embedding = result.embedding;
        return embedding.values;
    } catch (error) {
        console.error("Gemini Embedding Error:", error);
        throw error;
    }
}

async function debugRag() {
    console.log("Starting RAG Debug (Gemini)...");

    try {
        // 1. Check Workspaces
        const allWorkspaces = await db.select().from(workspaces);
        console.log(`Found ${allWorkspaces.length} workspaces.`);

        for (const ws of allWorkspaces) {
            console.log(`\nWorkspace: ${ws.name} (ID: ${ws.id})`);
            
            // 2. Check Documents
            const docs = await db.select().from(documents).where(eq(documents.workspaceId, ws.id));
            console.log(`  Documents: ${docs.length}`);

            for (const doc of docs) {
                console.log(`    Doc: ${doc.name} (ID: ${doc.id})`);

                // 3. Check Chunks
                // Use raw SQL for JSONB check
                const result = await db.execute(sql`SELECT * FROM document_chunks WHERE (metadata->>'documentId')::int = ${doc.id}`);
                // Drizzle execute result is driver dependent, often has rows property or is array
                const chunks = result.rows ? result.rows : result as unknown as any[]; 
                
                console.log(`      Chunks: ${chunks.length}`);

                if (chunks.length > 0) {
                    const firstChunk = chunks[0] as any;
                    // Check embedding dimension
                    const embedding = firstChunk.embedding;
                    
                    if (Array.isArray(embedding)) {
                        console.log(`      First Chunk Embedding Dim: ${embedding.length}`);
                        if (embedding.length === 768) {
                           console.log("      ✅ Dimension matches schema (768)");
                        } else {
                           console.log("      ❌ Dimension Mismatch! Expected 768");
                        }
                    } else if (typeof embedding === 'string') {
                         try {
                            const parsed = JSON.parse(embedding);
                            console.log(`      First Chunk Embedding Dim (parsed): ${parsed.length}`);
                         } catch (e) {
                             console.log(`      First Chunk Embedding is string but failed parse: ${(embedding as string).substring(0, 50)}...`);
                         }
                    } else {
                        console.log(`      First Chunk Embedding Type: ${typeof embedding}`);
                    }
                    
                    console.log(`      First Chunk Content Preview: ${firstChunk.content.substring(0, 50)}...`);
                } else {
                    console.warn(`      !! NO CHUNKS FOUND !!`);
                }
            }
        }

    } catch (e) {
        console.error("Debug failed:", e);
    }
    console.log("\n--- End RAG Debug ---");
}

debugRag();
