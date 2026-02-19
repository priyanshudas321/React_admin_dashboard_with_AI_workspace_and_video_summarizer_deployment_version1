
const path = require('path');
require("dotenv").config({ path: path.join(__dirname, ".env.local") });

const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const { pgTable, serial, text, integer, vector, timestamp, varchar } = require('drizzle-orm/pg-core');
const { count, eq, customType } = require('drizzle-orm');

// Re-define schema locally to avoid import issues with TS/Next.js environment in a standalone script
// or I can try to use tsx to import the actual schema. 
// Let's try simple SQL query first for maximum reliability.

const sql = neon(process.env.DATABASE_URL);

async function main() {
  try {
      console.log("Checking database content...");
      
      const docs = await sql`SELECT id, name, type, length(content) as content_len FROM documents ORDER BY created_at DESC LIMIT 5`;
      console.log("Recent Documents:");
      // console.table(docs);

      for (const doc of docs) {
          console.log(`Document: ID=${doc.id} Name=${doc.name} Type=${doc.type} Length=${doc.content_len}`);
          const chunkCount = await sql`SELECT count(*) FROM document_chunks WHERE document_id = ${doc.id}`;
          console.log(`  - Chunks in DB: ${chunkCount[0].count}`);
          
          if (chunkCount[0].count > 0) {
              const sampleChunk = await sql`SELECT content, embedding FROM document_chunks WHERE document_id = ${doc.id} LIMIT 1`;
              console.log(`  - Sample Chunk Content: ${sampleChunk[0].content.substring(0, 50)}...`);
              console.log(`  - Sample Embedding Length: ${JSON.parse(sampleChunk[0].embedding).length}`);
          }
      }

  } catch (err) {
      console.error("Error querying DB:", err);
  }
}

main();
