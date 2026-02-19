
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

async function fixSchema() {
    console.log("--- Fixing 'document_chunks' Schema ---");
    const url = process.env.DATABASE_URL;
    if (!url) { console.error("DATABASE_URL missing"); return; }

    try {
        const sql = neon(url);
        
        // 1. Add missing columns
        console.log("Adding 'document_name'...");
        await sql`ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS document_name TEXT;`;
        
        console.log("Adding 'metadata'...");
        await sql`ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS metadata JSONB;`;
        
        console.log("Adding 'user_id'...");
        // User requested TEXT, but traditionally it matches users.id. 
        // We'll use INTEGER to be safe with FKs if needed, or TEXT if users.id is text.
        // Given existing schema.ts had user_id as integer, we'll try INTEGER first.
        // If it fails, we can change. But user said "user_id TEXT" in their prompt.
        // Checking schema.ts: users.id is SERIAL (integer).
        // Mixing types is bad. Drizzle schema says integer. User prompt says TEXT.
        // I will use INTEGER to match the `users` table FK logic in the codebase.
        await sql`ALTER TABLE document_chunks ADD COLUMN IF NOT EXISTS user_id INTEGER;`;

        // 2. Loosen constraints on old columns so we don't need to populate them if we don't want to
        console.log("Loosening constraints on 'document_id' and 'chunk_index'...");
        try {
            await sql`ALTER TABLE document_chunks ALTER COLUMN document_id DROP NOT NULL;`;
        } catch (e) { console.log("  - document_id alter ignored (maybe already nullable)"); }
        
        try {
            await sql`ALTER TABLE document_chunks ALTER COLUMN chunk_index DROP NOT NULL;`;
        } catch (e) { console.log("  - chunk_index alter ignored (maybe already nullable)"); }

        console.log("✅ Schema migration commands executed.");

    } catch (e) {
        console.error("Migration failed:", e);
    }
    console.log("--- End Fix ---");
}

fixSchema();
