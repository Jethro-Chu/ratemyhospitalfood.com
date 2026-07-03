import { sql } from '@vercel/postgres';

const REACTION_TYPES = ['helpful', 'funny'];

async function ensureReactionColumns() {
  await sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS helpful_count INT NOT NULL DEFAULT 0`;
  await sql`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS funny_count INT NOT NULL DEFAULT 0`;
}

function applyReaction(reviewId, type, step) {
  if (type === 'helpful') {
    return sql`
      UPDATE reviews
      SET helpful_count = GREATEST(0, helpful_count + ${step})
      WHERE id = ${reviewId}
      RETURNING helpful_count, funny_count
    `;
  }
  return sql`
    UPDATE reviews
    SET funny_count = GREATEST(0, funny_count + ${step})
    WHERE id = ${reviewId}
    RETURNING helpful_count, funny_count
  `;
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { reviewId, type, delta } = body || {};
  if (!reviewId || !REACTION_TYPES.includes(type)) {
    return Response.json({ error: 'reviewId and a valid reaction type are required' }, { status: 400 });
  }
  const step = Number(delta) < 0 ? -1 : 1;

  try {
    let result;
    try {
      result = await applyReaction(reviewId, type, step);
    } catch (error) {
      // 42703 = undefined column: the DB predates the reaction migration. Heal and retry.
      if (error?.code === '42703') {
        await ensureReactionColumns();
        result = await applyReaction(reviewId, type, step);
      } else {
        throw error;
      }
    }

    if (result.rows.length === 0) {
      return Response.json({ error: 'Review not found' }, { status: 404 });
    }
    return Response.json({
      helpfulCount: Number(result.rows[0].helpful_count),
      funnyCount: Number(result.rows[0].funny_count),
    });
  } catch (error) {
    // 22P02 = malformed UUID
    if (error?.code === '22P02') {
      return Response.json({ error: 'Invalid review id' }, { status: 400 });
    }
    console.error('Reaction error:', error);
    return Response.json({ error: 'Could not save reaction' }, { status: 500 });
  }
}
