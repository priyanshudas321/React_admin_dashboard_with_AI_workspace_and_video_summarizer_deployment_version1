
import { db } from "./src/db/index";
import { users } from "./src/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, createToken, hashPassword } from "./src/lib/auth";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function debugAuth() {
    console.log("--- Starting Auth Debug ---");
    const email = "test@test.com"; // The user reported this email
    // You might need to temporarily hardcode a known password here to test valid login
    // Or just test the DB connection and user retrieval first
    const password = "password123"; // Assumption for testing

    try {
        console.log(`1. Testing DB Connection & Fetching User: ${email}`);
        const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

        if (!user) {
            console.error("❌ User not found in DB");
            return;
        }
        console.log("✅ User found:", { id: user.id, email: user.email, role: user.role, hasPasswordHash: !!user.passwordHash });

        console.log("2. Testing Password Verification");
        // We can't know the real password, but we can verify if the hash format looks valid
        console.log("   Hash preview:", user.passwordHash?.substring(0, 10) + "...");
        
        // Optional: Test hashing a new password to ensure bcrypt works
        const testHash = await hashPassword("test");
        console.log("✅ bcrypt.hash() working. Result:", testHash.substring(0, 10) + "...");
        
        const testVerify = await verifyPassword("test", testHash);
        console.log(`✅ bcrypt.compare() working. Result: ${testVerify}`);

        console.log("3. Testing Token Creation (Jose)");
        try {
            const token = await createToken(user);
            console.log("✅ Token created successfully:", token.substring(0, 20) + "...");
        } catch (tokenError) {
            console.error("❌ Token creation failed:", tokenError);
        }

    } catch (e) {
        console.error("❌ Debug failed with error:", e);
    }
    console.log("--- End Auth Debug ---");
}

debugAuth();
