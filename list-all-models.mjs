
import 'dotenv/config';

async function listModels() {
    console.log("--- Listing All Available Models ---");
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.models) {
            data.models.forEach(m => {
                if (m.name.includes("embed")) {
                     console.log(`- ${m.name} (Supported: ${m.supportedGenerationMethods})`);
                }
            });
        }
    } catch (e) {
        console.error("List failed:", e);
    }
}

listModels();
