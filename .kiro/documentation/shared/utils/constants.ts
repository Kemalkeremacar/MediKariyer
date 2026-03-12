// Shared constants for MediKariyer Documentation System

export const USER_ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor', 
  HOSPITAL: 'hospital',
  DEVELOPER: 'developer',
} as const;

export const COMPONENT_TYPES = {
  BACKEND: 'backend',
  FRONTEND: 'frontend',
  MOBILE: 'mobile',
  SHARED: 'shared',
} as const;

export const COMPONENT_LAYERS = {
  PRESENTATION: 'presentation',
  BUSINESS: 'business',
  DATA: 'data',
  INFRASTRUCTURE: 'infrastructure',
} as const;

export const CHANGE_TYPES = {
  UI: 'ui',
  API: 'api',
  DATABASE: 'database',
  BUSINESS_LOGIC: 'business-logic',
  CONFIGURATION: 'configuration',
} as const;

export const CHANGE_SCOPES = {
  MINOR: 'minor',
  MAJOR: 'major',
  BREAKING: 'breaking',
} as const;

export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  DOCUMENTATION: '/api/documentation',
  ARCHITECTURE: '/api/architecture',
  ROLES: '/api/roles',
  FLOWS: '/api/flows',
  IMPACT: '/api/impact',
} as const;

export const SUPPORTED_FILE_EXTENSIONS = [
  '.js', '.ts', '.jsx', '.tsx', '.vue', 
  '.py', '.java', '.cs', '.php', '.rb'
] as const;

export const EXCLUDE_PATTERNS = [
  'node_modules', 'dist', 'build', '.git', 
  'coverage', '.next', '.nuxt', 'vendor'
] as const;