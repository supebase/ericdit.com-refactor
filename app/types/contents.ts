import type { UserProfile } from "./user";

export interface ContentType {
  id: string;
  name: string;
  description: string;
}

export interface ContentItem {
  id: string;
  title: string;
  body: string;
  content_type_id: ContentType;
  allow_comments: boolean;
  images: any[];
  user_created: UserProfile;
  date_created: string;
  date_updated: string;
  views: number;
  github_repo?: string;
}

export interface ContentQueryOptions {
  fields: string[];
  sort?: string[];
  filter?: Record<string, any>;
  limit?: number;
  page?: number;
}
