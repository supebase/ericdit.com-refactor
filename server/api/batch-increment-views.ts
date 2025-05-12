import { defineEventHandler, readBody } from "h3";
import { createDirectus, rest, readItem, updateItem } from "@directus/sdk";

/**
 * 批量增加内容浏览量的服务端 API
 * 接收前端批量上报的内容浏览量增量数据，依次读取并更新每个内容的 views 字段
 * 适用于高并发下的浏览量统计，避免直接在前端并发写入导致的竞态问题
 */
export default defineEventHandler(async (event) => {
    // 读取请求体，期望为 [{ id: string, count: number }, ...] 的数组
    const body = await readBody(event);
    if (!Array.isArray(body)) {
        return { success: false, message: "Invalid payload" };
    }

    // 获取运行时配置中的 Directus API 地址
    const config = useRuntimeConfig();
    // 创建 Directus 基础客户端，使用 REST 适配器
    const baseClient = createDirectus(config.public.directusApiUrl).with(rest({ "credentials": "include" }));

    // 并发处理所有内容的浏览量更新
    await Promise.all(
        body.map(async (item) => {
            const { id, count } = item;
            // 校验参数有效性
            if (!id || typeof count !== "number") return;
            try {
                // 读取当前内容的 views 字段
                const content = await baseClient.request(
                    readItem("contents", id, { fields: ["views"] })
                );
                const currentViews = content?.views ?? 0;
                // 更新内容的 views 字段，累加本次的 count
                await baseClient.request(
                    updateItem("contents", id, { views: currentViews + count })
                );
            } catch (e) {
                // 可选：记录日志或收集失败项，便于后续排查
            }
        })
    );

    // 返回处理结果
    return { success: true };
});