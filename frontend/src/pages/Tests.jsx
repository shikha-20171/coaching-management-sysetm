import { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import PageShell from "../components/PageShell";
import { EmptyBlock, LoadingBlock } from "../components/StatusBlock";
import { useToast } from "../components/ToastProvider";
import { getStoredRole } from "../utils/session";

const initialForm = {
  title: "",
  course_id: "",
  date: "",
  max_marks: "",
  average_score: "",
  status: "",
};

export default function Tests() {
  const [tests, setTests] = useState([]);
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const role = getStoredRole() || "staff";
  const { showToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    const [testsRes, coursesRes] = await Promise.all([API.get("/tests"), API.get("/courses")]);
    setTests(testsRes.data);
    setCourses(coursesRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTests = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return tests;
    return tests.filter((test) =>
      [test.title, test.course_name, test.status].join(" ").toLowerCase().includes(query)
    );
  }, [search, tests]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await API.post("/tests", form);
    setForm(initialForm);
    showToast("Test saved successfully", "success");
    fetchData();
  };

  return (
    <PageShell
      role={role}
      title="Tests & Assignments"
      subtitle="Plan assessments, search the pipeline, and keep students exam-ready."
    >
      <section className="dashboard-grid">
        <article className="panel-card">
          <div className="panel-card__header">
            <div>
              <h3>{role === "admin" ? "Create Test" : "Publish Assessment"}</h3>
              <p>Add a scheduled or live assessment for any course.</p>
            </div>
          </div>
          <form className="form-grid" onSubmit={handleSubmit}>
            <input className="app-input" placeholder="Test title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <select className="app-input" value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })}>
              <option value="">Select course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
            <input className="app-input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            <input className="app-input" placeholder="Max marks" value={form.max_marks} onChange={(e) => setForm({ ...form, max_marks: e.target.value })} />
            <input className="app-input" placeholder="Average score" value={form.average_score} onChange={(e) => setForm({ ...form, average_score: e.target.value })} />
            <input className="app-input" placeholder="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} />
            <button className="primary-button" type="submit">
              Save test
            </button>
          </form>
        </article>

        <article className="panel-card">
          <div className="panel-card__header">
            <div>
              <h3>Assessment Pipeline</h3>
              <p>Live view of quizzes, mocks, and assignment checkpoints.</p>
            </div>
            <input className="app-input table-search" placeholder="Search by test, course, status" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {loading ? <LoadingBlock label="Loading assessments..." /> : null}
          {!loading && !filteredTests.length ? (
            <EmptyBlock title="No assessments found" description="Create a test or change the search." />
          ) : null}
          {!loading && filteredTests.length ? (
            <div className="stack-list">
              {filteredTests.map((test) => (
                <div key={test.id} className="list-row">
                  <div>
                    <strong>{test.title}</strong>
                    <span>
                      {test.course_name} · {test.date} · Avg {test.average_score}/{test.max_marks}
                    </span>
                  </div>
                  <div className="pill pill--medium">{test.status}</div>
                </div>
              ))}
            </div>
          ) : null}
        </article>
      </section>
    </PageShell>
  );
}
