# Job Search Application

An intelligent job search assistant that uses AI to analyze CVs, extract skills, find matching jobs, and help optimize applications.

## Features

### Phase 1: Core Job Matching Pipeline
- ✅ CV file upload and text extraction (PDF support)
- ✅ Skill extraction and categorization using Claude AI
- ✅ LinkedIn profile URL support (public profile parsing)
- ✅ Job search from multiple sources (Indeed, LinkedIn, Glassdoor)
- ✅ Intelligent skill matching and scoring (0-10)
- ✅ Dashboard with extracted skills and job matches

### Phase 2: Application Optimization (Coming Soon)
- 📋 AI-powered CV optimization for specific jobs
- 💌 Personalized cover letter generation
- 📊 Application tracking and status management
- 🎯 Skill gap analysis and learning recommendations

## Tech Stack

- **Frontend**: React 19 + Next.js 14 + TailwindCSS
- **Backend**: Node.js + Next.js API Routes
- **Database**: MongoDB (Atlas)
- **AI/LLM**: Anthropic Claude API
- **PDF Processing**: pdf-parse, pdfjs-dist

## Getting Started

1. **Setup**: Copy `.env.example` to `.env.local` and add your credentials
2. **Install**: `npm install`
3. **Run**: `npm run dev`
4. Visit: [http://localhost:3000](http://localhost:3000)

## Project Structure

- `/lib` - Core utilities (PDF parsing, Claude API, skill extraction)
- `/models` - MongoDB schemas
- `/types` - TypeScript definitions
- `/components` - React components
- `/app` - Next.js pages and API routes

## Roadmap

- [x] Infrastructure and database setup
- [ ] CV upload and parsing (Phase 1)
- [ ] Skill extraction (Phase 1)
- [ ] Job search integration (Phase 1)
- [ ] Skill matching and scoring (Phase 1)
- [ ] CV optimization (Phase 2)
- [ ] Cover letter generation (Phase 2)
- [ ] Application tracking (Phase 2)

Built with ❤️ using Claude AI
