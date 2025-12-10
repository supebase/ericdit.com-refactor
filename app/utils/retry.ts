/**
 * 通用重试工具函数
 * 实现指数退避策略，智能重试条件
 */

/**
 * 重试配置选项
 */
export interface RetryOptions {
  /** 最大重试次数，默认 3 次 */
  maxRetries?: number;
  /** 初始重试间隔（毫秒），默认 500ms */
  initialDelay?: number;
  /** 最大重试间隔（毫秒），默认 5000ms */
  maxDelay?: number;
  /** 重试条件函数，返回 true 时重试 */
  shouldRetry?: (error: any, attempt: number) => boolean;
  /** 重试前的回调函数 */
  onRetry?: (attempt: number, error: any, delay: number) => void;
}

/**
 * 判断是否为网络错误
 * @param error 错误对象
 * @returns 是否为网络错误
 */
export function isNetworkError(error: any): boolean {
  return (
    error.message === 'Failed to fetch' ||
    error.name === 'NetworkError' ||
    error.code === 'ECONNABORTED' ||
    error.code === 'ERR_NETWORK'
  );
}

/**
 * 判断是否为可重试的 HTTP 状态码
 * @param status HTTP 状态码
 * @returns 是否可重试
 */
export function isRetryableStatusCode(status: number): boolean {
  return [500, 502, 503, 504, 429].includes(status);
}

/**
 * 默认重试条件
 * - 网络错误
 * - 可重试的 HTTP 状态码
 * @param error 错误对象
 * @param attempt 当前重试次数
 * @returns 是否重试
 */
export function defaultShouldRetry(error: any, attempt: number): boolean {
  // 如果是 HTTP 响应错误
  if (error.response) {
    return isRetryableStatusCode(error.response.status);
  }
  // 如果是网络错误
  return isNetworkError(error);
}

/**
 * 重试函数
 * @param fn 需要重试的异步函数
 * @param options 重试配置
 * @returns 函数执行结果
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 500,
    maxDelay = 5000,
    shouldRetry = defaultShouldRetry,
    onRetry
  } = options;

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // 检查是否需要重试
      if (attempt < maxRetries && shouldRetry(error, attempt)) {
        // 计算重试延迟（指数退避）
        const delay = Math.min(
          initialDelay * Math.pow(2, attempt),
          maxDelay
        );

        // 调用重试回调
        if (onRetry) {
          onRetry(attempt, error, delay);
        }

        // 等待延迟
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        // 超过重试次数或不需要重试，抛出错误
        throw error;
      }
    }
  }

  // 理论上不会到达这里，但为了类型安全
  throw lastError;
}

/**
 * 带重试功能的 fetch 包装器
 * @param input fetch 输入
 * @param init fetch 选项
 * @param retryOptions 重试选项
 * @returns fetch 响应
 */
export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  retryOptions?: RetryOptions
): Promise<Response> {
  return retry(() => fetch(input, init), retryOptions);
}
