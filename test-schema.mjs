
import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

async function inspectSchema() {
    console.log("--- Inspecting 'document_chunks' Table Columns (Direct SQL) ---");
    const url = process.env.DATABASE_URL;
    if (!url) { console.error("DATABASE_URL missing"); return; }

    try {
        const sql = neon(url);
        const result = await sql`
            SELECT column_name, data_type, udt_name 
            FROM information_schema.columns 
            WHERE table_name = 'document_chunks';
        `;
        
        if (result.length === 0) {
            console.log("❌ Table 'document_chunks' NOT FOUND in this database.");
        } else {
            console.log("Found columns:");
            result.forEach(row => {
                console.log(` - ${row.column_name} (${row.data_type} / ${row.udt_name})`);
            });
        }

    } catch (e) {
        console.error("Inspection failed:", e);
    }
    console.log("--- End Inspection ---");
}

inspectSchema();
