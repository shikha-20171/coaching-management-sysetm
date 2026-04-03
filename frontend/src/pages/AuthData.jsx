import { useEffect, useState } from "react";
import API from "../services/api";

export default function AuthData() {
  const [users, setUsers] = useState([]);
  const [authEvents, setAuthEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const res = await API.get("/auth/demo-data");
        if (!active) return;
        setUsers(res.data.users || []);
        setAuthEvents(res.data.authEvents || []);
      } catch (err) {
        if (!active) return;
        setError(err.response?.data?.message || "Unable to load SQL auth data.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();
    const intervalId = setInterval(loadData, 3000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="auth-data-page">
      <div className="auth-data-shell">
        <div className="auth-data-hero">
          <div>
            <div className="auth-badge">SQL Auth Data</div>
            <h1 className="auth-data-title">Browser me direct dikh raha hai ki data SQL me save ho raha hai.</h1>
            <p className="auth-data-copy">
              Register ya login karte hi yahan latest `users` aur `auth_events` table ka data refresh ho jayega.
            </p>
          </div>
          <a className="ghost-button auth-data-link" href="/">
            Back to Login
          </a>
        </div>

        {loading ? <div className="auth-data-state">Loading SQL data...</div> : null}
        {error ? <div className="auth-data-state auth-data-state--error">{error}</div> : null}

        <section className="auth-data-panel">
          <div className="auth-data-panel__header">
            <h2>Users Table</h2>
            <span>Latest registered users</span>
          </div>

          {users.length ? (
            <div className="auth-data-tableWrap">
              <table className="auth-data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Password Hash</th>
                    <th>Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.name}</td>
                      <td>{user.email}</td>
                      <td className="auth-data-code">{user.password}</td>
                      <td>{user.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="auth-data-state">Abhi tak SQL me koi user save nahi hua.</div>
          )}
        </section>

        <section className="auth-data-panel">
          <div className="auth-data-panel__header">
            <h2>Auth Events Table</h2>
            <span>Register aur login history</span>
          </div>

          {authEvents.length ? (
            <div className="auth-data-tableWrap">
              <table className="auth-data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Event</th>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>IP</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {authEvents.map((event) => (
                    <tr key={event.id}>
                      <td>{event.id}</td>
                      <td>{event.event_type}</td>
                      <td>{event.user_id}</td>
                      <td>{event.user_name}</td>
                      <td>{event.email}</td>
                      <td>{event.role}</td>
                      <td>{event.ip_address || "-"}</td>
                      <td>{new Date(event.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="auth-data-state">Abhi tak login/register event SQL me save nahi hua.</div>
          )}
        </section>
      </div>
    </div>
  );
}
