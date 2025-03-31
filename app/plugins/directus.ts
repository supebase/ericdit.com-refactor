/**
 * @file directus.ts
 * @description Directus API 插件配置文件，用于集成和管理 Directus 服务的核心功能
 */

import {
  // 用户管理相关接口
  registerUser, // 用户注册
  updateUser, // 更新用户信息
  readMe, // 获取当前用户信息
  readUser, // 获取指定用户信息
  readUsers, // 获取用户列表
  // 内容管理相关接口
  readItem, // 读取单个内容项
  readItems, // 批量读取内容项
  createItem, // 创建内容项
  updateItem, // 更新内容项
  deleteItem, // 删除内容项
  // 文件管理相关接口
  readFile, // 读取文件信息
  uploadFiles, // 上传文件
  deleteFile, // 删除文件
} from "@directus/sdk";

/**
 * Directus 插件初始化
 * @description 配置并提供 Directus 的核心功能，包括基础API、认证、实时通信等
 * @returns {Object} 包含所有 Directus API 的插件对象
 */
export default defineNuxtPlugin(() => {
  const { directus, authClient, realtimeClient } = useDirectus();

  // 提供插件中需要的 Directus API
  return {
    provide: {
      directus, // 基础客户端
      authClient, // 带认证的客户端
      realtimeClient, // 带 WebSocket 的客户端

      // 用户相关 API
      user: {
        registerUser,
        updateUser,
        readMe,
        readUser,
        readUsers,
      },

      // 内容管理 API
      content: {
        readItem,
        readItems,
        createItem,
        updateItem,
        deleteItem,
      },

      // 文件管理 API
      file: {
        readFile,
        uploadFiles,
        deleteFile,
      },
    },
  };
});
