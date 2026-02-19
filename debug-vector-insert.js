
const path = require('path');
require("dotenv").config({ path: path.join(__dirname, ".env.local") });

const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const { pgTable, serial, text, integer, vector } = require('drizzle-orm/pg-core');

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

// Define minimal schema for testing
const documentChunks = pgTable('document_chunks', {
    id: serial('id').primaryKey(),
    documentId: integer('document_id').notNull(),
    content: text('content').notNull(),
    chunkIndex: integer('chunk_index').notNull(),
    embedding: vector('embedding', { dimensions: 768 }).notNull(),
});

async function main() {
    console.log("Testing vector insertion...");
    
    // Create a dummy 768-dim vector
    const dummyVector = Array(768).fill(0.12345);
    
    try {
        // We need a valid document ID to satisfy foreign key.
        // Let's check for a document first.
        const docs = await sql`SELECT id FROM documents LIMIT 1`;
        if (docs.length === 0) {
            console.error("No documents found to link chunk to. Please create a dummy document first via UI or SQL.");
            return;
        }
        const docId = docs[0].id;
        console.log("Using Document ID:", docId);

        console.log("Inserting chunk with vector...");
        await db.insert(documentChunks).values({
            documentId: docId,
            content: "Debug content",
            chunkIndex: 999,
            embedding: dummyVector,
        });
        
        console.log("Insert Successful!");
    } catch (error) {
        console.error("Insert Failed!");
        console.error("Error Message:", error.message);
        // Log the first part of the error to see if it matches the screenshot
        if (error.message.startsWith("[")) {
            console.log("Error message starts with array!");
        }
    }
}

main();
