# Prompt log (DRAFT: each member must check and complete this with their own experience)

> Honesty rule: only keep entries that really happened to your group. Entries 1 to 6 were written from the project chat history; edit them in your own words and add your own.

| # | What we asked | What the AI produced | What broke | What we fixed |
|---|---|---|---|---|
| 1 | "Login and Signup screen, React + Firebase Auth, black and yellow, validation, show/hide password, forgot password" | Vite + React project, AuthPage, firebase.js, `.env` setup | Nothing in the code. Setup problems below | n/a |
| 2 | Followed setup steps for the database | Instructions to create a database and paste security rules | We opened **Realtime Database** instead of **Firestore**. Firebase showed "Parse error" because the rules syntax belongs to Firestore | Discarded the change, created a Firestore database, published the rules there |
| 3 | `npm run dev` | Project zip | "Missing script: dev". The zip extracted into a nested folder and npm picked up a stray `package.json` higher up. We then scaffolded a second Vite project by mistake | Opened the inner `quiz-auth` folder that really contains `package.json` and `src`, deleted the extra project |
| 4 | "Add role (student / teacher) and a dashboard" | Role saved in Firestore after signup | **Race condition**: the app listens for login before the profile document exists, so the role could be missing for a moment | The app waits for the profile and falls back to "student" after 1.5 s if it does not appear |
| 5 | "Add all remaining screens, professional" | Create quiz, take quiz with timer, results | **Security flaw**: the browser received `correct` for every question and graded itself, so a student could read answers in the Network tab and write any score | Moved to an Express API: students get questions without `correct`; the server grades and returns answers only after saving |
| 6 | Convert to full-stack for the assignment | Express routes with zod validation, token check, role and owner checks | Front end expected Firestore timestamps (`toDate()`), but the API returns epoch milliseconds, so dates failed to render | Changed the date formatter to `new Date(ms)` |
| 7+ | *(add yours)* | | | |

## Still to fill in honestly (do not invent)
- **Outdated syntax or hallucinated package** (required for part 1): describe a real case you hit. If nothing happened, say so and show where you checked versions instead.
- **UI fix** (part 2): test at 375 px width and with the keyboard only; write down what you really had to fix.
- **Vague vs detailed prompt** (part 2): run both prompts for the same component and keep both outputs.
- **Three non-trivial fixes**: entries 4, 5 and 6 can count if you can explain them fully.
