import { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import PageShell from "../components/PageShell";
import { EmptyBlock, LoadingBlock } from "../components/StatusBlock";
import { useToast } from "../components/ToastProvider";
import { getStoredRole } from "../utils/session";

const initialForm = {
  student_id: "",
  date: "",
  status: "Present",
  subject: "",
};

export default function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const role = getStoredRole() || "staff";
  const { showToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    const [attendanceRes, studentsRes] = await Promise.all([API.get("/attendance"), API.get("/students")]);
    setAttendance(attendanceRes.data);
    setStudents(studentsRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredAttendance = useMemo(() => {
    if (statusFilter === "all") return attendance;
    return attendance.filter((item) => item.status === statusFilter);
  }, [attendance, statusFilter]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await API.post("/attendance", form);
    setForm(initialForm);
    showToast("Attendance recorded", "success");
    fetchData();
  };

  return (
    <PageShell
      role={role}
      title="Attendance Tracker"
      subtitle="Record daily attendance, filter status, and monitor class discipline across institutes."
    >
      <section className="dashboard-grid">
        <article className="panel-card">
          <div className="panel-card__header">
            <div>
              <h3>{role === "admin" ? "Record Attendance" : "Mark Attendance"}</h3>
              <p>Capture session attendance with subject-level detail.</p>
            </div>
          </div>
          <form className="form-grid" onSubmit={handleSubmit}>
            <select className="app-input" value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })}>
              <option value="">Select student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
            <input className="app-input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <select className="app-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
            </select>
            <input className="app-input" placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            <button className="primary-button" type="submit">
              Save attendance
            </button>
          </form>
        </article>

        <article className="panel-card">
          <div className="panel-card__header">
            <div>
              <h3>Recent Attendance</h3>
              <p>Latest recorded attendance entries with quick status filtering.</p>
            </div>
            <select className="app-input table-search" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="Present">Present</option>
              <option value="Absent">Absent</option>
              <option value="Late">Late</option>
            </select>
          </div>
          {loading ? <LoadingBlock label="Loading attendance..." /> : null}
          {!loading && !filteredAttendance.length ? (
            <EmptyBlock title="No attendance records" description="Start by saving attendance for a student." />
          ) : null}
          {!loading && filteredAttendance.length ? (
            <div className="stack-list">
              {filteredAttendance.map((item) => (
                <div key={item.id} className="list-row">
                  <div>
                    <strong>{item.student_name}</strong>
                    <span>
                      {item.subject} · {item.date}
                    </span>
                  </div>
                  <div className="pill pill--neutral">{item.status}</div>
                </div>
              ))}
            </div>
          ) : null}
        </article>
      </section>
    </PageShell>
  );
}
