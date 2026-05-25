import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request) {
  try {
    const body = await request.json();
    const { hospitalId, rating, comment, name, imageUrl } = body;

    if (!hospitalId || !rating) {
      return NextResponse.json(
        { error: 'Hospital ID and rating are required' },
        { status: 400 }
      );
    }

    const ratingNum = parseInt(rating, 10);
    if (ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    await sql`
      INSERT INTO reviews (hospital_id, rating, comment, name, image_url)
      VALUES (${hospitalId}, ${ratingNum}, ${comment || null}, ${name || null}, ${imageUrl || null})
    `;

    revalidatePath(`/hospital/${hospitalId}`);
    revalidatePath('/');
    revalidatePath('/recent-reviews');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Review creation error:', error);
    return NextResponse.json(
      { error: 'Failed to save review. Please try again.' },
      { status: 500 }
    );
  }
}
