import { useCallback, useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "./firebase";
import { api } from "./api";
import Quizzes from "./Quizzes";
import QuizEditor from "./QuizEditor";
import TakeQuiz from "./TakeQuiz";
import Results, { ResultsTable } from "./Results";
import "./Dashboard.css";

const P = {
  home: "M3 10l9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  plus: "M12 5v14M5 12h14",
  chart: "M18 20V10M12 20V4M6 20v-6",
  out: "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9",
};
const Icon = ({ n }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={P[n]} /></svg>
);

const avg = (rows) => (rows.length ? Math.round(rows.reduce((n, r) => n + r.percent, 0) / rows.length) : null);

export default function Dashboard({ user, profile }) {
  const isTeacher = profile.role === "teacher";
  const name = profile.name || user.displayName || user.email;
  const [view, setView] = useState({ name: "home" });
  const [quizzes, setQuizzes] = useState(null);
  const [results, setResults] = useState(null);
  const go = (n, extra = {}) => { setView({ name: n, ...extra }); window.scrollTo(0, 0); };

  const [loadErr, setLoadErr] = useState("");
  const reload = useCallback(async () => {
    try {
      const [q, r] = await Promise.all([api("/quizzes"), api("/results")]);
      setQuizzes(q); setResults(r); setLoadErr("");
    } catch (e) {
      setLoadErr(e.message); setQuizzes((p) => p ?? []); setResults((p) => p ?? []);
    }
  }, []);
  useEffect(() => { reload(); }, [reload]);

  const nav = isTeacher
    ? [["home", "Overview", "home"], ["quizzes", "My quizzes", "list"], ["create", "Create quiz", "plus"], ["results", "Submissions", "chart"]]
    : [["home", "Overview", "home"], ["quizzes", "Quizzes", "list"], ["results", "My results", "chart"]];

  const ready = quizzes && results;
  let content = <p className="muted">Loading…</p>;
  if (ready) {
    if (view.name === "home") content = <Overview {...{ isTeacher, name, quizzes, results, go }} />;
    else if (view.name === "quizzes") content = <Quizzes {...{ isTeacher, quizzes, results, go, reload }} />;
    else if (view.name === "create") content = <QuizEditor {...{ user, profile, go, reload }} />;
    else if (view.name === "edit") content = <QuizEditor {...{ user, profile, go, reload }} quiz={view.quiz} />;
    else if (view.name === "take") content = <TakeQuiz {...{ user, profile, go, reload }} quiz={view.quiz} />;
    else if (view.name === "results") content = <Results {...{ isTeacher, results }} />;
  }
  const active = view.name === "edit" ? "quizzes" : view.name === "take" ? "quizzes" : view.name;

  return (
    <div className="shell">
      <aside className="side">
        <div className="logo brandside"><span className="logo-mark">Q</span><span>QuizDesk</span></div>
        <nav className="nav" aria-label="Main">
          {nav.map(([key, label, icon]) => (
            <button key={key} className={active === key ? "on" : ""} onClick={() => go(key)} aria-current={active === key ? "page" : undefined}>
              <Icon n={icon} /><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="side-foot">
          <div className="me"><strong>{name}</strong><span className="badge">{isTeacher ? "Teacher" : "Student"}</span></div>
          <button className="out" onClick={() => signOut(auth)}><Icon n="out" /><span>Sign out</span></button>
        </div>
      </aside>

      <div className="area">
        <header className="mtop">
          <div className="logo"><span className="logo-mark">Q</span><span>QuizDesk</span></div>
          <button className="out" onClick={() => signOut(auth)}>Sign out</button>
        </header>
        <main className="content">{loadErr && <div className="alert alert-error" role="alert">{loadErr}</div>}{content}</main>
      </div>
    </div>
  );
}

function Overview({ isTeacher, name, quizzes, results, go }) {
  const a = avg(results);
  const stats = isTeacher
    ? [["Quizzes created", quizzes.length], ["Published", quizzes.filter((q) => q.published).length], ["Submissions", results.length], ["Average score", a === null ? "-" : a + "%"]]
    : [["Available quizzes", quizzes.length], ["Attempts", results.length], ["Average score", a === null ? "-" : a + "%"], ["Best score", results.length ? Math.max(...results.map((r) => r.percent)) + "%" : "-"]];
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Hello, {name.split(" ")[0]}</h1>
          <p className="muted">{isTeacher ? "Here is how your quizzes are doing." : "Pick up a quiz or review your scores."}</p>
        </div>
        <button className="btn-y" onClick={() => go(isTeacher ? "create" : "quizzes")}>{isTeacher ? "Create quiz" : "Browse quizzes"}</button>
      </div>
      <section className="stats" aria-label="Summary">
        {stats.map(([l, v]) => (<div className="stat" key={l}><strong>{v}</strong><span>{l}</span></div>))}
      </section>
      <section className="panel">
        <div className="panel-head">
          <h2>{isTeacher ? "Recent submissions" : "Recent results"}</h2>
          {results.length > 0 && <button className="link" onClick={() => go("results")}>View all</button>}
        </div>
        {results.length ? <ResultsTable rows={results.slice(0, 5)} isTeacher={isTeacher} /> : (
          <div className="empty"><p className="empty-title">Nothing here yet</p><p>{isTeacher ? "Publish a quiz and submissions will show up here." : "Take a quiz and your score will show up here."}</p></div>
        )}
      </section>
    </>
  );
}
