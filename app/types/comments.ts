import type { UserProfile } from "./user";

export interface CommentItem {
  id: string;
  user_created: UserProfile;
  date_created: string;
  comment: string;
  content_id: string;
  parent_comment_id?: string | null;
}

export interface CommentQueryOptions {
  fields: string[];
  sort?: string[];
  filter?: Record<string, any>;
  limit?: number;
}

export interface ReplyData {
  commentId: string;
  content: string;
}

export interface RecentComment {
  id: string
  comment: string
  user_created?: {
    avatar?: string
    first_name?: string
  }
  date_created: string
  parent_comment_id?: any
}
