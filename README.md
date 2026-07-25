# Leaven (demo build)

Elevate your cooking! This is a lightweight, frontend-only demo of the Leaven
product flow from the design doc: describe a dish you already cook, get back
a structured elevation plan (a focused delta or a full rewrite), save it to
history, and leave feedback.

There is no backend, database, auth, or live LLM call in this build — it's
meant for quick demos. `src/data.ts` matches your input against a few seeded
example dishes (salmon, chicken piccata, weeknight pasta) and returns a
canned elevation plan; anything else falls back to a generic elevation
template so the flow always produces a result.

## Run it

```bash
npm install
npm run dev
```

Then open the printed local URL (typically http://localhost:5173).

## What's here

- `src/App.tsx` — Home, New Elevation, Result, and History screens (client-side view state, no router)
- `src/data.ts` — seeded example dishes + the mocked "elevation engine"
- `src/App.css` — styling

## GitHub Actions tutorial

The repository includes three small workflows:

- `.github/workflows/hello.yml` — manually run a greeting and inspect its logs
- `.github/workflows/ci.yml` — type-check and build pushes and pull requests to `main`
- `.github/workflows/dependency-review.yml` — review dependency changes in pull requests

Start with [lesson 1](lessons/0001-run-the-hello-workflow.html), or keep the
[GitHub Actions cheat sheet](reference/github-actions-cheat-sheet.html) open
while reading the workflow files. PMs can also use the commented
[workflow template](reference/github-actions-workflow-template.yml) to see the
main parts together. Run the same application validation locally with:

```bash
npm run check
```

## Not included (see the full design doc for the real scope)

Google OAuth / JWT auth, PostgreSQL + SQLAlchemy models, the FastAPI backend,
Ollama/Groq inference, admin library CRUD, and multimodal input (images,
recipe links, YouTube).
