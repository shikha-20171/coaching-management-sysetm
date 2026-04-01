import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaArrowTrendUp,
  FaBolt,
  FaCalendarCheck,
  FaClock,
  FaCompassDrafting,
  FaShieldHeart,
} from "react-icons/fa6";
import AskAiPanel from "../components/AskAiPanel";
import Card from "../components/Card";
import PageShell from "../components/PageShell";
import { EmptyBlock, LoadingBlock } from "../components/StatusBlock";
import { useToast } from "../components/ToastProvider";
import { downloadText } from "../utils/export";
import API from "../services/api";
import { getStoredRole, getStoredUser } from "../utils/session";

const fallback = {
  role: "student",
  student: null,
  profile: null,
  fees: [],
  insight: { risk: "low", summary: "", actions: [] },
  schedule: [],
  tasks: [],
  notifications: [],
  attendanceHistory: [],
  tests: [],
};

function priorityTone(priority) {
  return priority === "high" ? "high" : priority === "medium" ? "medium" : "low";
}

export default function UserDashboard() {
  const [data, setData] = useState(fallback);
  const [workspace, setWorkspace] = useState({ user: null, profile: null, materials: [], receipts: [], auditTrail: [] });
  const [profileForm, setProfileForm] = useState({ name: "", phone: "", guardian_name: "", city: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "" });
  const [loading, setLoading] = useState(true);
  const user = getStoredUser();
  const storedRole = getStoredRole();
  const { showToast } = useToast();

  const fetchDashboard = async () => {
    if (!user?.id) return;
    setLoading(true);
    const [dashboardRes, workspaceRes] = await Promise.all([
      API.get(`/dashboard/student/${user.id}`),
      API.get("/user/workspace"),
    ]);

    setData(dashboardRes.data);
    setWorkspace(workspaceRes.data);
    setProfileForm({
      name: workspaceRes.data.user?.name || user?.name || "",
      phone: workspaceRes.data.profile?.phone || "",
      guardian_name: workspaceRes.data.profile?.guardian_name || "",
      city: workspaceRes.data.profile?.city || "",
    });
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboard();
  }, [user?.id]);

  const role = data.role || storedRole || "student";
  const isStaff = role === "staff";
  const progressValue = isStaff
    ? Math.min(100, (data.profile?.assignedBatches || 0) * 18 + data.tests.length * 8)
    : data.student?.progress || 0;
  const attendanceValue = isStaff
    ? Math.min(100, 72 + (data.profile?.assignedCourses || 0) * 7)
    : data.student?.attendance || 0;
  const marksValue = isStaff ? Math.min(100, 55 + data.tests.length * 11) : data.student?.marks || 0;

  const spotlightItems = isStaff
    ? [
        { icon: FaCompassDrafting, label: "Courses in motion", value: `${data.profile?.assignedCourses || 0}`, tone: "blue" },
        { icon: FaCalendarCheck, label: "Batches aligned", value: `${data.profile?.assignedBatches || 0}`, tone: "teal" },
        { icon: FaClock, label: "Alerts to review", value: `${data.notifications.length}`, tone: "gold" },
      ]
    : [
        { icon: FaArrowTrendUp, label: "Progress level", value: `${progressValue}%`, tone: "blue" },
        { icon: FaShieldHeart, label: "Attendance health", value: `${attendanceValue}%`, tone: "teal" },
        { icon: FaBolt, label: "Academic momentum", value: `${marksValue}/100`, tone: "gold" },
      ];

  const handleProfileSave = async (event) => {
    event.preventDefault();
    const res = await API.patch("/user/profile", profileForm);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    showToast("Profile updated", "success");
    fetchDashboard();
  };

  const handlePasswordSave = async (event) => {
    event.preventDefault();
    await API.patch("/user/password", passwordForm);
    setPasswordForm({ currentPassword: "", newPassword: "" });
    showToast("Password changed successfully", "success");
  };

  const downloadReceipt = (receipt) => {
    downloadText(
      `receipt-${receipt.id}.txt`,
      `Receipt\nTitle: ${receipt.title}\nAmount: Rs ${receipt.amount}\nPaid on: ${receipt.paid_on}\nUser: ${workspace.user?.name || "Student"}`
    );
    showToast("Receipt downloaded", "success");
  };

  return (
    <PageShell
      role={role}
      title={isStaff ? "Staff Productivity Dashboard" : "Student Growth Dashboard"}
      subtitle={
        isStaff
          ? "Assigned batches, alerts, materials, and assessment readiness in one productive workspace."
          : "Your classes, tests, receipts, profile controls, materials, and AI study guidance in one focused workspace."
      }
    >
      {loading ? <LoadingBlock label="Loading your workspace..." /> : null}

      {!loading ? (
        <>
          <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="hero-panel hero-panel--student">
            <div>
              <span className="hero-panel__badge">{isStaff ? "Teaching + support cockpit" : "Personal learning cockpit"}</span>
              <h2 className="hero-panel__title">
                {isStaff ? "Stay ahead on delivery, mentoring, and alerts." : "Stay ahead with smart progress tracking."}
              </h2>
              <p className="hero-panel__copy">
                {isStaff
                  ? "Keep your courses, batches, materials, and reminders aligned without losing momentum."
                  : "See what matters this week, update your details, and download learning records from one place."}
              </p>
              <div className="hero-panel__spotlights">
                {spotlightItems.map(({ icon: Icon, label, value, tone }) => (
                  <div key={label} className={`spotlight-chip spotlight-chip--${tone}`}>
                    <Icon />
                    <div>
                      <strong>{value}</strong>
                      <span>{label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="hero-panel__grid">
              <div>
                <strong>{isStaff ? `${data.profile?.assignedCourses || 0} courses` : data.student?.course_name || "Program"}</strong>
                <span>{isStaff ? "Assigned load" : "Current course"}</span>
              </div>
              <div>
                <strong>{isStaff ? `${data.profile?.assignedBatches || 0} batches` : data.student?.mentor || "Mentor"}</strong>
                <span>{isStaff ? "Delivery pipeline" : "Faculty support"}</span>
              </div>
            </div>
          </motion.section>

          <section className="dashboard-grid">
            <article className="panel-card panel-card--accent panel-card--rich">
              <div className="panel-card__header">
                <div>
                  <h3>{isStaff ? "Delivery Readiness" : "Growth Snapshot"}</h3>
                  <p>{isStaff ? "A quick pulse on your weekly teaching bandwidth and execution health." : "A cleaner read of your academic health, consistency, and momentum."}</p>
                </div>
                <div className="pill pill--neutral">{isStaff ? "Weekly pulse" : "Live profile"}</div>
              </div>
              <div className="progress-stack">
                <div className="progress-metric">
                  <div className="progress-metric__meta">
                    <strong>{isStaff ? "Pipeline strength" : "Course completion"}</strong>
                    <span>{progressValue}%</span>
                  </div>
                  <div className="progress-bar"><span style={{ width: `${progressValue}%` }} /></div>
                </div>
                <div className="progress-metric">
                  <div className="progress-metric__meta">
                    <strong>{isStaff ? "Timetable confidence" : "Attendance rhythm"}</strong>
                    <span>{attendanceValue}%</span>
                  </div>
                  <div className="progress-bar progress-bar--teal"><span style={{ width: `${attendanceValue}%` }} /></div>
                </div>
                <div className="progress-metric">
                  <div className="progress-metric__meta">
                    <strong>{isStaff ? "Assessment coverage" : "Performance strength"}</strong>
                    <span>{marksValue}%</span>
                  </div>
                  <div className="progress-bar progress-bar--gold"><span style={{ width: `${marksValue}%` }} /></div>
                </div>
              </div>
            </article>

            <article className="panel-card">
              <div className="panel-card__header">
                <div>
                  <h3>{isStaff ? "Role Summary" : "Learner Summary"}</h3>
                  <p>{isStaff ? "The identity and capacity view for your current workload." : "The quick academic profile tied to your program and mentor."}</p>
                </div>
              </div>
              <div className="summary-grid">
                <div className="summary-tile"><span>Name</span><strong>{workspace.user?.name || user?.name || "Team Member"}</strong></div>
                <div className="summary-tile"><span>Email</span><strong>{workspace.user?.email || user?.email || "Not available"}</strong></div>
                <div className="summary-tile"><span>{isStaff ? "Focus area" : "Batch"}</span><strong>{isStaff ? "Teaching operations" : data.student?.batch_name || "Not assigned"}</strong></div>
                <div className="summary-tile"><span>{isStaff ? "Support mode" : "Mentor"}</span><strong>{isStaff ? "Mentoring + delivery" : data.student?.mentor || "Academic Team"}</strong></div>
              </div>
            </article>
          </section>

          <section className="metrics-grid">
            {isStaff ? (
              <>
                <Card title="Assigned Courses" value={data.profile?.assignedCourses || 0} meta="Teaching responsibility" accent="Live load" footer="Balanced course ownership" />
                <Card title="Assigned Batches" value={data.profile?.assignedBatches || 0} meta="Active class groups" tone="blue" accent="Batch sync" footer="Delivery windows mapped" />
                <Card title="Alerts" value={data.notifications.length} meta="Notifications requiring review" tone="gold" accent="Priority feed" footer="Needs quick follow-up" />
                <Card title="Tests in Pipeline" value={data.tests.length} meta="Upcoming assessments" tone="rose" accent="Exam cycle" footer="Track readiness early" />
              </>
            ) : (
              <>
                <Card title="Attendance" value={`${data.student?.attendance || 0}%`} meta="Learning consistency" accent="Attendance health" footer="Consistency drives compounding progress" />
                <Card title="Marks" value={data.student?.marks || 0} meta="Latest evaluation" tone="blue" accent="Performance pulse" footer="Latest assessment snapshot" />
                <Card title="Progress" value={`${data.student?.progress || 0}%`} meta="Overall completion" tone="gold" accent="Course runway" footer="Forward momentum is building" />
                <Card title="Pending Fees" value={`Rs ${(data.student?.pendingAmount || 0).toLocaleString()}`} meta="Financial health" tone="rose" accent="Fee status" footer={data.student?.pendingAmount ? "Action recommended" : "No immediate dues"} />
              </>
            )}
          </section>

          <section className="dashboard-grid">
            <article className="panel-card">
              <div className="panel-card__header">
                <div>
                  <h3>Materials Library</h3>
                  <p>Quick-access notes, guides, and role-relevant resources.</p>
                </div>
              </div>
              {workspace.materials.length ? (
                <div className="stack-list">
                  {workspace.materials.map((item) => (
                    <div key={item.id} className="list-row">
                      <div>
                        <strong>{item.title}</strong>
                        <span>{item.description}</span>
                      </div>
                      <div className="pill pill--neutral">{item.type}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyBlock title="No materials yet" description="Materials will appear here based on your role and course." />
              )}
            </article>

            <article className="panel-card">
              <div className="panel-card__header">
                <div>
                  <h3>{isStaff ? "Action Board" : "Fee Receipts"}</h3>
                  <p>{isStaff ? "Current delivery actions and assessment focus areas." : "Download paid receipt records instantly."}</p>
                </div>
              </div>
              {isStaff ? (
                <div className="stack-list">
                  {data.tasks.map((task) => (
                    <div key={task.id} className="list-row">
                      <div>
                        <strong>{task.title}</strong>
                        <span>Aligned to your course delivery operations.</span>
                      </div>
                      <div className="pill pill--medium">{task.status}</div>
                    </div>
                  ))}
                </div>
              ) : workspace.receipts.length ? (
                <div className="stack-list">
                  {workspace.receipts.map((receipt) => (
                    <div key={receipt.id} className="list-row">
                      <div>
                        <strong>{receipt.title}</strong>
                        <span>Paid on {receipt.paid_on}</span>
                      </div>
                      <button className="ghost-button" onClick={() => downloadReceipt(receipt)} type="button">
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyBlock title="No receipts yet" description="Paid installments will appear here as downloadable receipts." />
              )}
            </article>
          </section>

          <section className="dashboard-grid">
            <AskAiPanel
              role={role}
              context={{
                student: data.student,
                insight: data.insight,
                notifications: data.notifications,
                tasks: data.tasks,
                tests: data.tests,
                schedule: data.schedule,
              }}
              title={isStaff ? "Ask AI Work Assistant" : "Ask AI Study Assistant"}
              description={
                isStaff
                  ? "Ask what to prioritize in delivery, mentoring, tests, and alerts."
                  : "Ask how to improve attendance, marks, fees, and weekly study focus."
              }
            />

            <article className="panel-card">
              <div className="panel-card__header">
                <div>
                  <h3>Profile Settings</h3>
                  <p>Update your visible profile details without leaving the dashboard.</p>
                </div>
              </div>
              <form className="form-grid" onSubmit={handleProfileSave}>
                <input className="app-input" placeholder="Name" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
                <input className="app-input" placeholder="Phone" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} />
                <input className="app-input" placeholder="Guardian name" value={profileForm.guardian_name} onChange={(e) => setProfileForm({ ...profileForm, guardian_name: e.target.value })} />
                <input className="app-input" placeholder="City" value={profileForm.city} onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })} />
                <button className="primary-button" type="submit">Save profile</button>
              </form>
            </article>

            <article className="panel-card">
              <div className="panel-card__header">
                <div>
                  <h3>Password Security</h3>
                  <p>Change your password with a simple in-dashboard security flow.</p>
                </div>
              </div>
              <form className="form-grid" onSubmit={handlePasswordSave}>
                <input className="app-input" type="password" placeholder="Current password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
                <input className="app-input" type="password" placeholder="New password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
                <button className="primary-button" type="submit">Change password</button>
              </form>
            </article>
          </section>

          <section className="dashboard-grid">
            <article className="panel-card">
              <div className="panel-card__header">
                <div>
                  <h3>{isStaff ? "Assessment Pipeline" : "This Week's Focus"}</h3>
                  <p>{isStaff ? "Tests and assignments connected to your courses." : "Simple, high-impact actions based on your current profile."}</p>
                </div>
              </div>
              <div className="stack-list">
                {(isStaff ? data.tests : data.tasks).map((item) => (
                  <div key={item.id} className="list-row">
                    <div>
                      <strong>{item.title}</strong>
                      <span>{isStaff ? item.date : "Aligned to your current academic momentum."}</span>
                    </div>
                    <div className="pill pill--medium">{item.status}</div>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel-card">
              <div className="panel-card__header">
                <div>
                  <h3>Notifications</h3>
                  <p>Latest announcements, reminders, and important system alerts.</p>
                </div>
              </div>
              <div className="stack-list">
                {data.notifications.map((notice) => (
                  <div key={notice.id} className="list-row">
                    <div>
                      <strong>{notice.title}</strong>
                      <span>{notice.message}</span>
                    </div>
                    <div className={`pill pill--${priorityTone(notice.priority)}`}>{notice.priority}</div>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="dashboard-grid">
            <article className="panel-card">
              <div className="panel-card__header">
                <div>
                  <h3>{isStaff ? "Assigned Schedule" : "Attendance History"}</h3>
                  <p>{isStaff ? "Current batches and their delivery windows." : "Your most recent attendance records."}</p>
                </div>
              </div>
              <div className="stack-list">
                {(isStaff ? data.schedule : data.attendanceHistory).map((item) => (
                  <div key={item.id} className="list-row">
                    <div>
                      <strong>{isStaff ? item.title : item.subject}</strong>
                      <span>{isStaff ? item.time : item.date}</span>
                    </div>
                    <div className="pill pill--neutral">{isStaff ? item.type : item.status}</div>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel-card">
              <div className="panel-card__header">
                <div>
                  <h3>{isStaff ? "Recent Activity Log" : "Upcoming Tests"}</h3>
                  <p>{isStaff ? "Recent security and work actions linked to your account." : "Plan your revision around live and scheduled assessments."}</p>
                </div>
              </div>
              {isStaff ? (
                workspace.auditTrail.length ? (
                  <div className="stack-list">
                    {workspace.auditTrail.map((item) => (
                      <div key={item.id} className="list-row">
                        <div>
                          <strong>{item.action} {item.entity}</strong>
                          <span>{item.details}</span>
                        </div>
                        <div className="pill pill--neutral">{new Date(item.created_at).toLocaleDateString("en-IN")}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyBlock title="No recent activity" description="Your latest role activity will appear here." />
                )
              ) : (
                <div className="stack-list">
                  {data.tests.map((test) => (
                    <div key={test.id} className="list-row">
                      <div>
                        <strong>{test.title}</strong>
                        <span>{test.date}</span>
                      </div>
                      <div className="pill pill--medium">{test.status}</div>
                    </div>
                  ))}
                </div>
              )}
            </article>
          </section>
        </>
      ) : null}
    </PageShell>
  );
}
