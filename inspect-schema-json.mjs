
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';
import fs from 'fs';

async function inspectSchema() {
    const url = process.env.DATABASE_URL;
    if (!url) { console.error("DATABASE_URL missing"); return; }

    try {
        const sql = neon(url);
        const result = await sql`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'document_chunks'
            ORDER BY ordinal_position;
        `;
        
        fs.writeFileSync('schema.json', JSON.stringify(result, null, 2));
        console.log("Schema dump complete.");
    } catch (e) {
        console.error("Inspection failed:", e);
    }
}

inspectSchema();
