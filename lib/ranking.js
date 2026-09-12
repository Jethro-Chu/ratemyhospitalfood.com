// lib/ranking.js

export const BAYESIAN_M = 5;

/**
 * Calculates the Bayesian weighted ranking score.
 * Formula: rankingScore = (v / (v + m)) * R + (m / (v + m)) * C
 *
 * @param {number|string} v - Number of reviews for the hospital
 * @param {number|string} R - Hospital's actual average rating
 * @param {number|string} C - Average rating across all valid reviews on the website
 * @param {number|string} [m=5] - Weight assigned to site-wide average
 * @returns {number}
 */
export function calculateRankingScore(v, R, C, m = BAYESIAN_M) {
  const reviews = Math.max(0, Number(v) || 0);
  const rating = Math.max(0, Number(R) || 0);
  const siteAvg = Math.max(0, Number(C) || 0);
  const weight = Number.isFinite(Number(m)) && Number(m) >= 0 ? Number(m) : BAYESIAN_M;

  const denominator = reviews + weight;
  if (denominator <= 0) {
    return 0;
  }

  const score = (reviews / denominator) * rating + (weight / denominator) * siteAvg;
  return Number.isFinite(score) ? score : 0;
}

/**
 * Calculates the site-wide average rating across all valid reviews from a list of hospitals.
 * C = sum(v_i * R_i) / sum(v_i)
 *
 * @param {Array} hospitals
 * @returns {number}
 */
export function calculateSiteWideAverage(hospitals) {
  if (!Array.isArray(hospitals) || hospitals.length === 0) return 0;

  let totalRatingSum = 0;
  let totalReviewsCount = 0;

  for (const h of hospitals) {
    const v = Math.max(0, Number(h?.numRatings) || 0);
    const r = Math.max(0, Number(h?.rating) || 0);
    if (v > 0) {
      totalRatingSum += v * r;
      totalReviewsCount += v;
    }
  }

  return totalReviewsCount > 0 ? totalRatingSum / totalReviewsCount : 0;
}

/**
 * Sorts hospitals for the leaderboard using Bayesian weighted rating.
 * Sorts by rankingScore descending, with secondary tie-breakers on review count and raw rating.
 *
 * @param {Array} hospitals
 * @param {number} [siteWideAvg] - Optional explicit C. If omitted, computed from hospitals.
 * @param {number} [m=5] - Prior weight
 * @returns {Array}
 */
export function sortLeaderboardHospitals(hospitals, siteWideAvg, m = BAYESIAN_M) {
  if (!Array.isArray(hospitals)) return [];

  const C = typeof siteWideAvg === 'number' && Number.isFinite(siteWideAvg)
    ? siteWideAvg
    : calculateSiteWideAverage(hospitals);

  return [...hospitals].sort((a, b) => {
    const countA = Math.max(0, Number(a?.numRatings) || 0);
    const countB = Math.max(0, Number(b?.numRatings) || 0);

    // Unrated hospitals (0 reviews) sort below rated hospitals
    if ((countA === 0) !== (countB === 0)) {
      return countA === 0 ? 1 : -1;
    }

    const scoreA = calculateRankingScore(countA, a?.rating, C, m);
    const scoreB = calculateRankingScore(countB, b?.rating, C, m);

    if (scoreB !== scoreA) {
      return scoreB - scoreA;
    }
    if (countB !== countA) {
      return countB - countA;
    }
    return (Number(b?.rating) || 0) - (Number(a?.rating) || 0);
  });
}
