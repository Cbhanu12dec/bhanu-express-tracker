import { useAuth } from "./hooks/useAuth";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";

export default function App() {
  const { user, checking, error, login, logout } = useAuth();

  if (checking) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center text-white/40 text-sm"
        style={{ background: "#08070c" }}>
        Checking session&hellip;
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={login} error={error} />;
  }

  return <Dashboard uid={user.uid} onLogout={logout} />;
}
