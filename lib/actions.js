'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  getHospitals as getFallbackHospitals,
  getHospitalById as getFallbackHospitalById
} from './data';

// --- 0. Fetch Homepage Stats ---
export async function getHomepageStats() {
  try {
    const { rows } = await sql`
      WITH hosp_stats AS (
        SELECT 
          (SELECT COUNT(*) FROM hospitals) as total_hospitals,
          (SELECT COUNT(*) FROM reviews) as total_reviews
      ),
      top_rating AS (
        SELECT AVG(rating) as max_rating
        FROM reviews
        GROUP BY hospital_id
        ORDER BY max_rating DESC
        LIMIT 1
      )
      SELECT 
        hosp_stats.total_hospitals, 
        hosp_stats.total_reviews, 
        COALESCE(top_rating.max_rating, 0) as top_score
      FROM hosp_stats
      LEFT JOIN top_rating ON true;
    `;
    
    if (rows.length > 0) {
      return {
        totalHospitals: Number(rows[0].total_hospitals),
        totalReviews: Number(rows[0].total_reviews),
        topScore: Number(rows[0].top_score).toFixed(1)
      };
    }
    return { totalHospitals: 0, totalReviews: 0, topScore: "0.0" };
  } catch (error) {
    console.error('Database Error in getHomepageStats:', error);
    return { totalHospitals: 0, totalReviews: 0, topScore: "0.0" };
  }
}

// --- 1. Fetch Hospitals (This is what the Home Page needs!) ---
export async function getHeroReviews() {
  try {
    // Top rated review
    const topRated = await sql`
      SELECT r.id, r.rating, r.comment, h.name as "hospitalName", h.id as "hospitalId"
      FROM reviews r
      JOIN hospitals h ON r.hospital_id = h.id
      WHERE r.comment IS NOT NULL AND r.comment != '' AND r.rating >= 4
      ORDER BY r.rating DESC, r.created_at DESC
      LIMIT 1
    `;

    // Low rated review for the "Alert" card
    const lowRated = await sql`
      SELECT r.id, r.rating, r.comment, h.name as "hospitalName", h.id as "hospitalId"
      FROM reviews r
      JOIN hospitals h ON r.hospital_id = h.id
      WHERE r.comment IS NOT NULL AND r.comment != '' AND r.rating <= 3
      ORDER BY r.rating ASC, r.created_at DESC
      LIMIT 1
    `;

    // Recent reviews to fill the rest
    const recent = await sql`
      SELECT r.id, r.rating, r.comment, h.name as "hospitalName", h.id as "hospitalId"
      FROM reviews r
      JOIN hospitals h ON r.hospital_id = h.id
      WHERE r.comment IS NOT NULL AND r.comment != ''
      ORDER BY r.created_at DESC
      LIMIT 5
    `;

    // Deduplicate and select exactly 3 (if available)
    const selected = [];
    const usedIds = new Set();

    if (topRated.rows.length > 0) {
      selected.push({ ...topRated.rows[0], badge: 'Top Rated', type: 'positive' });
      usedIds.add(topRated.rows[0].id);
    }

    if (recent.rows.length > 0) {
      for (const r of recent.rows) {
        if (!usedIds.has(r.id)) {
          selected.push({ ...r, badge: 'Fresh Pick', type: 'neutral' });
          usedIds.add(r.id);
          break; // just add one recent
        }
      }
    }

    if (lowRated.rows.length > 0 && !usedIds.has(lowRated.rows[0].id)) {
      selected.push({ ...lowRated.rows[0], badge: 'Needs Improvement', type: 'warning' });
      usedIds.add(lowRated.rows[0].id);
    } else {
      // Fill with another recent if no low-rated available
      for (const r of recent.rows) {
        if (!usedIds.has(r.id) && selected.length < 3) {
          selected.push({ ...r, badge: 'Recent Review', type: 'neutral' });
          usedIds.add(r.id);
        }
      }
    }

    return selected;
  } catch (error) {
    console.error('Database Error in getHeroReviews:', error);
    return [];
  }
}

