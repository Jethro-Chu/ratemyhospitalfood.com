'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { headers, cookies } from 'next/headers';
import { assertOrigin, checkBudget, text } from './security';
import { submitReview } from './reviewSubmission';
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
    const { rows } = await sql`
      SELECT r.id, r.rating, r.comment, r.name as "reviewerName", h.name as "hospitalName", h.id as "hospitalId"
      FROM reviews r
      JOIN hospitals h ON r.hospital_id = h.id
      WHERE r.comment IS NOT NULL AND r.comment != '' AND r.rating >= 4
      ORDER BY r.rating DESC, RANDOM()
      LIMIT 3
    `;

    const badges = ['Top Rated', 'Fresh Pick', 'Recent Review'];
    
    return rows.map((row, index) => {
      let firstName = 'Anonymous';
      if (row.reviewerName && row.reviewerName.trim() !== '') {
         const parts = row.reviewerName.trim().split(' ');
         if (parts.length > 0 && parts[0]) {
             firstName = parts[0];
         }
      }
      
      return {
        ...row,
        firstName,
        badge: badges[index % badges.length],
        type: 'positive'
      };
    });
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
        COUNT(r.id) as "num_ratings",
        (
          SELECT rc.comment FROM reviews rc
          WHERE rc.hospital_id = h.id AND rc.comment IS NOT NULL AND rc.comment != ''
          ORDER BY rc.created_at DESC
          LIMIT 1
        ) as review_snippet,
        (
          SELECT rp.image_url FROM reviews rp
          WHERE rp.hospital_id = h.id AND rp.image_url IS NOT NULL
          ORDER BY rp.created_at DESC
          LIMIT 1
        ) as photo_url
      FROM hospitals h
      LEFT JOIN reviews r ON h.id = r.hospital_id
      GROUP BY h.id, h.name, h.location, h.website
      ORDER BY
        ((0.75 * LN(COUNT(r.id) + 1)) + (0.25 * (COALESCE(AVG(r.rating), 0) / 5.0))) DESC,
        COUNT(r.id) DESC,
        COALESCE(AVG(r.rating), 0) DESC
    `;

    // Clean up the numbers
    return rows.map(row => ({
      ...row,
      rating: Number(row.rating),
      numRatings: Number(row.num_ratings),
      reviewSnippet: row.review_snippet || null,
      photoUrl: row.photo_url || null
    }));
  } catch (error) {
    console.error('Database Error:', error);
    return getFallbackHospitals();
  }
}

// --- 2. Create Hospital ---
async function submissionRequest() {
  return new Request('https://www.ratemyhospitalfood.com', { headers: await headers() });
}

export async function createHospital(formData) {
  const result = await createHospitalClient({ name: formData.get('name'), location: formData.get('location') });
  if (!result) return { message: 'Could not add this hospital. Check the fields or try again later.' };
  redirect('/');
}

export async function createHospitalClient(input) {
  try {
    const request = await submissionRequest();
    assertOrigin(request);
    const name = text(input?.name, 200, true);
    const location = text(input?.location, 200, true);
    await checkBudget(request, 'hospital', 4, 100);
    const existing = await sql`SELECT id FROM hospitals WHERE LOWER(name) = LOWER(${name}) AND LOWER(location) = LOWER(${location})`;
    if (existing.rows.length) return { id: existing.rows[0].id };
    const result = await sql`INSERT INTO hospitals (name, location) VALUES (${name}, ${location}) RETURNING id`;
    revalidatePath('/');
    return { id: result.rows[0].id };
  } catch { return null; }
}

export async function createReview(formData) {
  try {
    const request = await submissionRequest();
    const jar = await cookies();
    const review = await submitReview(request, Object.fromEntries(['hospitalId', 'rating', 'comment', 'name', 'imageUrl'].map(key => [key, formData.get(key)])), jar.get('food_photo')?.value);
    revalidatePath(`/hospital/${review.hospitalId}`);
    revalidatePath('/');
    revalidatePath('/recent-reviews');
  } catch { return { message: 'Could not save review. Check the fields or try again later.' }; }
}

// --- 3.5 Get Recent Reviews ---
export async function getRecentReviews() {
  try {
    // Try last 30 days first
    const { rows } = await sql`
      SELECT
        r.id, r.rating, r.comment, r.name, r.image_url, r.created_at,
        h.id  AS hospital_id,
        h.name AS hospital_name
      FROM reviews r
      JOIN hospitals h ON r.hospital_id = h.id
      WHERE r.created_at >= NOW() - INTERVAL '30 days'
      ORDER BY r.created_at DESC LIMIT 100
    `;

    // Fall back to all reviews (most recent 50) if nothing in past month
    if (rows.length === 0) {
      const fallback = await sql`
        SELECT
          r.id, r.rating, r.comment, r.name, r.image_url, r.created_at,
          h.id  AS hospital_id,
          h.name AS hospital_name
        FROM reviews r
        JOIN hospitals h ON r.hospital_id = h.id
        ORDER BY r.created_at DESC
        LIMIT 50
      `;
      return { reviews: fallback.rows.map(normalizeReview), isAllTime: true };
    }

    return { reviews: rows.map(normalizeReview), isAllTime: false };
  } catch (error) {
    console.error('Database Error in getRecentReviews:', error);
    return { reviews: [], isAllTime: false };
  }
}

function normalizeReview(r) {
  return {
    ...r,
    rating: Number(r.rating),
    helpfulCount: Number(r.helpful_count ?? 0),
    funnyCount: Number(r.funny_count ?? 0),
    createdAt: r.created_at ? new Date(r.created_at).toISOString() : null,
    date: r.created_at
      ? new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : null,
  };
}

// --- 3.6 Paginated review feed (newest first, all-time) ---
export async function getReviewsFeed({ limit = 12, offset = 0 } = {}) {
  limit = Number.isInteger(limit) ? Math.min(50, Math.max(1, limit)) : 12;
  offset = Number.isInteger(offset) ? Math.min(10000, Math.max(0, offset)) : 0;
  try {
    const { rows } = await sql`
      SELECT
        r.id, r.hospital_id, r.rating, r.comment, r.name, r.image_url, r.created_at, r.helpful_count, r.funny_count,
        h.name AS hospital_name,
        COUNT(*) OVER() AS total_count
      FROM reviews r
      JOIN hospitals h ON r.hospital_id = h.id
      ORDER BY r.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    const total = rows.length > 0 ? Number(rows[0].total_count) : 0;
    return {
      reviews: rows.map(normalizeReview),
      total,
      hasMore: offset + rows.length < total,
    };
  } catch (error) {
    console.error('Database Error in getReviewsFeed:', error);
    return { reviews: [], total: 0, hasMore: false };
  }
}

