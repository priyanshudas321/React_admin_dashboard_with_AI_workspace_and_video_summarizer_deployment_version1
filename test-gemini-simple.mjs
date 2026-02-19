
import 'dotenv/config';
import { GoogleGenerativeAI } from "@google/generative-ai";

async function testSimple() {
    console.log("--- Testing Gemini Simple Chat ---");
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) { console.error("GEMINI_API_KEY missing"); return; }
    
    const genAI = new GoogleGenerativeAI(apiKey);
    
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("Hello!");
        console.log("Response:", result.response.text());
        console.log("✅ API Key works for chat.");
    } catch (e) {
        console.error("Simple chat failed:", e);
    }
}

testSimple();
