import { getStoredRole, getStoredUser } from "../utils/session";

export default function Navbar({ title, subtitle }) {
  const user = getStoredUser();
  const role = getStoredRole();
  const today = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="topbar">
      <div>
        <p className="topbar__eyebrow">{today}</p>
        <h1 className="topbar__title">{title}</h1>
        {subtitle ? <p className="topbar__subtitle">{subtitle}</p> : null}
      </div>

      <div className="topbar__panel">
        <div>
          <span className="topbar__label">Signed in as</span>
          <strong className="topbar__user">{user?.name || "Team Member"}</strong>
        </div>
        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            localStorage.removeItem("user");
            window.location.href = role === "admin" ? "/admin" : "/";
          }}
          className="topbar__action"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
