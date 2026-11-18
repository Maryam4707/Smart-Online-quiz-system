import { useState } from "react";
import { api } from "./api";

export default function Quizzes({ isTeacher, quizzes, results, go, reload }) {
  const [err, setErr] = useState("");
  const run = async (fn) => { setErr(""); try { await fn(); await reload(); } catch (e) { setErr(e.message); } };
  const toggle = (q) => run(() => api(`/quizzes/${q.id}`, { method: "PUT", body: { title: q.title, description: q.description || "", durationMin: q.durationMin, questions: q.questions, published: !q.published } }));
  const remove = (q) => window.confirm(`Delete "${q.title}"? This cannot be undone.`) && run(() => api(`/quizzes/${q.id}`, { method: "DELETE" }));

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{isTeacher ? "My quizzes" : "Available quizzes"}</h1>
          <p className="muted">{isTeacher ? "Publish a quiz to make it visible to students." : "Choose a quiz to start. The timer begins when you press Start."}</p>
        </div>
        {isTeacher && <button className="btn-y" onClick={() => go("create")}>Create quiz</button>}
      </div>

      {err && <div className="alert alert-error" role="alert">{err}</div>}

      {quizzes.length === 0 ? (
        <div className="empty big">
          <p className="empty-title">{isTeacher ? "You have not created a quiz yet" : "No quizzes are available right now"}</p>
          <p>{isTeacher ? "Create your first quiz in a few minutes." : "Quizzes published by teachers will appear here."}</p>
          {isTeacher && <button className="btn-y" onClick={() => go("create")}>Create quiz</button>}
        </div>
      ) : (
        <div className="cards">
          {quizzes.map((q) => {
            const mine = results.filter((r) => r.quizId === q.id);
            const best = mine.length ? Math.max(...mine.map((r) => r.percent)) : null;
            return (
              <article className="qcard" key={q.id}>
                <div className="qcard-top">
                  <h3>{q.title}</h3>
                  {isTeacher && <span className={`status ${q.published ? "pub" : "draft"}`}>{q.published ? "Published" : "Draft"}</span>}
                </div>
                {q.description && <p className="muted clamp">{q.description}</p>}
                <p className="meta">{q.questions.length} questions, {q.durationMin} min{!isTeacher && q.ownerName ? `, by ${q.ownerName}` : ""}</p>
                {!isTeacher && best !== null && <p className="meta">Attempts: {mine.length}, best score: {best}%</p>}
                {isTeacher ? (
                  <div className="actions">
                    <button className="btn-o" onClick={() => toggle(q)}>{q.published ? "Unpublish" : "Publish"}</button>
                    <button className="btn-o" onClick={() => go("edit", { quiz: q })}>Edit</button>
                    <button className="btn-d" onClick={() => remove(q)}>Delete</button>
                  </div>
                ) : (
                  <div className="actions"><button className="btn-y" onClick={() => go("take", { quiz: q })}>{mine.length ? "Retake quiz" : "Start quiz"}</button></div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
