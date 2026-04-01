import { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      await API.post("/auth/register", form);
      alert("Registered successfully");
      navigate("/");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Registration failed. Please make sure backend server is running."
      );
    }
  };

  return (
    <div className="auth-page auth-page--register">
      <div className="auth-shell">
        <section className="auth-brand">
          <div>
            <div className="auth-badge">Create Your Workspace</div>
            <h1 className="auth-title">Build a premium student experience.</h1>
            <p className="auth-subtitle">
              Launch a modern coaching workflow with secure access for admins,
              staff, and students from the very first login.
            </p>
          </div>

          <div className="auth-highlights">
            <div className="auth-highlight">
              <strong>Role-based access</strong>
              <span>Set up the right view for each person in a few seconds.</span>
            </div>
            <div className="auth-highlight">
              <strong>Future-ready design</strong>
              <span>Clean visuals that already feel like a real product.</span>
            </div>
          </div>
        </section>

        <section className="auth-panel">
          <div className="auth-panel-header">
            <p className="auth-kicker">New Account</p>
            <h2 className="auth-heading">Create your profile</h2>
            <p className="auth-description">
              Start with your basic details and choose the role you want inside
              the platform.
            </p>
          </div>

          <div className="auth-form">
            <label className="auth-field">
              <span className="auth-label">Full Name</span>
              <input
                placeholder="Enter your full name"
                className="auth-input"
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>

            <label className="auth-field">
              <span className="auth-label">Email Address</span>
              <input
                placeholder="Enter your email"
                className="auth-input"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>

            <label className="auth-field">
              <span className="auth-label">Password</span>
              <input
                type="password"
                placeholder="Create a secure password"
                className="auth-input"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </label>

            <label className="auth-field">
              <span className="auth-label">Select Role</span>
              <select
                className="auth-select"
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="student">Student</option>
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            <button onClick={handleSubmit} className="auth-submit">
              Register
            </button>

            <p className="auth-footer">
              Already have an account?{" "}
              <Link to="/" className="auth-link">
                Login
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
