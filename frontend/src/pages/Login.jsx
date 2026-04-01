import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await API.post("/auth/login", { email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      if (res.data.user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/user");
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Login failed. Please make sure backend server is running."
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <section className="auth-brand">
          <div>
            <div className="auth-badge">Coaching Management Suite</div>
            <h1 className="auth-title">Run your institute with clarity.</h1>
            <p className="auth-subtitle">
              Student records, batches, fees, and daily operations in one
              polished workspace built for fast-moving coaching teams.
            </p>
          </div>

          <div className="auth-highlights">
            <div className="auth-highlight">
              <strong>Smarter dashboards</strong>
              <span>Track enrollments, fee status, and classes at a glance.</span>
            </div>
            <div className="auth-highlight">
              <strong>Better team flow</strong>
              <span>Admins, staff, and students all get focused experiences.</span>
            </div>
          </div>
        </section>

        <section className="auth-panel">
          <div className="auth-panel-header">
            <p className="auth-kicker">Welcome Back</p>
            <h2 className="auth-heading">Sign in to your workspace</h2>
            <p className="auth-description">
              Continue managing students, batches, and performance without
              jumping across tools.
            </p>
            <p className="auth-demo">
              Sign in with your registered email and password to access your dashboard.
            </p>
          </div>

          <div className="auth-form">
            <label className="auth-field">
              <span className="auth-label">Email Address</span>
              <input
                type="email"
                placeholder="Enter your email"
                className="auth-input"
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label className="auth-field">
              <span className="auth-label">Password</span>
              <input
                type="password"
                placeholder="Enter your password"
                className="auth-input"
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>

            <button onClick={handleLogin} className="auth-submit">
              Login
            </button>

            <p className="auth-footer">
              Don&apos;t have an account?{" "}
              <Link to="/register" className="auth-link">
                Register
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
