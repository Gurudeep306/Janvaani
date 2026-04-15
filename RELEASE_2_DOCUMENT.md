# INDUSTRIAL SOFTWARE ENGINEERING
# RELEASE 2 DOCUMENT

**Date:** 15 April 2026  
**Project Title:** JanVaani AI — Smart Public Grievance System  
**Team Members:** Mangam Rajvardhan, Paidipati Gurudeep, Prince Kumar  
**GitHub:** https://github.com/Gurudeep306/Janvaani

---

## 1. PROBLEM STATEMENT

Reporting public grievances in India is still frustrating for most citizens. Existing complaint portals are clunky, only work in English or Hindi, and don't tell you which department your complaint should go to — so it sits in a queue no one checks. If you speak Telugu or Odia or Marathi, you're mostly out of luck. On top of that, there's no real way to track what happened to your complaint after you filed it.

We wanted to build something that actually works for regular people. An operator sits with the citizen, takes down their complaint in whatever language they speak, and the system handles everything else — figures out the language, picks the right department, sets a deadline, and generates a proper grievance document. No forms to fill, no bureaucratic runaround.

---

## 2. PROPOSED SOLUTION

JanVaani AI is an operator-assisted grievance filing system. The idea is simple: a government operator talks to the citizen, captures their complaint (by typing it or using voice dictation), and submits it. The backend does the heavy lifting:

- **Language detection** — a 9-layer pipeline that combines local script checks, dictionary matching, n-gram analysis, and 5 different AI models to figure out what language the citizen is speaking. This matters because a complaint in Telugu about water supply needs different routing than one in Hindi about electricity.
- **Department classification** — an AI synthesis agent reads the complaint and maps it to one of 10 government departments (Water, Electricity, Roads, Health, Police, Sanitation, Education, Revenue, Transport, General Administration).
- **SLA tracking** — each department has severity-based deadlines. A critical water complaint gets 4 hours, a low-priority education issue gets 10 days. The system calculates and tracks these.
- **Formal documentation** — the AI generates a proper formal grievance in English (for government records) and an operator script in the citizen's language (so the operator can confirm the filing).

The system also supports voice input through the browser's Web Speech API, GPS-based location capture, and ticket tracking — so citizens can come back and check on their complaint.

---

## 3. SYSTEM ARCHITECTURE

The system is a standard client-server setup with a React frontend and Node.js/Express backend, backed by a local SQLite database.

### Frontend (React SPA)
The operator portal is a single-page app built with React. It has three main modes:
- **Type Mode** — operator types the citizen's complaint manually
- **Voice Mode** — uses the Web Speech API to capture the citizen's speech directly
- **Track Mode** — look up an existing ticket by ID

It also captures GPS coordinates via the browser's Geolocation API and sends everything to the backend as a JSON payload.

### Backend (Node.js + Express)
The Express server handles 15 API endpoints. When a complaint hits `POST /analyze`, the server kicks off two things in parallel:

1. **Language Detection Pipeline (9 layers):**
   - L1: Unicode block analysis — if the text is in Telugu script, we know instantly
   - L3: N-gram signature matching
   - L4: Franc (statistical language identification library)
   - L5: Custom word dictionary + morpheme + phonetic heuristic matching (covers 30+ languages with ~100-400 keywords each)
   - L6: Llama-4-Scout-17B (via Groq)
   - L7: Llama-3.3-70B (via Groq)
   - L11: XLM-RoBERTa (via HuggingFace Inference API)
   - L12: Kimi-K2-Instruct (via Groq) — highest weight
   - L13: Qwen3-32B (via Groq)
   
   All AI layers fire in parallel. Each layer votes with a confidence score and a weight. The final language is decided by weighted vote fusion.

2. **Reverse Geocoding** — GPS coordinates → human-readable address via Nominatim/OpenStreetMap

Once the language is resolved, the text goes to the **AI Synthesis Agent** (Kimi-K2-Instruct as primary, with Qwen3-32B and Llama-4-Scout as fallbacks). This agent classifies the department, assigns severity, writes the formal grievance, and generates the operator script.

Everything gets saved to SQLite in a single atomic transaction across 4 tables.

### Database (SQLite with WAL)
Four normalized tables:
- `tickets` — main grievance record (35+ columns)
- `ticket_updates` — status change history
- `language_votes` — per-layer detection votes (for debugging/auditing)
- `word_detections` — individual word-level language matches

The database uses Write-Ahead Logging for concurrent read/write safety and foreign key constraints for referential integrity.

### Data Flow

