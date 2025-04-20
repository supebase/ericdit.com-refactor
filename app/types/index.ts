/**
 * @file index.ts
 * @description 全局类型定义文件，包含用户、内容、评论等核心功能的接口定义
 */

/**
 * 用户相关类型定义
 */
export namespace User {
  /**
   * 用户档案接口
   * @interface Profile
   */
  export interface Profile {
    id: string; // 用户唯一标识
    first_name: string; // 用户名
    email: string; // 电子邮箱
    avatar: string; // 头像URL
    location: string; // 地理位置
  }

  /**
   * 用户在线状态接口
   * @interface Status
   */
  export interface Status {
    id: string; // 状态记录ID
    user_created: User.Profile; // 关联的用户信息
    last_activity_at: string | null; // 最后活动时间
  }
}

/**
 * 内容相关类型定义
 */
export namespace Contents {
  /**
   * 内容项接口
   * @interface Item
   */
  export interface Item {
    id: string; // 内容唯一标识
    title: string; // 内容标题
    body: string; // 内容主体
    content_type_id: Types; // 内容类型
    allow_comments: boolean; // 是否允许评论
    images: any[]; // 关联图片列表
    user_created: User.Profile; // 创建者信息
    date_created: string; // 创建时间
    date_updated: string; // 更新时间
    views: number; // 浏览量
  }

  /**
   * 内容类型接口
   * @interface Types
   */
  export interface Types {
    id: string; // 类型ID
    name: string; // 类型名称
    description: string; // 类型描述
  }

  /**
   * 查询选项接口
   * @interface QueryOptions
   */
  export interface QueryOptions {
    fields: string[]; // 需要返回的字段
    sort?: string[]; // 排序条件
    filter?: Record<string, any>; // 过滤条件
    limit?: number; // 每页数量
    page?: number; // 当前页码
  }
}

/**
 * 评论相关类型定义
 */
export namespace Comments {
  /**
   * 评论项接口
   * @interface Item
   */
  export interface Item {
    id: string; // 评论ID
    user_created: User.Profile; // 评论作者
    date_created: string; // 创建时间
    comment: string; // 评论内容
    content_id: string; // 关联的内容ID
    parent_comment_id?: string | null; // 父评论ID（用于回复）
  }

  /**
   * 评论查询选项接口
   * @interface QueryOptions
   */
  export interface QueryOptions {
    fields: string[]; // 需要返回的字段
    sort?: string[]; // 排序条件
    filter?: Record<string, any>; // 过滤条件
  }
}

/**
 * 点赞相关类型定义
 */
export namespace Likes {
  /**
   * 点赞项接口
   * @interface Item
   */
  export interface Item {
    id: string; // 点赞记录ID
    user_created: User.Profile; // 点赞用户
    content_id: string; // 被点赞的内容ID
    comment_id?: string | null; // 被点赞的评论ID（可选）
  }

  /**
   * 点赞查询选项接口
   * @interface QueryOptions
   */
  export interface QueryOptions {
    fields: string[]; // 需要返回的字段
    sort?: string[]; // 排序条件
    filter?: Record<string, any>; // 过滤条件
  }
}

/**
 * 书签相关类型定义
 */
export namespace Bookmarks {
  /**
   * 书签项接口
   * @interface Item
   */
  export interface Item {
    id: string; // 书签ID
    user_created: User.Profile; // 创建书签的用户
    date_created: string; // 创建时间
    content_id:
    | string
    | {
      // 关联的内容ID或内容对象
      id: string;
      title: string;
    };
  }

  /**
   * 书签查询选项接口
   * @interface QueryOptions
   */
  export interface QueryOptions {
    fields: string[]; // 需要返回的字段
    sort?: string[]; // 排序条件
    filter?: Record<string, any>; // 过滤条件
  }
}

/**
 * 头像上传相关返回类型
 */
export interface ProfileAvatarReturn {
  /**
   * 头像图片的计算属性 URL
   */
  avatarUrl: ComputedRef<string | null>;
  /**
   * 头像上传加载状态
   */
  isLoading: Ref<boolean>;
  /**
   * 上传头像方法
   * @param file 头像文件
   */
  uploadAvatar: (file: File) => Promise<void>;
}

/**
 * 用户统计数据返回类型（全站维度）
 */
export interface UserStatsReturn {
  /**
   * 全站活跃用户总数
   */
  totalUsers: Ref<number>;
  /**
   * 获取用户总数的方法
   */
  fetchTotalUsers: () => Promise<void>;
  /**
   * 加载状态
   */
  isLoading: Ref<boolean>;
}

/**
 * 用户个人统计数据返回类型
 */
export interface UserMetricsReturn {
  /**
   * 用户评论数
   */
  commentsCount: Ref<number>;
  /**
   * 用户点赞数
   */
  likesCount: Ref<number>;
  /**
   * 获取指定用户统计数据的方法
   * @param userId 用户ID
   */
  fetchStats: (userId: string) => Promise<void>;
}

/**
 * IP/地理位置接口返回类型
 */
export interface IPResponse {
  ipinfo: {
    /**
     * IP 地址文本
     */
    text: string;
  };
  ipdata: {
    /**
     * 地理位置信息
     */
    info1: string;
  };
}

/**
 * 清理控制器类型定义
 * - 用于注册和批量执行清理函数
 */
export interface CleanupController {
  /**
   * 注册清理函数
   * @param fn 清理回调
   */
  addCleanup: (fn: () => void) => void;
  /**
   * 执行所有清理函数
   */
  runCleanup: () => void;
}

/**
 * 应用设置类型定义
 */
export interface AppSettings {
  site_name: string | Ref<string>; // 网站名称
  site_description: string | Ref<string>; // 网站描述
  seo_keywords: string; // 搜索引擎关键词
  maintenance_mode: boolean; // 维护模式
  type?: "website" | "article"; // 页面类型
  noindex?: boolean; // 是否禁止搜索引擎收录
  donate_images: any[]; // 打赏二维码图片列表
}
