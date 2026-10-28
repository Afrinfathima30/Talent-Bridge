# TalentBridge — MERN Job Portal System

A full-stack recruitment platform built with MongoDB, Express.js, React, and Node.js.

## Core features
- Candidate, employer, and admin roles
- JWT authentication and role-based API protection
- Employer dashboard: create, edit, close, and manage job listings
- Candidate dashboard: browse, filter, save, and apply for jobs
- Resume upload and text extraction (PDF/DOCX/TXT)
- Resume-to-job matching score with skill overlap and keyword analysis
- Application status tracking and employer review workflow
- Admin moderation: approve/reject job listings, suspend users, review activity
- LinkedIn profile import integration hook (requires approved LinkedIn OAuth/API access)
- Responsive dashboard and polished landing page

## Requirements
- Node.js 18+
- MongoDB local instance or MongoDB Atlas
- For resume PDF/DOCX extraction, install dependencies listed in `server/package.json`

## Setup

### 1. Backend
```bash
cd server
cp .env.example .env
```
Set `MONGODB_URI`, `JWT_SECRET`, and `CLIENT_ORIGIN` in `.env`.

```bash
npm install
npm run dev
```
API: `http://localhost:5000`

### 2. Frontend
In a second terminal:
```bash
cd client
npm install
npm run dev
```
Open the Vite URL (normally `http://localhost:5173`).

### 3. Create an admin
Register a user normally, then set that user's role to `admin` directly in MongoDB for initial local setup. Never expose a public admin-registration route.

## Resume parsing
Supported file types: PDF, DOCX, TXT. Files are parsed in memory; the starter does not permanently store uploaded resume files. Max upload size is 5 MB. The extracted text and skill-match analysis are stored with the application record.

## LinkedIn integration
LinkedIn profile import is implemented as an integration hook and requires an approved LinkedIn developer app and permissions. The API does not scrape LinkedIn pages or ask for LinkedIn passwords. Configure `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, and `LINKEDIN_REDIRECT_URI` only after you have the relevant LinkedIn API product access. See `server/src/routes/linkedin.js` for the authorization flow scaffold. Depending on the permissions granted by LinkedIn, profile fields may be limited.

## Important production work
Before production use, add email verification, password reset, rate limiting, virus scanning for uploads, secure object storage, audit logs, retention/deletion policies, richer employer organization membership, and automated tests. Resume matching is a heuristic, not a hiring decision; keep human review in the loop.