```
Operator Input (text/voice + GPS)
        │
   POST /analyze
        │
   ┌────┴────┐
   │         │
Language   Reverse
Detection  Geocode
(9 layers) (Nominatim)
   │         │
   └────┬────┘
        │
  AI Synthesis Agent
  (Kimi-K2 → Qwen3 → Llama-4)
        │
  Atomic DB Transaction
  (4 tables)
        │
  JSON Response → Frontend
```

---

## 4. TECH STACK

**Frontend: React 19**  
Built as a single-page app using functional components and hooks. We used lucide-react for icons. The app handles three input modes (type, voice, track), manages form state, and renders the result card after filing. Voice dictation uses the browser's native Web Speech API — no external speech service needed.

**Backend: Node.js + Express 5**  
The server is a single `server.js` file (~1625 lines). It handles REST routing, coordinates the language detection pipeline, manages AI API calls with timeouts and fallbacks, and writes to the database. We use `cors` for cross-origin support and `dotenv` for environment variable management.

**Database: SQLite via better-sqlite3**  
We picked SQLite because it's zero-configuration and fast for our scale. `better-sqlite3` gives us synchronous reads which simplifies the code a lot. WAL mode is enabled for concurrent access. All writes happen inside transactions.

**AI/ML Services:**
- **Groq SDK** — We use Groq's free tier to run 4 different models: Kimi-K2-Instruct (language detection + primary synthesis), Qwen3-32B (detection + synthesis fallback), Llama-4-Scout-17B (detection + final fallback), and Llama-3.3-70B (detection only). All calls go through the `groq-sdk` npm package.
- **HuggingFace Inference API** — We call the `papluca/xlm-roberta-base-language-detection` model for an additional language detection vote. Uses the `@huggingface/inference` package.
- **Franc** — A local statistical language detection library. Gives us a baseline vote without any API call.
- **Custom NLP** — We built word dictionaries covering 30+ languages (Indian + international), morpheme pattern tables, phonetic heuristic rules, Unicode block detection, n-gram signatures, and Devanagari/Bengali script disambiguation logic. This is all local code, no API calls.

**APIs:**
- Nominatim/OpenStreetMap — reverse geocoding (GPS → address)

**Dev Tools:**
- GitHub for version control
- VS Code as the editor

---

## 5. TEAM ROLES

**P Gurudeep — Backend Developer**  
Built the entire Express server, including the 9-layer language detection pipeline, the AI synthesis agent with its fallback cascade, and the SQLite database schema. Handled all API integrations (Groq, HuggingFace, Nominatim). Designed the weighted voting system for language consensus and the department registry with SLA calculations. Also wrote the custom word dictionaries and phonetic heuristics for Indian languages.

**M Rajvardhan — Frontend Developer**  
Built the React operator portal from scratch — the three-mode interface (type/voice/track), form handling, API integration with the backend, and the result card rendering. Implemented voice dictation using the Web Speech API and GPS capture via the Geolocation API. Also handled multi-language UI strings (English, Hindi, Telugu) and the overall visual design using lucide-react icons.

**Prince Kumar — AI Integration Engineer**  
Worked on prompt engineering for the AI models — both the language detection prompts and the synthesis agent prompt. Tested different prompt formats to get consistent JSON output from the LLMs. Also helped with system data flow design, tested edge cases with various language inputs, and maintained the GitHub repository.

---

## 6. AI USAGE DECLARATION

**What was written by hand:**
- React component structure, state management, and UI layout
- Express server setup, routing, middleware
- SQLite schema design and transaction logic
- Word dictionaries and language heuristics (Unicode ranges, morpheme patterns, phonetic rules)
- Department registry with SLA mappings
- Weighted voting algorithm for language consensus

**Where AI tools helped:**
- Generating initial boilerplate for API integration (Groq SDK setup, HuggingFace calls)
- Debugging async/await issues and promise handling
- Suggesting error handling patterns
- Helping structure the prompt templates for the LLM calls
- Some CSS/styling suggestions

**AI tools we used:** ChatGPT, Claude, Gemini, GitHub Copilot

The core architecture decisions (multi-layer detection, weighted voting, fallback cascade, atomic transactions) were ours. AI tools mostly helped with implementation speed and debugging, not with the system design itself.

---

## 7. PROMPTS LOG

### Frontend Development

