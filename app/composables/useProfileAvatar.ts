import type { User } from "~/types";

/**
 * 用户头像管理组合式函数
 * @returns {Object} 返回头像相关的状态和方法
 * - avatarUrl: 计算属性，返回当前用户头像的URL
 * - isLoading: 上传状态标志
 * - uploadAvatar: 头像上传方法
 */
export const useProfileAvatar = (): object => {
  // 注入必要的依赖
  const { $authClient, $file, $user } = useNuxtApp();
  const { user } = useAuth();
  const toast = useToast();

  /**
   * 上传状态标志
   * @type {Ref<boolean>}
   */
  const isLoading: Ref<boolean> = ref(false);

  /**
   * 计算用户头像URL
   * @returns {string | null} 返回头像URL或null
   */
  const avatarUrl = computed(() => {
    const avatarId = user.value?.avatar;
    return avatarId ? `${useAssets(avatarId)}` : null;
  });

  /**
   * 上传用户头像
   * @param {File} file - 要上传的图片文件
   * @returns {Promise<void>}
   * @throws {Error} 上传失败时抛出错误
   */
  const uploadAvatar = async (file: File): Promise<void> => {
    if (!file) return;
    isLoading.value = true;

    const formData = new FormData();
    formData.append("file", file);

    try {
      // 如果已有头像，先删除旧头像
      if (user.value?.avatar) {
        await $authClient.request($file.deleteFile(user.value.avatar));
      }

      // 上传新头像
      const uploadResponse = await $authClient.request($file.uploadFiles(formData));
      if (uploadResponse && uploadResponse.id) {
        // 更新用户信息中的头像ID
        const updatedUser = await $authClient.request<User.Profile>(
          $user.updateUser(user.value?.id || "", { avatar: uploadResponse.id })
        );
        if (user.value) {
          user.value.avatar = updatedUser.avatar;
        }
        // 显示成功提示
        toast.add({
          title: "上传通知",
          description: "您的头像已上传并更新成功。",
          icon: "hugeicons:checkmark-circle-02",
          color: "success",
        });
      }
    } catch (error: any) {
      // 错误处理和提示
      toast.add({
        title: "上传通知",
        description: error instanceof Error ? error.message : "发生错误，请稍后再试。",
        icon: "hugeicons:alert-02",
        color: "error",
      });
    } finally {
      isLoading.value = false;
    }
  };

  return { avatarUrl, isLoading, uploadAvatar };
};