export async function getHospitals() {
  try {
    const { rows } = await sql`
      SELECT 
        h.id, 
        h.name, 
        h.location, 
        h.website,
        COALESCE(AVG(r.rating), 0) as rating,
        COUNT(r.id) as "num_ratings"
      FROM hospitals h
      LEFT JOIN reviews r ON h.id = r.hospital_id
      GROUP BY h.id, h.name, h.location, h.website
      ORDER BY 
        (COALESCE(AVG(r.rating), 0) * LOG(10, COUNT(r.id) + 1)) DESC,
        COALESCE(AVG(r.rating), 0) DESC,
        COUNT(r.id) DESC
    `;
    
    // Clean up the numbers
    return rows.map(row => ({
      ...row,
      rating: Number(row.rating),
      numRatings: Number(row.num_ratings)
    }));
  } catch (error) {
    console.error('Database Error:', error);
    return getFallbackHospitals();
  }
}

// --- 2. Create Hospital ---
export async function createHospital(formData) {
  const name = formData.get('name');
  const location = formData.get('location');
  
  try {
    // 1. Check for duplicates (Case Insensitive)
    const existing = await sql`
      SELECT id FROM hospitals 
      WHERE LOWER(name) = LOWER(${name}) 
      AND LOWER(location) = LOWER(${location})
    `;

    if (existing.rows.length > 0) {
      return { message: 'This hospital already exists!' };
    }

    // 2. Insert if new
    await sql`
      INSERT INTO hospitals (name, location)
      VALUES (${name}, ${location})
    `;
  } catch (error) {
    console.error('Database Error:', error);
    return { message: 'Database Error: Failed to Create Hospital.' };
  }

  revalidatePath('/');
  redirect('/');
}

// --- 2.5 Create Hospital from Client Object ---
export async function createHospitalClient({ name, location }) {
  try {
    const existing = await sql`
      SELECT id FROM hospitals 
      WHERE LOWER(name) = LOWER(${name}) 
      AND LOWER(location) = LOWER(${location})
    `;
    if (existing.rows.length > 0) return { id: existing.rows[0].id };

    const result = await sql`
      INSERT INTO hospitals (name, location)
      VALUES (${name}, ${location})
      RETURNING id
    `;
    revalidatePath('/');
    return { id: result.rows[0].id };
  } catch (error) {
    console.error('Database Error:', error);
    return null;
  }
}

// --- 3. Create Review ---
export async function createReview(formData) {
  const hospitalId = formData.get('hospitalId');
  const rating = formData.get('rating');
  const comment = formData.get('comment');
  const name = formData.get('name');
  const imageUrl = formData.get('imageUrl');

  try {
    await sql`
      INSERT INTO reviews (hospital_id, rating, comment, name, image_url)
      VALUES (${hospitalId}, ${rating}, ${comment}, ${name}, ${imageUrl || null})
    `;
  } catch (error) {
    console.error('Failed to create review:', error);
    return { message: 'Failed to save review' };
  }

  revalidatePath(`/hospital/${hospitalId}`);
  revalidatePath('/');
  revalidatePath('/recent-reviews');
}

// --- 4. Get Single Hospital ---
export async function getHospitalById(id) {
  try {
    // 1. Get the Hospital & Stats
    const hospitalData = await sql`
      SELECT 
        h.id, 
        h.name, 
        h.location, 
        h.website,
        COALESCE(AVG(r.rating), 0) as rating,
        COUNT(r.id) as "num_ratings"
      FROM hospitals h
      LEFT JOIN reviews r ON h.id = r.hospital_id
      WHERE h.id = ${id}
      GROUP BY h.id, h.name, h.location, h.website
    `;

    if (hospitalData.rows.length === 0) {
        return null;
    }

    const hospital = hospitalData.rows[0];

    // 2. Get the Reviews
    const reviewsData = await sql`
      SELECT id, hospital_id, rating, comment, name, image_url, created_at 
      FROM reviews 
      WHERE hospital_id = ${id} 
      ORDER BY created_at DESC
    `;

    return {
      ...hospital,
      rating: Number(hospital.rating),
      numRatings: Number(hospital.num_ratings),
      reviews: reviewsData.rows.map(r => ({
        ...r,
        rating: Number(r.rating),
        date: new Date(r.created_at).toLocaleDateString()
      }))
    };

  } catch (error) {
    console.error('[DEBUG] Database Error in getHospitalById:', error);
    // Let's NOT fall back to local storage if it's a real Postgres ID, because that masks the error!
    return null;
  }
}
