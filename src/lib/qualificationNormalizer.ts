export interface QualificationContext {
  strengthLabel: string;
  usGpaEquivalent: string;
  aiPromptDescription: string;
  curriculumType: string;
  hasEnglishProficiency: boolean;
  englishDescription: string;
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
      const parts = [`GPA: ${gpa}/${scale}.`];
      if (satScore) parts.push(`SAT: ${satScore}.`);
      if (englishDescription) parts.push(englishDescription);
      return { strengthLabel: 'us-gpa', usGpaEquivalent: `${gpa}/${scale}`, aiPromptDescription: parts.join(' '), curriculumType: 'US GPA', hasEnglishProficiency, englishDescription };
    }

    case 'igcse': {
      // Support grades stored in either igcseGrades or legacy ieltsToeflScore
      const grades = (academic.igcseGrades || '').trim() ||
        ((academic.englishProficiencyType === 'cambridge' || academic.englishProficiencyType === 'cambridge-english')
          ? (academic.ieltsToeflScore || '')
          : '');
      if (!grades) return unknown(englishDescription, satScore);
      const desc = [`Cambridge IGCSE: ${grades}.`];
      if (englishDescription) desc.push(englishDescription);
      return { strengthLabel: 'igcse', usGpaEquivalent: 'see grades', aiPromptDescription: desc.join(' '), curriculumType: 'Cambridge IGCSE', hasEnglishProficiency, englishDescription };
    }

    case 'alevel': {
      const grades = (academic.aLevelGrades || '').trim();
      if (!grades) return unknown(englishDescription, satScore);
      const desc = [`Cambridge A-Level: ${grades}.`];
      if (englishDescription) desc.push(englishDescription);
      return { strengthLabel: 'alevel', usGpaEquivalent: 'see grades', aiPromptDescription: desc.join(' '), curriculumType: 'Cambridge A-Level', hasEnglishProficiency, englishDescription };
    }

    case 'ib': {
      const score = parseInt(academic.ibScore || '') || null;
      if (!score) return unknown(englishDescription, satScore);
      const desc = [`IB Diploma: ${score}/45.`];
      if (englishDescription) desc.push(englishDescription);
      return { strengthLabel: 'ib', usGpaEquivalent: `${score}/45`, aiPromptDescription: desc.join(' '), curriculumType: 'IB Diploma', hasEnglishProficiency, englishDescription };
    }

    case 'indian-board': {
      const raw = (academic.indianBoardPercent || '').replace('%', '').trim();
      const pct = parseFloat(raw) || null;
      if (!pct) return unknown(englishDescription, satScore);
      const desc = [`Indian Board (CBSE/ISC): ${pct}%.`];
      if (englishDescription) desc.push(englishDescription);
      return { strengthLabel: 'indian-board', usGpaEquivalent: `${pct}%`, aiPromptDescription: desc.join(' '), curriculumType: 'Indian Board (CBSE/ISC)', hasEnglishProficiency, englishDescription };
    }

    case 'other': {
      const details = (academic.nationalExamDetails || '').trim();
      if (!details) return unknown(englishDescription, satScore);
      const desc = [`National Curriculum Qualification: ${details}.`];
      if (englishDescription) desc.push(englishDescription);
      return {
        strengthLabel: 'other',
        usGpaEquivalent: 'see details',
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
