// Shared TypeScript type definitions for MediKariyer Documentation System

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: Permission[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRole {
  id: string;
  name: 'admin' | 'doctor' | 'hospital' | 'developer';
  description: string;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  resource: string;
  actions: string[];
  conditions?: AccessCondition[];
}

export interface AccessCondition {
  field: string;
  operator: 'equals' | 'contains' | 'in' | 'not_in';
  value: string | string[];
}

export interface Component {
  id: string;
  name: string;
  type: 'backend' | 'frontend' | 'mobile' | 'shared';
  layer: 'presentation' | 'business' | 'data' | 'infrastructure';
  path: string;
  dependencies: ComponentDependency[];
  interfaces: ComponentInterface[];
  documentation: ComponentDocumentation;
}

export interface ComponentDependency {
  targetComponent: string;
  dependencyType: 'hard' | 'soft' | 'optional';
  description: string;
}

export interface ComponentInterface {
  name: string;
  type: 'api' | 'function' | 'class' | 'module';
  signature: string;
  description: string;
}

export interface ComponentDocumentation {
  description: string;
  examples: string[];
  lastUpdated: Date;
  author: string;
}

export interface Change {
  id: string;
  type: 'ui' | 'api' | 'database' | 'business-logic' | 'configuration';
  component: string;
  description: string;
  scope: 'minor' | 'major' | 'breaking';
  author: string;
  timestamp: Date;
}

export interface ImpactReport {
  id: string;
  changeId: string;
  affectedComponents: ComponentImpact[];
  affectedRoles: RoleImpact[];
  affectedFlows: FlowImpact[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  generatedAt: Date;
}

export interface ComponentImpact {
  componentId: string;
  impactType: 'direct' | 'indirect';
  severity: 'low' | 'medium' | 'high';
  description: string;
}

export interface RoleImpact {
  roleId: string;
  affectedFeatures: string[];
  impactDescription: string;
}

export interface FlowImpact {
  flowId: string;
  affectedSteps: string[];
  impactDescription: string;
}