| # | Tool | What we asked for | Why | Result |
|---|------|-------------------|-----|--------|
| 1 | ChatGPT | JSON body parsing middleware for Express | req.body was coming as undefined | Used directly |
| 2 | Claude | POST route structure for complaint submission | Needed the basic route handler pattern | Used directly |
| 3 | Gemini | Input validation for empty/null complaint text | Wanted to catch bad inputs early | Used directly |
| 4 | ChatGPT | try-catch wrapper for async Express routes | Server was crashing on unhandled promise rejections | Used directly |
| 5 | Claude | Groq API integration pattern for Express | First time using the Groq SDK, needed the setup pattern | Partially used — we changed the model and prompt |
| 6 | Gemini | Helper function to call LLM and parse response | Wanted to separate the API call from the route handler | Used directly |
| 7 | ChatGPT | dotenv setup for API keys | Needed to stop hardcoding keys in the code | Used directly |
| 8 | Claude | Error handling for missing API keys at startup | Server should fail fast if keys aren't set | Used directly |
| 9 | Gemini | Department classification from LLM output | Wanted the AI to return a department name we could match | Partially used — we built our own registry instead |
| 10 | ChatGPT | Fallback logic when LLM returns bad JSON | Groq sometimes returns malformed responses | Used directly |
| 11 | Claude | Rule-based routing as backup to AI classification | AI routing alone wasn't reliable enough | Used directly |
| 12 | Gemini | Location-based routing for complaints | Wanted to factor in GPS data for department selection | Partially used — simplified it to just reverse geocoding |
| 13 | ChatGPT | JSON response structure for frontend | Needed a consistent format the React app could parse | Used directly |
| 14 | Claude | Refactoring large functions into smaller ones | server.js was getting hard to read | Used directly |
| 15 | Gemini | Standardizing response format across endpoints | Different endpoints were returning different shapes | Used directly |
| 16 | ChatGPT | Proper HTTP status codes (400, 404, 500) | We were returning 200 for everything | Used directly |
| 17 | Claude | 404 handler for undefined routes | Random paths were returning blank responses | Used directly |
| 18 | Gemini | Centralized error middleware | Repetitive try-catch in every route | Used directly |
| 19 | ChatGPT | Request logging for debugging | Needed to see what was hitting the server | Partially used — kept console.log, skipped the library suggestion |
| 20 | Claude | Fixing async/await in nested promise chains | Had a bug with promises not resolving | Used directly |
| 21 | Gemini | Input sanitization for complaint text | Security concern — user input going to LLM | Used directly |
| 22 | ChatGPT | Edge case test ideas for the API | Wanted to test with empty strings, special chars, very long text | Used directly |
| 23 | Claude | Improving routing accuracy | Department misclassification on ambiguous complaints | Partially used — ended up using multi-model consensus |
| 24 | Gemini | PORT from env variable | Hardcoded port was causing conflicts | Used directly |
| 25 | ChatGPT | Fallback response when geocoding fails | Nominatim was timing out sometimes | Used directly |

### Backend Development

| # | Tool | What we asked for | Why | Result |
|---|------|-------------------|-----|--------|
| 1 | Gemini | Import pattern for express, dotenv, etc. | Setting up the initial server file | Used directly |
| 2 | ChatGPT | dotenv config with custom path | .env file wasn't in the default location | Used directly |
| 3 | Claude | process.env.PORT with fallback | Needed configurable port | Used directly |
| 4 | Gemini | express.json() middleware setup | Request body parsing | Used directly |
| 5 | ChatGPT | CORS middleware configuration | Frontend on different port was getting blocked | Used directly |
| 6 | Claude | Server startup verification | Checking the basic setup worked | Used directly |
| 7 | Gemini | Router integration for complaint routes | Connecting route files to main app | Used directly |
| 8 | ChatGPT | Debugging mismatched route paths | Routes were 404-ing due to typos | Used directly |
| 9 | Claude | Postman testing setup | Needed to test endpoints without the frontend | Used directly |
| 10 | Gemini | Console logging for request debugging | Tracking request flow through the pipeline | Partially used |
| 11 | ChatGPT | Port-in-use error handling | EADDRINUSE crash on restart | Used directly |
| 12 | Claude | Global error middleware | Unhandled errors were killing the server | Used directly |
| 13 | Gemini | Code cleanup and import organization | File was getting messy | Used directly |
| 14 | ChatGPT | Fixing variable name typos | Runtime errors from misspelled variable names | Used directly |
| 15 | Claude | Verifying env variable usage | Making sure API keys were being read correctly | Used directly |
| 16 | Gemini | End-to-end flow testing | Checking frontend → backend → DB → response | Used directly |
| 17 | ChatGPT | Removing debug logs for production | Cleaning up before deployment | Used directly |

---

## 8. MILESTONES & TIMELINE

