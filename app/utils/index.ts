import type { CleanupController } from "~/types";
import type { ValidationResult } from "~/types/auth";
import { AUTH_VALIDATION_RULES } from "~/types/auth";
import { hasSensitiveWords } from "./sensitive";

/**
 * createCleanup
 * 创建清理控制器，用于统一管理组件/模块中的清理逻辑
 * - 支持注册多个清理函数（自动去重）
 * - 支持批量执行并自动清空
 * @returns CleanupController 实例
 */
export const createCleanup = (): CleanupController => {
  // 使用 Set 存储所有注册的清理函数，避免重复
  const cleanupFns = new Set<() => void>();

  /**
   * 注册清理函数
   * @param fn 清理回调
   */
  const addCleanup = (fn: () => void) => {
    cleanupFns.add(fn);
  };

  /**
   * 执行所有清理函数，并清空队列
   */
  const runCleanup = () => {
    cleanupFns.forEach((fn) => fn());
    cleanupFns.clear();
  };

  return {
    addCleanup,
    runCleanup,
  };
};

/**
 * debounce
 * 防抖函数：在指定延迟时间内只执行最后一次调用
 * - 常用于输入、滚动等高频事件的性能优化
 * @param fn 需要防抖处理的函数
 * @param delay 延迟时间（毫秒）
 * @returns 防抖后的新函数
 */
export const debounce = useDebounceFn;

/**
 * escapeHtml
 * HTML 转义函数：将特殊字符转为安全的 HTML 实体，防止 XSS 攻击
 * @param text 待转义的字符串
 * @returns 转义后的安全字符串
 */
export const escapeHtml = (text: string): string => {
  if (typeof text !== "string" || !text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/`/g, "&#x60;")
    .replace(/=/g, "&#x3d;")
    .replace(/;/g, "&#x3b;")
    .replace(/\(/g, "&#x28;")
    .replace(/\)/g, "&#x29;")
    .replace(/\[/g, "&#x5b;")
    .replace(/\]/g, "&#x5d;");
};

/**
 * 安全 localStorage 操作工具
 * - 支持 set、get、remove，自动捕获异常
 */
export const safeStorage = {
  set(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error("无法访问本地存储，可能处于隐私模式:", error);
      return false;
    }
  },
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error("无法访问本地存储，可能处于隐私模式:", error);
      return null;
    }
  },
  remove(key: string) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("无法访问本地存储，可能处于隐私模式:", error);
      return false;
    }
  }
};

/**
 * 校验邮箱格式是否合法
 * @param email 邮箱地址
 * @returns 是否为合法邮箱
 */
export const validateEmail = (email: string): boolean => {
  // 基本检查
  if (typeof email !== 'string' || email.trim().length === 0) {
    return false;
  }
  
  // 长度检查（RFC 5321）
  if (email.length > 254) {
    return false;
  }
  
  // 本地部分长度检查（RFC 5321）
  const atIndex = email.indexOf('@');
  if (atIndex < 1 || atIndex > 64 || email.length - atIndex - 1 > 253) {
    return false;
  }
  
  // 更严格的邮箱验证正则
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  return emailRegex.test(email);
};

/**
 * 校验用户名是否合法
 * - 检查敏感词、长度、字符类型、是否纯数字等
 * @param name 用户名
 * @returns 校验结果对象
 */
export const validateUsername = (name: string): ValidationResult => {
  if (!name) return { valid: false, message: "请输入你的名字。" };

  // 先进行敏感词检查
  if (hasSensitiveWords(name)) {
    return { valid: false, message: "该名字包含系统保留字或敏感词，请使用其他名字。" };
  }

  const isChinese = /[\u4e00-\u9fa5]/.test(name);
  const { CHINESE_MIN_LENGTH, ENGLISH_MIN_LENGTH, CHINESE_MAX_LENGTH, ENGLISH_MAX_LENGTH } =
    AUTH_VALIDATION_RULES.USERNAME;
  const maxLength = isChinese ? CHINESE_MAX_LENGTH : ENGLISH_MAX_LENGTH;
  const minLength = isChinese ? CHINESE_MIN_LENGTH : ENGLISH_MIN_LENGTH;
  const specialCharPattern = /^[\u4e00-\u9fa5a-zA-Z0-9]+$/;
  const isPureNumber = /^[0-9]+$/.test(name);

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

/**
 * 校验密码复杂度
 * - 检查长度、包含大写/小写/数字/特殊字符
 * @param password 密码
 * @returns 校验结果对象
 */
export const validatePassword = (password: string): ValidationResult => {
  if (!password) return { valid: false, message: "请输入密码" };

  // 增加密码复杂度要求
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < AUTH_VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
    return { valid: false, message: "密码长度不能少于 8 个字符" };
  }

  if (!(hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar)) {
    return {
      valid: false,
      message: "密码必须包含大小写字母、数字和特殊字符",
    };
  }

  return { valid: true, message: "" };
};

/**
 * 校验评论内容是否包含敏感词
 * @param comment 评论内容
 * @returns 校验结果对象
 */
export const validateComment = (comment: string): { valid: boolean; message: string } => {
  if (hasSensitiveWords(comment)) {
    return { valid: false, message: "评论中包含敏感词" };
  }
  return { valid: true, message: "" };
};
