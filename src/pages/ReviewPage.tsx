import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { ReviewResult, applyReview } from '../utils/spacedRepetition';
import { Word } from '../types';
import Icon from '../components/Icon';
import WordCard from '../components/WordCard';

type ReviewItem = {
  progress_id: number;
  word: Word;
};

export default function ReviewPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showMeanings, setShowMeanings] = useState<Record<number, boolean>>({});

  const fetchCards = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    const now = new Date().toISOString();
    const { data, error: fetchError } = await supabase
      .from('user_word_progress')
      .select('id, word_id, proficiency, next_review_at, last_review_at, review_count, words(*)')
      .eq('user_id', user.id)
      .lte('next_review_at', now)
      .lte('proficiency', 1)
      .order('next_review_at', { ascending: true })
      .limit(100);

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    const mapped: ReviewItem[] =
      data
        ?.flatMap((row) => {
          const rawWord = (row as { words?: unknown }).words;
          const word = Array.isArray(rawWord) ? rawWord[0] : rawWord;
          if (!word) return [];
          return {
            progress_id: row.id,
            word: word as Word
          };
        }) ?? [];
    setItems(mapped);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const handleResponse = useCallback(
    async (id: number, result: ReviewResult) => {
      if (!user) return;
      const currentItem = items.find((it) => it.progress_id === id);
      if (!currentItem) return;
      setSaving(true);
      const { data: existing } = await supabase
        .from('user_word_progress')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      const update = applyReview(existing, result);

      const { error: updateError } = await supabase
        .from('user_word_progress')
        .update(update)
        .eq('id', id);

      setSaving(false);
      if (updateError) {
        setError(updateError.message);
        return;
      }
      setItems((prev) => prev.filter((it) => it.progress_id !== id));
      setShowMeanings((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      if (items.length <= 1) {
        fetchCards();
      }
    },
    [fetchCards, items, user]
  );

  const handleBack = () => navigate(-1);

  const toggleMeaning = (id: number) => {
    setShowMeanings((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) return <div className="card">Loading review queue...</div>;
  if (error) return <div className="card error">{error}</div>;

  if (!items.length) {
    return (
      <div className="card">
        <div className="card-header">
          <h2>All caught up</h2>
          <Icon name="checkCircle" className="icon" />
        </div>
        <p className="muted">No words due right now. Come back later.</p>
        <div className="actions">
          <button className="btn ghost" onClick={handleBack}>
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h2>Review</h2>
      </div>
      <div className="stack">
        {items.map((item) => (
          <WordCard
            key={item.progress_id}
            word={item.word}
            showMeaning={!!showMeanings[item.progress_id]}
            onToggleMeaning={() => toggleMeaning(item.progress_id)}
            onBack={handleBack}
            onResponse={(result) => handleResponse(item.progress_id, result)}
            saving={saving}
          />
        ))}
      </div>
    </div>
  );
}
