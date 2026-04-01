import { motion } from "framer-motion";
import {
  FaBookOpen,
  FaBell,
  FaBuilding,
  FaChartLine,
  FaClipboardCheck,
  FaCreditCard,
  FaLayerGroup,
  FaUsers,
  FaUserGraduate,
  FaUserTie,
  FaWandMagicSparkles,
  FaFilePen,
} from "react-icons/fa6";
import { NavLink } from "react-router-dom";

const adminLinks = [
  { to: "/admin", label: "Overview", icon: FaChartLine },
  { to: "/institutes", label: "Institutes", icon: FaBuilding },
  { to: "/students", label: "Students", icon: FaUsers },
  { to: "/courses", label: "Courses", icon: FaBookOpen },
  { to: "/batches", label: "Batches", icon: FaLayerGroup },
  { to: "/fees", label: "Fees", icon: FaCreditCard },
  { to: "/attendance", label: "Attendance", icon: FaClipboardCheck },
  { to: "/tests", label: "Tests", icon: FaFilePen },
  { to: "/notifications", label: "Alerts", icon: FaBell },
];

const studentLinks = [{ to: "/user", label: "My Dashboard", icon: FaWandMagicSparkles }];
const staffLinks = [
  { to: "/user", label: "Dashboard", icon: FaWandMagicSparkles },
  { to: "/attendance", label: "Attendance", icon: FaClipboardCheck },
  { to: "/tests", label: "Tests", icon: FaFilePen },
  { to: "/notifications", label: "Alerts", icon: FaBell },
];

export default function Sidebar({ role = "admin" }) {
  const links = role === "admin" ? adminLinks : role === "staff" ? staffLinks : studentLinks;
  const roleLabel =
    role === "staff"
      ? "Staff Workspace"
      : role === "student"
        ? "Student Workspace"
        : "Admin Command";
  const RoleIcon =
    role === "staff" ? FaUserTie : role === "student" ? FaUserGraduate : FaChartLine;

  return (
    <motion.aside
      initial={{ x: -32, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`sidebar sidebar--${role}`}
    >
      <div>
        <div className="sidebar__brand">EduPulse AI</div>
        <p className="sidebar__copy">
          Multi-coaching control center with dashboards, alerts, tests, and fee intelligence.
        </p>
        <div className="sidebar__role-card">
          <RoleIcon />
          <div>
            <span>Experience</span>
            <strong>{roleLabel}</strong>
          </div>
        </div>
      </div>

      <nav className="sidebar__nav">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar__link${isActive ? " sidebar__link--active" : ""}`
            }
          >
            <Icon />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__footer">
        <span>AI readiness</span>
        <strong>
          {role === "admin"
            ? "Insights, alerts, and tracking live"
            : "Progress, alerts, and next actions live"}
        </strong>
      </div>
    </motion.aside>
  );
}
