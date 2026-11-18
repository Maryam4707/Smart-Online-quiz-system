# One-page spec: QuizDesk

**Domain:** online quizzes. **Users:** teacher, student.

## Entities
- **User** (Firebase Auth + Firestore `users/{uid}`): name, email, role (`student` | `teacher`).
- **Quiz**: title, description, durationMin (1 to 180), published, ownerId, ownerName, questions[], createdAt.
- **Question** (embedded in Quiz): text, options (exactly 4), correct (0 to 3).
- **Result**: quizId, quizTitle, ownerId, studentId, studentName, score, total, percent, answers[], createdAt.

## Endpoints
| # | Method and path | Role | Purpose |
|---|---|---|---|
| 1 | GET /api/quizzes | any | List quizzes (students get no answers) |
| 2 | POST /api/quizzes | teacher | Create |
| 3 | PUT /api/quizzes/:id | owner | Update, publish |
| 4 | DELETE /api/quizzes/:id | owner | Delete |
| 5 | POST /api/quizzes/:id/submit | student | Grade and save attempt |
| 6 | GET /api/results | any | List results (supporting read for screen 3) |

Endpoints 1 to 4 are the Quiz CRUD; 5 and 6 belong to the Attempt resource.

## UI screens
1. **Auth**: login, signup (with role), forgot password.
2. **Quiz management / list**: teacher creates, edits, publishes, deletes; student browses published quizzes.
3. **Attempt and results**: timed quiz, score with answer review, results history (teacher sees submissions).

## Rules
- Only a teacher can create a quiz; only its owner can change or delete it.
- Only published quizzes are visible to students.
- The server grades; the browser never sees correct answers before submitting.
