# ProjectGarage - Vercel Deployment Guide

## Prerequisites ✅
- [x] Code committed and pushed to GitHub
- [x] Vercel CLI installed
- [ ] Vercel account (sign up at https://vercel.com if needed)
- [ ] Groq API key for AI features

## Deployment Steps

### 1. Login to Vercel
```bash
vercel login
```
This will open your browser to authenticate. Choose your preferred login method (GitHub, GitLab, Bitbucket, or Email).

### 2. Deploy the Project
```bash
vercel
```

You'll be asked:
- **Set up and deploy?** → Yes
- **Which scope?** → Select your account/team
- **Link to existing project?** → No (first deployment)
- **What's your project's name?** → projectgarage (or press Enter for default)
- **In which directory is your code located?** → ./ (press Enter)
- **Auto-detected Next.js. Continue?** → Yes
- **Override settings?** → No

### 3. Add Environment Variables

After deployment, add your Groq API key:

**Option A: Via CLI**
```bash
vercel env add GROQ_API_KEY
```
Enter your Groq API key when prompted.
Select: Production, Preview, Development (all three)

**Option B: Via Vercel Dashboard**
1. Go to https://vercel.com/dashboard
2. Select your project (projectgarage)
3. Go to Settings → Environment Variables
4. Add:
   - Name: `GROQ_API_KEY`
   - Value: Your Groq API key from https://console.groq.com/
   - Environments: Production, Preview, Development

### 4. Redeploy with Environment Variables
```bash
vercel --prod
```

## Your Deployment URLs

After deployment completes, you'll get:
- **Production URL**: https://projectgarage.vercel.app (or your custom domain)
- **Preview URL**: Unique URL for each git branch/commit
- **Development**: http://localhost:3000

## Environment Variables Needed

| Variable | Required | Purpose |
|----------|----------|---------|
| `GROQ_API_KEY` | Yes | AI-generated specs for 2023+ vehicles & reliability analysis |
| `BRAVE_API_KEY` | Optional | Web article search for reliability analysis (Reddit works without it) |
| `ENABLE_EDMUNDS_SCRAPING` | Optional | Feature flag for Edmunds scraping (default: false) |
| `NEXT_PUBLIC_BASE_URL` | Auto-set | Vercel sets this automatically |

**Note**: The reliability analysis feature will work with just Reddit data if `BRAVE_API_KEY` is not provided.

## Vercel Free Tier Limits

✅ Your project fits within free tier:
- 100 GB bandwidth/month
- 100 deployments/day
- 10s function execution time
- 1024 MB memory
- Unlimited sites

## Automatic Deployments

Once linked, Vercel will automatically:
- Deploy on every push to `main` branch (Production)
- Create preview deployments for pull requests
- Run build checks before deploying

## Troubleshooting

### Build Fails
```bash
# Test build locally first
npm run build
```

### Environment Variables Not Working
- Redeploy after adding env vars: `vercel --prod`
- Check they're set for "Production" environment
- Verify variable names match exactly (case-sensitive)

### Domain Setup
1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

## Monitoring

View your deployment:
```bash
vercel ls
```

View logs:
```bash
vercel logs
```

## Quick Commands

```bash
vercel                  # Deploy to preview
vercel --prod          # Deploy to production
vercel ls              # List deployments
vercel logs            # View logs
vercel env ls          # List environment variables
vercel inspect [url]   # Inspect deployment
```

---

**Ready to deploy?** Run `vercel login` to get started!
