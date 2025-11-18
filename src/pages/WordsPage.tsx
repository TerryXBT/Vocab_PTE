import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Word, UserWordProgress } from '../types';
import Icon from '../components/Icon';
import WordCard from '../components/WordCard';
import { useAuth } from '../context/AuthContext';
import { applyReview, ReviewResult } from '../utils/spacedRepetition';

export default function WordsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [selectedProgressId, setSelectedProgressId] = useState<number | null>(null);
  const [selectedProgress, setSelectedProgress] =
    useState<Omit<UserWordProgress, 'id' | 'user_id' | 'word_id'> | null>(null);
  const [modalSaving, setModalSaving] = useState(false);
  const [modalShowMeaning, setModalShowMeaning] = useState(false);

  useEffect(() => {
    const fetchWords = async () => {
      setLoading(true);
      setError(null);
      let query = supabase.from('words').select('*').order('id', { ascending: true }).limit(200);

      if (search) {
        query = query.ilike('word', `%${search}%`);
      }
      if (tagFilter) {
        query = query.contains('tags', [tagFilter]);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) {
        setError(fetchError.message);
      } else {
        setWords(data ?? []);
      }
      setLoading(false);
    };

    fetchWords();
  }, [search, tagFilter]);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!selectedWord || !user) return;
      setModalShowMeaning(false);
      const { data: progressRow } = await supabase
        .from('user_word_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('word_id', selectedWord.id)
        .maybeSingle();

      if (progressRow) {
        setSelectedProgressId(progressRow.id);
        setSelectedProgress({
          proficiency: progressRow.proficiency,
          next_review_at: progressRow.next_review_at,
          last_review_at: progressRow.last_review_at,
          review_count: progressRow.review_count
        });
      } else {
        setSelectedProgressId(null);
        setSelectedProgress(null);
      }
    };

    fetchProgress();
  }, [selectedWord, user]);

  return (
    <div className="stack">
      <div>
        <div className="badge-soft">Library</div>
        <h1 style={{ margin: '0.35rem 0 0' }}>Words</h1>
        <p className="muted" style={{ margin: 0 }}>
          Search, filter, and revisit the vocabulary that powers your score.
        </p>
      </div>
      <div className="card">
        <div className="filters">
          <input
            placeholder="Search word"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <input
            placeholder="Filter by tag (e.g. PTE)"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
          />
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : (
          <div className="word-list">
            <div className="muted" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Icon name="list" className="icon" />
              {words.length} words
            </div>
            {words.map((w) => (
              <button
                key={w.id}
                className="word-row clickable"
                onClick={() => setSelectedWord(w)}
                style={{ textAlign: 'left' }}
              >
                <div className="word-title">
                  <strong>{w.word}</strong>
                  {w.tags?.length ? <span className="tag">{w.tags[0]}</span> : null}
                  {w.pos ? <span className="muted">{w.pos}</span> : null}
                  {w.phonetic ? <span className="muted">/{w.phonetic}/</span> : null}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      {selectedWord ? (
        <WordModal
          word={selectedWord}
          showMeaning={modalShowMeaning}
          onClose={() => {
            setSelectedWord(null);
            setSelectedProgress(null);
            setSelectedProgressId(null);
            setModalShowMeaning(false);
            setModalSaving(false);
          }}
          onShowMeaning={() => setModalShowMeaning(true)}
          onToggleMeaning={() => setModalShowMeaning((v) => !v)}
          onResponse={async (result) => {
            if (!user || !selectedWord) return;
            setModalSaving(true);

            let existing = selectedProgress;
            if (selectedProgressId) {
              const { data: existingRow } = await supabase
                .from('user_word_progress')
                .select('*')
                .eq('id', selectedProgressId)
                .maybeSingle();
              if (existingRow) {
                existing = {
                  proficiency: existingRow.proficiency,
                  next_review_at: existingRow.next_review_at,
                  last_review_at: existingRow.last_review_at,
                  review_count: existingRow.review_count
                };
              }
            }

            const update = applyReview(existing, result);
            if (result === 'dont_know') {
              update.next_review_at = new Date().toISOString(); // make immediately due
            }

            if (selectedProgressId) {
              const { error: updateError } = await supabase
                .from('user_word_progress')
                .update(update)
                .eq('id', selectedProgressId);
              if (updateError) {
                setError(updateError.message);
                setModalSaving(false);
                return;
              }
            } else {
              const { data: inserted, error: insertError } = await supabase
                .from('user_word_progress')
                .insert({
                  user_id: user.id,
                  word_id: selectedWord.id,
                  ...update
                })
                .select()
                .maybeSingle();
              if (insertError) {
                setError(insertError.message);
                setModalSaving(false);
                return;
              }
              if (inserted) {
                setSelectedProgressId(inserted.id);
                setSelectedProgress({
                  proficiency: inserted.proficiency,
                  next_review_at: inserted.next_review_at,
                  last_review_at: inserted.last_review_at,
                  review_count: inserted.review_count
                });
              }
            }

            setModalSaving(false);
            setModalShowMeaning(false);

            if (result === 'dont_know') {
              navigate('/review');
              return;
            }

            // Move to next word in the list for mastered path; if none, close modal
            const currentIndex = words.findIndex((w) => w.id === selectedWord.id);
            const nextWord = currentIndex >= 0 && currentIndex + 1 < words.length ? words[currentIndex + 1] : null;
            setSelectedProgress(null);
            setSelectedProgressId(null);
            setSelectedWord(nextWord);
          }}
          saving={modalSaving}
        />
      ) : null}
    </div>
  );
}

type WordModalProps = {
  word: Word;
  showMeaning: boolean;
  onClose: () => void;
  onShowMeaning: () => void;
  onToggleMeaning: () => void;
  onResponse: (result: ReviewResult) => void;
  saving: boolean;
};

function WordModal({
  word,
  showMeaning,
  onClose,
  onShowMeaning,
  onToggleMeaning,
  onResponse,
  saving
}: WordModalProps) {
  const hint = 'Click anywhere on the card to display the meaning.';

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onToggleMeaning();
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onResponse('dont_know');
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        onResponse('know');
      }
    },
    [onClose, onResponse, onShowMeaning, onToggleMeaning, showMeaning]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <WordCard
          word={word}
          showMeaning={showMeaning}
          onToggleMeaning={onToggleMeaning}
          onBack={onClose}
          onResponse={onResponse}
          saving={saving}
          hintText={hint}
        />
      </div>
    </div>
  );
}
