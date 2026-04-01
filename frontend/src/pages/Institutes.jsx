import { useEffect, useState } from "react";
import API from "../services/api";
import PageShell from "../components/PageShell";

const initialForm = {
  name: "",
  city: "",
  manager: "",
  contact: "",
  status: "",
};

export default function Institutes() {
  const [institutes, setInstitutes] = useState([]);
  const [form, setForm] = useState(initialForm);

  const fetchInstitutes = async () => {
    const res = await API.get("/institutes");
    setInstitutes(res.data);
  };

  useEffect(() => {
    fetchInstitutes();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await API.post("/institutes", form);
    setForm(initialForm);
    fetchInstitutes();
  };

  return (
    <PageShell
      role="admin"
      title="Multi-Coaching Management"
      subtitle="Manage multiple coaching institutes on one platform with campus-level visibility."
    >
      <section className="dashboard-grid">
        <article className="panel-card">
          <div className="panel-card__header">
            <div>
              <h3>Add Institute</h3>
              <p>Create a new coaching branch with operational ownership.</p>
            </div>
          </div>
          <form className="form-grid" onSubmit={handleSubmit}>
            <input className="app-input" placeholder="Institute name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="app-input" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <input className="app-input" placeholder="Manager" value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })} />
            <input className="app-input" placeholder="Contact" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
            <input className="app-input" placeholder="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} />
            <button className="primary-button" type="submit">
              Save institute
            </button>
          </form>
        </article>

        <article className="panel-card">
          <div className="panel-card__header">
            <div>
              <h3>Campus Directory</h3>
              <p>Each branch with live student and batch footprint.</p>
            </div>
          </div>
          <div className="stack-list">
            {institutes.map((institute) => (
              <div key={institute.id} className="list-row">
                <div>
                  <strong>{institute.name}</strong>
                  <span>
                    {institute.city} · {institute.manager} · {institute.studentCount} students
                  </span>
                </div>
                <div className="pill pill--neutral">{institute.status}</div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </PageShell>
  );
}
