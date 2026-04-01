import { useEffect, useState } from "react";
import PageShell from "../components/PageShell";
import API from "../services/api";

const initialForm = {
  title: "",
  fees: "",
  institute_id: "",
  category: "",
  duration: "",
  mentor: "",
  mode: "",
};

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [form, setForm] = useState(initialForm);

  const fetchCourses = async () => {
    const [coursesRes, institutesRes] = await Promise.all([
      API.get("/courses"),
      API.get("/institutes"),
    ]);
    setCourses(coursesRes.data);
    setInstitutes(institutesRes.data);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleAdd = async (event) => {
    event.preventDefault();
    await API.post("/courses", form);
    setForm(initialForm);
    fetchCourses();
  };

  return (
    <PageShell
      role="admin"
      title="Course Portfolio"
      subtitle="Design high-value programs with clear pricing, mentor ownership, and delivery mode."
    >
      <section className="dashboard-grid">
        <article className="panel-card">
          <div className="panel-card__header">
            <div>
              <h3>Create Course</h3>
              <p>Add a premium coaching offering with pricing and delivery details.</p>
            </div>
          </div>
          <form className="form-grid" onSubmit={handleAdd}>
            <input className="app-input" placeholder="Course title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <input className="app-input" placeholder="Fees" value={form.fees} onChange={(e) => setForm({ ...form, fees: e.target.value })} />
            <select className="app-input" value={form.institute_id} onChange={(e) => setForm({ ...form, institute_id: e.target.value })}>
              <option value="">Select institute</option>
              {institutes.map((institute) => (
                <option key={institute.id} value={institute.id}>
                  {institute.name}
                </option>
              ))}
            </select>
            <input className="app-input" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
            <input className="app-input" placeholder="Duration" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
            <input className="app-input" placeholder="Mentor" value={form.mentor} onChange={(e) => setForm({ ...form, mentor: e.target.value })} />
            <input className="app-input" placeholder="Mode" value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })} />
            <button className="primary-button" type="submit">
              Save course
            </button>
          </form>
        </article>

        <article className="panel-card">
          <div className="panel-card__header">
            <div>
              <h3>Live Course Catalog</h3>
              <p>Each program is ready for admissions, mentoring, and batch mapping.</p>
            </div>
          </div>
          <div className="stack-list">
            {courses.map((course) => (
              <div key={course.id} className="list-row">
                <div>
                  <strong>{course.title}</strong>
                  <span>
                    {course.institute_name} · {course.category} · {course.duration} · {course.mode}
                  </span>
                </div>
                <div className="pill pill--neutral">Rs {course.fees}</div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </PageShell>
  );
}
