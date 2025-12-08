/**
 * 敏感词级别类型
 * - critical: 严重违规，如政治敏感词、极端内容
 * - medium: 中度违规，如脏话、侮辱性语言
 * - low: 轻度违规，如广告、推广
 */
export type SensitiveWordLevel = 'critical' | 'medium' | 'low';

/**
 * 匹配模式类型
 * - exact: 精确匹配，只匹配完整的敏感词
 * - prefix: 前缀匹配，匹配敏感词开头的内容
 * - suffix: 后缀匹配，匹配敏感词结尾的内容
 * - any: 任意匹配，匹配包含敏感词的任何内容
 */
export type MatchMode = 'exact' | 'prefix' | 'suffix' | 'any';

/**
 * 敏感词信息接口
 */
export interface SensitiveWord {
  /**
   * 敏感词文本
   */
  word: string;
  /**
   * 敏感词级别
   */
  level: SensitiveWordLevel;
  /**
   * 敏感词分类
   */
  category?: string;
  /**
   * 敏感词描述
   */
  description?: string;
  /**
   * 创建时间
   */
  createdAt?: string;
}

/**
 * 匹配结果接口
 */
export interface MatchResult {
  /**
   * 匹配到的敏感词
   */
  word: string;
  /**
   * 敏感词级别
   */
  level: SensitiveWordLevel;
  /**
   * 匹配开始位置
   */
  start: number;
  /**
   * 匹配结束位置
   */
  end: number;
  /**
   * 原始匹配文本
   */
  originalText: string;
}

/**
 * 敏感词过滤器配置接口
 */
export interface BlocklistConfig {
  /**
   * 是否区分大小写
   */
  caseSensitive: boolean;
  /**
   * 是否忽略标点符号
   */
  ignorePunctuation: boolean;
  /**
   * 是否忽略空白字符
   */
  ignoreWhitespace: boolean;
  /**
   * 是否忽略数字
   */
  ignoreNumbers: boolean;
  /**
   * 是否允许部分匹配
   */
  allowPartialMatch: boolean;
  /**
   * 匹配模式
   */
  matchMode: MatchMode;
  /**
   * 替换字符
   */
  replacement: string;
  /**
   * 支持的敏感词级别
   */
  levels: SensitiveWordLevel[];
}

/**
 * 敏感词过滤结果接口
 */
export interface FilterResult {
  /**
   * 过滤后的文本
   */
  filteredText: string;
  /**
   * 匹配到的敏感词列表
   */
  matches: MatchResult[];
  /**
   * 是否包含敏感词
   */
  hasSensitiveWords: boolean;
}