// --- 3.7 Popular reviews, ranked by reader reactions ---
// The reaction columns are installed by the reviewed SQL migration,
// so fall back to a rating-based ranking when they're missing.
export async function getPopularReviews(limit = 6) {
  limit = Number.isInteger(limit) ? Math.min(50, Math.max(1, limit)) : 6;
  try {
    const { rows } = await sql`
      SELECT r.id, r.hospital_id, r.rating, r.comment, r.name, r.image_url, r.created_at, r.helpful_count, r.funny_count, h.name AS hospital_name
      FROM reviews r
      JOIN hospitals h ON r.hospital_id = h.id
      WHERE r.comment IS NOT NULL AND r.comment != ''
      ORDER BY
        (COALESCE(r.helpful_count, 0) + COALESCE(r.funny_count, 0)) DESC,
        r.rating DESC,
        r.created_at DESC
      LIMIT ${limit}
    `;
    return rows.map(normalizeReview);
  } catch (error) {
    try {
      const { rows } = await sql`
        SELECT r.id, r.hospital_id, r.rating, r.comment, r.name, r.image_url, r.created_at, r.helpful_count, r.funny_count, h.name AS hospital_name
        FROM reviews r
        JOIN hospitals h ON r.hospital_id = h.id
        WHERE r.comment IS NOT NULL AND r.comment != ''
        ORDER BY r.rating DESC, r.created_at DESC
        LIMIT ${limit}
      `;
      return rows.map(normalizeReview);
    } catch (fallbackError) {
      console.error('Database Error in getPopularReviews:', fallbackError);
      return [];
    }
  }
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

    // 2. Get the Reviews (SELECT * so reaction columns ride along once they exist)
    const reviewsData = await sql`
      SELECT id, hospital_id, rating, comment, name, image_url, created_at, helpful_count, funny_count
      FROM reviews
      WHERE hospital_id = ${id}
      ORDER BY created_at DESC
    `;

    return {
      ...hospital,
      rating: Number(hospital.rating),
      numRatings: Number(hospital.num_ratings),
      reviews: reviewsData.rows.map(normalizeReview)
    };

  } catch (error) {
    console.error('[DEBUG] Database Error in getHospitalById:', error);
    // Let's NOT fall back to local storage if it's a real Postgres ID, because that masks the error!
    return null;
  }
}
