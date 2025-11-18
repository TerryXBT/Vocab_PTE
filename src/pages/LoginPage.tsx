import { FormEvent, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Icon from '../components/Icon';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }
    navigate('/dashboard');
  };

  return (
    <div className="card">
      <div className="stack">
        <div>
          <div className="badge-soft">Welcome back</div>
          <h2 style={{ margin: '0.4rem 0 0' }}>Log in to Voca PTE</h2>
          <p className="muted" style={{ margin: 0 }}>
            Pick up where you left off and keep your streak alive.
          </p>
        </div>
      </div>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        {error ? <p className="error">{error}</p> : null}
        <button className="btn primary" type="submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Log in'}
          <Icon name="arrowRight" className="icon" />
        </button>
      </form>
      <p className="muted">
        No account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}
