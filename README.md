<p align="center">
  <img src="https://img.shields.io/badge/CodeX-The%20New%20Standard%20for%20Devs-blue?style=for-the-badge&labelColor=0a0a0a&color=2563eb" alt="CodeX Badge" />
</p>

<h1 align="center">
  CodeX
</h1>

<p align="center">
  A full stack competitive programming platform built to push developers beyond their limits.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_19-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Express_5-000000?style=flat-square&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/Gemini_AI-8E75B2?style=flat-square&logo=google&logoColor=white" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/Judge0-CE422B?style=flat-square&logoColor=white" alt="Judge0" />
  <img src="https://img.shields.io/badge/Razorpay-0C2451?style=flat-square&logo=razorpay&logoColor=white" alt="Razorpay" />
</p>

## Features

### Code Editor & Execution Engine

The core of CodeX. A fully integrated coding environment that feels like a real IDE, not a glorified text box.

| Capability | Description |
|---|---|
| **Monaco Editor** | VS Code-grade editor with syntax highlighting, autocomplete, and theming |
| **Multi-Language Support** | Write and submit in **JavaScript**, **C++**, or **Java** |
| **Judge0 Integration** | Remote code execution with batch test case evaluation against hidden + visible test cases |
| **Real-time Feedback** | Instant runtime, memory usage, and per-test-case pass/fail results |
| **Complexity Analyzer** | AI-powered Big-O time & space complexity analysis of your submitted code |

### AI-Powered DSA Tutor

Not a chatbot. A **context-aware tutor** that understands the exact problem you're solving.

- Gives **hints without spoiling the solution** — guides you to think, not copy
- Reviews your code with **line-by-line explanations** of bugs and inefficiencies
- Suggests **multiple algorithmic approaches** with complexity trade-offs
- Acts as a **test case helper** for edge case validation
- Strictly scoped to the current problem — no distractions, no off-topic wandering

### Virtual Mock Interviews

Simulates the pressure and pace of a real technical interview.

- Choose **interview type** (DSA, System Design, Behavioral) and **difficulty level**
- Progressive questioning that adapts based on your answers
- Evaluates correctness with **1-sentence explanations** — no fluff
- End-of-session **performance summary** with actionable improvement tips
- Feels human, responds fast, and never goes easy on you

### AI Resume Builder & Analyzer

An entire career toolkit, not just a form.

- **Build** a professional resume from scratch with guided sections
- **AI Analysis** — get strengths, weaknesses, and specific recommendations
- **Content Improver** — paste a bullet point, get back an ATS-optimized, impact-driven version
- **Improvement Suggestions** — 3 targeted suggestions per field, tuned to your section context
- **PDF Export** — generates a polished, print-ready HTML resume with professional styling

### Live Contests with Leaderboards

Compete globally. Track everything.

- **Timed contests** with start/end windows and real-time participation tracking
- **Multi-problem contest sets** — each contest bundles curated problems
- **Per-user metrics** — time taken, problems attempted, submissions per problem
- **Contest results page** with full leaderboard and performance breakdown
- Admin tools for **creating, managing, and deleting contests**

### Personal Dashboard & Analytics

Your entire coding journey, visualized.

- **Problems solved** breakdown by difficulty (Easy / Medium / Hard)
- **Streak tracking** — current streak, longest streak, last active date
- **Activity heatmap** based on submission history
- **Recent submissions** with status, runtime, and linked problem details
- **Contest participation** count and history

### Community Blog

A space for developers to share knowledge, stories, and raw experiences.

- Write with a **rich text editor** on topics like interviews, contests, careers, and more
- **Category filtering** — find posts relevant to your interests
- **Anonymous posting** — share without attaching your name
- **Likes & comments** — engage with the community
- Full **CRUD** — create, edit, and manage your own posts

### Course Promotions & Marketplace

A built-in promotion system for courses and resources.

- **Self-serve ad platform** — users can promote their courses with images and descriptions
- **Google Vision SafeSearch** integration for automated content moderation
- **Razorpay payment integration** for promo slot purchases
- **Slot-based system** with configurable duration (1 day, 1 week, 1 month)
- **Click tracking** and admin approval workflow

### Auth & Security

Production-grade authentication, not an afterthought.

