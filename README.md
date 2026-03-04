# AI-Powered Applicant Tracking System

A production-grade AI-powered ATS built with Next.js 15, MongoDB, and Groq AI. Analyze resumes against job descriptions with intelligent matching and ATS optimization recommendations.

## Features

- **Authentication**: Secure JWT-based authentication with NextAuth
- **Resume Upload**: Upload PDF or DOCX resumes with automatic text extraction
- **AI Analysis**: Powered by Groq's llama-3.1-8b-instant model for intelligent matching
- **Job Tracking**: Manage job applications with status tracking and notes
- **Match Scoring**: Get detailed match scores between resumes and job descriptions
- **ATS Optimization**: Receive recommendations to improve ATS compatibility
- **Modern UI**: Clean, responsive interface inspired by Stripe, Linear, and Vercel

## Tech Stack

- **Frontend**: Next.js 15 App Router, React 19, TypeScript
- **Styling**: Tailwind CSS, ShadCN UI
- **Database**: MongoDB with Prisma ORM
- **Authentication**: NextAuth with JWT
- **AI**: Groq SDK (llama-3.1-8b-instant)
- **File Storage**: Vercel Blob
- **File Parsing**: pdf-parse, mammoth
- **Deployment**: Vercel

## Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account (free tier works)
- Groq API key (free at https://console.groq.com)
- Vercel account (for deployment and Blob storage)

## Setup Instructions

### 1. Clone and Install

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
# MongoDB Atlas Connection String
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ats?retryWrites=true&w=majority

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32

# Groq API Key (Free - get from https://console.groq.com)
GROQ_API_KEY=gsk_your_groq_api_key_here

# Vercel Blob Storage Token
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_your_token_here
```

#### Getting Your API Keys:

**MongoDB URI:**
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string and replace `<password>` with your database password

**NextAuth Secret:**
```bash
openssl rand -base64 32
```

**Groq API Key:**
1. Go to [Groq Console](https://console.groq.com)
2. Sign up for free
3. Create an API key

**Vercel Blob Token:**
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel login`
3. Run: `vercel link`
4. Run: `vercel env pull`
5. Or get it from Vercel dashboard → Storage → Blob

### 3. Database Setup

```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin your-repo-url
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Add environment variables:
   - `MONGODB_URI`
   - `NEXTAUTH_URL` (use your Vercel domain)
   - `NEXTAUTH_SECRET`
   - `GROQ_API_KEY`
   - `BLOB_READ_WRITE_TOKEN`
5. Click "Deploy"

### 3. Setup Vercel Blob Storage

1. In Vercel dashboard, go to Storage tab
2. Create a new Blob store
3. Copy the token to `BLOB_READ_WRITE_TOKEN` environment variable

## Usage

### 1. Register an Account
- Navigate to `/register`
- Create your account with email and password

### 2. Upload Resume
- Go to "Upload Resume" page
- Upload a PDF or DOCX file
- Text will be automatically extracted

### 3. Add Job Application
- Go to "Jobs" page
- Click "Add Job"
- Enter company, role, and job description

### 4. Analyze Match
- Open a job application
- Select a resume to analyze
- Click "Analyze Resume"
- View match score, ATS score, matching/missing skills, and suggestions

### 5. Track Applications
- Update job status (Applied, Interview, Offer, Rejected)
- Add notes for each application
- View analytics on dashboard

## Project Structure

```
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── api/
│   │   ├── auth/
│   │   ├── upload/
│   │   ├── analyze/
│   │   └── jobs/
│   ├── dashboard/
│   ├── upload/
│   ├── jobs/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   └── ui/
├── lib/
│   ├── prisma.ts
│   ├── groq.ts
│   ├── auth.ts
│   ├── resume-parser.ts
│   └── utils.ts
├── prisma/
│   └── schema.prisma
├── types/
│   └── next-auth.d.ts
└── middleware.ts
```

## API Routes

- `POST /api/auth/register` - Register new user
- `POST /api/auth/[...nextauth]` - NextAuth endpoints
- `POST /api/upload` - Upload resume
- `GET /api/upload/resumes` - Get user's resumes
- `POST /api/analyze` - Analyze resume vs job
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create job
- `GET /api/jobs/[id]` - Get job details
- `PATCH /api/jobs/[id]` - Update job
- `DELETE /api/jobs/[id]` - Delete job

## Database Schema

### User
- id, email, password, name, createdAt, updatedAt
- Relations: resumes[], jobs[]

### Resume
- id, userId, fileName, fileUrl, extractedText, createdAt, updatedAt
- Relations: user

### Job
- id, userId, company, role, jobDescription, status, notes
- matchScore, matchingSkills[], missingSkills[], suggestions[], atsScore
- createdAt, updatedAt
- Relations: user

## Troubleshooting

### Prisma Issues
If you see Prisma 7 errors, the package.json uses Prisma 5.22.0 which is compatible with the schema.

```bash
npm install
npx prisma generate
```

### MongoDB Connection
Ensure your IP is whitelisted in MongoDB Atlas Network Access settings.

### Vercel Blob
Make sure you have a Blob store created in your Vercel project.

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
