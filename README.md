# 🏢 Project Management App — AI Agent Dashboard

> **Ultra-premium glassmorphism project management dashboard with built-in AI agent powered by Ollama.**

![Version](https://img.shields.io/badge/version-1.0.0-purple)
![React](https://img.shields.io/badge/React-19-3B82F6)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-8B5CF6)
![Vite](https://img.shields.io/badge/Vite-8.0-F59E0B)

---

## ✨ Features

- 🟣🔵🟡 **Gradient Glassmorphism UI** — Purple → Blue → Hot Yellow design language
- ⚡ **Project Grid View** — Beautiful card grid with lightning yellow accents
- 🏠 **Project Home View** — Full-screen project management for each project
- 🤖 **AI Agent Assistant** — Powered by Ollama (local LLM) with real-time chat
- 🧊 **Frosted Glass Effects** — backdrop-filter blur, embossed cards, premium shadows
- 📊 **7 Sample Projects** — Pre-loaded with stats, tasks, and progress tracking
- ✅ **Task Management** — Checkboxes, priorities, statuses, and filters
- 📱 **Responsive Layout** — Sidebar navigation with 4-panel workspace

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npx vite

# Open in browser
# http://localhost:5173
```

## 🤖 Setting Up the AI Agent

The AI panel connects to your **local Ollama** instance:

1. Install [Ollama](https://ollama.com)
2. Pull a model:
```bash
ollama pull llama3.2
```
3. Start Ollama (it runs on `localhost:11434`)
4. Refresh the app — the AI agent is now live!

## 🏗️ Project Structure

```
src/
├── components/
│   ├── AIPanel.tsx        # AI chat interface (Ollama-powered)
│   ├── ProjectGrid.tsx    # Card grid view (default)
│   ├── ProjectHome.tsx    # Full project detail view
│   └── Sidebar.tsx        # Gradient navigation sidebar
├── services/
│   └── ollama.ts          # Ollama API client
├── App.tsx                # Main app with view switching
├── App.css                # Complete glassmorphism styling
├── index.css              # CSS variables and global styles
├── main.tsx               # Entry point
└── types.ts               # Shared TypeScript interfaces
```

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| `--primary` | `#8B5CF6` | Purple accent |
| `--secondary` | `#3B82F6` | Blue accent |
| `--accent` | `#F59E0B` | Yellow accent |
| `--hot-yellow` | `#FFD700` | Lightning accents |
| `--glass-bg` | `rgba(255,255,255,0.72)` | Frosted glass |
| `--glass-blur` | `blur(16px)` | Backdrop blur |

## 🛠️ Build

```bash
npm run build     # Production build → dist/
npm run preview   # Preview production build
```

---

*Built with ❤️ using React, TypeScript, Vite & Ollama*
