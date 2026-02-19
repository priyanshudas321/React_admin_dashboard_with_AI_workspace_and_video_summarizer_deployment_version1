
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";

async function testGeminiRag() {
    console.log("--- Testing Gemini RAG (768 dim) ---");
    const url = process.env.DATABASE_URL;
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!url) { console.error("DATABASE_URL missing"); return; }
    if (!apiKey) { console.error("GEMINI_API_KEY missing"); return; }

    const genAI = new GoogleGenerativeAI(apiKey);
    const sql = neon(url);

    try {
        // 1. Generate Embedding
        console.log("Generating embedding for 'Hello Gemini'...");
        // List models to debug 404
        // const models = await genAI.listModels();
        // console.log("Available models:", models);
        // The listModels method is on the GoogleGenerativeAI instance? No, it's on the client or via fetch.
        // Actually the SDK doesn't expose listModels easily on the instance in 0.24.1?
        // Let's try to use "text-embedding-004" WITHOUT the "models/" prefix again but clarify API key usage.
        
        // Previous list-all-models.mjs output showed: models/gemini-embedding-001
        const model = genAI.getGenerativeModel({ model: "models/gemini-embedding-001" });
        const result = await model.embedContent("Hello Gemini");
        const vector = result.embedding.values;
        
        console.log(`Generated vector length: ${vector.length}`);
        if (vector.length !== 3072) {
             throw new Error(`Expected 3072 dimensions, got ${vector.length}`);
        }

        // 2. Insert
        console.log("Inserting test chunk...");
        const metadata = JSON.stringify({ source: "test-gemini-rag" });
        const [inserted] = await sql`
            INSERT INTO document_chunks 
            (document_name, content, embedding, metadata, user_id)
            VALUES 
            ('gemini_test_doc', 'Hello Gemini Content', ${JSON.stringify(vector)}, ${metadata}::jsonb, 1)
            RETURNING id;
        `;
        console.log("Inserted ID:", inserted.id);

        // 3. Search (Vector Similarity)
        console.log("Performing similarity search...");
        const searchRes = await sql`
            SELECT id, document_name, content, 
            (1 - (embedding <=> ${JSON.stringify(vector)})) as similarity
            FROM document_chunks
            WHERE id = ${inserted.id};
        `;
        
        console.log("Search Result:", searchRes[0]);
        
        // 4. Cleanup
        console.log("Cleaning up...");
        await sql`DELETE FROM document_chunks WHERE id = ${inserted.id}`;
        
        console.log("✅ Gemini RAG Test Passed!");

    } catch (e) {
        console.error("Test failed:", e);
    }
    console.log("--- End Test ---");
}

testGeminiRag();
