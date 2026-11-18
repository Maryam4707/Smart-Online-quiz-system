import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";
import "./AuthPage.css";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMPTY = { name: "", email: "", password: "", confirm: "", role: "student" };

const FIREBASE_ERRORS = {
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/user-not-found": "No account found with this email.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/email-already-in-use": "An account with this email already exists. Try logging in.",
  "auth/weak-password": "Password is too weak. Use at least 8 characters.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/too-many-requests": "Too many attempts. Wait a few minutes and try again.",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
};

function validate(mode, v) {
  const e = {};
  if (mode === "signup" && v.name.trim().length < 2) e.name = "Enter your full name.";
  if (!v.email.trim()) e.email = "Email is required.";
  else if (!EMAIL_RE.test(v.email.trim())) e.email = "Enter a valid email address.";
  if (mode !== "reset") {
    if (!v.password) e.password = "Password is required.";
    else if (mode === "signup") {
      if (v.password.length < 8) e.password = "Use at least 8 characters.";
      else if (!/[A-Za-z]/.test(v.password) || !/\d/.test(v.password))
        e.password = "Include at least one letter and one number.";
    }
  }
  if (mode === "signup") {
    if (!v.confirm) e.confirm = "Confirm your password.";
    else if (v.confirm !== v.password) e.confirm = "Passwords do not match.";
  }
  return e;
}

function EyeIcon({ off }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
      {off && <path d="M3 3l18 18" />}
    </svg>
  );
}

function Field({ id, label, type = "text", value, onChange, error, autoComplete, toggle }) {
  const [show, setShow] = useState(false);
  const isPw = type === "password";
  return (
    <div className={`field ${error ? "has-error" : ""}`}>
      <label htmlFor={id}>{label}</label>
      <div className="input-wrap">
        <input
          id={id}
          type={isPw && show ? "text" : type}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : undefined}
        />
        {isPw && (
          <button type="button" className="eye" onClick={() => setShow((s) => !s)} aria-label={show ? "Hide password" : "Show password"}>
            <EyeIcon off={show} />
          </button>
        )}
      </div>
      {error && <p className="field-error" id={`${id}-err`}>{error}</p>}
    </div>
  );
}

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // login | signup | reset
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  const switchMode = (next) => {
    setMode(next);
    setErrors({});
    setFormError("");
    setSuccess("");
    setValues((v) => ({ ...EMPTY, email: v.email }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSuccess("");
    const found = validate(mode, values);
    setErrors(found);
    if (Object.keys(found).length) return;

    setLoading(true);
    const email = values.email.trim();
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, values.password);
      } else if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, email, values.password);
        await updateProfile(cred.user, { displayName: values.name.trim() });
        await setDoc(doc(db, "users", cred.user.uid), {
          name: values.name.trim(),
          email,
          role: values.role,
          createdAt: serverTimestamp(),
        });
      } else {
        await sendPasswordResetEmail(auth, email);
        setSuccess("Reset link sent. Check your inbox (and spam folder).");
      }
    } catch (err) {
      setFormError(FIREBASE_ERRORS[err.code] || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copy = {
    login: { title: "Welcome back", sub: "Log in to take or manage your quizzes.", cta: "Log in" },
    signup: { title: "Create your account", sub: "Join to start taking and creating quizzes.", cta: "Create account" },
    reset: { title: "Reset password", sub: "Enter your email and we will send you a reset link.", cta: "Send reset link" },
  }[mode];

  return (
    <main className="auth">
      <aside className="auth-brand">
        <div className="logo">
          <span className="logo-mark">Q</span>
          <span>QuizDesk</span>
        </div>
        <div className="brand-card" aria-hidden="true">
          <p className="bc-meta">Question 4 of 10</p>
          <p className="bc-q">Which data structure uses LIFO order?</p>
          <ul>
            <li>Queue</li>
            <li className="picked">Stack</li>
            <li>Linked list</li>
            <li>Binary tree</li>
          </ul>
        </div>
        <p className="brand-line">Create, schedule and grade quizzes in one place.</p>
      </aside>

      <section className="auth-panel">
        <div className="auth-box">
          {mode !== "reset" && (
            <div className="tabs" role="tablist" aria-label="Authentication mode">
              <button role="tab" aria-selected={mode === "login"} className={mode === "login" ? "active" : ""} onClick={() => switchMode("login")} type="button">Log in</button>
              <button role="tab" aria-selected={mode === "signup"} className={mode === "signup" ? "active" : ""} onClick={() => switchMode("signup")} type="button">Sign up</button>
            </div>
          )}

          <h1>{copy.title}</h1>
          <p className="sub">{copy.sub}</p>

          <form onSubmit={handleSubmit} noValidate>
            {formError && <div className="alert alert-error" role="alert">{formError}</div>}
            {success && <div className="alert alert-ok" role="status">{success}</div>}

            {mode === "signup" && (
              <Field id="name" label="Full name" value={values.name} onChange={set("name")} error={errors.name} autoComplete="name" />
            )}
            <Field id="email" label="Email" type="email" value={values.email} onChange={set("email")} error={errors.email} autoComplete="email" />
            {mode !== "reset" && (
              <Field id="password" label="Password" type="password" value={values.password} onChange={set("password")} error={errors.password} autoComplete={mode === "login" ? "current-password" : "new-password"} />
            )}
            {mode === "signup" && (
              <Field id="confirm" label="Confirm password" type="password" value={values.confirm} onChange={set("confirm")} error={errors.confirm} autoComplete="new-password" />
            )}

            {mode === "signup" && (
              <fieldset className="roles">
                <legend>I am a</legend>
                {["student", "teacher"].map((r) => (
                  <button key={r} type="button" aria-pressed={values.role === r} className={values.role === r ? "on" : ""} onClick={() => setValues((v) => ({ ...v, role: r }))}>
                    {r === "student" ? "Student" : "Teacher"}
                  </button>
                ))}
              </fieldset>
            )}

            {mode === "login" && (
              <button type="button" className="link forgot" onClick={() => switchMode("reset")}>Forgot password?</button>
            )}

            <button className="btn" type="submit" disabled={loading}>
              {loading ? <span className="spinner" aria-label="Loading" /> : copy.cta}
            </button>
          </form>

          <p className="switch">
            {mode === "login" && <>New here? <button type="button" className="link" onClick={() => switchMode("signup")}>Create an account</button></>}
            {mode === "signup" && <>Already registered? <button type="button" className="link" onClick={() => switchMode("login")}>Log in</button></>}
            {mode === "reset" && <button type="button" className="link" onClick={() => switchMode("login")}>Back to log in</button>}
          </p>
        </div>
      </section>
    </main>
  );
}
