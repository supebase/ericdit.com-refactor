export interface ValidationResult {
  valid: boolean;
  message: string;
}

export type AuthErrorMessages = Record<string, string>;

export const AUTH_ERROR_MESSAGES: AuthErrorMessages = {
  "Invalid user credentials.": "错误的用户名或密码",
  'You don\'t have permission to "create" from collection "comments" or it does not exist.':
    "你还没有登录，不可以发表评论。",
};

export const AUTH_VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  USERNAME: {
    CHINESE_MIN_LENGTH: 2,
    ENGLISH_MIN_LENGTH: 3,
    CHINESE_MAX_LENGTH: 8,
    ENGLISH_MAX_LENGTH: 20,
  },
};
