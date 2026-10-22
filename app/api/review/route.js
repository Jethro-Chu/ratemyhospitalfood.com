import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { assertOrigin, failure, readBody } from '@/lib/security';
import { submitReview } from '@/lib/reviewSubmission';

export async function POST(request) {
  try {
    assertOrigin(request);
    const body = await readBody(request, 16 * 1024);
    const jar = await cookies();
    const review = await submitReview(request, body, jar.get('food_photo')?.value);
    revalidatePath(`/hospital/${review.hospitalId}`);
    revalidatePath('/');
    revalidatePath('/recent-reviews');
    return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return failure(error); }
}
