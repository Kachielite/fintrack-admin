// ============ App root ============
const { useState, useEffect } = React;

const PAGES = {
  overview: window.OverviewPage,
  regex: window.RegexEnginePage,
  ingestion: window.IngestionPage,
  transactions: window.TransactionsPage,
  users: window.UsersPage,
  ai: window.AIUsagePage,
};

const App = () => {
  const [authed, setAuthed] = useState(() => localStorage.getItem('ft.auth') === '1');
  const [email, setEmail] = useState(() => localStorage.getItem('ft.email') || 'leah@fintrack.io');
  const [page, setPage] = useState(() => localStorage.getItem('ft.page') || 'overview');

  useEffect(() => { localStorage.setItem('ft.page', page); }, [page]);

  const onLogin = (e) => {
    setEmail(e);
    setAuthed(true);
    localStorage.setItem('ft.auth', '1');
    localStorage.setItem('ft.email', e);
  };
  const onSignOut = () => {
    setAuthed(false);
    localStorage.removeItem('ft.auth');
  };

  if (!authed) return <window.LoginPage onLogin={onLogin}/>;

  const PageEl = PAGES[page] || PAGES.overview;
  return (
    <div className="app">
      <window.Sidebar current={page} onNavigate={setPage} onSignOut={onSignOut} email={email}/>
      <main className="content">
        <div className="content-inner">
          <PageEl/>
        </div>
      </main>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
