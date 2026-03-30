import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

async function main() {
  const sql = neon(process.env.DATABASE_URL!);

  const existing = await sql`SELECT id FROM users WHERE email = 'test@eventpulse.app'`;
  if (existing.length > 0) {
    console.log("EventPulse: test user already exists");
    return;
  }

  const passwordHash = await bcrypt.hash("Test123!", 12);
  await sql`INSERT INTO users (email, password_hash, name, role)
    VALUES ('test@eventpulse.app', ${passwordHash}, 'Test Organizer', 'organizer')`;

  console.log("EventPulse: created test user test@eventpulse.app");
}

main().catch(console.error);
