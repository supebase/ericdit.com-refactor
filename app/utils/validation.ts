import type { ValidationResult } from "~/types/auth";
import { AUTH_VALIDATION_RULES } from "~/types/auth";

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export const validateUsername = (name: string): ValidationResult => {
  const isChinese = /[\u4e00-\u9fa5]/.test(name);
  const { CHINESE_MIN_LENGTH, ENGLISH_MIN_LENGTH, CHINESE_MAX_LENGTH, ENGLISH_MAX_LENGTH } =
    AUTH_VALIDATION_RULES.USERNAME;
  const maxLength = isChinese ? CHINESE_MAX_LENGTH : ENGLISH_MAX_LENGTH;
  const minLength = isChinese ? CHINESE_MIN_LENGTH : ENGLISH_MIN_LENGTH;
  const specialCharPattern = /^[\u4e00-\u9fa5a-zA-Z0-9]+$/;
  const isPureNumber = /^[0-9]+$/.test(name);

  if (!name) return { valid: false, message: "请输入你的名字。" };
  if (isChinese && name.length < minLength)
    return { valid: false, message: "中文名字至少需要 2 个字。" };
  if (!isChinese && name.length < minLength)
    return { valid: false, message: "英文名字至少需要 3 个字母。" };
  if (name.length > maxLength)
    return {
      valid: false,
      message: isChinese ? "中文名字最多 8 个字。" : "英文名字最多 20 个字母",
    };
  if (!specialCharPattern.test(name))
    return { valid: false, message: "名字不能包含特殊字符，请检查并修改。" };
  if (isPureNumber) return { valid: false, message: "名字至少含一个字母或汉字，不能纯数字。" };

  return { valid: true, message: "" };
};

export const validatePassword = (password: string): ValidationResult => {
  if (!password) return { valid: false, message: "请输入密码" };
  if (password.length < AUTH_VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
    return { valid: false, message: "密码长度不能少于 8 个字符。" };
  }
  return { valid: true, message: "" };
};
