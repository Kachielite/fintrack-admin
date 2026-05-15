// ============ Login Page ============
const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = React.useState('leah@fintrack.io');
  const [password, setPassword] = React.useState('••••••••••••');
  const [submitting, setSubmitting] = React.useState(false);

  const submit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => onLogin(email), 360);
  };

  return (
    <div className="login-page" data-screen-label="Login">
      <form className="login-card" onSubmit={submit}>
        <div className="login-brand">
          <div className="sidebar-logo">F</div>
          <div className="login-brand-text">
            <span className="login-brand-name">FinTrack</span>
            <span className="login-brand-tag">Admin</span>
          </div>
        </div>

        <div className="login-form">
          <div className="field">
            <label className="field-label">Email</label>
            <input className="input mono" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)} autoComplete="email" required/>
          </div>
          <div className="field">
            <label className="field-label">Password</label>
            <input className="input mono" type="password" value={password}
              onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required/>
          </div>
          <button className="btn primary login-cta" type="submit" disabled={submitting}>
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </div>

        <div className="login-note">
          <Icon name="lock" size={12}/>
          This area is restricted to authorised personnel only.
        </div>
      </form>
    </div>
  );
};
window.LoginPage = LoginPage;
