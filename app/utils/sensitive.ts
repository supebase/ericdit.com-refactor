import type { BlocklistConfig, SensitiveWord, MatchResult, FilterResult } from "~/types";
import blockList from "~/sensitive/words.json";

/**
 * 敏感词过滤类
 * 使用正则表达式实现高效的敏感词匹配
 */
export class SensitiveWordFilter {
  private config: BlocklistConfig;
  private initialized: boolean = false;
  private whitelist: Set<string> = new Set();
  private sensitiveWords: SensitiveWord[] = [];
  private regexPatterns: Map<string, RegExp> = new Map();

  constructor(config?: Partial<BlocklistConfig>) {
    // 合并默认配置和用户配置
    this.config = {
      caseSensitive: false,
      ignorePunctuation: true,
      ignoreWhitespace: true,
      ignoreNumbers: false,
      matchMode: "exact",
      replacement: "*",
      levels: ["critical", "medium", "low"],
      allowPartialMatch: false,
      ...config,
    };
  }

  /**
   * 初始化敏感词库
   * @param words 敏感词列表
   */
  public init(words: SensitiveWord[]): void {
    if (this.initialized) {
      return;
    }

    // 存储敏感词列表
    this.sensitiveWords = words;
    // 构建正则表达式模式
    this.buildRegexPatterns();

    this.initialized = true;
  }

  /**
   * 构建正则表达式模式
   */
  private buildRegexPatterns(): void {
    // 按敏感词长度降序排序，优先匹配长词
    const sortedWords = [...this.sensitiveWords].sort((a, b) => b.word.length - a.word.length);

    // 获取所有敏感词文本
    const wordTexts = sortedWords.map((word) => this.escapeRegex(word.word));

    // 构建正则表达式模式
    const flags = this.config.caseSensitive ? "g" : "gi";

    // 构建精确匹配模式（考虑词边界）
    const exactPattern = new RegExp(`\\b(${wordTexts.join("|")})\\b`, flags);
    // 构建模糊匹配模式（不考虑词边界）
    const anyPattern = new RegExp(`(${wordTexts.join("|")})`, flags);
    // 构建支持分隔符的匹配模式
    const separatorPattern = new RegExp(
      `(${wordTexts.map((word) => word.split("").join("[\\s\\p{P}\\p{S}]*")).join("|")})`,
      flags
    );

    // 存储正则表达式模式
    this.regexPatterns.set("exact", exactPattern);
    this.regexPatterns.set("any", anyPattern);
    this.regexPatterns.set("separator", separatorPattern);
  }

  /**
   * 转义正则表达式特殊字符
   * @param text 要转义的文本
   * @returns 转义后的文本
   */
  private escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /**
   * 添加敏感词
   * @param word 敏感词对象
   */
  public addWord(word: SensitiveWord): void {
    this.sensitiveWords.push(word);
    this.buildRegexPatterns();
  }

  /**
   * 添加白名单词
   * @param words 白名单词列表
   */
  public addToWhitelist(words: string[]): void {
    for (const word of words) {
      this.whitelist.add(word.toLowerCase());
    }
  }

  /**
   * 从白名单中移除词
   * @param words 要移除的词列表
   */
  public removeFromWhitelist(words: string[]): void {
    for (const word of words) {
      this.whitelist.delete(word.toLowerCase());
    }
  }

  /**
   * 清空白名单
   */
  public clearWhitelist(): void {
    this.whitelist.clear();
  }

  /**
   * 检查文本中是否包含敏感词
   * @param text 待检查文本
   * @returns 是否包含敏感词
   */
  public hasSensitiveWords(text: string): boolean {
    return this.match(text).length > 0;
  }

