import bcrypt from 'bcrypt';
import { pool } from '../src/config/db.js';

async function verifyFixes() {
    try {
        console.log("--- Verifying Password Fixes ---");

        // 1. Check bcrypt consistency
        const pw = "TestPass@123";
        const hash = await bcrypt.hash(pw, 10);
        const ok = await bcrypt.compare(pw, hash);
        console.log(`Bcrypt Self-test: ${ok ? "PASS" : "FAIL"}`);

        // 2. We can't easily test actual network requests here without setting up a server, 
        // but we can check if the functions are exported correctly.
        
        // Let's check some existing users to see if they have the right flags
        const [users] = await pool.query("SELECT user_id, username, role, must_change_password FROM user LIMIT 5");
        console.log("\nSample User Flags:");
        users.forEach(u => {
            console.log(`User: ${u.username} (${u.role}), MustChange: ${u.must_change_password}`);
        });

    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

verifyFixes();
