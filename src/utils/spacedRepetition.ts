import { UserWordProgress } from '../types';

export type ReviewResult = 'know' | 'unsure' | 'dont_know';

export function nextIntervalDays(proficiency: number) {
  switch (proficiency) {
    case 1:
      return 1;
    case 2:
      return 2;
    case 3:
      return 4;
    case 4:
      return 7;
    default:
      return 14;
  }
}

export function applyReview(
  current: Omit<UserWordProgress, 'id' | 'user_id' | 'word_id'> | null,
  result: ReviewResult
) {
  const now = new Date();
  const currentProficiency = current?.proficiency ?? 0;
  const reviewCount = current?.review_count ?? 0;

  let proficiency = currentProficiency;
  let nextReviewAt = now;

  if (result === 'dont_know') {
    proficiency = 0;
    nextReviewAt = addHours(now, 12);
  } else if (result === 'unsure') {
    proficiency = Math.min(currentProficiency + 1, 3);
    nextReviewAt = addDays(now, 1);
  } else {
    proficiency = Math.min(currentProficiency + 1, 5);
    nextReviewAt = addDays(now, nextIntervalDays(proficiency));
  }

  return {
    proficiency,
    next_review_at: nextReviewAt.toISOString(),
    last_review_at: now.toISOString(),
    review_count: reviewCount + 1
  };
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addHours(date: Date, hours: number) {
  const d = new Date(date);
  d.setHours(d.getHours() + hours);
  return d;
}