  /**
   * 匹配文本中的敏感词
   * @param text 待检查文本
   * @returns 匹配结果列表
   */
  public match(text: string): MatchResult[] {
    if (!this.initialized) {
      this.init(blockList as SensitiveWord[]);
    }

    // 检查是否在白名单中
    if (this.whitelist.has(text.toLowerCase())) {
      return [];
    }

    const results: MatchResult[] = [];
    const originalText = text;
    const seenMatches = new Set<string>();

    // 直接使用正则表达式检测包含分隔符的敏感词
    const separatorPattern = new RegExp(
      this.sensitiveWords
        .sort((a, b) => b.word.length - a.word.length)
        .map((word) => {
          // 将敏感词转换为支持分隔符的正则表达式
          const escaped = this.escapeRegex(word.word);
          return `(${escaped.split("").join("[\\s\\p{P}\\p{S}]*")})`;
        })
        .join("|"),
      this.config.caseSensitive ? "g" : "gi"
    );

    // 重置正则表达式的lastIndex
    separatorPattern.lastIndex = 0;

    // 查找所有匹配项
    let match: RegExpExecArray | null;
    while ((match = separatorPattern.exec(text)) !== null) {
      // 查找匹配到的敏感词信息
      const matchedWord = this.sensitiveWords.find((word) => {
        // 检查原始敏感词是否与匹配的文本（去除分隔符后）匹配
        const cleanedMatch = match?.[0].replace(/[\s\p{P}\\p{S}]/gu, "") ?? "";
        const wordPattern = new RegExp(
          `^${this.escapeRegex(word.word)}$`,
          this.config.caseSensitive ? "" : "i"
        );
        return wordPattern.test(cleanedMatch);
      });

      if (matchedWord) {
        // 生成唯一的匹配标识符，避免重复
        const matchKey = `${match.index}-${match[0]}-${matchedWord.word}`;
        if (!seenMatches.has(matchKey)) {
          seenMatches.add(matchKey);
          results.push({
            word: matchedWord.word,
            level: matchedWord.level,
            start: match.index,
            end: match.index + match[0].length,
            originalText: match[0],
          });
        }
      }
    }

    return results;
  }

  /**
   * 过滤文本中的敏感词（替换为指定字符）
   * @param text 待过滤文本
   * @param replacement 替换字符，默认为配置中的replacement
   * @returns 过滤后的文本
   */
  public filter(text: string, replacement?: string): string {
    const matches = this.match(text);
    if (matches.length === 0) {
      return text;
    }

    let result = text;
    const repl = replacement || this.config.replacement;

    // 按匹配结果的起始位置倒序处理，避免替换后影响后续匹配位置
    matches
      .sort((a, b) => b.start - a.start)
      .forEach((match) => {
        const replacementText = repl.repeat(match.end - match.start);
        result = result.substring(0, match.start) + replacementText + result.substring(match.end);
      });

    return result;
  }

  /**
   * 过滤文本并返回详细结果
   * @param text 待过滤文本
   * @param replacement 替换字符，默认为配置中的replacement
   * @returns 过滤结果对象
   */
  public filterWithDetails(text: string, replacement?: string): FilterResult {
    const matches = this.match(text);
    const filteredText = this.filter(text, replacement);

    return {
      filteredText,
      matches,
      hasSensitiveWords: matches.length > 0,
    };
  }

  /**
   * 获取当前敏感词数量
   * @returns 敏感词数量
   */
  public getWordCount(): number {
    if (!this.initialized) {
      this.init(blockList as SensitiveWord[]);
    }

    return this.sensitiveWords.length;
  }

  /**
   * 清空敏感词库
   */
  public clear(): void {
    this.sensitiveWords = [];
    this.regexPatterns.clear();
    this.initialized = false;
  }

  /**
   * 获取当前配置
   * @returns 当前配置对象
   */
  public getConfig(): BlocklistConfig {
    return { ...this.config };
  }

  /**
   * 更新配置
   * @param config 新的配置对象
   * @returns 更新后的配置
   */
  public updateConfig(config: Partial<BlocklistConfig>): void {
    this.config = { ...this.config, ...config };
    // 重新构建正则表达式模式
    if (this.initialized) {
      this.buildRegexPatterns();
    }
  }
}

/**
 * 创建全局的敏感词过滤器实例
 */
export const sensitiveFilter = new SensitiveWordFilter();

/**
 * 检查文本是否包含敏感词的便捷方法
 * @param text 待检查文本
 * @returns 是否包含敏感词
 */
export const hasSensitiveWords = (text: string): boolean => {
  return sensitiveFilter.hasSensitiveWords(text);
};

/**
 * 过滤文本中的敏感词的便捷方法
 * @param text 待过滤文本
 * @param replacement 替换字符
 * @returns 过滤后的文本
 */
export const filterSensitiveWords = (text: string, replacement?: string): string => {
  return sensitiveFilter.filter(text, replacement);
};

/**
 * 匹配文本中的敏感词的便捷方法
 * @param text 待检查文本
 * @returns 匹配结果列表
 */
export const matchSensitiveWords = (text: string): MatchResult[] => {
  return sensitiveFilter.match(text);
};
