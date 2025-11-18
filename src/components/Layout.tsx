import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icon, { IconName } from './Icon';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { session, signOut, loading } = useAuth();
  const { pathname } = useLocation();

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link to="/" className="logo">
          Voca PTE
        </Link>
        <nav className="nav">
          {session && (
            <>
              <NavLink to="/dashboard" active={pathname === '/dashboard'} iconName="dashboard">
                Dashboard
              </NavLink>
              <NavLink to="/words" active={pathname === '/words'} iconName="book">
                Words
              </NavLink>
              <NavLink to="/review" active={pathname === '/review'} iconName="review">
                Review
              </NavLink>
            </>
          )}
        </nav>
        <div className="topbar-actions">
          {loading ? (
            <span className="muted">Loading...</span>
          ) : session ? (
            <>
              <span className="pill">
                <Icon name="user" className="icon" size={14} />
                {session.user.email}
              </span>
              <button className="btn ghost" onClick={() => signOut()}>
                <Icon name="logout" className="icon" />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link className="btn ghost" to="/login">
                <Icon name="user" className="icon" />
                Log in
              </Link>
              <Link className="btn primary" to="/signup">
                <Icon name="arrowRight" className="icon" />
                Sign up
              </Link>
            </>
          )}
        </div>
      </header>
      <main className="main">{children}</main>
    </div>
  );
}

function NavLink({
  to,
  children,
  active,
  iconName
}: {
  to: string;
  children: React.ReactNode;
  active: boolean;
  iconName?: IconName;
}) {
  return (
    <Link className={active ? 'nav-link active' : 'nav-link'} to={to}>
      {iconName ? <Icon name={iconName} className="icon" /> : null}
      {children}
    </Link>
  );
}
