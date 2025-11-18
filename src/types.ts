export type Word = {
  id: number;
  word: string;
  phonetic: string | null;
  pos: string | null;
  meaning_cn: string;
  meaning_en: string | null;
  example_sentence: string | null;
  tags: string[] | null;
};

export type UserWordProgress = {
  id: number;
  user_id: string;
  word_id: number;
  proficiency: number;
  next_review_at: string;
  last_review_at: string | null;
  review_count: number;
};
