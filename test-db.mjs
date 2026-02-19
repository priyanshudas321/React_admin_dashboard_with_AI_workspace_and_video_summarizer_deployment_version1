
import { neon } from '@neondatabase/serverless';
import 'dotenv/config'; // requires npm install dotenv if using node < 20.6, but user has node 24. 
// actually node --env-file is better.

async function testDB() {
    console.log("Testing Neon DB Connection...");
    const url = process.env.DATABASE_URL;
    if (!url) {
        console.error("DATABASE_URL missing");
        return;
    }
    console.log("URL found (masked):", url.replace(/:[^:]*@/, ':***@'));

    try {
        const sql = neon(url);
        const result = await sql`SELECT 1 as val`;
        console.log("Query success:", result);
    } catch (e) {
        console.error("Query failed:", e);
    }
}

testDB();
