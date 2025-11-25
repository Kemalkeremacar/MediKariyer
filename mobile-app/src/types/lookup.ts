export interface Specialty {
  id: number;
  name: string;
  description?: string | null;
}

export interface Subspecialty {
  id: number;
  name: string;
  specialty_id: number;
  description?: string | null;
}

export interface City {
  id: number;
  name: string;
  country?: string | null;
}

export interface ApplicationStatus {
  id: number;
  name: string;
}

export interface EducationType {
  id: number;
  name: string;
  description?: string | null;
  is_required?: boolean;
}

export interface Language {
  id: number;
  name: string;
  code?: string | null;
}

export interface LanguageLevel {
  id: number;
  name: string;
  description?: string | null;
}

