
import 'dotenv/config';

async function testRaw() {
    console.log("--- Testing Raw Gemini API Fetch ---");
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) { console.error("GEMINI_API_KEY missing"); return; }
    
    // Test simpler endpoint: list models
    // Endpoint: https://generativelanguage.googleapis.com/v1beta/models?key=API_KEY
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    
    try {
        const response = await fetch(url);
        console.log(`Status: ${response.status} ${response.statusText}`);
        
        const data = await response.json();
        
        if (!response.ok) {
            console.error("Error Body:", JSON.stringify(data, null, 2));
        } else {
            console.log("Success! Models found:", data.models?.length);
            // Check if text-embedding-004 is in the list
            const hasModel = data.models.some(m => m.name.includes("text-embedding-004"));
            console.log("Has text-embedding-004:", hasModel);
        }

    } catch (e) {
        console.error("Raw fetch failed:", e);
    }
}

testRaw();
