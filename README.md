# 🤖 AI Interview Coach

An AI-powered mock interview practice platform designed to help students, freshers, and job seekers ace campus placement drives and technical interviews.

## ✨ Features

- **Realistic AI Interviewer**: Professional interactive mock interviews with speech synthesis and human-like conversational delivery.
- **Microphone & Speech-To-Text**: Hands-free voice answers with automated technical vocabulary normalization (e.g. HTML, CSS, React, SQL, API).
- **Manual & Auto-Advance Control**: Take as much time as you need without being cut off unexpectedly, with an optional 8-second auto-next mode.
- **In-Depth Mistakes Breakdown (कहाँ गलती हुई)**: AI hiring panel analysis detailing high/medium impact gaps, missing industry terms, and actionable step-by-step corrections.
- **💡 "What You Should Say" Simple Model Answers (बोलना क्या था)**: 2–3 simple, conversational English sentences for every question with built-in **Listen (Audio playback)** and **Copy** buttons.
- **AI Video Proctoring**: Eye contact percentage, facial posture detection, and composure feedback.
- **Interview History & Performance Analytics**: Review past interview sessions, questions, verbal scores, and improvement tips.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), CSS3 (Modern Glassmorphic & Executive Conference UI), Web Speech API
- **Backend**: Node.js, Express.js, Google Gemini API
- **AI Models**: Google Gemini 2.5/Flash for evaluation, mistake diagnostics, and model answer generation

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- Google Gemini API Key

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Add your GEMINI_API_KEY in .env
npm start
```
The backend server runs on `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

## 📄 License
ISC
