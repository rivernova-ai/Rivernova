# 🚀 RIVERNOVA MVP - COMPLETE SETUP GUIDE

## The Global Human Capital OS
**Unbiased School Matching. Zero Commission. Real AI.**

---

## 📋 WHAT'S BEEN BUILT

### ✅ PHASE 1: AUTH & ONBOARDING
- **Supabase Authentication**: Google OAuth + Magic Link email
- **5-Step Onboarding Wizard**:
  1. Academic Background (GPA, test scores, major)
  2. Career Goals (field, dream job, industries)
  3. Budget & Financial (range, scholarships, aid)
  4. Location Preferences (countries, visa needs)
  5. Mode Selection (Domestic/International/Lifelong)
- **Database Schema**: Complete Supabase tables with RLS policies
- **Auto-redirect**: New users → Onboarding → Dashboard

### ✅ PHASE 2: ENHANCED DASHBOARD
- **Mode Toggle**: Switch between Domestic/International/Lifelong
- **Profile Stats**: Completion status, matches count, applications
- **Quick Actions**: Find Matches, AI Counselor, View Ledger
- **Personalized Welcome**: Dynamic greeting with user name

### ✅ PHASE 3: SCHOOL MATCHING ENGINE (CORE MVP)
- **Perplexity Integration**: Real-time school research with citations
- **Claude Synthesis**: AI-powered match ranking (8-12 schools)
- **Match Cards**: 
  - Success probability score
  - Cost breakdown (tuition, living, scholarships)
  - "Why this match" reasoning
  - Zero Commission badge
  - Expandable details with citations
- **Database Storage**: All matches saved to Supabase
- **Favorite System**: Save preferred matches

### ✅ PHASE 4: AI COUNSELOR CHATBOT
- **24/7 Availability**: Floating chat button on all pages
- **Context-Aware**: Knows user profile + current matches
- **Streaming Responses**: Real-time Claude-powered chat
- **Capabilities**:
  - Answer questions about schools, visas, essays
  - Generate essay outlines
  - Refine match criteria
  - Application strategies

### ✅ PHASE 5: ZERO-COMMISSION LEDGER
- **Public Page**: `/ledger` (no login required)
- **Transparent Table**: All recommended schools with $0 commission proof
- **Search & Filter**: Find schools by name or country
- **Real-time Stats**: Total schools verified, commission amount ($0)
- **Verification Status**: Timestamp for each entry

### ✅ PHASE 6: APPLICATION STARTER
- **Checklist**: Pre-filled application requirements
- **Essay Generator**: AI-powered essay outlines via Claude
- **Important Dates**: Deadline tracker
- **Document Management**: Track required materials

### ✅ PHASE 7: VIRAL HOOKS (Foundation)
- **Shareable Matches**: Ready for social sharing
- **Referral System**: Database schema ready for implementation

---

## 🛠️ TECH STACK

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS 4 + shadcn/ui
- **Database**: Supabase (Postgres + Auth + Storage)
- **AI Models**:
  - Perplexity Sonar Pro (school research)
  - Claude 3.5 Sonnet (synthesis + chat)
- **Deployment**: Vercel-ready

---

## 📦 SETUP INSTRUCTIONS

### 1. Database Setup

**Run the SQL schema in Supabase:**

```bash
# Navigate to Supabase Dashboard → SQL Editor
# Copy and paste the contents of: supabase-schema.sql
# Click "Run"
```

This creates:
- `profiles` table (user data)
- `matches` table (school recommendations)
- `chat_history` table (AI counselor conversations)
- `commission_ledger` table (public transparency)
- `referrals` table (viral growth)
- RLS policies for security
- Auto-create profile trigger

### 2. Environment Variables

Create a `.env.local` file with your API keys:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
PERPLEXITY_API_KEY=your_perplexity_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
NEXT_PUBLIC_API_URL=http://localhost:3000
```

See `.env.example` for the template.

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Visit: **http://localhost:3000**

---

## 🎯 USER FLOW

1. **Landing Page** (`/`)
   - Hero section with value proposition
   - Problem/Solution sections
   - Zero Commission guarantee
   - CTA: "Get Started" → Opens Auth Modal

2. **Sign Up/Login**
   - Google OAuth or Magic Link
   - Auto-creates profile in Supabase
   - Redirects to `/onboarding`

3. **Onboarding** (`/onboarding`)
   - 5-step wizard with progress indicator
   - Saves profile data to Supabase
   - Redirects to `/dashboard`

4. **Dashboard** (`/dashboard`)
   - Mode toggle (Domestic/International/Lifelong)
   - Profile stats
   - Quick actions: Find Matches, AI Counselor, Ledger
   - CTA: "Generate Matches Now"

5. **Matches** (`/dashboard/matches`)
   - Click "Generate Matches" → Calls `/api/matches/generate`
   - Perplexity researches schools (30-60 seconds)
   - Claude synthesizes 8-12 ranked matches
   - Display match cards with:
     - Success probability
     - Cost breakdown
     - Reasoning
     - Zero Commission badge
     - Expandable details

6. **AI Counselor** (Floating button)
   - Click chat icon → Opens chat modal
   - Ask questions about schools, essays, applications
   - Streaming responses from Claude
   - Context-aware (knows profile + matches)

7. **Ledger** (`/ledger`)
   - Public page (no login)
   - Search schools
   - View $0 commission proof
   - Transparency stats

---

## 🚀 DEPLOYMENT TO VERCEL

### Option 1: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Option 2: GitHub Integration

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repo
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `PERPLEXITY_API_KEY`
   - `ANTHROPIC_API_KEY`
   - `NEXT_PUBLIC_API_URL` (set to your Vercel domain)
6. Click "Deploy"

**Your live URL will be**: `https://rivernova.vercel.app` (or custom domain)

