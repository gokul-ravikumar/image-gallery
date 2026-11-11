import { useState } from "react";
import { postJson } from "./api.js";

function Login({ onLogin, onSwitchToRegister, notice }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      return setError("Email and password are required");
    }

    setLoading(true);
    try {
      // The backend verifies the password, creates the JWT and stores it
      // in an HttpOnly cookie. We only need the user object from the response.
      const data = await postJson("/auth/login", { email, password });
      onLogin(data.user);
    } catch (err) {
      setError(err.message); // e.g. "Invalid email or password"
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth">
      <div className="auth-card">
        <p className="auth-brand">
          <span className="auth-brand-mark" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.5-3.5L7 22" />
            </svg>
          </span>
          Image Gallery
        </p>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to access your image gallery.</p>

        {notice && (
          <p className="auth-alert auth-alert--success" role="status">
            {notice}
          </p>
        )}

        {error && (
          <p className="auth-alert auth-alert--error" role="alert">
            {error}
          </p>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label" htmlFor="login-email">
              Email address
            </label>
            <input
              id="login-email"
              className="auth-input"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="login-password">
              Password
            </label>
            <input
              id="login-password"
              className="auth-input"
              type="password"
              placeholder="Enter your password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="auth-footer">
          Don&apos;t have an account?{" "}
          <button type="button" className="auth-link" onClick={onSwitchToRegister}>
            Create an account
          </button>
        </p>
      </div>
    </main>
  );
}

export default Login;
