/**
 * 文章图片元数据接口
 */
interface ImageMeta {
  directus_files_id: string;
}

/**
 * 阅读速度配置常量
 * WORDS_PER_MINUTE: 英文单词阅读速度（词/分钟）
 * CHINESE_CHARS_PER_MINUTE: 中文字符阅读速度（字/分钟）
 * IMAGE_TIME: 单张图片预计观看时间（分钟）
 * CAROUSEL_BASE_TIME: 图片组基础观看时间（分钟）
 * CODE_BLOCK_BASE_TIME: 代码块基础阅读时间（分钟）
 * CODE_LINE_TIME: 每行代码预计阅读时间（分钟）
 */
const READ_SPEED_CONFIG = {
  WORDS_PER_MINUTE: 200,
  CHINESE_CHARS_PER_MINUTE: 300,
  IMAGE_TIME: 0.25,
  CAROUSEL_BASE_TIME: 0.25,
  CODE_BLOCK_BASE_TIME: 0.3,
  CODE_LINE_TIME: 0.07,
} as const;

/**
 * 计算文章阅读时间的组合式函数
 * @param content - 文章内容（包含 Markdown 格式）
 * @param images - 文章关联的图片元数据数组
 * @returns 预计阅读时间（分钟）
 */
export const useArticleMetrics = (content: string, images?: Array<ImageMeta>): string => {
  const safeContent = content || "";

  /**
   * 计算代码块阅读时间
   * @param content - 文章内容
   * @returns 代码阅读时间（分钟）
   */
  const calculateCodeTime = (content: string): number => {
    const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
    return codeBlocks.reduce((total, block) => {
      const lines = block.split("\n").length - 2; // 减去代码块标记的两行
      return (
        total + READ_SPEED_CONFIG.CODE_BLOCK_BASE_TIME + lines * READ_SPEED_CONFIG.CODE_LINE_TIME
      );
    }, 0);
  };

  /**
   * 计算文本内容阅读时间
   * @param content - 文章内容（不含代码块）
   * @returns 文本阅读时间（分钟）
   */
  const calculateTextTime = (content: string): number => {
    const contentWithoutCode = content.replace(/```[\s\S]*?```/g, "");
    const chineseChars = contentWithoutCode.match(/[\u4e00-\u9fa5]/g)?.length || 0;
    const englishWords = contentWithoutCode
      .replace(/[\u4e00-\u9fa5]/g, "")
      .trim()
      .split(/\s+/).length;

    return (
      chineseChars / READ_SPEED_CONFIG.CHINESE_CHARS_PER_MINUTE +
      englishWords / READ_SPEED_CONFIG.WORDS_PER_MINUTE
    );
  };

  /**
   * 计算图片查看时间
   * @param imagesCount - 图片数量
   * @returns 图片查看时间（分钟）
   */
  const calculateImageTime = (imagesCount: number): number => {
    return imagesCount > 0
      ? READ_SPEED_CONFIG.CAROUSEL_BASE_TIME + imagesCount * READ_SPEED_CONFIG.IMAGE_TIME
      : 0;
  };

  /**
   * 计算总阅读时间
   * @param content - 文章内容
   * @param imagesCount - 图片数量
   * @returns 总阅读时间（分钟）
   */
  const calculateReadingTime = (content: string, imagesCount: number = 0): number => {
    if (!content) return 0;

    const codeTime = calculateCodeTime(content);
    const textTime = calculateTextTime(content);
    const imageTime = calculateImageTime(imagesCount);

    return Math.ceil(textTime + imageTime + codeTime);
  };

  // 计算文章中的总图片数（包括 Markdown 内联图片和外部图片）
  const totalImages = (images?.length || 0) + (safeContent.match(/!\[.*?\]\(.*?\)/g) || []).length;

  return `${calculateReadingTime(safeContent, totalImages)} 分钟`;
};
