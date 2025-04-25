import type { UserProfile } from "./user";

export interface BookmarkItem {
  id: string;
  user_created: UserProfile;
  date_created: string;
  content_id:
    | string
    | {
        id: string;
        title: string;
      };
}

export interface BookmarkQueryOptions {
  fields: string[];
  sort?: string[];
  filter?: Record<string, any>;
}
