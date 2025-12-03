/**
 * Settings Feature Types
 */

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  push: boolean;
}

export interface SettingsData {
  notifications: NotificationSettings;
  language: string;
  theme: 'light' | 'dark' | 'system';
}

export interface SettingsUpdatePayload {
  notifications?: Partial<NotificationSettings>;
  language?: string;
  theme?: 'light' | 'dark' | 'system';
}

export type AccountAction = 'freeze' | 'delete';
