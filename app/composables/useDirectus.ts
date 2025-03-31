/**
 * Directus 客户端管理组合式函数
 * 提供三种类型的 Directus 客户端：
 * - 基础客户端：用于普通的 API 请求
 * - 认证客户端：用于需要身份验证的请求
 * - 实时客户端：用于 WebSocket 连接和实时数据订阅
 *
 * @throws Error 当 Directus API URL 配置无效时抛出错误
 * @returns 包含三种客户端实例的对象
 */

export const useDirectus = () => {
  const {
    public: { directusApiUrl },
  } = useRuntimeConfig();

  if (!directusApiUrl || !/^https?:\/\//.test(directusApiUrl)) {
    throw new Error("Directus API URL 没有配置正确");
  }

  const { baseClient, authClient, realtimeClient } = createDirectusClient(directusApiUrl);

  return {
    directus: baseClient, // 基础客户端
    authClient, // 带认证的客户端
    realtimeClient, // 带 WebSocket 的客户端
  };
};
