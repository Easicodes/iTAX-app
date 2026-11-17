# iTAX — Minimal Full-Stack Build & Deployment Guide

This matches the architecture in Chapter 4 of your project (Node.js/Express + MongoDB),
trimmed to the smallest setup that still gives you a real, shared, gradeable system:
a live link + a real database, no local server needing to stay on.

Total cost: **₦0** (everything below has a free tier). Total time: **~30–40 minutes**.

---

## What you're deploying
- **Database**: MongoDB Atlas (free, cloud-hosted)
- **Backend**: `/backend` (Node/Express API) → deployed to Render (free)
- **Frontend**: `/frontend` (plain HTML/JS) → deployed to Vercel or Netlify (free)

---

## Step 1 — Create a free MongoDB Atlas database (~10 min)
1. Go to https://www.mongodb.com/cloud/atlas/register and sign up (free, no card needed).
2. Create a **free M0 cluster** (any provider/region is fine).
3. Under **Database Access**, create a database user (username + password — save these).
4. Under **Network Access**, click **Add IP Address** → **Allow Access from Anywhere** (0.0.0.0/0). This is fine for a student demo project.
5. Click **Connect** → **Drivers** → copy the connection string. It looks like:
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
6. Add `itax` as the database name right after `.net/`, so it ends up:
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/itax?retryWrites=true&w=majority`
   Keep this — you'll paste it into Render in Step 3.

## Step 2 — Put this project on GitHub (~5 min)
Render and Vercel both deploy straight from GitHub.
1. Create a free GitHub account if you don't have one: https://github.com/signup
2. Create a new repository (e.g. `itax-app`), then upload this whole folder to it
   (easiest way: on the repo page, click **Add file → Upload files**, and drag in
   the `backend` and `frontend` folders).

## Step 3 — Deploy the backend to Render (~10 min)
1. Go to https://render.com and sign up (free) with your GitHub account.
2. Click **New → Web Service**, pick your `itax-app` repository.
3. Set:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free
4. Under **Environment Variables**, add:
   - `MONGO_URI` → the connection string from Step 1
   - `JWT_SECRET` → any long random text, e.g. `super-secret-key-change-me-123`
   - `FRONTEND_ORIGIN` → `*` (you can tighten this later)
   - `OPENAI_API_KEY` → leave blank (Tax Buddy will use the built-in rule-based answers for free; see note below)
5. Click **Create Web Service**. Wait for the build to finish, then copy your live backend URL,
   e.g. `https://itax-backend.onrender.com`.
6. Test it: open `https://itax-backend.onrender.com/api/health` in your browser.
   You should see `{"status":"ok", ...}`. If so, your database and backend are live.

   Note: Render's free tier "sleeps" after 15 minutes of no traffic and takes ~30–50 seconds
   to wake back up on the next request. That's normal for a free demo — just mention it if your
   supervisor opens it after it's been idle.

## Step 4 — Deploy the frontend (React + Tailwind) to Vercel (~5 min)
The frontend is a Vite + React + Tailwind CSS app (matching Table 4.1 of Chapter 4).
1. Go to https://vercel.com, sign up with GitHub, click **Add New → Project**, pick your `itax-app` repo.
2. Set **Root Directory** to `frontend`. Vercel auto-detects Vite — leave the build
   command (`vite build`) and output directory (`dist`) as the defaults it suggests.
3. Before deploying, add an **Environment Variable**:
   - `VITE_API_BASE_URL` → your Render backend URL from Step 3, e.g.
     `https://itax-backend.onrender.com` (no trailing slash)
4. Click **Deploy**. Vercel gives you a live link like `https://itax-app.vercel.app`.

If you ever need to change the backend URL later, update that environment variable in
Vercel's project settings and hit **Redeploy** — no code change needed.

### Running the frontend locally first (optional)
```bash
cd frontend
cp .env.example .env     # then set VITE_API_BASE_URL to http://localhost:5000
npm install
npm run dev               # opens at http://localhost:5173
```

## Step 5 — Try it end-to-end
1. Open your Vercel link.
2. Click **Register**, create an account (any email/password — this is your own test account).
3. Add a couple of transactions in the **Ledger** tab.
4. Check the **Dashboard** tab — it should show totals and the CIT exemption status.
5. Try **Tax Buddy** — ask "Am I exempt from CIT?" and it will answer using the rules from
   Section 56 of the NTA 2025.

