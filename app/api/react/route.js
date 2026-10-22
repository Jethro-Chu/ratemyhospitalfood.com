import { sql } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { actorFromCookie, assertOrigin, checkBudget, cookieOptions, failure, readBody, SecurityError, sign, uuid } from '@/lib/security';

export async function POST(request) {
  try {
    assertOrigin(request);
    const body = await readBody(request, 2048);
    if (!uuid(body?.reviewId) || !['helpful', 'funny'].includes(body?.type) || ![1, -1].includes(body?.delta)) throw new SecurityError(400, 'Invalid reaction');
    const jar = await cookies();
    const actor = actorFromCookie(jar.get('food_actor')?.value);
    const signedActor = sign(actor);
    await checkBudget(request, 'reaction', 60, 3000);
    // Both the ledger and counter change in one atomic statement. A browser can
    // remove only its own reaction; repeating +1 does not increment again.
    const result = await sql`
      WITH added AS (
        INSERT INTO review_reactions (review_id, actor, type)
        SELECT ${body.reviewId}::uuid, ${actor}, ${body.type} WHERE ${body.delta} = 1
        ON CONFLICT DO NOTHING RETURNING 1
      ), removed AS (
        DELETE FROM review_reactions WHERE review_id = ${body.reviewId}::uuid
          AND actor = ${actor} AND type = ${body.type} AND ${body.delta} = -1 RETURNING 1
      ), change AS (SELECT (SELECT count(*) FROM added) - (SELECT count(*) FROM removed) AS step)
      UPDATE reviews SET
        helpful_count = GREATEST(0, helpful_count + CASE WHEN ${body.type} = 'helpful' THEN change.step::int ELSE 0 END),
        funny_count = GREATEST(0, funny_count + CASE WHEN ${body.type} = 'funny' THEN change.step::int ELSE 0 END)
      FROM change WHERE id = ${body.reviewId}::uuid RETURNING helpful_count, funny_count
    `;
    if (!result.rows.length) throw new SecurityError(404, 'Review not found');
    const response = NextResponse.json({ helpfulCount: Number(result.rows[0].helpful_count), funnyCount: Number(result.rows[0].funny_count) }, { headers: { 'Cache-Control': 'no-store' } });
    response.cookies.set('food_actor', signedActor, cookieOptions);
    return response;
  } catch (error) {
    if (error?.code === '23503') return failure(new SecurityError(404, 'Review not found'));
    return failure(error);
  }
}
