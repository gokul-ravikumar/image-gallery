import { useState } from "react";
import { postJson } from "./api.js";

function Register({ onSwitchToLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    // Basic frontend validation (the backend validates again)
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      return setError("All fields are required");
    }
    if (!email.includes("@")) {
      return setError("Please enter a valid email");
    }
    if (password.length < 8) {
      return setError("Password must be at least 8 characters");
    }
    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    setLoading(true);
    try {
      // confirmPassword is NOT sent - it's only a frontend check
      await postJson("/auth/register", { name, email, password });
      onSwitchToLogin("Registration successful. Please log in.");
    } catch (err) {
      setError(err.message); // e.g. "Email already registered"
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

        <h1 className="auth-title">Create your account</h1>
        <p className="auth-subtitle">Sign up to start managing your images.</p>

        {error && (
          <p className="auth-alert auth-alert--error" role="alert">
            {error}
          </p>
        )}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="auth-field">
            <label className="auth-label" htmlFor="register-name">
              Full name
            </label>
            <input
              id="register-name"
              className="auth-input"
              type="text"
              placeholder="Jane Doe"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="register-email">
              Email address
            </label>
            <input
              id="register-email"
              className="auth-input"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="register-password">
              Password
            </label>
            <input
              id="register-password"
              className="auth-input"
              type="password"
              placeholder="At least 8 characters"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="register-confirm-password">
              Confirm password
            </label>
            <input
              id="register-confirm-password"
              className="auth-input"
              type="password"
              placeholder="Re-enter your password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <button type="button" className="auth-link" onClick={() => onSwitchToLogin("")}>
            Sign in
          </button>
        </p>
      </div>
    </main>
  );
}

export default Register;
