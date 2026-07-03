require('dotenv').config({ path: '.env.local' });
const { sql } = require('@vercel/postgres');

async function test() {
  try {
    const { rows } = await sql`SELECT id, name FROM hospitals LIMIT 2`;
    console.log("Hospitals:", rows);
    
    if (rows.length > 0) {
      const id = rows[0].id;
      console.log("Testing getHospitalById with ID:", id);
      const single = await sql`
        SELECT 
          h.id, 
          h.name
        FROM hospitals h
        LEFT JOIN reviews r ON h.id = r.hospital_id
        WHERE h.id = ${id}
        GROUP BY h.id, h.name
      `;
      console.log("Single result:", single.rows);
    }
  } catch (err) {
    console.error("Error:", err);
  }
}
test();
