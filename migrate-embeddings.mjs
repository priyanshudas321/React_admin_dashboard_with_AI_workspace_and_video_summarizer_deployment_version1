
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

async function migrate() {
    console.log("--- Migrating for Gemini Embeddings (768 dim) ---");
    const url = process.env.DATABASE_URL;
    if (!url) { console.error("DATABASE_URL missing"); return; }

    try {
        const sql = neon(url);
        
        // 1. Alter Column Type
        // Note: Casting from vector(384) to vector(768) isn't direct. 
        // We likely need to drop the column content or clear it first if strict constraint.
        // Easiest path for simple migration: Clear existing data or Drop/Add column.
        // User wants "clean slate" logic essentially for embeddings.
        
        console.log("Truncating existing chunks to avoid dimension mismatch errors...");
        await sql`TRUNCATE TABLE document_chunks;`;
        
        console.log("Altering embedding column to vector(768)...");
        // We drop and re-add to be safe and clean
        await sql`ALTER TABLE document_chunks DROP COLUMN IF EXISTS embedding;`;
        await sql`ALTER TABLE document_chunks ADD COLUMN embedding vector(768);`;
        
        console.log("✅ Database schema updated for Gemini.");

    } catch (e) {
        console.error("Migration failed:", e);
    }
    console.log("--- End Migration ---");
}

migrate();
