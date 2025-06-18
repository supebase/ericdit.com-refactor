import type { UseTimeAgoMessages } from "@vueuse/core";

/**
 * 自定义时间映射表
 * 将特定时间段转换为更友好的中文表述
 */
const timeMap: Record<string, string> = {
  "1 天": "昨天",
  "2 天": "前天",
  "1 周": "上周",
  "1 个月": "上个月",
  "1 年": "去年",
};

/**
 * 完整日期格式化函数
 * 将日期转换为中文格式的完整日期字符串
 * 例如：2024年1月1日
 *
 * @param date - 要格式化的日期对象
 * @returns 格式化后的日期字符串
 */
const fullDateFormatter = (date: Date): string => {
  return new Date(date).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * 相对时间消息配置
 * 定义不同时间单位的中文显示格式
 */
const messages: UseTimeAgoMessages = {
  justNow: "刚刚",
  past: (n) => timeMap[n] || `${n}前`,
  future: (n) => `${n} 后`,
  second: (n) => `${n} 秒`,
  minute: (n) => `${n} 分钟`,
  hour: (n) => `${n} 小时`,
  day: (n) => `${n} 天`,
  week: (n) => `${n} 周`,
  month: (n) => `${n} 个月`,
  year: (n) => `${n} 年`,
  invalid: "无效的日期",
};

/**
 * 日期时间格式化组合式函数
 * 将日期转换为相对时间格式（例如：刚刚、1分钟前、昨天等）
 *
 * @param date - 要格式化的日期（支持多种格式）
 * @returns ComputedRef<string> 格式化后的相对时间字符串
 *
 * @example
 * ```ts
 * const formattedDate = useDatetime(new Date())
 * console.log(formattedDate.value) // 输出：刚刚
 *
 * const formattedDate = useDatetime('2024-01-01')
 * console.log(formattedDate.value) // 输出：x天前
 * ```
 */
export function useDateFormatter(date: string | Date | number | null): ComputedRef<string> {
  return computed(() => {
    if (!date) return messages.invalid;

    try {
      return useTimeAgo(date, {
        messages,
        max: "year",
        fullDateFormatter,
      }).value;
    } catch (error) {
      console.warn("Date formatting error:", error);
      return messages.invalid;
    }
  });
}
