
import { db } from "./src/db/index.js"; 
import { documentChunks, documents, workspaces } from "./src/db/schema.js";
import { eq } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function testInsertion() {
    console.log("Testing vector insertion...");

    // 1. Create dummy workspace and document
    try {
        const userId = 1; // Assuming user 1 exists, otherwise need to fetch one
        
        // Create workspace
        const [ws] = await db.insert(workspaces).values({
            userId,
            name: "Vector Test WS",
        }).returning();
        console.log("Created workspace:", ws.id);

        // Create document
        const [doc] = await db.insert(documents).values({
            userId,
            workspaceId: ws.id,
            name: "Vector Test Doc",
            type: "text",
            content: "test",
        }).returning();
        console.log("Created document:", doc.id);

        // 2. Try inserting chunk WITH stringify
        try {
            console.log("Attempt 1: Stringified Vector");
            const vector = Array(768).fill(0.1);
            await db.insert(documentChunks).values({
                documentId: doc.id,
                content: "chunk1",
                chunkIndex: 0,
                embedding: JSON.stringify(vector), // Cast handled by Drizzle if schema is vector?
            });
            console.log("Success: Stringified Vector");
        } catch (e) {
            console.error("Fail: Stringified Vector", e.message);
        }

        // 3. Try inserting chunk WITHOUT stringify (Array)
        try {
            console.log("Attempt 2: Raw Array Vector");
            const vector = Array(768).fill(0.2);
            await db.insert(documentChunks).values({
                documentId: doc.id,
                content: "chunk2",
                chunkIndex: 1,
                embedding: vector,
            });
            console.log("Success: Raw Array Vector");
        } catch (e) {
            console.error("Fail: Raw Array Vector", e.message);
        }

        // Cleanup
        await db.delete(workspaces).where(eq(workspaces.id, ws.id));
        console.log("Cleanup done.");

    } catch (e) {
        console.error("Setup failed:", e);
    }
}

testInsertion();
