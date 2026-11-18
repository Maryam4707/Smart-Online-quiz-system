import { useState } from "react";
import { api } from "./api";

const blank = () => ({ text: "", options: ["", "", "", ""], correct: 0 });

export default function QuizEditor({ quiz, go, reload }) {
  const [title, setTitle] = useState(quiz?.title || "");
  const [description, setDescription] = useState(quiz?.description || "");
  const [duration, setDuration] = useState(quiz?.durationMin || 10);
  const [qs, setQs] = useState(quiz?.questions || [blank()]);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [fail, setFail] = useState("");

  const setQ = (i, patch) => setQs((a) => a.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const setOpt = (i, k, v) => setQ(i, { options: qs[i].options.map((o, j) => (j === k ? v : o)) });

  const validate = () => {
    const e = {};
    if (title.trim().length < 3) e.title = "Enter a quiz title (at least 3 characters).";
    const d = Number(duration);
    if (!Number.isInteger(d) || d < 1 || d > 180) e.duration = "Enter a time limit from 1 to 180 minutes.";
    qs.forEach((q, i) => {
      if (!q.text.trim() || q.options.some((o) => !o.trim())) e["q" + i] = "Fill in the question and all four options.";
    });
    return e;
  };

  const save = async (published) => {
    const e = validate();
    setErrors(e);
    setFail("");
    if (Object.keys(e).length) return;
    setSaving(true);
    const data = {
      title: title.trim(),
      description: description.trim(),
      durationMin: Number(duration),
      questions: qs.map((q) => ({ text: q.text.trim(), options: q.options.map((o) => o.trim()), correct: q.correct })),
      published,
    };
    try {
      if (quiz) await api(`/quizzes/${quiz.id}`, { method: "PUT", body: data });
      else await api("/quizzes", { method: "POST", body: data });
      await reload();
      go("quizzes");
    } catch (e) {
      setFail([e.message, ...(e.details || [])].join(" "));
      setSaving(false);
    }
  };

  return (
    <div className="ed">
      <div className="page-head"><div><h1>{quiz ? "Edit quiz" : "Create quiz"}</h1><p className="muted">Each question has four options and one correct answer.</p></div></div>
      {fail && <div className="alert alert-error" role="alert">{fail}</div>}

      <section className="panel">
        <div className={`fld ${errors.title ? "bad" : ""}`}>
          <label htmlFor="t">Quiz title</label>
          <input id="t" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Data Structures, Midterm" />
          {errors.title && <p className="field-error">{errors.title}</p>}
        </div>
        <div className="fld">
          <label htmlFor="d">Description (optional)</label>
          <textarea id="d" rows="2" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Topics covered, instructions for students" />
        </div>
        <div className={`fld short ${errors.duration ? "bad" : ""}`}>
          <label htmlFor="m">Time limit (minutes)</label>
          <input id="m" type="number" min="1" max="180" value={duration} onChange={(e) => setDuration(e.target.value)} />
          {errors.duration && <p className="field-error">{errors.duration}</p>}
        </div>
      </section>

      {qs.map((q, i) => (
        <section className={`panel qblock ${errors["q" + i] ? "bad" : ""}`} key={i}>
          <div className="panel-head">
            <h2>Question {i + 1}</h2>
            {qs.length > 1 && <button className="link danger" type="button" onClick={() => setQs((a) => a.filter((_, j) => j !== i))}>Remove</button>}
          </div>
          <div className="fld">
            <label htmlFor={`q${i}`}>Question text</label>
            <textarea id={`q${i}`} rows="2" value={q.text} onChange={(e) => setQ(i, { text: e.target.value })} />
          </div>
          <p className="hint">Select the radio button next to the correct answer.</p>
          {q.options.map((o, k) => (
            <div className="optrow" key={k}>
              <input type="radio" name={`c${i}`} checked={q.correct === k} onChange={() => setQ(i, { correct: k })} aria-label={`Option ${k + 1} is correct`} />
              <input value={o} onChange={(e) => setOpt(i, k, e.target.value)} placeholder={`Option ${k + 1}`} aria-label={`Option ${k + 1}`} />
            </div>
          ))}
          {errors["q" + i] && <p className="field-error">{errors["q" + i]}</p>}
        </section>
      ))}

      <button type="button" className="btn-o wide" onClick={() => setQs((a) => [...a, blank()])}>Add question</button>

      <div className="savebar">
        <button className="btn-o" disabled={saving} onClick={() => go("quizzes")}>Cancel</button>
        <button className="btn-o" disabled={saving} onClick={() => save(false)}>Save as draft</button>
        <button className="btn-y" disabled={saving} onClick={() => save(true)}>{saving ? "Saving…" : quiz ? "Save and publish" : "Publish quiz"}</button>
      </div>
    </div>
  );
}
