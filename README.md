# eFootball Tournament Management System

A production-ready web application for managing eFootball tournaments — built for the Bangladeshi eFootball community.

**Live on GitHub Pages · Backend on Supabase · Zero server cost**

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS |
| State | Zustand |
| Routing | React Router v6 |
| Backend | Supabase (Auth + DB + Storage + Realtime) |
| Hosting | GitHub Pages |

---

## Features

- Single elimination bracket (8 / 16 / 32 / 64 players)
- Random seeding and auto-bracket generation
- Match result submission with screenshot proof
- Auto-confirm when both players agree on winner
- 1-hour result window — default win if opponent misses it
- Dispute resolution via admin referee review
- Real-time in-app notifications (Supabase Realtime)
- Role-based access: Player / Admin
- Screenshot upload to Supabase Storage (max 5MB)
- Player profiles with stats and match history
- Search by player name, username, or eFootball UID
- Admin: create tournaments, manage players, suspend accounts

---

## Project Structure

```
src/
├── components/
│   ├── ui/          # Button, Card, Badge, Avatar, Modal, etc.
│   ├── layout/      # Navbar, AppLayout, ProtectedRoute
│   ├── tournament/  # TournamentCard, BracketView
│   ├── match/       # MatchCard, SubmitResultModal
│   └── player/      # NotificationPanel
├── pages/
│   ├── player/      # Dashboard, Tournaments, Matches, Profile, Search
│   └── admin/       # Dashboard, Tournaments CRUD, Players, Reviews
├── hooks/           # useAuth, useTournament, useMatch
├── store/           # authStore, notificationStore (Zustand)
├── lib/             # supabase.ts client
├── types/           # All TypeScript interfaces
└── utils/           # bracket.ts, format.ts
```

**Architectural rule:** future features are added as new files only. Existing files are never modified or replaced.

---

## Local Setup

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/efootball-tournament.git
cd efootball-tournament
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env` and fill in your Supabase credentials:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

> Your Supabase URL and anon key are found in: Supabase Dashboard → Project Settings → API

### 3. Database

The migrations are already applied to the connected Supabase project. If you're connecting a new Supabase project, run the SQL files in `supabase/migrations/` in order via the Supabase SQL Editor.

### 4. Run locally

```bash
npm run dev
```

---

## GitHub Pages Deployment

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/efootball-tournament.git
git push -u origin main
```

### 2. Add GitHub Secrets

Go to: **GitHub repo → Settings → Secrets and variables → Actions → New repository secret**

Add these two secrets:
- `VITE_SUPABASE_URL` — your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — your Supabase anon key

### 3. Enable GitHub Pages

Go to: **GitHub repo → Settings → Pages**
- Source: **GitHub Actions**

The workflow at `.github/workflows/deploy.yml` will automatically build and deploy on every push to `main`.

Your app will be live at:
```
https://YOUR_USERNAME.github.io/efootball-tournament/
```

---

## Creating the First Admin

After your first user registers, promote them to admin via Supabase SQL Editor:

```sql
UPDATE profiles
SET role = 'admin'
WHERE username = 'your_username';
```

---

## Supabase Auth Setup

In Supabase Dashboard → Authentication → URL Configuration:

- **Site URL:** `https://YOUR_USERNAME.github.io/efootball-tournament`
- **Redirect URLs:** add `https://YOUR_USERNAME.github.io/efootball-tournament/**`

---

## Database Migrations

| File | Description |
|---|---|
| `001_initial_schema.sql` | All tables, indexes, triggers |
| `002_rls_policies.sql` | Row Level Security policies |
| `003_storage_buckets.sql` | Storage buckets and policies |

---

## Future Features (Architecture Ready)

The codebase is structured to support future additions without modifying existing files:

- Ranking / leaderboard system
- Player statistics dashboard
- Club / team system
- Entry fees and online payments
- Live score updates
- Discord webhook integration
- Email notifications
- Global tournament support

---

## License

MIT
