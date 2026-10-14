import  {useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from "react-router-dom";
import logo from "../assets/lendsqr-logo.svg";
import illustration from "../assets/login-illustration.svg";
import "../styles/login.scss";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!password.trim()) {
      setError("Enter your password.");
      return;
    }
    setError("");
    navigate("/dashboard");
  }

  return (
    <main className="login-page">
      <section className="login-hero">
        <a className="login-logo" href="/login" aria-label="Lendsqr home">
          <img src={logo} alt="lendsqr" />
        </a>
        <img
          className="login-illustration"
          src={illustration}
          alt="Person walking through a colorful doorway"
        />
      </section>

      <section className="login-panel">
        <div className="login-form-wrap">
          <h1>Welcome!</h1>
          <p className="login-subtitle">Enter details to login.</p>
          <form onSubmit={handleSubmit} noValidate>
            <label className="sr-only" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={Boolean(
                error && (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
              )}
            />
            <div className="password-field">
              <label className="sr-only" htmlFor="password">Password</label>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
            </div>
            {error && (
              <p className="form-error" role="alert">{error}</p>
            )}
            <button
              className="forgot-password"
              type="button"
              onClick={() => setError("Password recovery is not connected in this demo.")}
            >
              FORGOT PASSWORD?
            </button>
            <button className="login-submit" type="submit">LOG IN</button>
          </form>
        </div>
      </section>
    </main>
  );
}
