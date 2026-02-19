import { db } from "./src/db";
import { documentChunks } from "./src/db/schema";
import { sql as drizzleSql,  desc } from "drizzle-orm";
// import { pipeline } from "@huggingface/transformers"; // Dynamic import in main logic if needed, or keeping it for types
// @ts-ignore
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function debugVectorSearch() {
    console.log("--- Starting Vector Search Debug ---");

    try {
        // 1. Get a sample embedding
        const sampleChunks = await db.select().from(documentChunks).limit(1);
        
        if (sampleChunks.length === 0) {
            console.log("No chunks found to test with.");
            return;
        }

        const sample = sampleChunks[0];
        const targetEmbedding = sample.embedding;
        const targetContent = sample.content;
        
        console.log(`Target Content: "${targetContent.substring(0, 50)}..."`);
        
        let embeddingArray = targetEmbedding;
        // Handle potential string format from DB
        if (typeof targetEmbedding === 'string') {
             try {
                embeddingArray = JSON.parse(targetEmbedding);
             } catch (e) {
                 console.error("Failed to parse string embedding");
                 return;
             }
        }

        console.log(`Target Embedding Length: ${Array.isArray(embeddingArray) ? embeddingArray.length : 'Unknown'}`);

        // 2. Perform search using the same embedding
        // Cast to vector using ::vector
        const vectorString = JSON.stringify(embeddingArray);
        const similarity = drizzleSql<number>`1 - (${documentChunks.embedding} <=> ${vectorString}::vector)`;
        
        const results = await db.select({
            id: documentChunks.id,
            content: documentChunks.content,
            similarity: similarity
        })
        .from(documentChunks)
        .orderBy(desc(similarity))
        .limit(5);

        console.log("\nSearch Results (Self-Search):");
        results.forEach(r => {
            console.log(`- ID: ${r.id}, Similarity: ${r.similarity}`);
            console.log(`  Content: "${r.content.substring(0, 50)}..."`);
        });

    } catch (e) {
        console.error("Vector Debug failed:", e);
    }
}

debugVectorSearch();
