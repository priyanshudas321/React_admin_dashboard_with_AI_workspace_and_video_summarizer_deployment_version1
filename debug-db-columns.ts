
import { db } from "./src/db/index";
import { sql } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function inspectSchema() {
    console.log("--- Inspecting 'document_chunks' Table Columns ---");
    try {
        const result = await db.execute(sql`
            SELECT column_name, data_type, udt_name 
            FROM information_schema.columns 
            WHERE table_name = 'document_chunks';
        `);
        
        // Handle potentially different result formats from Drizzle drivers
        const rows = result.rows ? result.rows : result as unknown as any[];
        
        if (rows.length === 0) {
            console.log("❌ Table 'document_chunks' NOT FOUND in this database.");
        } else {
            console.log("Found columns:");
            rows.forEach(row => {
                console.log(` - ${row.column_name} (${row.data_type} / ${row.udt_name})`);
            });
        }

    } catch (e) {
        console.error("Inspection failed:", e);
    }
    console.log("--- End Inspection ---");
}

inspectSchema();
