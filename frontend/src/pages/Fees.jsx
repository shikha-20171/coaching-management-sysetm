import { useEffect, useMemo, useState } from "react";
import PageShell from "../components/PageShell";
import { EmptyBlock, LoadingBlock } from "../components/StatusBlock";
import { useToast } from "../components/ToastProvider";
import API from "../services/api";

const initialForm = {
  student_id: "",
  amount: "",
  due_date: "",
  installment: "",
};

export default function Fees() {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    const [feesRes, studentsRes] = await Promise.all([API.get("/fees"), API.get("/students")]);
    setFees(feesRes.data);
    setStudents(studentsRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredFees = useMemo(() => {
    if (statusFilter === "all") return fees;
    return fees.filter((fee) => fee.status === statusFilter);
  }, [fees, statusFilter]);

  const handleAdd = async (event) => {
    event.preventDefault();
    await API.post("/fees", form);
    setForm(initialForm);
    showToast("Fee record added", "success");
    fetchData();
  };

  const markPaid = async (id) => {
    await API.patch(`/fees/${id}/pay`);
    showToast("Fee marked as paid", "success");
    fetchData();
  };

  return (
    <PageShell
      role="admin"
      title="Fee Intelligence"
      subtitle="Track installments, identify overdue collections, filter status, and close recovery loops fast."
    >
      <section className="dashboard-grid">
        <article className="panel-card">
          <div className="panel-card__header">
            <div>
              <h3>Add Fee Record</h3>
              <p>Create a due installment and keep recovery tracking visible.</p>
            </div>
          </div>
          <form className="form-grid" onSubmit={handleAdd}>
            <select className="app-input" value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })}>
              <option value="">Select student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name}
                </option>
              ))}
            </select>
            <input className="app-input" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            <input className="app-input" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
            <input className="app-input" placeholder="Installment name" value={form.installment} onChange={(e) => setForm({ ...form, installment: e.target.value })} />
            <button className="primary-button" type="submit">
              Add fee
            </button>
          </form>
        </article>

        <article className="panel-card">
          <div className="panel-card__header">
            <div>
              <h3>Collection Tracker</h3>
              <p>Mark paid records instantly and keep collection status current.</p>
            </div>
            <select className="app-input table-search" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          {loading ? <LoadingBlock label="Loading fee records..." /> : null}
          {!loading && !filteredFees.length ? (
            <EmptyBlock title="No fee records" description="Create a fee entry or change the status filter." />
          ) : null}

          {!loading && filteredFees.length ? (
            <div className="table-grid">
              {filteredFees.map((fee) => (
                <div key={fee.id} className="table-grid__row table-grid__row--fees">
                  <div>
                    <strong>{fee.student_name}</strong>
                    <span>{fee.installment || "Installment"}</span>
                  </div>
                  <span>Rs {fee.amount}</span>
                  <span>{fee.due_date}</span>
                  <span className={`pill pill--${fee.status === "paid" ? "low" : "high"}`}>{fee.status}</span>
                  {fee.status !== "paid" ? (
                    <button className="ghost-button" onClick={() => markPaid(fee.id)} type="button">
                      Mark paid
                    </button>
                  ) : (
                    <span className="paid-copy">Closed</span>
                  )}
                </div>
              ))}
            </div>
          ) : null}
        </article>
      </section>
    </PageShell>
  );
}
