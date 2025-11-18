import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import Icon from '../components/Icon';

export default function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [targetExam, setTargetExam] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password
    });
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }
    const user = data.user;
    if (user) {
      await supabase.from('profiles').upsert({
        id: user.id,
        nickname: nickname || null,
        target_exam: targetExam || null
      });
    }
    setLoading(false);
    navigate('/dashboard');
  };

  return (
    <div className="card">
      <div className="stack">
        <div>
          <div className="badge-soft">Get started</div>
          <h2 style={{ margin: '0.4rem 0 0' }}>Create your Voca PTE account</h2>
          <p className="muted" style={{ margin: 0 }}>
            One sign-in for all your study sessions, synced safely in Supabase.
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
            minLength={6}
            autoComplete="new-password"
          />
        </label>
        <label>
          Nickname (optional)
          <input value={nickname} onChange={(e) => setNickname(e.target.value)} />
        </label>
        <label>
          Target exam (optional)
          <input value={targetExam} onChange={(e) => setTargetExam(e.target.value)} />
        </label>
        {error ? <p className="error">{error}</p> : null}
        <button className="btn primary" type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Sign up'}
          <Icon name="arrowRight" className="icon" />
        </button>
      </form>
      <p className="muted">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
