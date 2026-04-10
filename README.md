# JanVaani AI: Grievance Intake Operator Tool

**JanVaani** (Voice of the People) is an advanced, AI-driven grievance redressal system designed for government operators. It allows operators to seamlessly record citizen complaints via voice or text in multiple Indian languages, automatically categorizes them, sets Service Level Agreement (SLA) deadlines, and routes them to the appropriate department using an innovative **8-Layer AI Language Detection Engine**.

## Key Features

### Frontend (Operator Portal)

- **Multilingual UI:** Native interface support for English, Hindi, Telugu, Tamil, Kannada, Bengali, Marathi, and Odia.
- **Speech-to-Text Integration:** Native browser speech recognition capturing citizen voices in 22 scheduled Indian languages + Auto-detect.
- **Smart Geolocation:** Automatic fetching and reverse-geocoding of the citizen's location (Lat/Long to District/State) using OpenStreetMap.
- **Live Ticket Tracking:** Real-time tracking of SLA status, escalation chains, and nodal officer assignments.

### Backend (AI & NLP Engine)

- **8-Layer Language Detection:** A highly resilient pipeline to detect code-mixed and transliterated Indian languages:
  1. _L1 Unicode Script Ranges_ (100% accurate for native scripts)
  2. _L3 N-gram Signature Matching_
  3. _L4 Franc Statistical NLP_
  4. _L5 Deep Word-Level Analysis_ (Custom dictionaries, phonetic heuristics, and morpheme matching)
  5. _L6 Groq Llama-4-Scout (17B)_
  6. _L7 Groq Llama-3.3-70B_
  7. _L8 Groq Llama-3.1-8B_
  8. _L11 HuggingFace XLM-RoBERTa_
- **AI Synthesis Agent:** Automatically translates raw multilingual grievances into formal English, assigns severity (CRITICAL to LOW), calculates SLA deadlines, and generates a localized confirmation script for the operator to read to the citizen.
- **Local SQLite Database:** Fast, WAL-mode enabled database (`better-sqlite3`) tracking tickets, status histories, language vote weights, and word-level detections.

---

## Tech Stack

**Frontend:** React.js, Web Speech API, Geolocation API
**Backend:** Node.js, Express.js
**Database:** SQLite3 (`better-sqlite3`)
**AI/ML:** Groq SDK (LLaMA models), HuggingFace Inference API, custom NLP heuristics.

---

## Installation & Setup

### Prerequisites

- Node.js (v18 or higher recommended)
- API Keys for Groq and Hugging Face

### 1. Clone the Repository

```bash
git clone [https://github.com/Gurudeep306/Janvaani.git](https://github.com/Gurudeep306/Janvaani.git)
cd Janvaani
```

### 2. Install the Dependencies

```bash
npm install
```

### 3. Run the Development Server

```bash
npm start
```

Once the command is running, the terminal will usually provide a local URL, such as http://localhost:3000
