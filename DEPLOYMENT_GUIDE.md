# Deployment Guide: GitHub → Vercel

## Step 1: Create GitHub Repository

### Option A: Using GitHub Web UI (Easiest)
1. Go to https://github.com/new
2. Repository name: `job-search-app`
3. Description: "AI-powered job search platform with CV analysis and skill matching"
4. Choose: Public (for free Vercel deployment)
5. Do NOT initialize with README, .gitignore, or license
6. Click "Create repository"

### Option B: Using GitHub CLI
```bash
# Install GitHub CLI from https://cli.github.com/
gh repo create job-search-app --public --source=. --remote=origin --push
```

---

## Step 2: Push Code to GitHub

After creating the repository on GitHub, run:

```bash
cd C:\Users\dutt_\job-search-app

# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/job-search-app.git

# Rename branch to main (if needed)
git branch -M main

# Push code to GitHub
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

**You'll be prompted for authentication:**
- Modern GitHub uses "Personal Access Tokens" instead of passwords
- Go to: https://github.com/settings/tokens
- Click "Generate new token (classic)"
- Give it `repo` scope permissions
- Copy the token and paste it when prompted

---

## Step 3: Deploy to Vercel

### Option A: Automatic Deployment (Recommended)

1. **Go to Vercel**: https://vercel.com/
2. **Sign up/Login** with GitHub account
3. Click "New Project"
4. Find and select `job-search-app` repository
5. Click "Import"

### Configuration Screen:
- **Framework Preset**: Next.js ✓ (auto-detected)
- **Root Directory**: ./
- **Build Command**: `npm run build` (default)
- **Environment Variables**: Add these:

```
MONGODB_URI = your_mongodb_connection_string
ANTHROPIC_API_KEY = your_anthropic_api_key
NEXT_PUBLIC_API_URL = https://your-vercel-domain.vercel.app
```

Click "Deploy" and wait 2-3 minutes!

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd C:\Users\dutt_\job-search-app
vercel

# Follow the prompts to link your project
```

---

## Step 4: Configure Environment Variables on Vercel

1. Go to your Vercel project dashboard
2. Click "Settings" → "Environment Variables"
3. Add these variables:

| Variable | Value |
|----------|-------|
| `MONGODB_URI` | Your MongoDB Atlas connection string |
| `ANTHROPIC_API_KEY` | Your Anthropic Claude API key |
| `NEXT_PUBLIC_API_URL` | Your Vercel domain (e.g., `https://job-search-abc.vercel.app`) |

4. Click "Save"
5. Go to "Deployments" and click "Redeploy" on the latest deployment

---

## Step 5: Get Your Live URL

After deployment completes:
1. Go to your Vercel project dashboard
2. Copy the URL from the top (e.g., `https://job-search-app-xyz.vercel.app`)
3. This is your live web URL!

---

## Setting Up MongoDB Atlas

If you don't have MongoDB set up yet:

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new project
4. Create a free cluster (M0 tier)
5. Create a database user with password
6. Whitelist your IP address (or use 0.0.0.0/0 for development)
7. Get connection string and add to `.env.local` and Vercel

Connection string format:
```
mongodb+srv://username:password@cluster.mongodb.net/job-search-app?retryWrites=true&w=majority
```

---

## Getting Anthropic API Key

1. Go to https://console.anthropic.com/
2. Sign up/Login
3. Go to "API Keys"
4. Click "Create Key"
5. Copy the key (starts with `sk-ant-`)
6. Add to `.env.local` and Vercel

---

## Automatic Deployments

Once set up, every time you:
1. Commit code to GitHub
2. Push to `main` branch

Vercel will **automatically**:
1. Pull the latest code
2. Install dependencies
3. Build the app
4. Deploy to production

No manual steps needed!

---

## Monitoring & Logs

On Vercel Dashboard:
- **Deployments**: See all deployment history
- **Logs**: Real-time build and runtime logs
- **Analytics**: View traffic and performance
- **Domains**: Manage custom domains (e.g., `jobmatch.com`)

---

## Custom Domain (Optional)

To use your own domain:
1. Buy domain from Namecheap, GoDaddy, etc.
2. On Vercel: Settings → Domains
3. Add your domain
4. Follow DNS configuration instructions
5. Point domain to Vercel nameservers

---

## Troubleshooting

### Deployment fails with "Command not found"
- Check that `npm run build` works locally
- Verify all dependencies are in `package.json`

### "Cannot find module" errors
- Ensure all imports are correct
- Check that environment variables are set on Vercel

### 404 errors after deployment
- Wait 5 minutes for deployment to fully propagate
- Hard refresh browser (Ctrl+Shift+R)
- Check Vercel deployment logs

### Database connection errors
- Verify `MONGODB_URI` is correct
- Check MongoDB IP whitelist includes Vercel IPs
- Test connection locally first

### Claude API errors
- Verify `ANTHROPIC_API_KEY` is correct
- Check that you have API credits
- Confirm API key has correct permissions

---

## Quick Reference Commands

```bash
# Check git remote
git remote -v

# Push to GitHub
git push origin main

# Create new commit and push
git add .
git commit -m "Your message"
git push

# View deployment status
vercel logs

# Redeploy latest commit
vercel --prod

# List Vercel projects
vercel list
```

---

## After Deployment

### Test Your Live App
1. Go to your Vercel URL
2. Test CV upload
3. Test skill extraction
4. Verify all pages load
5. Check console for errors

### Set Up CI/CD
Vercel automatically creates preview deployments for pull requests - no setup needed!

### Monitor Performance
- Check Vercel Analytics dashboard
- Monitor build times
- Track API usage and errors

---

## Environment Variables Summary

```env
# Required for running locally and on Vercel
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/job-search-app
ANTHROPIC_API_KEY=sk-ant-v0-...
NEXT_PUBLIC_API_URL=https://your-domain.vercel.app

# Optional
NODE_ENV=production
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760
```

---

## Security Best Practices

✅ Never commit `.env.local` to GitHub
✅ Store secrets in Vercel Environment Variables
✅ Use separate API keys for dev and production
✅ Regularly rotate API keys
✅ Monitor Vercel deployment logs for errors
✅ Set up alerts in Vercel for build failures

---

## Next Steps After Deployment

1. ✅ Share your live URL with users
2. ✅ Test all features in production
3. ✅ Monitor error logs
4. ✅ Continue building Phase 2 (job search)
5. ✅ Set up custom domain for professional look
6. ✅ Add analytics/monitoring

---

## Support & Resources

- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- MongoDB Docs: https://docs.mongodb.com
- Anthropic Docs: https://docs.anthropic.com

---

**Your app will be live and automatically updating with every GitHub push!**

Built with ❤️ using Claude AI, Next.js, and Vercel
