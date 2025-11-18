import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import Icon from '../components/Icon';

type Stats = {
  dueToday: number;
  totalStudied: number;
  totalReviews: number;
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({ dueToday: 0, totalStudied: 0, totalReviews: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);

      const nowIso = new Date().toISOString();

      const [{ count: dueCount, error: dueError }, { count: studiedCount, error: studiedError }] =
        await Promise.all([
          supabase
            .from('user_word_progress')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .lte('next_review_at', nowIso),
          supabase
            .from('user_word_progress')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', user.id)
        ]);

      const { data: reviewSum, error: reviewError } = await supabase
        .from('user_word_progress')
        .select('review_count')
        .eq('user_id', user.id);

      if (dueError || studiedError || reviewError) {
        setError(dueError?.message || studiedError?.message || reviewError?.message || 'Error');
        setLoading(false);
        return;
      }

      const totalReviews = (reviewSum ?? []).reduce((sum, row) => sum + (row.review_count ?? 0), 0);

      setStats({
        dueToday: dueCount ?? 0,
        totalStudied: studiedCount ?? 0,
        totalReviews
      });
      setLoading(false);
    };

    fetchStats();
  }, [user]);

  if (loading) return <div className="card">Loading dashboard...</div>;
  if (error) return <div className="card error">{error}</div>;

  return (
    <div className="stack">
      <div>
        <div className="badge-soft">Today</div>
        <h1 style={{ margin: '0.35rem 0 0' }}>Dashboard</h1>
        <p className="muted" style={{ margin: 0 }}>
          A clear snapshot of what&apos;s due and what you&apos;ve mastered.
        </p>
      </div>
      <div className="grid">
        <StatCard title="Words due today" value={stats.dueToday} />
        <StatCard title="Words studied total" value={stats.totalStudied} />
        <StatCard title="Total reviews" value={stats.totalReviews} />
      </div>
      <div className="actions">
        <Link className="btn primary" to="/review">
          <Icon name="review" className="icon" />
          Start Review
        </Link>
        <Link className="btn ghost" to="/words">
          <Icon name="book" className="icon" />
          Browse Words
        </Link>
      </div>
    </div>
  );
}
