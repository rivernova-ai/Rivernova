/**
 * School comparison utilities
 */

export interface ComparisonSchool {
  name: string;
  location: string;
  program: string;
  tuition: string;
  matchScore?: number;
  admissionRate?: string;
  ranking?: string;
  employmentRate?: string;
  avgSalary?: string;
  scholarships?: string;
  highlights: string[];
  [key: string]: any;
}

export function getTuitionNumber(tuitionStr: string): number {
  return parseInt(tuitionStr?.replace(/[^0-9]/g, '') || '0');
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value);
}
