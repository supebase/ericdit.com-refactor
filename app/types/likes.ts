import type { UserProfile } from "./user";

export interface LikeItem {
  id: string;
  user_created: UserProfile;
  content_id: string;
  comment_id?: string | null;
}

export interface LikeQueryOptions {
  fields: string[];
  sort?: string[];
  filter?: Record<string, any>;
}
