# Demo plan (10 min + 5 min Q&A)

Prepare: backend and front end running, two accounts (one teacher, one student) already created, one published quiz with 3 questions, browser DevTools (Network tab) ready, a recorded backup video.

| Time | Part | What to show |
|---|---|---|
| 0:00 to 2:00 | 1. Frameworks and AI | Stack slide with real `npm ls` output. Your real case of outdated syntax or a wrong package, and the fix |
| 2:00 to 5:00 | 2. UI components | Same component (for example the answer option button) from a vague prompt and from a detailed prompt. Check: keyboard focus, `aria-pressed`, labels, 375 px width (bottom tab bar), states (loading, empty, error, timer). Show one problem you fixed |
| 5:00 to 8:00 | 3. Backend routes | Show each check live (see below). Then one real flaw: answers leaking to students, before and after |
| 8:00 to 10:00 | 4. Integration | From the UI: create, read, update (publish), delete a quiz, then a student attempt. Show one front/back mismatch and the fix |
| 10:00 to 11:00 | 5. Closing | Three lessons, in your own words |

## Backend checks to demo
- No token: `curl http://http://192.168.100.9:4000/api/quizzes` returns 401.
- Student creating a quiz returns 403 (the UI hides the button, the server still refuses).
- Teacher B deleting teacher A's quiz returns 403.
- Invalid body (title "ab", 3 options) returns 400 with a `details` list.
- Bad id (`/api/quizzes/..%2F`) returns 400.
- Secrets: show `.gitignore`, `.env.example`, and that `serviceAccountKey.json` is not in the repo.
- The flaw: open Network, load a quiz as a student, show there is no `correct` field.

## Who explains what (every member must be able to explain any function)
`requireAuth` and `requireRole` (auth.js), `parse` and the zod schemas, the submit grading in routes.js, `api()` in api.js, `reload()` in Dashboard.jsx, the timer effect in TakeQuiz.jsx, the profile fallback in App.jsx.

## Likely questions
- Why check the role on the server if the UI already hides buttons?
- Why does the server grade, not the browser?
- What does `verifyIdToken` check? What if the token expires?
- Why can the browser not read quizzes from Firestore directly now?
- What would you add next (tests, teacher approval, pagination)?
