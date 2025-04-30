export interface ProfileAvatarReturn {
  avatarUrl: ComputedRef<string | null>;
  isLoading: Ref<boolean>;
  uploadAvatar: (file: File) => Promise<void>;
}

export interface ImageMeta {
  directus_files_id: string;
}

export interface UserStatsReturn {
  totalUsers: Ref<number>;
  fetchTotalUsers: () => Promise<void>;
  isLoading: Ref<boolean>;
}

export interface UserMetricsReturn {
  commentsCount: Ref<number>;
  likesCount: Ref<number>;
  fetchStats: (userId: string) => Promise<void>;
}

export interface IPResponse {
  ipinfo: {
    text: string;
  };
  ipdata: {
    info1: string;
  };
}

export interface CleanupController {
  addCleanup: (fn: () => void) => void;
  runCleanup: () => void;
}

export interface AppSettings {
  site_name: string | Ref<string>;
  site_description: string | Ref<string>;
  seo_keywords: string;
  maintenance_mode: boolean;
  type?: "website" | "article";
  noindex?: boolean;
  donate_images: any[];
}

export interface VersionInfo {
  version: string;
  buildTime: string;
  buildHash: string;
  fullVersion: string;
}
