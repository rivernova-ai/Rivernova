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
  graduationRate?: string;
  netPrice?: string;
  gpaMinimum?: string;
  ranking?: string;
  employmentRate?: string;
  avgSalary?: string;
  scholarships?: string;
  highlights: string[];
  [key: string]: any;
}

export function getTuitionNumber(tuitionStr: string): number {
  if (!tuitionStr) return 0;
  const m = tuitionStr.match(/\$?([\d,]+)/);
  return m ? parseInt(m[1].replace(/,/g, '')) : 0;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(value);
}
