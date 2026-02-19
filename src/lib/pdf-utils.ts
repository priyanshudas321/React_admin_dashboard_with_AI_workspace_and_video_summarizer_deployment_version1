import "server-only";

export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
    const { createRequire } = await import("module");
    const require = createRequire(import.meta.url);
    const PDFParser = require("pdf2json");

    return new Promise((resolve, reject) => {
        const pdfParser = new PDFParser(null, 1); // 1 = text content
        
        pdfParser.on("pdfParser_dataError", (errData: any) => {
            console.error("PDF Parsing Error:", errData.parserError);
            reject(new Error(errData.parserError));
        });

        pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
           try {
                // Try getRawTextContent first
                 const rawText = pdfParser.getRawTextContent();
                 if (typeof rawText === 'string' && rawText.trim().length > 0) {
                     resolve(rawText);
                     return;
                 }
            } catch (e) {
                // ignore and try manual extraction
            }
            
            // Manual extraction from JSON structure if getRawTextContent fails or returns empty
            try {
                // pdfData is the JSON object. access formImage which contains Pages
                const formImage = pdfData.formImage || pdfData;
                if (!formImage.Pages) {
                     // Fallback attempts
                     resolve("");
                     return;
                }

                const text = formImage.Pages.map((page: any) => {
                    return page.Texts.map((t: any) => {
                        // T is URI encoded
                        return decodeURIComponent(t.R[0].T);
                    }).join(" ");
                }).join("\n\n");
                
                resolve(text);
            } catch (err) {
                console.error("PDF Text Extraction Error:", err);
                reject(new Error("Failed to extract text from PDF structure."));
            }
        });

        try {
            pdfParser.parseBuffer(buffer);
        } catch (e) {
            reject(e);
        }
    });
}
