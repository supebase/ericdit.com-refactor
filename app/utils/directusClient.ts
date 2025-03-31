import { createDirectus, rest, authentication, realtime } from "@directus/sdk";

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
  // 初始化基础客户端
  const baseClient = createDirectus(apiUrl).with(rest({ credentials }));

  // 初始化带认证的客户端
  const authClient = baseClient.with(authentication("session", { credentials, autoRefresh }));

  // 初始化带 WebSocket 的客户端
  const realtimeClient = baseClient.with(realtime());

  return { baseClient, authClient, realtimeClient };
};
