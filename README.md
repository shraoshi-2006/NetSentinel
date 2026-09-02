# 🛡️ NetSentinel

<p align="center">
  <strong>Autonomous Network & Web Vulnerability Assessment Platform</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Next.js_15-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Python_3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge" alt="License" />
</p>

---

## 📌 Overview

**NetSentinel** is an enterprise-grade, defensive cybersecurity scanner and security posture management platform. It allows security analysts, engineers, and developers to perform controlled, in-depth vulnerability assessments against domains and IP addresses, calculate comprehensive security posture scores, and track remediation over time.

Built with a high-performance **FastAPI** backend and an animated, responsive **Next.js 15** dark-mode frontend, NetSentinel combines port discovery, service fingerprinting, DNS security checks, HTTP header analysis, and dynamic 100-point security grading into an intuitive, unified dashboard.

---

## ✨ Key Features

### 1. 🎯 Comprehensive Vulnerability & Port Scanner
- **Dual-Engine Scanning**: Combines Python socket probing with deep Nmap inspection for rapid discovery and detailed service fingerprinting.
- **Protocol Analysis**: Inspects open ports, exposed services, banners, and protocol versions across common and high-risk network ports.
- **Web & DNS Auditing**: Evaluates HTTP security headers (HSTS, CSP, X-Frame-Options, etc.), analyzes DNS records, and checks for DNSSEC configuration.
- **CVE & Threat Enrichment**: Maps discovered services to known Common Vulnerabilities and Exposures (CVEs) and calculates contextual severity ratings.
- **Asynchronous Execution**: Scans execute smoothly in the background via non-blocking tasks, ensuring instant UI responsiveness.

### 2. 📊 Dynamic 100-Point Security Score Engine
- **Transparent Formula**: Calculates an exact security posture score from 0 to 100 based on discovered vulnerabilities, severity weights, and risky open ports.
- **Grading Tiers**:
  - `90 – 100` → **Excellent** (Hardened perimeter)
  - `75 – 89` → **Good** (Minor exposure)
  - `60 – 74` → **Moderate** (Action recommended)
  - `40 – 59` → **Poor** (Significant risks detected)
  - `0 – 39` → **Critical** (Immediate remediation required)
- **6 Sub-Category Metrics**: Detailed breakdown bars for **Network**, **Port**, **Service**, **Vulnerability**, **Configuration**, and **Web Security**.
- **Actionable Remediation**: Prioritized recommendations (Urgent, High, Medium) with step-by-step guidance.
- **Longitudinal Trend Chart**: Interactive SVG score trajectory tracking security improvements across scans.

### 3. 🔒 Isolated Private Sessions (Zero-Friction Privacy)
- **Automatic User Keys**: Each visitor is automatically assigned a unique, cryptographically random workspace key (`usr_...`) stored locally in their browser.
- **Strict Data Isolation**: Scan history, targets, findings, and security scores are completely private to the active key. Outsiders visiting the deployed link cannot view someone else's scans.
- **Per-User Sequential Numbering**: Every user's scans are numbered `#1`, `#2`, `#3`... starting from `#1` specifically for their workspace.
- **Cross-Device Sync**: Users can copy their User Key in **Settings** &rarr; **Profile & Security** and paste it on any device to sync their scans.

### 4. ⚡ Modern SOC-Grade Dashboard
- **Live Metrics**: Dynamically calculated KPIs (Total Scans, Critical Findings, Safe Targets, Average Scan Time).
- **Scan Detail Explorer**: Comprehensive drill-down reports for individual targets with severity badges and port summaries.
- **One-Click JSON Export**: Download raw, structured audit reports for compliance documentation or offline analysis.
- **Notification Hub**: Dedicated management interface for Slack, Email, and Webhook alert channels.

---

## 🏗️ Architecture & Tech Stack

