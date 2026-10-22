import { sql } from '@vercel/postgres';
import { assertOrigin, assertPhoto, checkBudget, validateReview } from './security';

export async function submitReview(request, body, receipt) {
  assertOrigin(request);
  const review = validateReview(body);
  assertPhoto(review.imageUrl, receipt);
  await checkBudget(request, 'review', 6, 200);
  await sql`
    INSERT INTO reviews (hospital_id, rating, comment, name, image_url)
    VALUES (${review.hospitalId}, ${review.rating}, ${review.comment}, ${review.name}, ${review.imageUrl})
  `;
  return review;
}
