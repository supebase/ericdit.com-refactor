import type { IPResponse } from "~/types";

/**
 * useGeoLocation
 * 获取用户地理位置信息的组合式函数
 * - 通过远程 API 获取用户 IP 和地理位置
 * - 提供默认兜底值，保证健壮性
 * @returns 包含 ip 和 location 的对象
 */
export const useGeoLocation = async () => {
  try {
    // 获取运行时配置
    const config = useRuntimeConfig();
    // 请求远程 IP/地理位置服务
    const data = await $fetch<IPResponse>(config.public.ipDataApiUrl, {
      timeout: 5000,
      retry: 2,
    });

    // 校验返回数据有效性
    if (!data.ipinfo?.text || !data.ipdata?.info1) {
      return {
        ip: "未知",
        location: "地球",
      };
    }

    // 返回有效的 IP 和地理位置信息
    return {
      ip: data.ipinfo.text,
      location: data.ipdata.info1,
    };
  } catch (error) {
    // 网络异常或接口异常时返回默认值
    return {
      ip: "未知",
      location: "地球",
    };
  }
};