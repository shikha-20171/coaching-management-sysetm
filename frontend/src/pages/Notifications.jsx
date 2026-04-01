import { useEffect, useState } from "react";
import API from "../services/api";
import PageShell from "../components/PageShell";
import { EmptyBlock, LoadingBlock } from "../components/StatusBlock";
import { useToast } from "../components/ToastProvider";
import { getStoredRole } from "../utils/session";

const initialForm = {
  title: "",
  message: "",
  audience: "all",
  priority: "medium",
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const role = getStoredRole() || "staff";
  const { showToast } = useToast();

  const fetchNotifications = async () => {
    setLoading(true);
    const endpoint = role === "admin" ? "/notifications" : `/notifications?role=${role}`;
    const res = await API.get(endpoint);
    setNotifications(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, [role]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await API.post("/notifications", form);
    setForm(initialForm);
    showToast("Notification sent", "success");
    fetchNotifications();
  };

  return (
    <PageShell
      role={role}
      title="Alerts & Notifications"
      subtitle="Broadcast reminders, academic alerts, and operational updates with a live role-aware feed."
    >
      <section className="dashboard-grid">
        <article className="panel-card">
          <div className="panel-card__header">
            <div>
              <h3>{role === "admin" ? "Send Notification" : "Send Staff Alert"}</h3>
              <p>Push high-priority alerts or routine announcements instantly.</p>
            </div>
          </div>
          <form className="form-grid" onSubmit={handleSubmit}>
            <input className="app-input" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <select className="app-input" value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })}>
              <option value="all">All</option>
              <option value="student">Students</option>
              <option value="staff">Staff</option>
            </select>
            <select className="app-input" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <input className="app-input" placeholder="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
            <button className="primary-button" type="submit">
              Send alert
            </button>
          </form>
        </article>

        <article className="panel-card">
          <div className="panel-card__header">
            <div>
              <h3>Live Alert Feed</h3>
              <p>Latest notifications currently visible in dashboards.</p>
            </div>
          </div>

          {loading ? <LoadingBlock label="Loading notifications..." /> : null}
          {!loading && !notifications.length ? (
            <EmptyBlock title="No notifications yet" description="Send the first alert to activate the feed." />
          ) : null}

          {!loading && notifications.length ? (
            <div className="stack-list">
              {notifications.map((notice) => (
                <div key={notice.id} className="list-row">
                  <div>
                    <strong>{notice.title}</strong>
                    <span>
                      {notice.message} · Audience: {notice.audience}
                    </span>
                  </div>
                  <div className={`pill pill--${notice.priority === "high" ? "high" : notice.priority === "medium" ? "medium" : "low"}`}>
                    {notice.priority}
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </article>
      </section>
    </PageShell>
  );
}
