'use server';

import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  getHospitals as getFallbackHospitals,
  getHospitalById as getFallbackHospitalById
} from './data';

// --- 1. Fetch Hospitals (This is what the Home Page needs!) ---
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
      ORDER BY rating DESC
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

    if (hospitalData.rows.length === 0) return null;

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
    console.error('Database Error:', error);
    return getFallbackHospitalById(id);
  }
}
