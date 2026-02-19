
import { db } from "./src/db/index";
import { documents, documentChunks, workspaces } from "./src/db/schema";
import { eq, sql } from "drizzle-orm";
import { pipeline } from "@huggingface/transformers";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function debugRag() {
    console.log("--- Starting RAG Debug ---");

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
                const chunks = await db.select().from(documentChunks).where(eq(documentChunks.documentId, doc.id));
                console.log(`      Chunks: ${chunks.length}`);

                if (chunks.length > 0) {
                    const firstChunk = chunks[0];
                    // Check embedding dimension if possible, or just length if it comes back as array
                    // Drizzle might return it as string or array depending on driver
                    const embedding = firstChunk.embedding as any; // Cast to any to avoid TS issues with driver return type
                    
                    if (Array.isArray(embedding)) {
                        console.log(`      First Chunk Embedding Dim: ${embedding.length}`);
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