### Release 1 (March 2026)
- Identified the core problem — grievance filing is inaccessible for non-English speakers
- Built a basic React frontend with complaint input
- Set up the Express backend with initial Groq API integration
- Got a working end-to-end flow: input → AI analysis → response

### Release 2 (April 2026)
- Expanded language detection from a single AI call to a 9-layer pipeline with weighted voting
- Added 5 AI models for language detection (Kimi-K2, Qwen3-32B, Llama-4-Scout, Llama-3.3-70B, XLM-RoBERTa)
- Built custom word dictionaries for 30+ languages with ~7000 words total
- Implemented SQLite database with 4 normalized tables and atomic transactions
- Added 15 REST API endpoints (analyze, tickets CRUD, stats, word-analysis, detect-language, admin analytics, health check)
- Built the AI synthesis agent with a 3-model fallback cascade (Kimi-K2 → Qwen3-32B → Llama-4-Scout)
- Added voice input via Web Speech API
- Added GPS location capture and reverse geocoding
- Built ticket tracking with status history
- Added SLA deadline calculation per department and severity
- Created an admin dashboard with analytics
- Added support for code-mixed text detection (e.g., Hindi-English mixed)
- Built Devanagari disambiguation (Hindi vs Marathi vs Nepali vs Sanskrit etc.) and Bengali disambiguation (Bengali vs Assamese)

---

## 9. WHAT CHANGED FROM RELEASE 1 → RELEASE 2

The Release 1 goals were:
- Complete complaint workflow → **Done**
- 5+ REST endpoints → **Done** (we have 15)
- Database integration → **Done** (SQLite with 4 tables)
- Better AI classification accuracy → **Done** (9-layer consensus instead of single model)
- Multilingual support → **Done** (30+ languages with custom dictionaries)
- Authentication → **Not done** (deferred — not critical for the operator portal use case)
- Cloud deployment → **Not done** (still local, Docker setup is planned)

---

## 10. CURRENT API ENDPOINTS

| Method | Path | Purpose |
|--------|------|---------|
| POST | /analyze | Process a new grievance (language detection + AI synthesis + DB save) |
| GET | /tickets | List all tickets with filters (dept, severity, status, language, date range) |
| GET | /tickets/:id | Get a single ticket with full details and history |
| PATCH | /tickets/:id/status | Update ticket status (OPEN → IN_PROGRESS → RESOLVED etc.) |
| POST | /tickets/:id/notes | Add an internal note to a ticket |
| DELETE | /tickets/:id | Delete a ticket |
| GET | /stats | Dashboard statistics (counts by dept, severity, language, status) |
| GET | /tickets/:id/word-analysis | Get word-level language detection breakdown |
| POST | /detect-language | Standalone language detection (without filing a ticket) |
| GET | /developer/dashboard | Developer debug info |
| GET | /health | Health check with system status |
| GET | /admin/analytics | Admin analytics with trends and breakdowns |
| GET | /admin/departments/:dept | Department-specific ticket data |
| PATCH | /admin/tickets/bulk-status | Bulk status update for multiple tickets |
| GET | /admin | Admin dashboard HTML page |

---

## 11. CHALLENGES & HOW WE HANDLED THEM

**Language detection accuracy** — A single LLM would often misidentify romanized Indian languages (e.g., calling Telugu text "Hindi" because they look similar in Roman script). We fixed this by using multiple models and a weighted voting system. If 4 out of 5 AI models agree on Telugu, and the word dictionary also matches Telugu, that's the answer.

**Groq rate limits** — Free tier has limits. We stagger the API calls with 300ms delays between models and use timeouts to skip slow responses. If one model fails, the others still vote.

**Code-mixed text** — Citizens often mix languages ("paani nahi aa raha since 3 days"). We built a segment-level analysis that splits the text and detects language per segment, then reports the dominant language and flags the mix.

**Devanagari ambiguity** — Hindi, Marathi, Nepali, Sanskrit, Maithili, Konkani, and Dogri all use Devanagari script. Unicode detection alone can't tell them apart. We built a disambiguation layer with language-specific marker words (e.g., "आहे" → Marathi, "छ" → Nepali).

**LLM output consistency** — LLMs don't always return valid JSON. We added a `parseAIResponse` function that strips markdown code blocks, handles `<think>` tags from reasoning models, and falls back to regex extraction if JSON.parse fails.

---

## 12. FUTURE WORK

- Docker containerization for easy deployment
- Cloud hosting (likely Railway or Render for the free tier)
- SMS notifications to citizens when ticket status changes
- Authentication for the operator portal
- Batch processing for high-volume complaint intake
- Dashboard visualizations with charts
- Automated escalation when SLA deadlines are missed
