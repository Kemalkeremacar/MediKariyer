/**
 * Profile Feature Types
 */

export interface ProfileData {
  id: number;
  first_name: string;
  last_name: string;
  title: string;
  specialty_name: string;
  subspecialty_name: string | null;
  phone: string | null;
  residence_city_name: string | null;
  completion_percent: number;
  has_photo: boolean;
  profile_photo: string | null;
  email?: string;
}

export interface ProfileMenuItem {
  id: string;
  icon: any;
  label: string;
  onPress: () => void;
  showChevron?: boolean;
}

export interface ProfileSection {
  title: string;
  items: ProfileMenuItem[];
}
