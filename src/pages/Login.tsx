import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { useLogin } from '@/hooks/use-login';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { mutate, isPending, isError } = useLogin();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    mutate({ email, password }, {
      onSuccess: () => navigate('/'),
    });
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={submit}>
        <div className="login-brand">
          <div className="sidebar-logo">F</div>
          <div className="login-brand-text">
            <span className="login-brand-name">FinTrack</span>
            <span className="login-brand-tag">Admin</span>
          </div>
        </div>

        <div className="login-form">
          {isError && (
            <div className="login-error">
              Invalid credentials. Please try again.
            </div>
          )}
          <div className="field">
            <label className="field-label">Email</label>
            <input
              className="input mono"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              placeholder="admin@fintrack.io"
            />
          </div>
          <div className="field">
            <label className="field-label">Password</label>
            <input
              className="input mono"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <button className="btn primary login-cta" type="submit" disabled={isPending}>
            {isPending ? 'Signing in…' : 'Sign in'}
          </button>
        </div>

        <div className="login-note">
          <Lock size={12} />
          This area is restricted to authorised personnel only.
        </div>
      </form>
    </div>
  );
}