- **JWT-based** session management with HTTP-only cookies
- **Bcrypt** password hashing
- **OTP verification** via email (Nodemailer)
- **Forgot password** flow with secure reset tokens
- **Role-based access control** — Admin vs User with protected routes on both frontend and backend
- **Profile pictures** via Cloudinary upload

### Admin Panel

Full control over the platform's content and operations.

- **Problem Management** — create problems with visible/hidden test cases, starter code in multiple languages, and reference solutions
- **Contest Management** — create and delete contests, assign problem sets
- **Video Management** — upload and manage solution videos per problem
- **Promo Moderation** — approve, reject, or remove course promotions
- **Blog Moderation** — manage community content

## Architecture

```
codex/
├── frontend/                    # React 19 + Vite 7
│   ├── src/
│   │   ├── pages/               # 16 page components
│   │   │   ├── Homepage          # Problem listing, search, filtering
│   │   │   ├── ProblemPage       # Code editor + test runner
│   │   │   ├── ContestEditorPage # Contest-mode problem solving
│   │   │   ├── DashboardPage     # Personal analytics & stats
│   │   │   ├── Interview         # Virtual mock interview interface
│   │   │   ├── Resume            # AI resume builder & analyzer
│   │   │   ├── PromotePage       # Course promotion marketplace
│   │   │   └── ...
│   │   ├── components/           # Reusable UI components
│   │   │   ├── problem/          # Editor panels, sidebar, results
│   │   │   ├── main/             # Blog cards, feed, promo sidebar
│   │   │   └── shared/           # Common components
│   │   ├── store/                # Redux Toolkit state management
│   │   ├── services/             # API service layer
│   │   ├── hooks/                # Custom React hooks
│   │   └── utils/                # Utility functions
│   └── ...
│
├── backend/                     # Express 5 + Node.js
│   ├── src/
│   │   ├── controllers/         # 13 controller modules
│   │   │   ├── userSubmission    # Code run & submit via Judge0
│   │   │   ├── solveDoubt        # AI DSA tutor (Gemini)
│   │   │   ├── interview         # Virtual interview bot (Gemini)
│   │   │   ├── resumeAnalysis    # Resume AI analysis & PDF gen
│   │   │   ├── problemAnalyzer   # Big-O complexity analyzer
│   │   │   ├── userDashboard     # Aggregated analytics pipeline
│   │   │   └── ...
│   │   ├── models/              # 7 Mongoose schemas
│   │   │   ├── user             # Users with roles & solved tracking
│   │   │   ├── problem          # Problems with test cases & solutions
│   │   │   ├── submission       # Code submissions with metrics
│   │   │   ├── contestModule    # Contests with participants & timing
│   │   │   ├── blog             # Community posts with engagement
│   │   │   └── ...
│   │   ├── routes/              # 12 route modules
│   │   ├── middleware/          # Auth, validation, file upload
│   │   └── config/              # DB, Cloudinary, environment
│   └── ...
```

## Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite 7, Redux Toolkit, TailwindCSS 4, DaisyUI 5, Monaco Editor, Recharts, Framer Motion |
| **Backend** | Node.js, Express 5, Mongoose, JWT, Bcrypt, Nodemailer |
| **Database** | MongoDB (primary), Redis (caching) |
| **AI** | Google Gemini 1.5 Flash — tutor, interviews, resume analysis, complexity analysis |
| **Code Execution** | Judge0 API — sandboxed multi-language code execution |
| **Payments** | Razorpay — course promo purchases |
| **Media** | Cloudinary — image/video upload & CDN |
| **Content Safety** | Google Cloud Vision — SafeSearch moderation for user-uploaded promo images |
| **Form Validation** | React Hook Form + Zod schema validation |

## What's Next

CodeX is actively evolving. Here's what's on the horizon:

- [ ] **Collaborative coding rooms** — solve problems together in real-time
- [ ] **Discussion forums** per problem — community solutions and debates  
- [ ] **Skill-based matchmaking** for contests
- [ ] **Weekly challenges** with curated problem sets
- [ ] **Dark/Light theme toggle** with system preference detection
- [ ] **Mobile-responsive** code editor experience
- [ ] **Webhooks & notifications** for contest reminders and streak alerts

<p align="center">
  <strong>Built with obsession by <a href="https://github.com/Ameysr">Amey</a></strong><br/>
  <sub>If it helped you, drop a ⭐ it fuels the grind.</sub>
</p>
