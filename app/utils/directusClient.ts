import { createDirectus, rest, authentication, realtime } from "@directus/sdk";
import { retry, type RetryOptions } from "./retry";

/**
 * 创建和配置 Directus 客户端
 * @param apiUrl Directus API 的 URL 地址
 * @param credentials 配置是否携带 Cookie
 * @param autoRefresh 是否自动刷新令牌
 * @returns 配置好的客户端对象
 */
export const createDirectusClient = (
  apiUrl: string,
  credentials: RequestCredentials = "include",
  autoRefresh: boolean = true
) => {
  // 重试配置
  const retryOptions: RetryOptions = {
    maxRetries: 3,
    initialDelay: 500,
    maxDelay: 5000,
    onRetry: (attempt, error, delay) => {
      console.warn(`Directus 请求失败，正在重试 (${attempt + 1}/3)...`, {
        error: error.message,
        delay: `${delay}ms`
      });
    }
  };

  // 初始化基础客户端
  const baseClient = createDirectus(apiUrl).with(rest({ credentials }));

  // 初始化带认证的客户端
  const authClient = baseClient.with(authentication("session", { credentials, autoRefresh }));

  // 初始化带 WebSocket 的客户端
  const realtimeClient = baseClient.with(realtime());

  // 包装客户端请求方法，添加重试逻辑
  const wrapClientWithRetry = (client: any) => {
    const originalRequest = client.request;
    
    client.request = async (command: any, options?: any) => {
      return retry(() => originalRequest.call(client, command, options), retryOptions);
    };
    
    return client;
  };

  // 为所有客户端添加重试逻辑
  const baseClientWithRetry = wrapClientWithRetry(baseClient);
  const authClientWithRetry = wrapClientWithRetry(authClient);
  const realtimeClientWithRetry = wrapClientWithRetry(realtimeClient);

  return { 
    baseClient: baseClientWithRetry, 
    authClient: authClientWithRetry, 
    realtimeClient: realtimeClientWithRetry 
  };
};
