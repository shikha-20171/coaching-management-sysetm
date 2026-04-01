import { useEffect, useState } from "react";
import PageShell from "../components/PageShell";
import API from "../services/api";

const initialForm = {
  name: "",
  course_id: "",
  institute_id: "",
  schedule: "",
  room: "",
  capacity: "",
  status: "",
};

export default function Batches() {
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [form, setForm] = useState(initialForm);

  const fetchData = async () => {
    const [batchesRes, coursesRes, institutesRes] = await Promise.all([
      API.get("/batches"),
      API.get("/courses"),
      API.get("/institutes"),
    ]);
    setBatches(batchesRes.data);
    setCourses(coursesRes.data);
    setInstitutes(institutesRes.data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (event) => {
    event.preventDefault();
    await API.post("/batches", form);
    setForm(initialForm);
    fetchData();
  };

  return (
    <PageShell
      role="admin"
      title="Batch Operations"
      subtitle="Structure schedules, rooms, seat capacity, and course mapping for every learning group."
    >
      <section className="dashboard-grid">
        <article className="panel-card">
          <div className="panel-card__header">
            <div>
              <h3>Create Batch</h3>
              <p>Build a properly scheduled batch with room and capacity planning.</p>
            </div>
          </div>
          <form className="form-grid" onSubmit={handleAdd}>
            <input className="app-input" placeholder="Batch name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <select className="app-input" value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })}>
              <option value="">Select course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
            <select className="app-input" value={form.institute_id} onChange={(e) => setForm({ ...form, institute_id: e.target.value })}>
              <option value="">Select institute</option>
              {institutes.map((institute) => (
                <option key={institute.id} value={institute.id}>
                  {institute.name}
                </option>
              ))}
            </select>
            <input className="app-input" placeholder="Schedule" value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} />
            <input className="app-input" placeholder="Room" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} />
            <input className="app-input" placeholder="Capacity" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} />
            <input className="app-input" placeholder="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} />
            <button className="primary-button" type="submit">
              Save batch
            </button>
          </form>
        </article>

        <article className="panel-card">
          <div className="panel-card__header">
            <div>
              <h3>Current Batches</h3>
              <p>Monitor active groups, timings, and seat planning status.</p>
            </div>
          </div>
          <div className="stack-list">
            {batches.map((batch) => (
              <div key={batch.id} className="list-row">
                <div>
                  <strong>{batch.name}</strong>
                  <span>
                    {batch.institute_name} · {batch.course_name} · {batch.schedule} · {batch.room}
                  </span>
                </div>
                <div className="pill pill--neutral">
                  {batch.status || "Active"} · {batch.capacity || 30} seats
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </PageShell>
  );
}
