export interface UserProfile {
  id: string;
  first_name: string;
  email: string;
  avatar: string;
  location: string;
  role: {
    name: string;
  };
}

export interface UserStatus {
  id: string;
  user_created: UserProfile;
  last_activity_at: string | null;
}

export interface UserStatusComposable {
  usersStatus: Ref<Record<string, boolean>>;
  updateUserStatus: () => Promise<void>;
  checkUserStatus: (userId: string) => Promise<boolean>;
  updateLastActivity: () => void;
  subscribeUserStatus: (userId: string) => Promise<(() => void) | undefined>;
  cleanup: () => void;
}
