
const path = require('path');
require("dotenv").config({ path: path.join(__dirname, ".env.local") });

async function main() {
    const key = process.env.GROQ_API_KEY;
    if (!key) {
        console.error("Error: GROQ_API_KEY not found in .env.local");
        return;
    }
    console.log("Groq API Key found (length):", key.length);

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${key}`,
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: "Say hi" }],
                temperature: 0,
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Groq API Status ${response.status}: ${err}`);
        }

        const data = await response.json();
        console.log("Groq Success:", data.choices[0].message.content);

    } catch (error) {
        console.error("Groq Error:", error);
    }
}

main();
