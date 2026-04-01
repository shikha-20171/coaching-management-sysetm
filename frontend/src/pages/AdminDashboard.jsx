import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import AskAiPanel from "../components/AskAiPanel";
import Card from "../components/Card";
import PageShell from "../components/PageShell";
import { EmptyBlock, LoadingBlock } from "../components/StatusBlock";
import { useToast } from "../components/ToastProvider";
import { downloadCsv } from "../utils/export";
import API from "../services/api";

const emptyState = {
  stats: {
    totalInstitutes: 0,
    totalStudents: 0,
    activeBatches: 0,
    totalCourses: 0,
    totalTests: 0,
    notificationsCount: 0,
    revenue: 0,
    pendingRevenue: 0,
    pendingFees: 0,
  },
  attentionStudents: [],
  topStudents: [],
  revenueSeries: [],
  attendanceOverview: [],
  operations: [],
  upcomingPayments: [],
  institutes: [],
};

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(emptyState);
  const [reports, setReports] = useState({ feeDefaulters: [], institutePerformance: [], auditLogs: [] });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    async function fetchAll() {
      setLoading(true);
      const [dashboardRes, reportsRes] = await Promise.all([
        API.get("/dashboard/admin"),
        API.get("/reports/admin"),
      ]);
      setDashboard(dashboardRes.data);
      setReports(reportsRes.data);
      setLoading(false);
    }

    fetchAll();
  }, []);

  const {
    stats,
    attentionStudents,
    topStudents,
    revenueSeries,
    attendanceOverview,
    operations,
    upcomingPayments,
    institutes,
  } = dashboard;

  const filteredInstitutes = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return institutes;
    return institutes.filter((institute) =>
      [institute.name, institute.city, institute.manager].join(" ").toLowerCase().includes(query)
    );
  }, [institutes, search]);

  return (
    <PageShell
      role="admin"
      title="Admin Command Center"
      subtitle="Multi-coaching operations, academic health, attendance, fees, AI intervention, and reporting from a single dashboard."
    >
      {loading ? <LoadingBlock label="Loading admin command center..." /> : null}

      {!loading ? (
        <>
          <motion.section initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="hero-panel">
            <div>
              <span className="hero-panel__badge">Advanced institute operations</span>
              <h2 className="hero-panel__title">Run every campus like a premium learning product.</h2>
              <p className="hero-panel__copy">
                Track campus growth, fee recovery, batch load, tests, reports, and attention queues without switching contexts.
              </p>
            </div>
            <div className="hero-panel__grid">
              <div>
                <strong>{stats.totalInstitutes}</strong>
                <span>Active institutes</span>
              </div>
              <div>
                <strong>Rs {stats.revenue.toLocaleString()}</strong>
                <span>Collected revenue</span>
              </div>
            </div>
          </motion.section>

          <section className="metrics-grid">
            <Card title="Students" value={stats.totalStudents} meta="Across all campuses" accent="Network scale" footer="Active academic base" />
            <Card title="Batches" value={stats.activeBatches} meta="Running learning groups" tone="blue" accent="Delivery grid" footer="Operations in motion" />
            <Card title="Tests Live" value={stats.totalTests} meta="Assessments and quizzes" tone="gold" accent="Exam pulse" footer="Assessment engine active" />
            <Card title="Alerts + Pending" value={`${stats.notificationsCount} / Rs ${stats.pendingRevenue.toLocaleString()}`} meta={`${stats.pendingFees} unpaid fee records`} tone="rose" accent="Attention zone" footer="Recovery needs monitoring" />
          </section>

          <section className="dashboard-grid dashboard-grid--charts">
            <article className="panel-card">
              <div className="panel-card__header">
                <div>
                  <h3>Revenue Momentum</h3>
                  <p>Monthly collection trend with admission movement.</p>
                </div>
              </div>
              <div className="chart-box">
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={revenueSeries}>
                    <defs>
                      <linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="5%" stopColor="#3dd9b3" stopOpacity={0.55} />
                        <stop offset="95%" stopColor="#3dd9b3" stopOpacity={0.03} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
                    <XAxis dataKey="month" stroke="#8ea9c7" />
                    <YAxis stroke="#8ea9c7" />
                    <Tooltip />
                    <Area type="monotone" dataKey="revenue" stroke="#3dd9b3" fill="url(#revenueFill)" strokeWidth={3} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="panel-card">
              <div className="panel-card__header">
                <div>
                  <h3>Attendance Snapshot</h3>
                  <p>Daily attendance health across current sessions.</p>
                </div>
              </div>
              <div className="chart-box">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={attendanceOverview} dataKey="value" nameKey="label" outerRadius={88} fill="#75a9ff" />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </article>
          </section>

          <section className="dashboard-grid dashboard-grid--charts">
            <article className="panel-card">
              <div className="panel-card__header">
                <div>
                  <h3>Top Performers</h3>
                  <p>Students leading current academic outcomes.</p>
                </div>
              </div>
              <div className="chart-box">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={topStudents}>
                    <CartesianGrid stroke="rgba(148, 163, 184, 0.15)" vertical={false} />
                    <XAxis dataKey="name" stroke="#8ea9c7" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#8ea9c7" />
                    <Tooltip />
                    <Bar dataKey="marks" fill="#75a9ff" radius={[12, 12, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            <article className="panel-card">
              <div className="panel-card__header">
                <div>
                  <h3>Campus Presence</h3>
                  <p>Search student and batch footprint per institute.</p>
                </div>
                <input className="app-input table-search" placeholder="Search institute, city, manager" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              {filteredInstitutes.length ? (
                <div className="stack-list">
                  {filteredInstitutes.map((institute) => (
                    <div key={institute.id} className="list-row">
                      <div>
                        <strong>{institute.name}</strong>
                        <span>
                          {institute.city} · {institute.manager}
                        </span>
                      </div>
                      <div className="pill pill--neutral">{institute.status}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyBlock title="No campuses found" description="Try a different search for campus presence." />
              )}
            </article>
          </section>

          <section className="dashboard-grid">
            <AskAiPanel
              role="admin"
              context={{
                stats,
                attentionStudents,
                upcomingPayments,
                feeDefaulters: reports.feeDefaulters,
                operations,
              }}
              title="Ask AI Ops Assistant"
              description="Ask what needs attention across institutes, revenue, risk, and follow-up queues."
            />

            <article className="panel-card">
              <div className="panel-card__header">
                <div>
                  <h3>AI Attention Queue</h3>
                  <p>Students requiring fast intervention based on risk signals.</p>
                </div>
              </div>
              <div className="stack-list">
                {attentionStudents.map((student) => (
                  <div key={student.id} className="list-row">
                    <div>
                      <strong>{student.name}</strong>
                      <span>
                        {student.course} · {student.institute} · {student.attendance}% attendance
                      </span>
                    </div>
                    <div className={`pill pill--${student.risk}`}>{student.risk} risk</div>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel-card">
              <div className="panel-card__header">
                <div>
                  <h3>Ops Checklist</h3>
                  <p>High-value admin actions to keep every campus running smoothly.</p>
                </div>
              </div>
              <div className="stack-list">
                {operations.map((item) => (
                  <div key={item.title} className="list-row list-row--compact">
                    <div>
                      <strong>{item.title}</strong>
                      <span>{item.note}</span>
                    </div>
                    <div className="pill pill--neutral">{item.value}</div>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="dashboard-grid">
            <article className="panel-card">
              <div className="panel-card__header">
                <div>
                  <h3>Fee Defaulters Report</h3>
                  <p>Export the highest pending fee list for follow-up campaigns.</p>
                </div>
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() => {
                    downloadCsv("fee-defaulters.csv", reports.feeDefaulters);
                    showToast("Fee defaulters report exported", "success");
                  }}
                >
                  Export CSV
                </button>
              </div>
              {reports.feeDefaulters.length ? (
                <div className="stack-list">
                  {reports.feeDefaulters.map((item) => (
                    <div key={item.id} className="list-row">
                      <div>
                        <strong>{item.name}</strong>
                        <span>{item.count} pending records</span>
                      </div>
                      <div className="pill pill--high">Rs {item.pendingAmount}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyBlock title="No fee defaulters" description="Pending fee recovery is fully clear right now." />
              )}
            </article>

            <article className="panel-card">
              <div className="panel-card__header">
                <div>
                  <h3>Audit Trail</h3>
                  <p>Latest admin-visible system actions across the platform.</p>
                </div>
                <button
                  className="ghost-button"
                  type="button"
                  onClick={() => {
                    downloadCsv("audit-log.csv", reports.auditLogs);
                    showToast("Audit log exported", "success");
                  }}
                >
                  Export CSV
                </button>
              </div>
              {reports.auditLogs.length ? (
                <div className="stack-list">
                  {reports.auditLogs.map((item) => (
                    <div key={item.id} className="list-row">
                      <div>
                        <strong>{item.actorName} · {item.action} {item.entity}</strong>
                        <span>{item.details}</span>
                      </div>
                      <div className="pill pill--neutral">{new Date(item.created_at).toLocaleDateString("en-IN")}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyBlock title="No audit events yet" description="System actions will appear here after operational changes." />
              )}
            </article>
          </section>

          <section className="panel-card">
            <div className="panel-card__header">
              <div>
                <h3>Upcoming Payments</h3>
                <p>Fee records requiring tracking or follow-up.</p>
              </div>
            </div>
            <div className="table-grid">
              {upcomingPayments.map((payment) => (
                <div key={payment.id} className="table-grid__row">
                  <span>{payment.studentName}</span>
                  <span>Rs {payment.amount.toLocaleString()}</span>
                  <span>{payment.dueDate}</span>
                  <span className={`pill pill--${payment.status === "paid" ? "low" : "medium"}`}>{payment.status}</span>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </PageShell>
  );
}