**This is the link you send your supervisor** — it's live, backed by a real database, and
anyone can register their own account and test it.

---

## Turning on the real RAG pipeline (recommended — this is what Chapter 4 describes)
By default, Tax Buddy answers using simple built-in keyword rules (free, no setup, works
immediately). To switch on the actual Retrieval-Augmented Generation pipeline — embeddings,
a vector-similarity search over a `KnowledgeChunk` collection, and grounded chat completions,
exactly as described in Chapter 4 and Appendix B:

1. Get an API key from https://platform.openai.com/api-keys (requires adding billing to your
   OpenAI account — embedding and chatting with the small knowledge base used here costs well
   under $1 total for a full grading session).
2. Set `OPENAI_API_KEY` in your `.env` (locally) or in Render's environment variables (deployed).
3. Run the one-time ingestion script, which embeds `backend/data/knowledgeBase.js` (the NTA
   2025 / NTAA 2025 excerpts) and stores the vectors in MongoDB:
   ```bash
   cd backend
   npm run ingest
   ```
4. Redeploy (if using Render, it redeploys automatically when you push the env var / on next deploy).

From then on, every message to Tax Buddy is embedded, matched against the stored knowledge
chunks by cosine similarity, and answered by an OpenAI chat completion grounded in only the
top-matching chunks — with the matched section references returned as `sources` and shown
under each chat bubble in the UI. If the `OPENAI_API_KEY` is ever removed or the knowledge base
is empty, it automatically falls back to the free rule-based answers, so the app never breaks.

## Running the test suite
```bash
cd backend
npm install
npm test
```
This runs the Jest unit tests in `backend/tests/` covering the CIT calculation logic (Table 4.2,
UT-01–UT-03) and the RAG helper functions — cosine similarity, top-k retrieval ranking, and the
rule-based fallback matcher (UT-04–UT-05). These are pure-function tests (no database or network
needed), so they run the same way on your machine, in CI, or for your supervisor.

## Running it locally first (optional, before deploying)
```bash
cd backend
cp .env.example .env     # then fill in MONGO_URI and JWT_SECRET from Step 1
npm install
npm start                # backend runs on http://localhost:5000
```
Then open `frontend/index.html` directly in your browser (leave `config.js` pointing at
`http://localhost:5000`). This lets you test everything before paying for nothing and
deploying for free in Steps 3–4.

## Project structure
```
itax-app/
├── backend/
│   ├── server.js             # Express app entrypoint
│   ├── models/               # Mongoose schemas: User, Transaction, TaxFiling,
│   │                         #   ChatSession, ChatMessage, KnowledgeChunk
│   │                         #   (all 6 collections from Figure 4.2)
│   ├── lib/
│   │   ├── cit.js             # Pure CIT calculation logic (unit-tested)
│   │   └── rag.js             # Embeddings, cosine similarity, chat completion,
│   │                          #   and the free rule-based fallback
│   ├── data/knowledgeBase.js  # NTA 2025 / NTAA 2025 excerpts to embed
│   ├── scripts/ingestKnowledge.js  # One-time embedding ingestion (npm run ingest)
│   ├── tests/                 # Jest unit tests (npm test)
│   ├── routes/                 # auth, transactions, tax (filings), chat (Tax Buddy RAG)
│   ├── middleware/auth.js      # JWT auth guard
│   └── .env.example
└── frontend/                  # Vite + React + Tailwind CSS (Table 4.1)
    ├── index.html
    ├── .env.example           # VITE_API_BASE_URL — points the app at your backend
    └── src/
        ├── App.jsx            # Tab shell (Dashboard / Ledger / Tax Buddy)
        ├── api.js              # Fetch client for the backend REST API
        ├── context/AuthContext.jsx
        └── components/        # AuthScreen, TopBar, TabNav, Dashboard, Ledger, Chat
```

## Frontend stack
React 18, Tailwind CSS, Framer Motion (animations), Recharts (income/expense chart) and
Lucide (icons) — matching the React.js + Tailwind CSS stack specified in Table 4.1. Visual
design: a deep forest-green and gold palette distinct from generic dashboard templates, a
large "hero number" treatment for the CIT position rather than identical KPI cards, and
a sliding-pill tab navigation. Verified by building the project and screenshotting every
screen (desktop and mobile) against a mock backend before delivery.
