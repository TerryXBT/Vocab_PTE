import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon from '../components/Icon';

export default function LandingPage() {
  const { session } = useAuth();

  return (
    <div className="card hero">
      <div className="badge-soft">Voca PTE · Apple-inspired</div>
      <h1>Master vocabulary with calm focus</h1>
      <p className="muted">
        A minimal, tactile experience for building your word bank with spaced repetition, synced
        securely with Supabase.
      </p>
      <div className="actions">
        {session ? (
          <Link className="btn primary" to="/dashboard">
            <Icon name="dashboard" className="icon" />
            Go to Dashboard
          </Link>
        ) : (
          <>
            <Link className="btn primary" to="/signup">
              <Icon name="arrowRight" className="icon" />
              Create account
            </Link>
            <Link className="btn ghost" to="/login">
              <Icon name="user" className="icon" />
              Log in
            </Link>
          </>
        )}
      </div>
      <ul className="feature-list">
        <li className="feature-item">
          <Icon name="checkCircle" className="feature-icon" />
          <span>Spaced repetition that keeps the right words in front of you</span>
        </li>
        <li className="feature-item">
          <Icon name="play" className="feature-icon" />
          <span>US and UK pronunciation with the Web Speech API</span>
        </li>
        <li className="feature-item">
          <Icon name="list" className="feature-icon" />
          <span>Supabase Auth + Postgres on the free tier with synced progress</span>
        </li>
      </ul>
    </div>
  );
}
