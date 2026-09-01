# NetSentinel

NetSentinel is a professional, resume-worthy network and web vulnerability scanner platform built from scratch. It allows authorized users to perform controlled security assessments against target domains or IP addresses.

## Features

- **Port Scanning**: Integrates with Nmap for comprehensive port discovery and service fingerprinting.
- **DNS & HTTP Analysis**: Analyzes DNS records, checks for DNSSEC, and evaluates HTTP security headers.
- **Vulnerability Enrichment**: Automatically matches discovered services with CVEs from the National Vulnerability Database (NVD) and fetches host info from Shodan.
- **Risk Engine**: Calculates an intelligent risk score (0-100) based on exposed services and finding severity.
- **Modern Dashboard**: Built with Next.js 15, Tailwind CSS v4, and lucide-react, featuring dark mode by default.
- **Asynchronous Scanning**: Uses Celery and Redis to handle long-running security scans in the background without blocking the UI.
- **Production Ready**: Fully dockerized frontend and backend, with a ready-to-use `render.yaml` for cloud deployment.

## Architecture

- **Frontend**: Next.js 15 (App Router), React, Tailwind CSS v4, Axios.
- **Backend**: FastAPI, SQLAlchemy (asyncpg), PostgreSQL, Celery, Redis.
- **Security Tools**: python-nmap, dnspython, httpx.

## Local Development

### Prerequisites
- Docker and Docker Compose
- Nmap (if running locally without Docker)

### Setup

1. **Clone the repository**
2. **Run with Docker Compose**
   ```bash
   docker-compose up -d --build
   ```
3. **Access the application**
   - Frontend Dashboard: `http://localhost:3000`
   - Backend API Docs: `http://localhost:8000/docs`

## Authorization Disclaimer

**NetSentinel is for defensive purposes and authorized security assessments only.** 
By using this software, you confirm that you have explicit authorization to perform security testing against the specified targets. Do not scan targets you do not own or have permission to test.
