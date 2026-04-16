# 🚀 RIVERNOVA - DEPLOYMENT INSTRUCTIONS

## PRE-DEPLOYMENT CHECKLIST

### 1. Database Setup (CRITICAL - DO THIS FIRST)

```bash
# Go to: https://supabase.com/dashboard/project/nmeitgxujataiktevouk/sql/new
# Copy the entire contents of: supabase-schema.sql
# Paste into SQL Editor
# Click "Run" button
# Verify tables created: profiles, matches, chat_history, commission_ledger, referrals
```

### 2. Test Locally

```bash
# Start dev server
npm run dev

# Test these flows:
1. Sign up with Google OAuth
2. Complete onboarding (all 5 steps)
3. View dashboard
4. Generate matches (this will take 30-60 seconds)
5. Open AI Counselor chat
6. Visit /ledger page
```

### 3. Deploy to Vercel

#### Option A: Vercel CLI (Fastest)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Follow prompts:
# - Project name: rivernova
# - Framework: Next.js
# - Build command: npm run build
# - Output directory: .next
```

#### Option B: GitHub + Vercel Dashboard

```bash
# 1. Push to GitHub
git add .
git commit -m "Rivernova MVP complete"
git push origin main

# 2. Go to https://vercel.com/new
# 3. Import your GitHub repository
# 4. Configure project:
#    - Framework Preset: Next.js
#    - Root Directory: ./
#    - Build Command: npm run build
#    - Output Directory: .next

# 5. Add Environment Variables (copy from your .env.local):
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
PERPLEXITY_API_KEY=your_perplexity_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
NEXT_PUBLIC_API_URL=https://your-domain.vercel.app

# 6. Click "Deploy"
```

### 4. Post-Deployment Configuration

#### Update Supabase Auth Redirect URLs

```bash
# Go to: https://supabase.com/dashboard/project/nmeitgxujataiktevouk/auth/url-configuration

# Add these URLs:
Site URL: https://your-domain.vercel.app
Redirect URLs:
  - https://your-domain.vercel.app/auth/callback
  - http://localhost:3000/auth/callback (for local dev)
```

#### Configure Google OAuth

```bash
# Go to: https://console.cloud.google.com/apis/credentials

# Update Authorized redirect URIs:
  - https://nmeitgxujataiktevouk.supabase.co/auth/v1/callback
  - https://your-domain.vercel.app/auth/callback
```

### 5. Custom Domain (Optional)

```bash
# In Vercel Dashboard:
# 1. Go to Project Settings → Domains
# 2. Add your custom domain (e.g., rivernova.com)
# 3. Update DNS records as instructed
# 4. Update NEXT_PUBLIC_API_URL in environment variables
# 5. Update Supabase redirect URLs with new domain
```

---

## 🎯 TESTING PRODUCTION

### Test Checklist:

```bash
# 1. Landing Page
Visit: https://your-domain.vercel.app
✓ Hero section loads
✓ Animations work
✓ "Get Started" button opens auth modal

# 2. Authentication
✓ Google OAuth works
✓ Magic link email sends
✓ Redirects to /onboarding after signup

# 3. Onboarding
✓ All 5 steps work
✓ Data saves to Supabase
✓ Redirects to /dashboard after completion

# 4. Dashboard
✓ Mode toggle works
✓ Stats display correctly
✓ Quick actions link properly

# 5. Matches
✓ "Generate Matches" button works
✓ Loading state shows (30-60 seconds)
✓ Match cards display with all data
✓ Favorite system works

# 6. AI Counselor
✓ Chat button appears
✓ Modal opens
✓ Messages send and receive
✓ Streaming responses work

# 7. Ledger
✓ Public page loads without login
✓ Schools display in table
✓ Search works
✓ Stats show correctly

# 8. Mobile
✓ Responsive design works
✓ Touch interactions work
✓ Chat modal fits screen
```

---

## 🐛 TROUBLESHOOTING

### Issue: "Unauthorized" errors
**Fix**: Check Supabase RLS policies are applied (run schema again)

### Issue: Match generation fails
**Fix**: 
1. Verify PERPLEXITY_API_KEY and ANTHROPIC_API_KEY in Vercel
2. Check API rate limits
3. View Vercel function logs

### Issue: Google OAuth doesn't work
**Fix**: 
1. Update redirect URLs in Google Console
2. Update redirect URLs in Supabase
3. Clear browser cache

### Issue: Chat doesn't stream
**Fix**: 
1. Verify ANTHROPIC_API_KEY
2. Check browser console for errors
3. Ensure Vercel function timeout is set to 60s

### Issue: Database errors
**Fix**: 
1. Verify schema is applied in Supabase
2. Check RLS policies are enabled
3. View Supabase logs

---

## 📊 MONITORING

### Vercel Analytics
```bash
# Enable in Vercel Dashboard:
Project Settings → Analytics → Enable
```

### Error Tracking
```bash
# Add Sentry (optional):
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### Performance
```bash
# Check Vercel Insights:
Project → Analytics → Web Vitals
```

---

## 🎉 LAUNCH ANNOUNCEMENT

### Social Media Copy:

```
🚀 Introducing Rivernova - The Global Human Capital OS

✨ AI-powered school matching
🛡️ Zero commissions, 100% unbiased
🌍 Domestic, International, Lifelong modes
💬 24/7 AI counselor
📊 Public transparency ledger

Find your perfect school in minutes, not months.

Try it now: https://your-domain.vercel.app

#EdTech #AI #YCombinator #Education
```

---

## 📈 NEXT STEPS

### Week 1:
- [ ] Monitor error logs
- [ ] Collect user feedback
- [ ] Fix critical bugs
- [ ] Add analytics events

### Week 2:
- [ ] Implement Stripe payments
- [ ] Add email notifications
- [ ] Improve match algorithm
- [ ] Add more schools to ledger

### Week 3:
- [ ] Launch referral system
- [ ] Create social sharing
- [ ] Write blog posts
- [ ] Reach out to YC

---

## 🏆 SUCCESS METRICS

### Track These KPIs:
- Sign-ups per day
- Onboarding completion rate
- Matches generated
- AI Counselor usage
- Ledger page views
- Time to first match
- User retention (7-day, 30-day)

---

**You're ready to launch! 🚀**

Questions? Check MVP_GUIDE.md for detailed documentation.
