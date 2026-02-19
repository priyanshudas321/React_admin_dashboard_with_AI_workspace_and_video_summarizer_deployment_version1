
const { GoogleGenerativeAI } = require("@google/generative-ai");
const path = require('path');
require("dotenv").config({ path: path.join(__dirname, ".env.local") });

async function main() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("Error: GEMINI_API_KEY not found in .env.local");
        return;
    }
    console.log("API Key found (length):", key.length);

    const genAI = new GoogleGenerativeAI(key);
    const modelsToTry = ["text-embedding-004", "models/text-embedding-004", "embedding-001", "models/embedding-001"];

    for (const modelName of modelsToTry) {
        console.log(`\nTesting model: ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.embedContent("Hello world");
            const embedding = result.embedding;
            console.log(`SUCCESS: Model ${modelName} worked! Dimensions: ${embedding.values.length}`);
            break; // Found one that works
        } catch (error) {
            console.error(`FAILED: Model ${modelName} error:`, error.message || error);
        }
    }
    
    // Test Generation specific to check key validity
    console.log("\nTesting generation with gemini-pro...");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Say hi");
        console.log("Generation Success:", await result.response.text());
    } catch (e) {
        console.error("Generation Error:", e.message);
    }
}

main();
