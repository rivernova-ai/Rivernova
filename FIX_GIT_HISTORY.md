# 🔒 FIX: Remove API Keys from Git History

## ⚠️ CRITICAL: Your API keys were exposed in previous commits!

GitHub blocked your push because it detected secrets in your git history.

---

## 🚨 IMMEDIATE ACTION REQUIRED

### Step 1: Regenerate ALL API Keys (DO THIS FIRST!)

Your keys are now public in git history. You MUST regenerate them:

1. **Perplexity API Key**
   - Go to: https://www.perplexity.ai/settings/api
   - Delete your old key
   - Generate new key
   - Update `.env.local`

2. **Anthropic (Claude) API Key**
   - Go to: https://console.anthropic.com/settings/keys
   - Delete your old keys
   - Generate new key
   - Update `.env.local`

3. **Supabase Keys** (Optional - these are less sensitive)
   - Go to: https://supabase.com/dashboard/project/nmeitgxujataiktevouk/settings/api
   - Rotate keys if concerned

---

## 🛠️ Step 2: Clean Git History - EASIEST METHOD

Since you haven't shared this repo with others, start fresh:

### Run the PowerShell script:

```powershell
.\fresh-start.ps1
```

This will:
- Remove old git history
- Create fresh repository
- Keep all your files safe

### Then:

1. **Delete the old GitHub repository**
   - Go to: https://github.com/rivernova-ai/Rivernova/settings
   - Scroll down → "Delete this repository"

2. **Create a NEW GitHub repository**
   - Go to: https://github.com/new
   - Name: Rivernova
   - Don't initialize with README

3. **Push to new repo**
   ```bash
   git remote add origin https://github.com/rivernova-ai/Rivernova.git
   git branch -M main
   git push -u origin main
   ```

---

## ✅ Step 3: Verify Protection

After cleaning:

```bash
# Check that .env.local is ignored
git status

# Should NOT show .env.local
# Should show: "nothing to commit, working tree clean"
```

---

## 📋 Step 4: Update Environment Variables

### Local Development
Update `.env.local` with your NEW keys:
```env
NEXT_PUBLIC_SUPABASE_URL=https://nmeitgxujataiktevouk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_new_supabase_key>
NEXT_PUBLIC_API_URL=http://localhost:3000
PERPLEXITY_API_KEY=<your_new_perplexity_key>
ANTHROPIC_API_KEY=<your_new_anthropic_key>
```

### Vercel (if deployed)
1. Go to: https://vercel.com/rivernova-ai/rivernova/settings/environment-variables
2. Update all API keys with new values
3. Redeploy: `vercel --prod`

---

## 🎯 Summary

**What happened:**
- API keys were committed in documentation files
- GitHub detected them and blocked your push
- Keys are now public in git history

**What's been fixed:**
- ✅ Removed keys from all documentation files
- ✅ Created `.env.example` template (safe to commit)
- ✅ Updated `.gitignore` to protect `.env.local`
- ✅ Created `ENV_SETUP.md` guide

**What YOU need to do:**
1. ⚠️ Regenerate ALL API keys (Perplexity + Anthropic)
2. 🔧 Run `.\fresh-start.ps1` to clean git history
3. ✅ Update `.env.local` with new keys
4. 🚀 Push to NEW GitHub repository

---

## 🔐 Future Protection

Your setup is now secure:
- `.env.local` is in `.gitignore` ✅
- `.env.example` is safe template ✅
- Documentation uses placeholders ✅
- `ENV_SETUP.md` guides collaborators ✅

**Never commit `.env.local` again!**
