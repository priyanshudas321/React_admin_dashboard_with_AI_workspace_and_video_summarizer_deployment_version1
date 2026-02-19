
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

async function testRag() {
    console.log("--- Testing RAG Insert/Select ---");
    const url = process.env.DATABASE_URL;
    if (!url) { console.error("DATABASE_URL missing"); return; }

    try {
        const sql = neon(url);
        
        // 1. Insert
        console.log("Inserting chunk...");
        const vector = JSON.stringify(Array(384).fill(0.1));
        const metadata = JSON.stringify({ test: true });
        
        // Note: Using raw SQL to verify columns exist and work
        const [inserted] = await sql`
            INSERT INTO document_chunks 
            (document_name, content, embedding, metadata, user_id)
            VALUES 
            ('test_doc', 'test_content', ${vector}, ${metadata}::jsonb, 1)
            RETURNING id;
        `;
        
        console.log("Inserted ID:", inserted.id);

        // 2. Select
        console.log("Selecting chunk...");
        const [row] = await sql`
            SELECT document_name, metadata FROM document_chunks WHERE id = ${inserted.id};
        `;
        
        console.log("Selected:", row);
        
        // 3. Cleanup
        console.log("Cleaning up...");
        await sql`DELETE FROM document_chunks WHERE id = ${inserted.id}`;
        
        console.log("✅ RAG Schema Test Passed!");

    } catch (e) {
        console.error("Test failed:", e);
    }
    console.log("--- End Test ---");
}

testRag();