---

## 🔑 KEY FEATURES

### 1. Unbiased Matching
- **Zero commissions** from any institution
- AI-powered recommendations based purely on fit
- Public ledger for transparency

### 2. Real-Time Research
- Perplexity API pulls latest data (2023-2024)
- Scholarships, visa rates, employment outcomes
- All recommendations include citations

### 3. Personalized Guidance
- 24/7 AI counselor knows your profile
- Context-aware responses
- Essay outlines, application strategies

### 4. Multi-Mode Support
- **Domestic**: US universities, in-state tuition
- **International**: Global schools, visa pathways
- **Lifelong**: Career upskilling, bootcamps

---

## 📊 DATABASE SCHEMA

### profiles
```sql
- id (UUID, references auth.users)
- email, full_name
- academic_background (JSONB)
- career_goals (JSONB)
- budget (JSONB)
- location_preferences (JSONB)
- mode (domestic/international/lifelong)
- onboarding_completed (BOOLEAN)
```

### matches
```sql
- id (UUID)
- user_id (references profiles)
- school_name, school_data (JSONB)
- success_probability (NUMERIC)
- reasoning, cost_breakdown (JSONB)
- citations (JSONB)
- favorited (BOOLEAN)
```

### commission_ledger
```sql
- id (UUID)
- school_name (UNIQUE)
- country, commission_amount (always $0)
- statement, verified_at
- public (BOOLEAN, always TRUE)
```

---

## 🎨 DESIGN SYSTEM

### Colors
- **Background**: `#09090b` (dark)
- **Gradients**: Indigo (#818cf8) → Purple (#c084fc) → Pink (#f472b6)
- **Cards**: `bg-white/5` with `border-white/10`
- **Text**: White with opacity variants (60%, 40%)

### Components
- **Rounded**: `rounded-3xl` for cards, `rounded-xl` for buttons
- **Shadows**: `shadow-[0_0_30px_rgba(99,102,241,0.3)]` for glow effects
- **Animations**: Smooth transitions, fade-in, slide-in

### Typography
- **Headers**: Bold, tracking-tight, uppercase for labels
- **Body**: White/60 for secondary text
- **Gradient Text**: `.gradient-text` class for brand highlights

---

## 🧪 TESTING CHECKLIST

### Before Launch:
- [ ] Run SQL schema in Supabase
- [ ] Test Google OAuth login
- [ ] Test Magic Link email
- [ ] Complete onboarding flow
- [ ] Generate matches (verify Perplexity + Claude work)
- [ ] Test AI Counselor chat
- [ ] View public ledger
- [ ] Test on mobile (responsive design)
- [ ] Check all environment variables in Vercel

---

## 🎯 NEXT STEPS (Post-MVP)

### Immediate Priorities:
1. **Payment Integration**: Stripe $99 flat fee
2. **Email Notifications**: Match alerts, deadline reminders
3. **Advanced Filters**: Sort matches by cost, probability, location
4. **Application Tracking**: Full application management system
5. **Referral System**: Unique codes, rewards, tracking

### Growth Features:
1. **Ambassador Program**: Student advocates
2. **Social Sharing**: OG images for match results
3. **Success Stories**: User testimonials
4. **Blog/Resources**: SEO content
5. **Mobile App**: React Native version

---

## 📞 SUPPORT

### Issues?
- Check Supabase logs for auth errors
- Verify API keys are correct
- Check browser console for errors
- Ensure database schema is applied

### API Rate Limits:
- **Perplexity**: 50 requests/minute
- **Claude**: 50 requests/minute
- Consider caching for production

---

## 🏆 LAUNCH CHECKLIST

- [ ] Database schema applied
- [ ] Environment variables set
- [ ] Test user flow end-to-end
- [ ] Deploy to Vercel
- [ ] Custom domain configured
- [ ] Analytics added (Vercel Analytics)
- [ ] Error monitoring (Sentry)
- [ ] Social media OG tags
- [ ] Privacy policy + Terms of Service
- [ ] YC application ready 🚀

---

**Built with ❤️ for YC Summer 2026**

*Democratizing education through AI-powered, unbiased guidance.*
