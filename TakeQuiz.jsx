import { useEffect, useRef, useState } from "react";
import { api } from "./api";

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export default function TakeQuiz({ quiz, go, reload }) {
  const total = quiz.questions.length;
  const [phase, setPhase] = useState("intro"); // intro | quiz | submitting | failed | done
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState({});
  const [left, setLeft] = useState(quiz.durationMin * 60);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");
  const r = useRef({ answers: {}, ends: 0, busy: false });

  const start = () => { r.current.ends = Date.now() + quiz.durationMin * 60000; setPhase("quiz"); };
  const pick = (qi, oi) => { r.current.answers = { ...r.current.answers, [qi]: oi }; setAnswers(r.current.answers); };

  const submit = async () => {
    if (r.current.busy) return;
    r.current.busy = true;
    setPhase("submitting");
    const a = r.current.answers;
    try {
      const res = await api(`/quizzes/${quiz.id}/submit`, { method: "POST", body: { answers: Array.from({ length: total }, (_, k) => a[k] ?? -1) } });
      setResult(res); setPhase("done"); reload();
    } catch (e) {
      setErr(e.message); setPhase("failed");
    } finally {
      r.current.busy = false;
    }
  };

  useEffect(() => {
    if (phase !== "quiz") return;
    const t = setInterval(() => {
      const l = Math.max(0, Math.round((r.current.ends - Date.now()) / 1000));
      setLeft(l);
      if (l <= 0) submit();
    }, 500);
    return () => clearInterval(t);
  }, [phase]);

  const confirmSubmit = () => {
    const open = total - Object.keys(answers).length;
    if (open === 0 || window.confirm(`You have ${open} unanswered question${open > 1 ? "s" : ""}. Submit anyway?`)) submit();
  };

  if (phase === "intro") {
    return (
      <div className="take narrow panel">
        <h1>{quiz.title}</h1>
        {quiz.description && <p className="muted">{quiz.description}</p>}
        <ul className="rules">
          <li>{total} questions, {quiz.durationMin} minutes in total.</li>
          <li>The timer starts when you press Start and cannot be paused.</li>
          <li>The quiz is submitted automatically when time runs out.</li>
        </ul>
        <div className="actions"><button className="btn-o" onClick={() => go("quizzes")}>Back</button><button className="btn-y" onClick={start}>Start quiz</button></div>
      </div>
    );
  }

  if (phase === "submitting") return <div className="take narrow panel"><p className="muted" role="status">Submitting your answers…</p></div>;

  if (phase === "failed") {
    return (
      <div className="take narrow panel">
        <div className="alert alert-error" role="alert">{err}</div>
        <p className="muted">Your answers are still here. Try submitting again.</p>
        <div className="actions"><button className="btn-y" onClick={submit}>Try again</button></div>
      </div>
    );
  }

  if (phase === "done") {
    const { score, percent, review } = result;
    return (
      <div className="take narrow">
        <section className="panel scorebox">
          <p className="muted">{quiz.title}</p>
          <div className={`bigpct ${percent >= 50 ? "ok" : "low"}`}>{percent}%</div>
          <p>You answered {score} of {total} correctly. {percent >= 50 ? "Well done." : "Review the answers below and try again."}</p>
          <div className="actions center"><button className="btn-o" onClick={() => go("quizzes")}>Back to quizzes</button><button className="btn-y" onClick={() => go("results")}>My results</button></div>
        </section>
        <h2 className="sect">Review</h2>
        {quiz.questions.map((q, k) => {
          const { correct, selected } = review[k];
          const ok = selected === correct;
          return (
            <section className={`panel rev ${ok ? "right" : "wrong"}`} key={k}>
              <p className="meta">Question {k + 1}, {ok ? "correct" : selected === -1 ? "not answered" : "incorrect"}</p>
              <p className="qtext">{q.text}</p>
              {selected !== -1 && !ok && <p className="yours">Your answer: {q.options[selected]}</p>}
              <p className="correct">Correct answer: {q.options[correct]}</p>
            </section>
          );
        })}
      </div>
    );
  }

  const q = quiz.questions[i];
  return (
    <div className="take narrow">
      <div className="take-top">
        <div><strong>{quiz.title}</strong><p className="meta">Question {i + 1} of {total}</p></div>
        <div className={`timer ${left < 60 ? "low" : ""}`} role="timer" aria-label="Time left">{fmt(left)}</div>
      </div>
      <div className="progress"><span style={{ width: `${((i + 1) / total) * 100}%` }} /></div>
      <section className="panel">
        <p className="qtext big">{q.text}</p>
        <div className="opts">
          {q.options.map((o, k) => (
            <button key={k} className={`opt ${answers[i] === k ? "sel" : ""}`} onClick={() => pick(i, k)} aria-pressed={answers[i] === k}>
              <span className="letter">{"ABCD"[k]}</span><span>{o}</span>
            </button>
          ))}
        </div>
      </section>
      <div className="take-nav">
        <button className="btn-o" disabled={i === 0} onClick={() => setI(i - 1)}>Previous</button>
        {i < total - 1 ? <button className="btn-y" onClick={() => setI(i + 1)}>Next</button> : <button className="btn-y" onClick={confirmSubmit}>Submit quiz</button>}
      </div>
      <div className="palette" aria-label="Jump to question">
        {quiz.questions.map((_, k) => (
          <button key={k} className={`${k === i ? "cur" : ""} ${answers[k] !== undefined ? "ans" : ""}`} onClick={() => setI(k)} aria-label={`Question ${k + 1}`}>{k + 1}</button>
        ))}
      </div>
      {i < total - 1 && <button className="link finish" onClick={confirmSubmit}>Finish and submit now</button>}
    </div>
  );
}
