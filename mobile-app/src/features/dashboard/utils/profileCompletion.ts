export interface ProfileSection {
  name: string;
  weight: number;
  isComplete: boolean;
}

export interface ProfileCompletionData {
  personalInfo: boolean;
  education: boolean;
  experience: boolean;
  certificates: boolean;
  languages: boolean;
}

const SECTION_WEIGHTS = {
  personalInfo: 20,
  education: 20,
  experience: 30,
  certificates: 20,
  languages: 10,
};

export const calculateProfileCompletion = (data: ProfileCompletionData): number => {
  let totalCompletion = 0;

  if (data.personalInfo) totalCompletion += SECTION_WEIGHTS.personalInfo;
  if (data.education) totalCompletion += SECTION_WEIGHTS.education;
  if (data.experience) totalCompletion += SECTION_WEIGHTS.experience;
  if (data.certificates) totalCompletion += SECTION_WEIGHTS.certificates;
  if (data.languages) totalCompletion += SECTION_WEIGHTS.languages;

  return Math.round(totalCompletion);
};

export const checkSectionComplete = (sectionName: keyof ProfileCompletionData, data: any): boolean => {
  switch (sectionName) {
    case 'personalInfo':
      // Check for both possible field names from API
      const hasName = !!(data.first_name && data.last_name) || !!data.fullName;
      const hasEmail = !!data.email;
      const hasPhone = !!data.phone || !!data.phone_number;
      const hasCity = !!data.residence_city_name || !!data.city;
      return hasName && hasEmail;
    case 'education':
      return !!(data.educations && data.educations.length > 0);
    case 'experience':
      return !!(data.experiences && data.experiences.length > 0);
    case 'certificates':
      return !!(data.certificates && data.certificates.length > 0);
    case 'languages':
      return !!(data.languages && data.languages.length > 0);
    default:
      return false;
  }
};

export const getProfileSections = (data: any): ProfileSection[] => {
  return [
    {
      name: 'Kişisel Bilgiler',
      weight: SECTION_WEIGHTS.personalInfo,
      isComplete: checkSectionComplete('personalInfo', data),
    },
    {
      name: 'Eğitim',
      weight: SECTION_WEIGHTS.education,
      isComplete: checkSectionComplete('education', data),
    },
    {
      name: 'Deneyim',
      weight: SECTION_WEIGHTS.experience,
      isComplete: checkSectionComplete('experience', data),
    },
    {
      name: 'Sertifikalar',
      weight: SECTION_WEIGHTS.certificates,
      isComplete: checkSectionComplete('certificates', data),
    },
    {
      name: 'Diller',
      weight: SECTION_WEIGHTS.languages,
      isComplete: checkSectionComplete('languages', data),
    },
  ];
};
