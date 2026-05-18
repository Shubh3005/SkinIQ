# SkinIQ

**A dermatologist in your pocket.** SkinIQ scans a photo of your skin and classifies the condition using a deep learning model trained on the HAM10000 dataset, then pairs the result with personalized skincare routines and longitudinal progress tracking.

🔗 **Live demo:** [skin-iq.vercel.app](https://skin-iq.vercel.app)

> **Medical Disclaimer:** SkinIQ is not a medical device and does not provide medical advice. Results are for informational purposes only. The underlying model was trained on dermoscopy images — not standard camera photos — and has meaningful accuracy limitations. Always consult a qualified dermatologist for any skin concern.

---

## Features

- **Skin scan** — upload or capture a photo; the ML backend classifies the condition and returns skin type, skin tone, detected condition, and clinical urgency
- **Skincare routines** — personalized morning and evening routine steps based on your skin type, with a daily completion tracker
- **Routine calendar** — monthly calendar with adherence visualization (morning / evening / both / none) and streak tracking
- **Scan history** — all past scans stored per-user with thumbnails, date, and full details on tap
- **Progress tracking** — view scan history over time to observe how your skin changes
- **Achievements** — streak milestones unlock badges (3, 7, 14, 30 days) *(coming soon)*
- **SkinCare AI chat** — conversational assistant for skincare questions *(coming soon)*
- **Authentication** — email/password sign-up and sign-in via Supabase Auth

---

## Tech Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite 5 |
| Styling | Tailwind CSS 3, ShadCN UI |
| Animation | Framer Motion |
| Charts | Recharts 2.12 |
| Routing | React Router 6 |
| Backend client | Supabase JS SDK v2 |

### Backend (ML Inference)
| Layer | Technology |
|---|---|
| API framework | FastAPI |
| Model | EfficientNet-B3 (PyTorch) |
| Weights host | HuggingFace Hub (`sgupta7049/skiniq-efficientnet-b3`) |
| Inference runtime | CPU-only PyTorch 2.3 |
| Deployment | Railway (Docker) |

### Infrastructure
| Service | Role |
|---|---|
| Supabase | PostgreSQL database, Auth, Row Level Security, Edge Functions |
| Vercel | Frontend hosting |
| Railway | FastAPI backend hosting |
| HuggingFace Hub | Model weight storage and download |

---

## Architecture Overview

```
Browser (Vercel)
│
├── React SPA
│   ├── Supabase JS SDK ──► Supabase (Auth + Postgres + RLS)
│   │                        ├── profiles
│   │                        ├── skin_scan_history
│   │                        ├── routine_logs
│   │                        ├── chat_history
│   │                        └── achievements
│   │
│   └── fetch ──► FastAPI (Railway)
│                  ├── POST /predict   ← base64 image
│                  │    └── EfficientNet-B3 (weights from HuggingFace Hub)
│                  └── GET  /health
```

The frontend sends a base64-encoded image to the FastAPI `/predict` endpoint. The backend runs EfficientNet-B3 inference and returns a structured JSON response. Results are then saved to Supabase by the frontend.

---

## ML Model

### Model Card

| Property | Value |
|---|---|
| Architecture | EfficientNet-B3 |
| Dataset | HAM10000 (Skin Cancer MNIST) |
| Task | 7-class skin condition classification |
| Validation accuracy | ~63% |
| Macro F1 | 0.66 |
| Input size | 224 × 224 px, ImageNet normalization |
| Weights | HuggingFace Hub: `sgupta7049/skiniq-efficientnet-b3` |

### Classes

| Code | Condition | Clinical Urgency |
|---|---|---|
| `akiec` | Actinic Keratosis | Moderate |
| `bcc` | Basal Cell Carcinoma | High |
| `bkl` | Benign Keratosis | Low |
| `df` | Dermatofibroma | Low |
| `mel` | Melanoma | High |
| `nv` | Melanocytic Nevus | Low |
| `vasc` | Vascular Lesion | Low |

### Known Limitations

- **Dermoscopy vs. camera photos:** HAM10000 was captured using dermoscopes — specialized medical imaging devices. SkinIQ accepts standard camera photos. This domain gap meaningfully degrades real-world accuracy.
- **63% validation accuracy** on a 7-class problem means roughly 1 in 3 predictions is incorrect even under ideal conditions.
- **Class imbalance:** HAM10000 is heavily skewed toward `nv` (melanocytic nevus). The model may over-predict that class.
- **Skin tone bias:** HAM10000 underrepresents darker skin tones. Performance on deeper skin tones is likely lower than the reported aggregate metrics.
- **Not a diagnostic tool.** Do not use SkinIQ output to make health decisions.

---

## Local Setup

### Prerequisites

- Node.js 18+
- Python 3.11+
- A Supabase project ([supabase.com](https://supabase.com))

### 1. Clone and install frontend

```bash
git clone https://github.com/Shubh3005/SkinIQ.git
cd SkinIQ
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-public-key>
VITE_AI_ENDPOINT=http://localhost:8000
```

> Use the **anon public** key from Supabase Dashboard → Project Settings → API. Never use the service_role key in frontend code.

### 3. Set up the database

In the Supabase SQL editor, run in order:

```
supabase/migrations/001_schema.sql
supabase/migrations/002_rls.sql
```

Also disable email confirmation for local development: Supabase Dashboard → Authentication → Providers → Email → **Confirm email: OFF**.

### 4. Run the FastAPI backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

Model weights are downloaded automatically from HuggingFace Hub on first startup (~85 MB). No environment variables required.

### 5. Start the frontend

```bash
# from project root
npm run dev
```

App runs at `http://localhost:5173`.

---

## Backend Deployment (Railway)

The `backend/` directory contains a `Dockerfile`. Deploy via Railway:

1. Create a new Railway project pointed at the `backend/` directory
2. Railway builds and runs the Docker image automatically
3. Copy the Railway public URL and set it as `VITE_AI_ENDPOINT` in Vercel

Model weights download from HuggingFace Hub on container startup. No volumes or secrets required.

---

## Project Structure

```
SkinIQ/
├── src/
│   ├── pages/
│   │   ├── Index.tsx           # Home — routine calendar
│   │   ├── SkinAnalyzer.tsx    # Scan page
│   │   ├── Profile.tsx         # Profile + scan history
│   │   ├── SkinCareAI.tsx      # AI chat
│   │   └── Auth.tsx            # Sign in / register
│   ├── components/
│   │   ├── routine-calendar/   # Calendar, daily steps, useRoutineCalendar hook
│   │   ├── skin-analyzer/      # Camera, results, useSkinAnalysis hook
│   │   └── profile/            # Scan history card, profile forms
│   └── contexts/
│       └── AuthContext.tsx
├── backend/
│   ├── main.py                 # FastAPI app, lifespan model loading
│   ├── model.py                # EfficientNet-B3 inference, HuggingFace download
│   ├── requirements.txt
│   └── Dockerfile
└── supabase/
    ├── migrations/
    │   ├── 001_schema.sql      # 5 tables: profiles, skin_scan_history, chat_history, achievements, routine_logs
    │   └── 002_rls.sql         # Row Level Security policies
    └── functions/              # Edge functions (fallback predict, history)
```

---

## License

MIT
