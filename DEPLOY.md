# Deploying ViSnap

## Step 1 — Push to GitHub

1. Go to github.com → New repository → name it `visnap` → Create
2. Download GitHub Desktop from desktop.github.com
3. Clone the new repo, drag all ViSnap files into it, commit and push

## Step 2 — Deploy on Vercel

1. Go to vercel.com → Sign up with GitHub
2. Click "Add New Project" → Import your `visnap` repo
3. Click Deploy (no settings needed — Vercel auto-detects everything)

## Step 3 — Add your API key

1. In Vercel: go to your project → Settings → Environment Variables
2. Add a new variable:
   - Name:  ANTHROPIC_API_KEY
   - Value: your key from console.anthropic.com
3. Click Save, then go to Deployments → Redeploy

Your app is now live. Users just visit the URL — no API key needed on their end.

## Local development

```bash
npm i -g vercel
vercel dev
```

Create a `.env` file (copy `.env.example`) with your real API key.