```
NetSentinel
├── frontend/                  # Next.js 15 App Router Frontend
│   ├── app/                   # App routes (Dashboard, Scans, Security Score, Settings)
│   ├── components/            # Reusable UI widgets (WorkspaceBadge, etc.)
│   ├── lib/                   # API client (Axios with X-User-ID interceptors) & User Session
│   └── public/                # Static assets
│
└── backend/                   # FastAPI Python REST API
    ├── app/
    │   ├── api/endpoints/     # REST routers (scans, security_score, targets)
    │   ├── core/              # Settings & environment configuration
    │   ├── db/                # SQLAlchemy session & models
    │   ├── models/            # Scan, Target, Finding, Port ORM models
    │   ├── schemas/           # Pydantic validation & response schemas
    │   └── services/scanner/  # Nmap engine, risk score, security score algorithm
    ├── tests/                 # Automated test suite (user isolation, sequential numbering)
    └── netsentinel.db         # Local SQLite storage (PostgreSQL in production)
```

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS, Lucide Icons, Axios |
| **Backend** | Python 3.10+, FastAPI, SQLAlchemy, Pydantic v2, Starlette |
| **Security Engines** | Socket Scanner, python-nmap, dnspython, httpx, CVE Engine |
| **Database** | PostgreSQL (Production) / SQLite (Local development) |
| **Deployment** | Vercel (Frontend), Render (Backend), Docker Compose |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- **Node.js 18+** & `npm`
- **Python 3.10+**
- **Nmap** installed on your system (optional for basic socket scanning, recommended for deep fingerprinting)

---

### 1. Clone the Repository
```bash
git clone https://github.com/shraoshi-2006/NetSentinel.git
cd NetSentinel
```

---

### 2. Backend Setup
```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
# On Windows (PowerShell):
.venv\Scripts\Activate.ps1
# On Linux / macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the development server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The backend API will be live at `http://localhost:8000`.
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **ReDoc Documentation**: `http://localhost:8000/redoc`

---

### 3. Frontend Setup
In a separate terminal:
```bash
cd frontend

# Install packages
npm install

# Set local environment variable
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start Next.js development server
npm run dev
```
Open your browser and navigate to **`http://localhost:3000`**.

---

### 4. Running with Docker Compose
If you prefer running everything in containers:
```bash
docker-compose up -d --build
```
- Dashboard: `http://localhost:3000`
- API Docs: `http://localhost:8000/docs`

---

## 🧪 Automated Testing

NetSentinel includes a dedicated pytest test suite validating multi-tenant isolation, scoring models, and sequential numbering:

```bash
cd backend
.venv\Scripts\python.exe -m pytest tests/
```
Included test suites:
- `tests/test_user_isolation.py`: Verifies that distinct users cannot access each other's scans or security scores.
- `tests/test_sequential_scan_numbers.py`: Verifies that each user's scans count up from `#1` independently.
- `tests/test_security_score.py`: Verifies the 100-point security score deduction engine and sub-category weights.

---

## ☁️ Deployment Guide

### Deploying the Backend on Render
1. Create a **Web Service** on [Render](https://render.com) connected to your repository.
2. Set the following configuration:
   - **Root Directory**: `backend`
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Add Environment Variables in Render:
   - `DATABASE_URL`: Your PostgreSQL connection string (or use Render PostgreSQL).
   - `SECRET_KEY`: A random secure string.

### Deploying the Frontend on Vercel
1. Import your repository into [Vercel](https://vercel.com).
2. Set the following configuration:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Next.js`
3. Add Environment Variables in Vercel:
   - `NEXT_PUBLIC_API_URL`: Your deployed Render backend URL (e.g. `https://your-backend.onrender.com`).
4. Click **Deploy**.

---

## 📡 API Reference

All scan requests automatically scope to the user passed in the `X-User-ID` header.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/scans` | Launch a new quick or full security scan on a target |
| `GET` | `/api/v1/scans` | Retrieve user's scan history (filtered by `X-User-ID`) |
| `GET` | `/api/v1/scans/{id}` | Fetch full scan details, ports, and findings by ID |
| `GET` | `/api/v1/security-score` | Calculate dynamic 100-pt security score and posture trends |
| `GET` | `/api/v1/targets` | List all discovered targets |

---

## ⚖️ Authorization & Legal Disclaimer

> [!WARNING]
> **NetSentinel is designed strictly for defensive cybersecurity assessments, authorized penetration testing, and personal infrastructure monitoring.**
> 
> Testing targets without explicit prior authorization from the system owner is illegal and violates computer crime laws. The developers and contributors of this software assume no liability for misuse, damages, or unintended consequences resulting from the use of this tool.

---

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE).

<p align="center">
  <sub>Built with ❤️ for cybersecurity professionals and developers.</sub>
</p>
