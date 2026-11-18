const fmtDate = (ms) => (ms ? new Date(ms).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "-");

export function ResultsTable({ rows, isTeacher }) {
  return (
    <div className="tablewrap">
      <table>
        <thead>
          <tr>{isTeacher && <th>Student</th>}<th>Quiz</th><th>Score</th><th>Result</th><th>Date</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              {isTeacher && <td>{r.studentName}</td>}
              <td>{r.quizTitle}</td>
              <td>{r.score} / {r.total}</td>
              <td><span className={`pill ${r.percent >= 50 ? "ok" : "low"}`}>{r.percent}%</span></td>
              <td>{fmtDate(r.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Results({ isTeacher, results }) {
  return (
    <>
      <div className="page-head"><div><h1>{isTeacher ? "Submissions" : "My results"}</h1><p className="muted">{isTeacher ? "Every attempt made on your quizzes." : "Your scores from every quiz you have taken."}</p></div></div>
      <section className="panel">
        {results.length ? <ResultsTable rows={results} isTeacher={isTeacher} /> : (
          <div className="empty"><p className="empty-title">No results yet</p><p>{isTeacher ? "Submissions appear here after students finish a quiz." : "Take a quiz and your score will appear here."}</p></div>
        )}
      </section>
    </>
  );
}
