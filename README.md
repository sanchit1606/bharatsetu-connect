# 🇮🇳 BharatSetu — Bridging Every Indian to Information, Rights & Care

> An AI-powered public service platform built to empower 1.4 billion citizens. Free. Private. Multilingual.

**Built for AMD Slingshot 2026 | AI for Social Good**

---

## 🌐 Overview

BharatSetu is a free, multilingual AI platform that helps every Indian citizen understand their health reports, know their legal rights, report civic issues, and access the information that was always meant for them.

### 🛠️ Five AI-Powered Tools

| Tool | Description |
|------|-------------|
| **Label Auditor** | Scan food/cosmetic labels for instant health analysis against FSSAI & WHO standards |
| **CivicSense** | Report civic issues and get complaints routed to the right government authority |
| **Rights Assistant** | Upload legal documents and get plain-language explanations with cited Indian law |
| **Lab Report Analyzer** | Upload medical reports for color-coded, visual health breakdowns — zero data stored |
| **GynaeCare** | Anonymous, stigma-free women's health chatbot sourced from WHO, NHS & UNICEF |

---

## ⚙️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | React 18 |
| **Language** | TypeScript |
| **Build Tool** | Vite 5 |
| **Styling** | Tailwind CSS 3 |
| **UI Components** | shadcn/ui (Radix UI primitives) |
| **Animations** | Framer Motion |
| **Routing** | React Router v6 |
| **State Management** | TanStack React Query |
| **Forms** | React Hook Form + Zod validation |
| **Icons** | Lucide React |
| **Theming** | CSS custom properties + next-themes |
| **Charts** | Recharts |

---

## 🚀 Installation & Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm, yarn, or [bun](https://bun.sh/)

### Steps

```bash
# 1. Clone the repository
git clone <YOUR_GIT_URL>

# 2. Navigate to the project directory
cd bharatsetu

# 3. Install dependencies
npm install
# or
bun install

# 4. Start the development server
npm run dev
# or
bun run dev
```

The app will be available at **http://localhost:8080**

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run build:dev` | Build in development mode |
| `npm run preview` | Preview the production build |
| `npm run lint` | Run ESLint |
| `npm run test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |

---

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/              # shadcn/ui base components
│   ├── Header.tsx       # Global sticky header with theme toggle
│   ├── Footer.tsx       # Global footer
│   ├── HeroBackground.tsx   # Animated network node background
│   ├── ScrollReveal.tsx     # Intersection Observer scroll animations
│   ├── StatCounter.tsx      # Animated number counters
│   ├── ThemeToggle.tsx      # Light/Dark theme switcher
│   └── NavLink.tsx          # Navigation link component
├── pages/
│   ├── Index.tsx        # Landing page (/)
│   ├── Features.tsx     # Features deep-dive (/features)
│   ├── Docs.tsx         # Documentation placeholder (/docs)
│   └── Contact.tsx      # Contact page (/contact)
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── index.css            # Global styles & CSS custom properties
├── App.tsx              # Root component with routing
└── main.tsx             # Entry point
```

---


