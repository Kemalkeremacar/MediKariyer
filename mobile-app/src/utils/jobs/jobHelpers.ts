/**
 * Job Helper Utilities
 * Utility functions for job-related operations
 */

/**
 * Format date relative to now (e.g., "2 days ago", "1 week ago")
 */
export const formatJobDate = (dateString: string | null): string => {
  if (!dateString) return 'Tarih belirtilmemiş';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Bugün';
  if (diffDays === 1) return 'Dün';
  if (diffDays < 7) return `${diffDays} gün önce`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} ay önce`;
  return `${Math.floor(diffDays / 365)} yıl önce`;
};

/**
 * Format salary range for display
 */
export const formatSalaryRange = (
  minSalary?: number | null,
  maxSalary?: number | null
): string => {
  if (!minSalary && !maxSalary) return 'Maaş belirtilmemiş';
  
  const formatter = new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  if (minSalary && maxSalary) {
    return `${formatter.format(minSalary)} - ${formatter.format(maxSalary)}`;
  }
  
  if (minSalary) {
    return `${formatter.format(minSalary)}+`;
  }
  
  if (maxSalary) {
    return `${formatter.format(maxSalary)}'e kadar`;
  }
  
  return 'Maaş belirtilmemiş';
};

/**
 * Get work type display label
 */
export const getWorkTypeLabel = (workType: string | null): string => {
  if (!workType) return 'Belirtilmemiş';
  
  const workTypeMap: Record<string, string> = {
    'full-time': 'Tam Zamanlı',
    'part-time': 'Yarı Zamanlı',
    'contract': 'Sözleşmeli',
    'temporary': 'Geçici',
    'internship': 'Staj',
  };
  
  return workTypeMap[workType.toLowerCase()] || workType;
};

/**
 * Check if job application deadline has passed
 */
export const isJobExpired = (deadline: string | null): boolean => {
  if (!deadline) return false;
  
  const deadlineDate = new Date(deadline);
  const now = new Date();
  
  return deadlineDate < now;
};

/**
 * Get days remaining until application deadline
 */
export const getDaysUntilDeadline = (deadline: string | null): number | null => {
  if (!deadline) return null;
  
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const diffMs = deadlineDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
};

/**
 * Format application deadline for display
 */
export const formatDeadline = (deadline: string | null): string => {
  if (!deadline) return 'Son başvuru tarihi belirtilmemiş';
  
  const daysRemaining = getDaysUntilDeadline(deadline);
  
  if (daysRemaining === null) return 'Son başvuru tarihi belirtilmemiş';
  if (daysRemaining === 0) return 'Bugün son gün';
  if (daysRemaining === 1) return 'Yarın son gün';
  if (daysRemaining < 7) return `${daysRemaining} gün kaldı`;
  
  const deadlineDate = new Date(deadline);
  return deadlineDate.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

/**
 * Parse requirements string/array into array of strings
 */
export const parseRequirements = (requirements: string | string[] | null): string[] => {
  if (!requirements) return [];
  
  if (Array.isArray(requirements)) {
    return requirements.filter(req => req && req.trim().length > 0);
  }
  
  // If it's a string, try to parse as JSON first
  if (typeof requirements === 'string') {
    try {
      const parsed = JSON.parse(requirements);
      if (Array.isArray(parsed)) {
        return parsed.filter(req => req && req.trim().length > 0);
      }
    } catch {
      // If JSON parse fails, split by newlines or semicolons
      return requirements
        .split(/[\n;]/)
        .map(req => req.trim())
        .filter(req => req.length > 0);
    }
  }
  
  return [];
};
