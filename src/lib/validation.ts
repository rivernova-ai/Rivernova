/**
 * Profile form validation utilities
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

/**
 * Validates GPA (0.0 to 4.0, decimal allowed)
 */
export function validateGPA(value: string): { isValid: boolean; error?: string } {
  if (!value) return { isValid: true }; // Optional field
  
  const gpa = parseFloat(value);
  
  if (isNaN(gpa)) {
    return { isValid: false, error: 'GPA must be a number' };
  }
  
  if (gpa < 0 || gpa > 4.0) {
    return { isValid: false, error: 'GPA must be between 0.0 and 4.0' };
  }
  
  return { isValid: true };
}

/**
 * Validates SAT score (400-1600)
 */
export function validateSATScore(value: string): { isValid: boolean; error?: string } {
  if (!value) return { isValid: true }; // Optional field
  
  const score = parseInt(value, 10);
  
  if (isNaN(score)) {
    return { isValid: false, error: 'SAT score must be a number' };
  }
  
  if (score < 400 || score > 1600) {
    return { isValid: false, error: 'SAT score must be between 400 and 1600' };
  }
  
  return { isValid: true };
}

/**
 * Validates ACT score (1-36)
 */
export function validateACTScore(value: string): { isValid: boolean; error?: string } {
  if (!value) return { isValid: true }; // Optional field
  
  const score = parseInt(value, 10);
  
  if (isNaN(score)) {
    return { isValid: false, error: 'ACT score must be a number' };
  }
  
  if (score < 1 || score > 36) {
    return { isValid: false, error: 'ACT score must be between 1 and 36' };
  }
  
  return { isValid: true };
}

/**
 * Validates Dream Job (text only, minimum 3 characters, no numbers)
 */
export function validateDreamJob(value: string): { isValid: boolean; error?: string } {
  if (!value) return { isValid: true }; // Optional field
  
  if (value.length < 3) {
    return { isValid: false, error: 'Dream job must be at least 3 characters' };
  }
  
  if (/\d/.test(value)) {
    return { isValid: false, error: 'Dream job cannot contain numbers' };
  }
  
  return { isValid: true };
}

/**
 * Validates Career Field (text only, minimum 3 characters, no numbers)
 */
export function validateCareerField(value: string): { isValid: boolean; error?: string } {
  if (!value) return { isValid: true }; // Optional field
  
  if (value.length < 3) {
    return { isValid: false, error: 'Career field must be at least 3 characters' };
  }
  
  if (/\d/.test(value)) {
    return { isValid: false, error: 'Career field cannot contain numbers' };
  }
  
  return { isValid: true };
}

/**
 * Validates budget (numbers only, positive)
 */
export function validateBudget(value: string): { isValid: boolean; error?: string } {
  if (!value) return { isValid: true }; // Optional field
  
  const budget = parseInt(value, 10);
  
  if (isNaN(budget)) {
    return { isValid: false, error: 'Budget must be a number' };
  }
  
  if (budget < 0) {
    return { isValid: false, error: 'Budget must be positive' };
  }
  
  return { isValid: true };
}

/**
 * Validates budget range (min < max)
 */
export function validateBudgetRange(
  minValue: string,
  maxValue: string
): { isValid: boolean; error?: string } {
  if (!minValue || !maxValue) return { isValid: true }; // Optional fields
  
  const min = parseInt(minValue, 10);
  const max = parseInt(maxValue, 10);
  
  if (isNaN(min) || isNaN(max)) {
    return { isValid: false, error: 'Budget values must be numbers' };
  }
  
  if (min >= max) {
    return { isValid: false, error: 'Maximum budget must be greater than minimum budget' };
  }
  
  return { isValid: true };
}

/**
 * Validates all profile fields
 */
export function validateProfileFields(data: {
  gpa?: string;
  satScore?: string;
  actScore?: string;
  dreamJob?: string;
  careerField?: string;
  budgetMin?: string;
  budgetMax?: string;
}): ValidationResult {
  const errors: ValidationError[] = [];
  
  if (data.gpa) {
    const gpaValidation = validateGPA(data.gpa);
    if (!gpaValidation.isValid) {
      errors.push({ field: 'gpa', message: gpaValidation.error || 'Invalid GPA' });
    }
  }
  
  if (data.satScore) {
    const satValidation = validateSATScore(data.satScore);
    if (!satValidation.isValid) {
      errors.push({ field: 'satScore', message: satValidation.error || 'Invalid SAT score' });
    }
  }
  
  if (data.actScore) {
    const actValidation = validateACTScore(data.actScore);
    if (!actValidation.isValid) {
      errors.push({ field: 'actScore', message: actValidation.error || 'Invalid ACT score' });
    }
  }
  
  if (data.dreamJob) {
    const dreamJobValidation = validateDreamJob(data.dreamJob);
    if (!dreamJobValidation.isValid) {
      errors.push({ field: 'dreamJob', message: dreamJobValidation.error || 'Invalid dream job' });
    }
  }
  
  if (data.careerField) {
    const careerFieldValidation = validateCareerField(data.careerField);
    if (!careerFieldValidation.isValid) {
      errors.push({ field: 'careerField', message: careerFieldValidation.error || 'Invalid career field' });
    }
  }
  
  if (data.budgetMin || data.budgetMax) {
    const budgetMinValidation = validateBudget(data.budgetMin || '');
    if (!budgetMinValidation.isValid) {
      errors.push({ field: 'budgetMin', message: budgetMinValidation.error || 'Invalid minimum budget' });
    }
    
    const budgetMaxValidation = validateBudget(data.budgetMax || '');
    if (!budgetMaxValidation.isValid) {
      errors.push({ field: 'budgetMax', message: budgetMaxValidation.error || 'Invalid maximum budget' });
    }
    
    const budgetRangeValidation = validateBudgetRange(data.budgetMin || '', data.budgetMax || '');
    if (!budgetRangeValidation.isValid) {
      errors.push({ field: 'budgetRange', message: budgetRangeValidation.error || 'Invalid budget range' });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}
