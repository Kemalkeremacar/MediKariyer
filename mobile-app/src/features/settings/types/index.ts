/**
 * Settings Feature Types
 */

export type NotificationPreference = {
  email: boolean;
  sms: boolean;
  push: boolean;
};

export type SettingsData = {
  notifications: NotificationPreference;
  language: string;
  theme: 'light' | 'dark' | 'system';
};

export type SettingsUpdatePayload = Partial<SettingsData>;

export type AccountAction = 'freeze' | 'delete';

export type SettingsSection = 
  | 'personal' 
  | 'notifications' 
  | 'privacy' 
  | 'account';
