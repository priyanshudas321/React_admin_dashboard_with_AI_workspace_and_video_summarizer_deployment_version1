import { WebSocket } from 'ws';
global.WebSocket = WebSocket as any;

import { db } from '../src/db';
import { users } from '../src/db/schema';
import { createToken } from '../src/lib/auth';
import fs from 'fs';
import path from 'path';

async function main() {
    // 1. Get a user
    const user = await db.select().from(users).limit(1);
    if (user.length === 0) {
        console.error('No users found in database. Cannot test.');
        process.exit(1);
    }
    const targetUser = user[0];
    console.log(`Testing with user: ${targetUser.email}`);

    // 2. Create Token
    const token = await createToken(targetUser);
    
    // 3. Create Sample PDF
    const pdfPath = path.join(__dirname, 'sample.pdf');
    const pdfContent = `%PDF-1.4\n%âãÏÓ\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/Resources <<\n/Font <<\n/F1 4 0 R\n>>\n>>\n/MediaBox [0 0 612 792]\n/Contents 5 0 R\n>>\nendobj\n4 0 obj\n<<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica\n>>\nendobj\n5 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 24 Tf\n100 100 Td\n(Hello World from PDF RAG!) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000015 00000 n \n0000000066 00000 n \n0000000123 00000 n \n0000000253 00000 n \n0000000344 00000 n \ntrailer\n<<\n/Size 6\n/Root 1 0 R\n>>\nstartxref\n438\n%%EOF\n`;
    fs.writeFileSync(pdfPath, pdfContent);

    // 4. Test Upload
    console.log('Testing File Upload...');
    const formData = new FormData();
    const fileBlob = new Blob([fs.readFileSync(pdfPath)], { type: 'application/pdf' });
    formData.append('file', fileBlob, 'sample.pdf');

    const uploadRes = await fetch('http://localhost:3000/api/pdf-rag', {
        method: 'POST',
        headers: {
            'Cookie': `auth-token=${token}`,
        },
        body: formData,
    });

    if (!uploadRes.ok) {
        console.error('Upload failed:', uploadRes.status, await uploadRes.text());
    } else {
        console.log('Upload success:', await uploadRes.json());
    }

    // 5. Test Question
    console.log('Testing Question...');
    const questionFormData = new FormData();
    questionFormData.append('question', 'What does the document say?');

    const questionRes = await fetch('http://localhost:3000/api/pdf-rag', {
        method: 'POST',
        headers: {
            'Cookie': `auth-token=${token}`,
        },
        body: questionFormData,
    });

    if (!questionRes.ok) {
        console.error('Question failed:', questionRes.status, await questionRes.text());
    } else {
        console.log('Question success:', await questionRes.json());
    }
}

main().catch(console.error);
