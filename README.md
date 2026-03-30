# Framr ✦
### *Where every frame earns its place.*

A dark editorial photo-sharing platform where AI decides what belongs in the public gallery. Every upload is analysed by Claude — generating poetic captions, tagging emotional mood, and scoring technical quality before a photo ever reaches the feed.

---


## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| Backend | Node.js + Express |
| Database | MongoDB Atlas |
| Auth | JWT + bcryptjs |
| Image Storage | ImageKit CDN |
| AI | Anthropic Claude API |
| Scheduling | node-cron |
| Deployment | Render + Vercel |

---

## What Makes Framr Different

Every other photo platform lets anyone post anything. Framr doesn't. Every photo passes through an AI quality gate before it reaches the public feed. Bad photos are blocked automatically — no moderation needed. The feed stays beautiful by design.

### ✦ Unique Features
- **AI Quality Gate** — Claude scores every upload 0–100. Below 50 = blocked from public feed automatically
- **AI Caption Generation** — 3 poetic editorial captions suggested per upload. User picks one or writes their own
- **AI Mood Tagging** — each post tagged with emotional tones (serene, melancholy, electric etc.) — feed is filterable by mood
- **Star of the Week** — every Monday a cron job picks the top post by weighted score (likes × 1 + quality × 3) — winner gets 500 points + permanent gold star badge on their profile
- **Thought Posts** — text-only posts styled as typographic cards alongside photos

### Standard Features
- JWT auth (register, login, persistent sessions)
- Public + private posts
- Like system with points
- Follow / unfollow
- Reputation tiers (Observer → Framer → Curator → Luminary → Master)
- Hall of Fame — all Star of the Week winners
- User profiles with post grid, stats, star badges
- Edit profile (username, bio, avatar)
- Mood-filtered feed
- Dark gold editorial UI

---

## Project Structure

```
Framr/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── post.controller.js
│   │   │   └── user.controller.js
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js
│   │   │   └── upload.middleware.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   └── Post.js
│   │   ├── routes/
│   │   │   ├── auth.routes.js
│   │   │   ├── post.routes.js
│   │   │   └── user.routes.js
│   │   ├── services/
│   │   │   ├── claude.service.js
│   │   │   └── imagekit.service.js
│   │   └── jobs/
│   │       └── starOfWeek.job.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── frontend/
    └── src/
        ├── components/
        │   ├── Navbar.jsx
        │   └── ProtectedRoute.jsx
        ├── context/
        │   └── AuthContext.jsx
        ├── pages/
        │   ├── CoverPage.jsx
        │   ├── Feed.jsx
        │   ├── CreatePost.jsx
        │   ├── Login.jsx
        │   ├── Signup.jsx
        │   ├── Profile.jsx
        │   ├── EditProfile.jsx
        │   └── HallOfFame.jsx
        ├── App.jsx
        └── main.jsx
```

---

## API Reference

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /api/auth/register | Public | Create account |
| POST | /api/auth/login | Public | Login, receive JWT |
| GET | /api/auth/me | Protected | Get current user |

### Posts
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /api/posts | Public | Public feed |
| GET | /api/posts/hall-of-fame | Public | Star of Week winners |
| GET | /api/posts/user/:userId | Public | User's posts |
| POST | /api/posts | Protected | Create post + trigger AI |
| POST | /api/posts/:id/like | Protected | Toggle like |
| DELETE | /api/posts/:id | Protected | Delete own post |

### Users
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /api/users/:username | Public | Get profile |
| PUT | /api/users/edit | Protected | Edit profile |
| POST | /api/users/:id/follow | Protected | Follow / unfollow |

---

## Points System

| Action | Points |
|--------|--------|
| Post approved — score ≥ 75 | +10 |
| Post approved — score 50–74 | +3 |
| Someone likes your post | +2 |
| Someone follows you | +8 |
| Win Star of the Week | +500 |

### Reputation Tiers
| Points | Tier |
|--------|------|
| 0–99 | Observer |
| 100–499 | Framer |
| 500–1499 | Curator |
| 1500–4999 | Luminary |
| 5000+ | Master |

---

## Environment Variables

Create `backend/.env`:

```bash
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/framr
JWT_SECRET=your_long_random_secret_key
JWT_EXPIRES_IN=7d
IMAGEKIT_PUBLIC_KEY=public_xxxxxxxxxxxx
IMAGEKIT_PRIVATE_KEY=private_xxxxxxxxxxxx
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx
FRONTEND_URL=http://localhost:5173
PORT=5000
```

---

## Local Setup

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Visit `http://localhost:5173`

---

## Deployment

### Backend → Render.com
1. Push to GitHub
2. Render → New Web Service → connect repo
3. Root directory: `backend`
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add all `.env` variables in Render dashboard

### Frontend → Vercel
1. Vercel → New Project → connect repo
2. Root directory: `frontend`
3. Replace all `http://localhost:5000` with your Render URL
4. Deploy

---

## Future Enhancements

**AI** — semantic natural language search using CLIP embeddings, AI style transfer preview before upload, smart auto-collections, thought post AI refinement

**Social** — collaborative albums, anonymous reactions, direct messages, post scheduling UI

**Visual** — three themes (Noir / Amber / Paper), masonry grid layout, full-screen lightbox, View Transitions API morphing between feed and full view

**Platform** — PWA support, PDF zine export, EXIF metadata display, browser extension to clip images from the web

---
