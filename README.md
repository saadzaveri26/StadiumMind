
# ⚽ StadiumMind

### AI-Powered Smart Stadium &amp; Tournament Operations Platform

*Your intelligent companion for FIFA World Cup 2026™ — real-time navigation, AI concierge, and operational command in one unified interface.*

[![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

---

**Built for [PromptWars Challenge 4](https://promptwars.dev)**

</div>

---

## 🎯 Problem Statement

Managing a FIFA World Cup venue with 80,000+ spectators creates massive operational complexity — real-time crowd monitoring, incident response, multilingual fan assistance, and wayfinding all need to work simultaneously and seamlessly. Traditional stadium management tools are fragmented, monolingual, and reactive rather than predictive.

**StadiumMind** solves this by unifying AI-powered intelligence, live telemetry, and multilingual support into a single platform that serves both fans and stadium operators.

---

## ✨ Key Features

### 🗺️ Live Zone Navigation
- **Real-time zone telemetry** — occupancy percentages, status indicators (Nominal / Warning / Critical), and temperature monitoring across all stadium zones
- **AI-powered pathfinding** — Gemini generates step-by-step walking routes between any two zones, factoring in real-time crowd density
- **One-click telemetry seeding** — initialize demo zone data with a single button press

### 🤖 AI Concierge Assistant
- **Powered by Gemini 2.5 Flash** — context-aware responses grounded in live stadium telemetry
- **Parallel inference** — simultaneous generation of the reply and 3 follow-up suggestions for faster UX
- **Voice input** — Web Speech API integration with locale-aware recognition across all 6 supported languages
- **Suggestion chips** — quick-access prompts for common queries (restrooms, match info, concessions, exits)

### 🛡️ Operations Dashboard (Staff-Only)
- **Role-based access** — Google OAuth with Firebase custom claims (`staff` role) restricts the ops dashboard to authorized personnel
- **AI alert generation** — Gemini analyzes current zone telemetry and generates prioritized threat assessments (HIGH / MEDIUM / LOW severity)
- **Incident logging** — staff can report, track, and resolve operational incidents in real-time
- **Zone occupancy table** — live monitoring of all zones with color-coded status badges

### 🌍 Multilingual Support
Full UI localization in **6 languages** reflecting the global nature of the World Cup:

| Language | Code | Voice Input |
|----------|------|-------------|
| 🇬🇧 English | `en` | `en-US` |
| 🇪🇸 Spanish | `es` | `es-ES` |
| 🇫🇷 French | `fr` | `fr-FR` |
| 🇵🇹 Portuguese | `pt` | `pt-PT` |
| 🇸🇦 Arabic | `ar` | `ar-SA` |
| 🇮🇳 Hindi | `hi` | `hi-IN` |

### 🔒 Security & Accessibility
- **Zod input validation** and **rate limiting** on every API route from day one
- **Content Security Policy**, **X-Frame-Options: DENY**, **X-Content-Type-Options: nosniff**
- **COOP: same-origin-allow-popups** for secure OAuth popup flow
- **Skip-navigation link**, proper `aria-labels`, heading hierarchy, and `aria-live` regions

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│  Next.js 16 App Router · React 19 · Tailwind CSS v4        │
│  shadcn/ui · Framer Motion · Material Symbols               │
├─────────────────────────────────────────────────────────────┤
│                      API ROUTES                             │
│  /api/assistant/chat    → Gemini 2.5 Flash (AI Concierge)  │
│  /api/navigate/route    → Gemini pathfinding + Firestore   │
│  /api/zones/seed        → Initialize demo zone telemetry   │
│  /api/zones/summary     → Aggregate zone statistics        │
│  /api/zones/update      → Update zone telemetry            │
│  /api/ops/alerts/generate → AI threat assessment           │
│  /api/incidents/log     → Incident CRUD (authenticated)    │
├─────────────────────────────────────────────────────────────┤
│                     BACKEND SERVICES                        │
│  Firebase Auth (Google OAuth) · Firestore (NoSQL DB)       │
│  Gemini 2.5 Flash (AI inference) · Vercel (Hosting)        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 20
- **npm** ≥ 10
- A **Firebase project** with Authentication (Google provider) and Firestore enabled
- A **Gemini API key** from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone & Install

```bash
git clone https://github.com/saadzaveri26/StadiumMind.git
cd StadiumMind
npm install
```

### 2. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Client-Side Firebase (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Server-Side Firebase Admin
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Server-Side Gemini
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the app is ready.

### 4. Initialize Demo Data

Navigate to the **Navigate** page → click **"Initialize Telemetry"** to seed Firestore with sample zone data.

---

## 📁 Project Structure

```
StadiumMind/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Landing — venue selector + live metrics
│   │   ├── assistant/          # AI Concierge chat interface
│   │   ├── navigate/           # Live zone map + pathfinding
│   │   ├── ops/                # Staff-only operations dashboard
│   │   └── api/                # 7 serverless API route handlers
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # shadcn/ui primitives (Button, Card, etc.)
│   │   ├── ChatBubble.tsx      # Chat message rendering
│   │   ├── ZoneCard.tsx        # Zone telemetry card
│   │   ├── AlertCard.tsx       # AI alert severity card
│   │   ├── RouteCard.tsx       # Pathfinding result display
│   │   ├── IncidentRow.tsx     # Incident log entry
│   │   ├── VoiceInputButton.tsx # Web Speech API voice input
│   │   ├── LanguageSelector.tsx # 6-language switcher
│   │   ├── SuggestionChip.tsx  # Quick-action chip
│   │   └── NavigationLayout.tsx # App shell with nav bar
│   ├── context/                # React contexts
│   │   ├── AuthContext.tsx     # Firebase Auth + staff role detection
│   │   └── LanguageContext.tsx # i18n language persistence
│   └── lib/                    # Shared utilities
│       ├── firebase.ts         # Client-side Firebase init
│       ├── firebase-admin.ts   # Server-side Admin SDK init
│       ├── gemini.ts           # Gemini model configuration
│       ├── rateLimit.ts        # In-memory rate limiter
│       ├── validation.ts       # Zod schemas for all API inputs
│       ├── translations.ts     # 6-language translation strings
│       ├── zoneData.ts         # Zone status computation logic
│       └── hooks/              # Custom React hooks
├── vercel.json                 # Vercel deployment config (Mumbai region)
├── Dockerfile                  # Docker multi-stage build (Cloud Run fallback)
├── cloudbuild.yaml             # GCP Cloud Build CI/CD (Cloud Run fallback)
├── next.config.ts              # Next.js config with security headers
├── tailwind.config.ts          # Tailwind CSS v4 configuration
├── jest.config.ts              # Jest testing configuration
└── package.json                # Dependencies & scripts
```

---

## 🧪 Testing

```bash
# Run all tests with coverage
npm test

# Run tests in watch mode
npx jest --watch
```

Tests cover:
- **API route handlers** — validation, rate limiting, error responses
- **Components** — ChatBubble rendering, ZoneCard states, LanguageSelector behavior
- **Utilities** — rate limiter logic, zone data computations

---

## ☁️ Deployment

### Vercel (Primary)

The app is configured for Vercel with the Mumbai (`bom1`) region for lowest latency:

1. Import `saadzaveri26/StadiumMind` on [vercel.com/new](https://vercel.com/new)
2. Vercel auto-detects Next.js — accept all defaults
3. Add all environment variables from `.env.local` to the Vercel dashboard
4. Deploy

> **Important:** After deploying, add your Vercel domain to **Firebase Console → Authentication → Authorized Domains** for Google OAuth to work.

### Docker / Cloud Run (Fallback)

The repo retains `Dockerfile` and `cloudbuild.yaml` for GCP Cloud Run deployment if needed:

```bash
docker build -t stadiummind .
docker run -p 3080:3080 --env-file .env.local stadiummind
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript (strict mode) |
| **UI Components** | shadcn/ui + Radix primitives |
| **Styling** | Tailwind CSS v4 |
| **Animations** | Framer Motion |
| **Icons** | Material Symbols Outlined |
| **Auth** | Firebase Authentication (Google OAuth) |
| **Database** | Cloud Firestore |
| **AI** | Gemini 2.5 Flash |
| **Validation** | Zod |
| **Testing** | Jest + React Testing Library |
| **Hosting** | Vercel (Mumbai region) |

---

## 📡 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/assistant/chat` | None | AI Concierge — send a message, get a reply + follow-ups |
| `POST` | `/api/navigate/route` | None | AI pathfinding between two stadium zones |
| `POST` | `/api/zones/seed` | None | Initialize Firestore with demo zone telemetry |
| `GET` | `/api/zones/summary` | None | Aggregate zone occupancy and critical counts |
| `POST` | `/api/zones/update` | None | Update a zone's telemetry data |
| `POST` | `/api/ops/alerts/generate` | Bearer Token | AI-generated threat alerts from live telemetry |
| `POST` | `/api/incidents/log` | Bearer Token | Log a new operational incident |

All routes include **Zod input validation** and **rate limiting** (60 requests/minute per IP).

---

## 👤 Author

**Saad Zaveri**

- GitHub: [@saadzaveri26](https://github.com/saadzaveri26)

---

## 📄 License

This project was built for the **PromptWars Challenge 4** hackathon.

---

<div align="center">

*Built with ❤️ and Gemini for the beautiful game* ⚽

</div>
