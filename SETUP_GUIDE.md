# Job Search Application - Setup Guide

## Phase 1 Infrastructure Complete ✅

### Created Files Summary

#### Core Infrastructure
- ✅ `.env.example` - Environment variables template
- ✅ `lib/mongodb.ts` - MongoDB connection handler
- ✅ `lib/anthropic-client.ts` - Claude API wrapper
- ✅ `lib/prompt-templates.ts` - Reusable Claude prompts

#### Type Definitions
- ✅ `types/cv.ts` - CV data types
- ✅ `types/job.ts` - Job and matching types

#### Database Models (Mongoose)
- ✅ `models/CV.ts` - CV schema
- ✅ `models/ExtractedSkills.ts` - Skills schema
- ✅ `models/JobListing.ts` - Job listings schema
- ✅ `models/SkillMatch.ts` - Skill matching schema
- ✅ `models/Application.ts` - Application tracking schema
- ✅ `models/GeneratedContent.ts` - Generated CV/CL schema

#### Processing Libraries
- ✅ `lib/pdf-parser.ts` - PDF text extraction
- ✅ `lib/cv-extractor.ts` - CV text parsing & skill extraction
- ✅ `lib/skill-analyzer.ts` - Claude-powered skill analysis
- ✅ `lib/linkedin-scraper.ts` - LinkedIn profile scraping
- ✅ `lib/job-search.ts` - Job search orchestration

#### Documentation
- ✅ `README.md` - Project overview
- ✅ `SETUP_GUIDE.md` - This file

### Next Steps

#### Phase 1 - Core Pipeline (Next)
1. **Week 1**
   - [ ] Create file upload endpoint (`POST /api/cv/upload`)
   - [ ] Implement skill extraction endpoint (`POST /api/skills/extract`)
   - [ ] Create database storage for CVs and skills
   - [ ] Build upload UI page

2. **Week 2**
   - [ ] Integrate job search APIs
   - [ ] Implement matching algorithm
   - [ ] Create job scoring system (0-10)
   - [ ] Build dashboard UI
   - [ ] Display jobs with match scores

#### Phase 2 - Advanced Features (Later)
   - [ ] CV optimization endpoint
   - [ ] Cover letter generation
   - [ ] Application tracking
   - [ ] Skill gap analysis

### Configuration Steps

1. **Create MongoDB Atlas Account**
   - Visit https://www.mongodb.com/cloud/atlas
   - Create free cluster
   - Generate connection string

2. **Get Anthropic API Key**
   - Visit https://console.anthropic.com
   - Create API key
   - Add to `.env.local`

3. **Setup Environment**
   ```bash
   cd job-search-app
   cp .env.example .env.local
   # Edit .env.local with your credentials
   npm run dev
   ```

### API Endpoints to Implement

**CV Management**
- POST /api/cv/upload - Upload PDF CV
- GET /api/cv - List CVs
- DELETE /api/cv/[id] - Delete CV

**Skills Analysis**
- POST /api/skills/extract - Extract skills
- GET /api/skills/[cvId] - Get extracted skills

**Job Search**
- POST /api/jobs/search - Trigger search
- GET /api/jobs - Get job listings
- GET /api/jobs/[id] - Get job details

**Skill Matching**
- GET /api/match/scores - Get all match scores
- GET /api/match/[jobId] - Detailed match

### Dependencies Installed

```json
{
  "frontend": ["react", "react-dom", "next", "tailwindcss"],
  "backend": ["mongoose", "mongodb", "pdf-parse"],
  "ai": ["@anthropic-ai/sdk"],
  "scraping": ["cheerio", "node-fetch"],
  "state": ["@tanstack/react-query", "zustand"],
  "file-upload": ["multer"],
  "http": ["axios"],
  "utils": ["dotenv"]
}
```

### Key Utilities

**PDF Parsing**
```typescript
import { extractPdfText } from '@/lib/pdf-parser';
const text = await extractPdfText(filePath);
```

**Claude API**
```typescript
import { callClaudeJSON } from '@/lib/anthropic-client';
const result = await callClaudeJSON(prompt);
```

**Skill Analysis**
```typescript
import { analyzeSkillsWithClaude } from '@/lib/skill-analyzer';
const skills = await analyzeSkillsWithClaude(cvText);
```

**Skill Matching**
```typescript
import { calculateSkillMatch } from '@/lib/skill-analyzer';
const match = calculateSkillMatch(userSkills, jobSkills);
```

### Database Collections

All MongoDB collections are defined and ready to use:

1. **CV** - User CVs with parsed data
2. **ExtractedSkills** - Categorized skills from CV+LinkedIn
3. **JobListing** - Job postings
4. **SkillMatch** - User-job skill matches
5. **Application** - Application tracking
6. **GeneratedContent** - Generated CVs & cover letters

### Testing

Create sample test files in `/tests` directory:
- `test-cv.pdf` - Sample CV for testing
- `test-skills.json` - Sample extracted skills

### Common Issues & Solutions

**MongoDB Connection**
- Ensure MongoDB URI is correct in `.env.local`
- Check IP whitelist in MongoDB Atlas
- Verify credentials

**Claude API**
- Check API key format (should start with `sk-ant-`)
- Verify rate limits haven't been exceeded
- Check for sufficient credits

**PDF Parsing**
- Ensure uploaded file is valid PDF
- Check file size < 5MB (configurable)
- Verify PDF isn't encrypted

### Cost Estimation

With current configuration:
- MongoDB: Free tier (up to 512MB)
- Claude API: ~$0.10-0.20 per job search cycle
- No hosting costs during development

### Performance Tips

1. **API Calls**: Use Claude Haiku for parsing (cheaper), Sonnet for generation
2. **Caching**: Cache skill extraction results
3. **Job Search**: Cache for 24 hours to reduce scraping
4. **Database**: Add indexes on frequently queried fields (already done)

### Security Checklist

- [ ] Never commit `.env.local` to git
- [ ] Validate file uploads (PDF only)
- [ ] Sanitize user input
- [ ] Rate limit API endpoints
- [ ] Encrypt sensitive data
- [ ] Use HTTPS in production
- [ ] Validate MongoDB ObjectIds

### Next: Building Phase 1

Once environment is configured, the next files to create are:

1. `/app/api/cv/upload.ts` - File upload handler
2. `/app/api/skills/extract.ts` - Skill extraction endpoint
3. `/app/(pages)/upload.tsx` - Upload form UI
4. `/app/(pages)/dashboard.tsx` - Dashboard UI

Ready to proceed? Run:
```bash
npm run dev
```

---

**Status**: ✅ Infrastructure complete, ready for Phase 1 implementation
