# 🎓 RIVERNOVA - SCHOOL SEARCH MVP

## Simple AI-Powered School Search

A clean, focused school search tool powered by Perplexity AI.

---

## 🚀 WHAT'S BUILT

### Simple School Search (`/search`)
- Clean search form with:
  - Intended Major (required)
  - Budget
  - Preferred Location
  - GPA
  - Career Goals
- Real-time AI research using Perplexity API
- Detailed school recommendations with:
  - Program information
  - Tuition costs
  - Admission requirements
  - Rankings
  - Scholarships
  - Employment outcomes
  - Citations/sources

---

## 🛠️ SETUP

### 1. Environment Variables

Already configured in `.env.local`:
```env
PERPLEXITY_API_KEY=your_perplexity_api_key
```

### 2. Run Development Server

```bash
npm run dev
```

Visit: **http://localhost:3000/search**

---

## 📖 HOW TO USE

1. Go to http://localhost:3000
2. Click "Search Schools Now" button
3. Fill in your details:
   - **Major** (required): e.g., "Computer Science"
   - **Budget**: e.g., "$30,000 - $50,000"
   - **Location**: e.g., "United States"
   - **GPA**: e.g., "3.8 / 4.0"
   - **Career Goals**: Optional description
4. Click "Search Schools"
5. Wait 20-30 seconds for AI research
6. View detailed school recommendations

---

## 🎯 FEATURES

### Real-Time AI Research
- Uses Perplexity Sonar Pro model
- Searches latest data (2023-2024)
- Includes citations and sources

### Comprehensive Results
Each school recommendation includes:
- School name and location
- Specific program for your major
- Annual tuition costs
- Admission requirements
- Program rankings
- Scholarship opportunities
- Employment rates and salaries
- Application deadlines

### Clean UI
- Matches Rivernova branding
- Indigo/purple/pink gradients
- Dark theme
- Mobile responsive
- Loading states
- Error handling

---

## 🚀 DEPLOY TO VERCEL

### Quick Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Add Environment Variable in Vercel

In Vercel Dashboard → Project Settings → Environment Variables:
```
PERPLEXITY_API_KEY=your_perplexity_api_key
```

---

## 📁 FILES CREATED

```
src/app/search/
  └── page.tsx (Search UI)

src/app/api/search-schools/
  └── route.ts (Perplexity API integration)

src/app/page.tsx (Updated CTAs to link to /search)
```

---

## 🧪 TEST IT

### Example Search:
- **Major**: Computer Science
- **Budget**: $40,000 - $60,000
- **Location**: United States
- **GPA**: 3.7 / 4.0
- **Goals**: Want to work at a tech company

Expected results: 10-15 schools with CS programs, tuition info, rankings, etc.

---

## 🎨 DESIGN

Matches existing Rivernova branding:
- Dark background (#09090b)
- Gradient buttons (indigo → purple)
- Rounded-3xl cards
- White/5 backgrounds
- Smooth animations

---

## 🔑 API USAGE

### Perplexity API
- Model: `sonar-pro`
- Max tokens: 4000
- Temperature: 0.2
- Returns citations: Yes

### Rate Limits
- 50 requests/minute
- Consider caching for production

---

## 📊 NEXT STEPS

### Immediate:
- [ ] Test with different majors
- [ ] Test with different budgets
- [ ] Verify results accuracy
- [ ] Deploy to Vercel

### Future Enhancements:
- [ ] Save search results
- [ ] Compare schools side-by-side
- [ ] Export results to PDF
- [ ] Email results
- [ ] Add filters (public/private, size, etc.)

---

## 🐛 TROUBLESHOOTING

### "Search failed" error
- Check PERPLEXITY_API_KEY is set correctly
- Verify API key is valid
- Check Perplexity API status

### No results showing
- Check browser console for errors
- Verify API response in Network tab
- Check server logs

### Slow response
- Normal: Perplexity takes 20-30 seconds
- If longer, check API rate limits

---

## ✅ READY TO USE

The school search MVP is complete and ready to test!

1. Visit: http://localhost:3000/search
2. Enter your details
3. Get AI-powered school recommendations

**No database required. No authentication required. Just search!**
