# 🚀 Meeting Summariser AI

![Logo](./assets/logo.png)

> **A premium,full-stack app for summarizing meetings, extracting action items, and analytics.**

---

![Screenshot - Dashboard](./assets/screenshot-dashboard.png)
![Screenshot - Login](./assets/screenshot-login.png)

---

## ✨ Features

- 🔒 **Firebase Authentication** (Google, Email/Password)
- 📄 **Upload Meeting Transcripts** (PDF, DOCX, TXT)
- 🤖 **AI-Powered Summaries** (LLM-generated, 5-bullet insights)
- ✅ **Action Items Extraction & CRUD**
- 📊 **Analytics Dashboard** (keywords, trends, charts)
- 🌗 **Dark & Light Mode** (Apple-style glassmorphism)
- 🖥️ **Modern, Responsive UI** (Inter font, glassy cards, micro-interactions)
- 👤 **User-specific Data**
- ⚡ **FastAPI Backend** (async, production-ready)
- 🛡️ **Secure, Scalable, Extensible**

---

## 🛠️ Tech Stack

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-4B5563?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)

---

## ⚡ Quickstart

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd Meeting\ Summariser
npm install
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Firebase Setup

- Create a Firebase project
- Enable Email/Password & Google Auth
- Download `firebase-admin-sdk.json` and place in `backend/`
- Copy your web config to `src/firebase.ts`

### 3. Run Backend (FastAPI)

```bash
cd backend
source venv/bin/activate
export DEVELOPMENT_MODE=true  # or false for prod
uvicorn main:app --reload --port 8001
```

### 4. Run Frontend (Vite + React)

```bash
npm run dev
# Open http://localhost:5173
```

---

## 🔥 API Overview

- `POST /api/meetings` — Upload transcript
- `GET /api/meetings` — List meetings
- `GET /api/meeting/{id}/summary` — Get summary
- `GET /api/meeting/{id}/action-items` — Get action items
- `POST /api/action-items` — Create action item
- `PUT /api/action-items/{id}` — Update action item
- `DELETE /api/action-items/{id}` — Delete action item
- `GET /api/analytics` — Get analytics

> All endpoints require Firebase JWT in `Authorization` header.

---

## 📁 Folder Structure

```
Meeting Summariser/
  backend/           # FastAPI backend
    api/             # API endpoints
    auth/            # Firebase JWT
    models/          # SQLAlchemy models
    services/        # LLM, analytics
    tasks/           # Background workers
    utils/           # Helpers
  src/               # React frontend
    components/      # UI components
    context/         # React context
    pages/           # App pages
    services/        # API calls
    types/           # TypeScript types
```

---

## 🤝 Contributing

1. Fork this repo
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push and open a PR

---

## 📜 License

[MIT](./LICENSE)

---

## 🙏 Credits

- [LangChain](https://github.com/langchain-ai/langchain)
- [Firebase](https://firebase.google.com/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [TailwindCSS](https://tailwindcss.com/)
- [Vercel](https://vercel.com/) (for deployment)

---
