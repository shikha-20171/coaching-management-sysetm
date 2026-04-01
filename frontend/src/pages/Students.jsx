import { useEffect, useMemo, useState } from "react";
import ConfirmDialog from "../components/ConfirmDialog";
import PageShell from "../components/PageShell";
import { EmptyBlock, LoadingBlock } from "../components/StatusBlock";
import { useToast } from "../components/ToastProvider";
import API from "../services/api";

const initialForm = {
  name: "",
  email: "",
  phone: "",
  guardian_name: "",
  city: "",
  institute_id: "",
  batch_id: "",
  course_id: "",
};

export default function Students() {
  const [students, setStudents] = useState([]);
  const [institutes, setInstitutes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const { showToast } = useToast();

  const fetchData = async () => {
    setLoading(true);
    const [studentsRes, institutesRes, coursesRes, batchesRes] = await Promise.all([
      API.get("/students"),
      API.get("/institutes"),
      API.get("/courses"),
      API.get("/batches"),
    ]);

    setStudents(studentsRes.data);
    setInstitutes(institutesRes.data);
    setCourses(coursesRes.data);
    setBatches(batchesRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return students;
    return students.filter((student) =>
      [student.name, student.email, student.course_name, student.batch_name]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [search, students]);

  const handleAdd = async (event) => {
    event.preventDefault();
    await API.post("/students", form);
    setForm(initialForm);
    showToast("Student added successfully", "success");
    fetchData();
  };

  const handleDelete = async () => {
    if (!studentToDelete) return;
    await API.delete(`/students/${studentToDelete.id}`);
    showToast("Student removed successfully", "success");
    setStudentToDelete(null);
    fetchData();
  };

  return (
    <PageShell
      role="admin"
      title="Student Management"
      subtitle="Admission-ready student records with batch, course, attendance, fee context, and search-ready administration."
    >
      <section className="dashboard-grid">
        <article className="panel-card">
          <div className="panel-card__header">
            <div>
              <h3>Add New Student</h3>
              <p>Create a proper student profile connected with course and batch.</p>
            </div>
          </div>
          <form className="form-grid" onSubmit={handleAdd}>
            <input className="app-input" placeholder="Student name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="app-input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input className="app-input" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input className="app-input" placeholder="Guardian name" value={form.guardian_name} onChange={(e) => setForm({ ...form, guardian_name: e.target.value })} />
            <input className="app-input" placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <select className="app-input" value={form.institute_id} onChange={(e) => setForm({ ...form, institute_id: e.target.value })}>
              <option value="">Select institute</option>
              {institutes.map((institute) => (
                <option key={institute.id} value={institute.id}>
                  {institute.name}
                </option>
              ))}
            </select>
            <select className="app-input" value={form.course_id} onChange={(e) => setForm({ ...form, course_id: e.target.value })}>
              <option value="">Select course</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
            <select className="app-input" value={form.batch_id} onChange={(e) => setForm({ ...form, batch_id: e.target.value })}>
              <option value="">Select batch</option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.name}
                </option>
              ))}
            </select>
            <button className="primary-button" type="submit">
              Add student
            </button>
          </form>
        </article>

        <article className="panel-card">
          <div className="panel-card__header">
            <div>
              <h3>Student Directory</h3>
              <p>Quick view of performance, course alignment, payment status, and search.</p>
            </div>
            <input
              className="app-input table-search"
              placeholder="Search by name, email, course, batch"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {loading ? <LoadingBlock label="Loading student directory..." /> : null}
          {!loading && !filteredStudents.length ? (
            <EmptyBlock
              title="No students found"
              description="Try a different search or create a new student profile."
            />
          ) : null}

          {!loading && filteredStudents.length ? (
            <div className="table-grid">
              {filteredStudents.map((student) => (
                <div key={student.id} className="table-grid__row table-grid__row--students">
                  <div>
                    <strong>{student.name}</strong>
                    <span>{student.email}</span>
                  </div>
                  <span>{student.institute_name}</span>
                  <span>{student.course_name}</span>
                  <span>{student.batch_name}</span>
                  <span>{student.attendance}%</span>
                  <span>Rs {student.total_pending}</span>
                  <button className="ghost-button" onClick={() => setStudentToDelete(student)} type="button">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </article>
      </section>

      <ConfirmDialog
        open={Boolean(studentToDelete)}
        title="Remove student"
        description={`This will remove ${studentToDelete?.name || "this student"} and linked fee/attendance data.`}
        confirmLabel="Remove"
        onCancel={() => setStudentToDelete(null)}
        onConfirm={handleDelete}
      />
    </PageShell>
  );
}
