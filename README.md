# QuizDesk: Online Quiz Management System

A small full-stack web app where **teachers** create and publish timed multiple-choice quizzes and **students** take them and see their results. Built for the "Group presentation and live demo" assignment with LLM assistance.

## Stack (declared versions)

| Layer | Technology | Version |
|---|---|---|
| Runtime | Node.js | 20 LTS or newer (`node -v`) |
| Front end | React / React DOM | 18.3.1 |
| Build tool | Vite, @vitejs/plugin-react | ^5.4.8, ^4.3.1 |
| Auth (client) | Firebase JS SDK (Authentication, Firestore) | ^10.14.1 |
| Back end | Express | 5.1.0 |
| Validation | zod | 3.23.8 |
| Security | helmet 7.1.0, cors 2.8.5, express-rate-limit 7.4.0 | pinned |
| Database / token check | firebase-admin (Firestore, Auth) | 12.6.0 |
| Config | dotenv | 16.4.5 |

Run `npm ls --depth=0` in the root and in `server/` and paste the real output into the slides: that is the version of record.

## Architecture

```
React (Vite)  --Bearer ID token-->  Express API  --Admin SDK-->  Firestore
     |                                  |
     +-- Firebase Auth (login/signup)   +-- verifies token, checks role, validates, grades
```

- Login, signup and password reset use Firebase Authentication in the browser.
- All quiz and result data goes through the Express API. Firestore rules block the browser from touching quizzes and results directly.
- A student never receives the correct answers. The server grades the attempt and reveals answers only after the result is saved.

## Setup

1. **Firebase**: enable Authentication (Email/Password) and create a Firestore database. Publish `firestore.rules`.
2. **Backend secret**: Firebase Console, Project settings, Service accounts, "Generate new private key". Save the file as `server/serviceAccountKey.json`. It is git-ignored; never commit it.
3. **Backend**:
   ```
   cd server
   copy .env.example .env      (Windows)   |   cp .env.example .env
   npm install
   npm run dev
   ```
   Check `http://http://192.168.100.9:4000/api/health` returns `{"ok":true}`.
4. **Front end** (second terminal, project root): put your Firebase web config in `.env` (see `.env.example`), then
   ```
   npm install
   npm run dev
   ```
5. Open `http://localhost:5173`.

Testing on a phone: run `npm run dev -- --host`, set `VITE_API_URL=http://<PC-IP>:4000` in the front-end `.env`, and add `http://<PC-IP>:5173` to `ALLOWED_ORIGINS` in `server/.env`.

## API

All routes need `Authorization: Bearer <Firebase ID token>`.

| Method | Path | Who | Purpose |
|---|---|---|---|
| GET | /api/quizzes | any | Teacher: own quizzes. Student: published quizzes without answers |
| POST | /api/quizzes | teacher | Create a quiz |
| PUT | /api/quizzes/:id | owner | Update a quiz (including publish / unpublish) |
| DELETE | /api/quizzes/:id | owner | Delete a quiz |
| POST | /api/quizzes/:id/submit | student | Submit answers, get graded result |
| GET | /api/results | any | Teacher: submissions to own quizzes. Student: own results |

Errors are JSON: `{ "error": "message", "details": ["field: problem"] }` with 400, 401, 403, 404 or 500.

## Security measures

- **Auth**: Firebase ID token verified on every request; role read from the database, never from the request.
- **Authorization**: role check per route plus owner check on update and delete.
- **Validation**: zod schemas for bodies and a strict pattern for ids.
- **Secrets**: service account key and `.env` files are git-ignored; only `.env.example` is committed.
- **Hardening**: helmet headers, CORS allow-list, 100 kb body limit, rate limit of 120 requests per minute.
- **Errors**: a central handler returns clean messages and logs details only on the server.

## Known limitations

- Role (student or teacher) is chosen at signup. A real system would use admin approval for teachers.
- Unlimited retakes; no pagination; no automated tests; question images are not supported.

## Project structure

```
src/        React app (AuthPage, Dashboard, Quizzes, QuizEditor, TakeQuiz, Results, api.js)
server/src/ Express API (server.js, routes.js, auth.js, firebase.js)
docs/       SPEC.md, PROMPT_LOG.md, PRESENTATION.md
```
 