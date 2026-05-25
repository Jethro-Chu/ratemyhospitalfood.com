import { db } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

export async function GET() {
  let client;

  try {
    client = await db.connect();

    // 1. ENABLE THE UUID EXTENSION (This fixes your error)
    await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    // 2. Create the Hospitals table
    await client.sql`
      CREATE TABLE IF NOT EXISTS hospitals (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        website VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // 3. Create the Reviews table
    await client.sql`
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        hospital_id UUID REFERENCES hospitals(id),
        rating INT NOT NULL,
        comment TEXT,
        name VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    // 4. Migrate: Add name column if it doesn't exist (for existing tables)
    await client.sql`
      ALTER TABLE reviews ADD COLUMN IF NOT EXISTS name VARCHAR(255);
    `;

    // 5. Migrate: Add image_url column for photo uploads
    await client.sql`
      ALTER TABLE reviews ADD COLUMN IF NOT EXISTS image_url TEXT;
    `;

    return Response.json({ message: 'Database tables created/updated successfully!' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  } finally {
    client?.release();
  }
}
