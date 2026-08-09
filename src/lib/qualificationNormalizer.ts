export interface QualificationContext {
  strengthLabel: string;
  usGpaEquivalent: string;
  aiPromptDescription: string;
  curriculumType: string;
  hasEnglishProficiency: boolean;
  englishDescription: string;
}

function parseIGCSEGrades(grades: string): { stars: number; aGrades: number; bGrades: number; cGrades: number } {
  // Count format: "6A* and 3As, 2Bs"
  const starCountMatch = grades.match(/(\d+)\s*A\*/i);
  const aCountMatch = grades.match(/(\d+)\s*A(?!\*)/i);
  const bCountMatch = grades.match(/(\d+)\s*B/i);
  if (starCountMatch || aCountMatch || bCountMatch) {
    return {
      stars: starCountMatch ? parseInt(starCountMatch[1]) : 0,
      aGrades: aCountMatch ? parseInt(aCountMatch[1]) : 0,
      bGrades: bCountMatch ? parseInt(bCountMatch[1]) : 0,
      cGrades: 0,
    };
  }
  // Individual subject format: "Mathematics A*, Physics A*, Chemistry A"
  const noStars = grades.replace(/A\*/gi, '');
  return {
    stars: (grades.match(/A\*/gi) || []).length,
    aGrades: (noStars.match(/\bA\b/gi) || []).length,
    bGrades: (grades.match(/\bB\b/gi) || []).length,
    cGrades: (grades.match(/\bC\b/gi) || []).length,
  };
}

function buildEnglishDescription(academic: Record<string, any>): { description: string; has: boolean } {
  const epType = academic.englishProficiencyType || '';
  const epScore = academic.ieltsToeflScore || '';
  if (epType === 'native') return { description: 'Native English speaker.', has: true };
  if (epType === 'not-yet') return { description: 'English proficiency test not yet taken.', has: false };
  if (!epType || !epScore) return { description: '', has: false };
  const labels: Record<string, string> = {
    ielts: 'IELTS', toefl: 'TOEFL iBT', det: 'Duolingo English Test',
    'cambridge-english': 'Cambridge English', cambridge: 'Cambridge English',
  };
  return { description: `${labels[epType] || epType}: ${epScore}.`, has: true };
}

function unknown(englishDescription: string, satScore: string): QualificationContext {
  const parts = ['Academic credentials not fully specified.'];
  if (satScore) parts.push(`SAT: ${satScore}.`);
  if (englishDescription) parts.push(englishDescription);
  return {
    strengthLabel: 'not specified',
    usGpaEquivalent: 'unknown',
    aiPromptDescription: parts.join(' '),
    curriculumType: 'Unknown',
    hasEnglishProficiency: !!englishDescription,
    englishDescription,
  };
}

