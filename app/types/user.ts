export interface UserProfile {
  id: string;
  first_name: string;
  email: string;
  avatar: string;
  location: string;
}

export interface UserStatus {
  id: string;
  user_created: UserProfile;
  last_activity_at: string | null;
}
