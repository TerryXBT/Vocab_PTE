import Icon from './Icon';
import { speakWord } from '../utils/speech';
import { ReviewResult } from '../utils/spacedRepetition';
import { Word } from '../types';

type Props = {
  word: Word;
  showMeaning: boolean;
  onToggleMeaning: () => void;
  onBack: () => void;
  onResponse: (result: ReviewResult) => void;
  saving?: boolean;
  hintText?: string;
};

export default function WordCard({
  word,
  showMeaning,
  onToggleMeaning,
  onBack,
  onResponse,
  saving,
  hintText = 'Click anywhere on the card to display the meaning.'
}: Props) {
  const handleWordClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    speakWord(word.word, 'uk');
  };

  return (
    <div className="flashcard" onClick={onToggleMeaning} style={{ cursor: 'pointer' }}>
      <div className="word-top">
        <div>
          <div className="word-main" onClick={handleWordClick}>
            <span className="word-text">{word.word}</span>
            {word.pos ? <span className="tag">{word.pos}</span> : null}
          </div>
          {word.phonetic ? <div className="muted">/{word.phonetic}/</div> : null}
        </div>
        <div className="actions">
          <div className="muted">Accent: UK</div>
          <button
            className="btn ghost"
            onClick={(e) => {
              e.stopPropagation();
              speakWord(word.word, 'uk');
            }}
          >
            <Icon name="play" className="icon" />
            Play
          </button>
        </div>
      </div>
      {!showMeaning ? (
        <div className="stack" style={{ marginTop: '1.2rem', alignItems: 'flex-start' }}>
          <div className="card-hint">{hintText}</div>
          <div
            className="actions"
            style={{ justifyContent: 'space-between', width: '100%', flexWrap: 'wrap' }}
          >
            <button
              className="btn success"
              onClick={(e) => {
                e.stopPropagation();
                onResponse('know');
              }}
              disabled={saving}
            >
              Mastered (→)
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="meaning">
            <div>
              <strong>CN:</strong> {word.meaning_cn}
            </div>
            {word.meaning_en ? (
              <div className="muted">
                <strong>EN:</strong> {word.meaning_en}
              </div>
            ) : null}
            {word.example_sentence ? <div className="example">“{word.example_sentence}”</div> : null}
            {word.tags ? <div className="tag-row">{word.tags.join(', ')}</div> : null}
          </div>
          <div className="actions" style={{ justifyContent: 'space-between', width: '100%' }}>
            <button
              className="btn success"
              onClick={(e) => {
                e.stopPropagation();
                onResponse('know');
              }}
              disabled={saving}
            >
              Mastered (→)
            </button>
          </div>
        </>
      )}
    </div>
  );
}