export function normalizeQualification(academic: Record<string, any>): QualificationContext {
  const { description: englishDescription, has: hasEnglishProficiency } = buildEnglishDescription(academic);
  const satScore = academic.satScore || '';

  let curr = (academic.curriculumType || '').toLowerCase();

  // Backward compat: infer curriculum from old data shape
  if (!curr) {
    const ibScore = parseInt(academic.ibScore || '') || null;
    const gpa = parseFloat(academic.gpa || '') || null;
    const epType = academic.englishProficiencyType || '';
    const oldScore = academic.ieltsToeflScore || '';
    if (ibScore) curr = 'ib';
    else if (gpa) curr = 'us-gpa';
    else if ((epType === 'cambridge' || epType === 'cambridge-english') && oldScore && /[A-C\*]/.test(oldScore)) {
      // Old users who put IGCSE grades into the Cambridge language field
      curr = 'igcse';
    }
  }

  switch (curr) {
    case 'us-gpa': {
      const gpa = parseFloat(academic.gpa || '') || null;
      if (!gpa) return unknown(englishDescription, satScore);
      const scale = parseFloat(academic.gpaScale || '4.0') || 4.0;
      const norm = (gpa / scale) * 4.0;
      let strength: string;
      let equivalent: string;
      if (norm >= 3.9) { strength = 'top 5%'; equivalent = '~4.0 GPA'; }
      else if (norm >= 3.7) { strength = 'top 15%'; equivalent = `~${norm.toFixed(1)} GPA`; }
      else if (norm >= 3.4) { strength = 'top 25%'; equivalent = `~${norm.toFixed(1)} GPA`; }
      else if (norm >= 3.0) { strength = 'average'; equivalent = `~${norm.toFixed(1)} GPA`; }
      else { strength = 'below average'; equivalent = `~${norm.toFixed(1)} GPA`; }
      const parts = [`GPA: ${gpa}/${scale} (${strength} of US applicants).`];
      if (satScore) parts.push(`SAT: ${satScore}.`);
      if (englishDescription) parts.push(englishDescription);
      return { strengthLabel: strength, usGpaEquivalent: equivalent, aiPromptDescription: parts.join(' '), curriculumType: 'US GPA', hasEnglishProficiency, englishDescription };
    }

    case 'igcse': {
      // Support grades stored in either igcseGrades or legacy ieltsToeflScore
      const grades = (academic.igcseGrades || '').trim() ||
        ((academic.englishProficiencyType === 'cambridge' || academic.englishProficiencyType === 'cambridge-english')
          ? (academic.ieltsToeflScore || '')
          : '');
      if (!grades) return unknown(englishDescription, satScore);
      const { stars, aGrades, bGrades } = parseIGCSEGrades(grades);
      let strength: string;
      let equivalent: string;
      if (stars >= 6) { strength = 'exceptional (top 2% globally)'; equivalent = '~4.0 GPA'; }
      else if (stars >= 4) { strength = 'top 5% globally'; equivalent = '~3.9 GPA'; }
      else if (stars >= 2 || (stars >= 1 && aGrades >= 3)) { strength = 'top 10%'; equivalent = '~3.7 GPA'; }
      else if (aGrades >= 4) { strength = 'top 15%'; equivalent = '~3.6 GPA'; }
      else if (bGrades >= 4) { strength = 'above average'; equivalent = '~3.3 GPA'; }
      else { strength = 'average'; equivalent = '~3.2 GPA'; }
      const desc = [`Cambridge IGCSE: ${grades} (${strength} academic profile).`];
      if (englishDescription) desc.push(englishDescription);
      return { strengthLabel: strength, usGpaEquivalent: equivalent, aiPromptDescription: desc.join(' '), curriculumType: 'Cambridge IGCSE', hasEnglishProficiency, englishDescription };
    }

    case 'alevel': {
      const grades = (academic.aLevelGrades || '').trim();
      if (!grades) return unknown(englishDescription, satScore);
      const upper = grades.toUpperCase();
      const stars = (upper.match(/A\*/g) || []).length;
      const aGrades = (upper.replace(/A\*/g, '').match(/\bA\b/g) || []).length;
      const bGrades = (upper.match(/\bB\b/g) || []).length;
      let strength: string;
      let equivalent: string;
      if (stars >= 3) { strength = 'exceptional — A*A*A* level (Oxford/Cambridge competitive)'; equivalent = '~4.0 GPA'; }
      else if (stars >= 2) { strength = 'top 5% — Russell Group competitive'; equivalent = '~3.9 GPA'; }
      else if (stars >= 1 && aGrades >= 2) { strength = 'top 10%'; equivalent = '~3.8 GPA'; }
      else if (aGrades >= 3) { strength = 'top 15%'; equivalent = '~3.7 GPA'; }
      else if (aGrades >= 2 && bGrades >= 1) { strength = 'top 25%'; equivalent = '~3.5 GPA'; }
      else { strength = 'above average'; equivalent = '~3.3 GPA'; }
      const desc = [`Cambridge A-Level: ${grades} (${strength}).`];
      if (englishDescription) desc.push(englishDescription);
      return { strengthLabel: strength, usGpaEquivalent: equivalent, aiPromptDescription: desc.join(' '), curriculumType: 'Cambridge A-Level', hasEnglishProficiency, englishDescription };
    }

    case 'ib': {
      const score = parseInt(academic.ibScore || '') || null;
      if (!score) return unknown(englishDescription, satScore);
      let strength: string;
      let equivalent: string;
      if (score >= 42) { strength = 'exceptional (top 1% globally)'; equivalent = '~4.0 GPA'; }
      else if (score >= 38) { strength = 'top 5%'; equivalent = '~3.9 GPA'; }
      else if (score >= 34) { strength = 'top 15%'; equivalent = '~3.7 GPA'; }
      else if (score >= 30) { strength = 'top 30%'; equivalent = '~3.4 GPA'; }
      else { strength = 'average (IB passing level)'; equivalent = '~3.0 GPA'; }
      const desc = [`IB Diploma: ${score}/45 (${strength} globally).`];
      if (englishDescription) desc.push(englishDescription);
      return { strengthLabel: strength, usGpaEquivalent: equivalent, aiPromptDescription: desc.join(' '), curriculumType: 'IB Diploma', hasEnglishProficiency, englishDescription };
    }

    case 'indian-board': {
      const raw = (academic.indianBoardPercent || '').replace('%', '').trim();
      const pct = parseFloat(raw) || null;
      if (!pct) return unknown(englishDescription, satScore);
      let strength: string;
      let equivalent: string;
      if (pct >= 95) { strength = 'exceptional (top 2%)'; equivalent = '~3.9 GPA'; }
      else if (pct >= 90) { strength = 'top 10%'; equivalent = '~3.7 GPA'; }
      else if (pct >= 85) { strength = 'top 20%'; equivalent = '~3.5 GPA'; }
      else if (pct >= 75) { strength = 'above average'; equivalent = '~3.2 GPA'; }
      else { strength = 'average'; equivalent = '~3.0 GPA'; }
      const desc = [`Indian Board (CBSE/ISC): ${pct}% (${strength}).`];
      if (englishDescription) desc.push(englishDescription);
      return { strengthLabel: strength, usGpaEquivalent: equivalent, aiPromptDescription: desc.join(' '), curriculumType: 'Indian Board (CBSE/ISC)', hasEnglishProficiency, englishDescription };
    }

    case 'other': {
      const details = (academic.nationalExamDetails || '').trim();
      if (!details) return unknown(englishDescription, satScore);
      const lower = details.toLowerCase();
      let strength = '';
      let equivalent = '';
      if (lower.includes('myanmar') || lower.includes('matriculation')) {
        if (lower.includes('distinction')) { strength = 'top 10% in Myanmar national curriculum'; equivalent = '~3.7 GPA equivalent'; }
        else if (lower.includes('merit')) { strength = 'top 25% in Myanmar national curriculum'; equivalent = '~3.3 GPA equivalent'; }
        else if (lower.includes('pass')) { strength = 'passing level'; equivalent = '~2.8 GPA equivalent'; }
        else { strength = 'Myanmar national curriculum graduate'; equivalent = '~3.0 GPA equivalent'; }
      }
      const desc = [`National Curriculum Qualification: ${details}.`];
      if (strength) desc.push(`Academic standing: ${strength} (${equivalent}).`);
      if (englishDescription) desc.push(englishDescription);
      return {
        strengthLabel: strength || 'national curriculum',
        usGpaEquivalent: equivalent || 'see details',
        aiPromptDescription: desc.join(' '),
        curriculumType: 'Other National Curriculum',
        hasEnglishProficiency,
        englishDescription,
      };
    }

    default:
      return unknown(englishDescription, satScore);
  }
}
