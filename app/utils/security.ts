/**
 * escapeHtml
 * HTML 转义函数：将特殊字符转为安全的 HTML 实体，防止 XSS 攻击
 * @param text 待转义的字符串
 * @returns 转义后的安全字符串
 */
export const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};