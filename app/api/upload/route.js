import { randomUUID } from 'node:crypto';
import { put } from '@vercel/blob';
import sharp from 'sharp';
import { NextResponse } from 'next/server';
import { assertOrigin, checkBudget, cookieOptions, failure, photoReceipt, readBody, SecurityError } from '@/lib/security';

export const runtime = 'nodejs';
export async function POST(request) {
  try {
    assertOrigin(request);
    // Apply the shared budget before reading or decoding an image.
    await checkBudget(request, 'upload', 8, 200);
    const form = await readBody(request, 4 * 1024 * 1024, 'multipart/form-data');
    const file = form.get('file');
    if (!(file instanceof File) || !file.size || file.size > 3 * 1024 * 1024) throw new SecurityError(400, 'Please choose an image smaller than 3MB');
    const source = Buffer.from(await file.arrayBuffer());
    const image = sharp(source, { limitInputPixels: 20_000_000, animated: false, failOn: 'warning' });
    let photo;
    try {
      const info = await image.metadata();
      if (!['jpeg', 'png', 'webp'].includes(info.format) || (info.pages ?? 1) > 1) throw new Error('format');
      // Decode and re-encode. Removes metadata, scripts, appended payloads and user filenames.
      photo = await image.rotate().resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 80 }).toBuffer();
    } catch { throw new SecurityError(400, 'Please choose a valid JPG, PNG, or WebP image'); }
    // Validate signing configuration before creating a public blob.
    photoReceipt('configuration-check');
    const blob = await put(`review-photos/${randomUUID()}.jpg`, photo, { access: 'public', contentType: 'image/jpeg', addRandomSuffix: false });
    const response = NextResponse.json({ url: blob.url }, { headers: { 'Cache-Control': 'no-store' } });
    response.cookies.set('food_photo', photoReceipt(blob.url), { ...cookieOptions, maxAge: 3600 });
    return response;
  } catch (error) { return failure(error); }
}
