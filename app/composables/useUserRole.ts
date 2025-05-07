/**
 * useUserRole
 *
 * 该组合式函数用于获取当前用户的角色信息，并提供常用的角色判断属性（如 isAdmin）。
 * 适用于需要基于用户角色进行权限控制的场景。
 *
 * 返回值：
 * - isAdmin: 是否为管理员（Administrator）
 * - roleName: 当前用户角色名
 * - updateRoleName: 手动刷新角色名的方法
 *
 * 使用方式：
 * const { isAdmin, roleName } = useUserRole();
 */

export function useUserRole() {
  // 获取用户角色名和用户信息
  const { getUserRoleName, user } = useAuth();
  // 当前用户角色名
  const roleName = ref<string | null>(null);

  const isLoading = ref(true);

  // 是否为管理员
  const isAdmin = computed(() => roleName.value === "Administrator");

  /**
   * 异步更新当前用户角色名
   */
  const updateRoleName = async () => {
    isLoading.value = true;
    roleName.value = await getUserRoleName();
    isLoading.value = false;
  };

  // 监听用户信息变化，自动更新角色名
  watch(
    () => user.value,
    async (val) => {
      if (val) {
        await updateRoleName();
      } else {
        roleName.value = null;
        isLoading.value = false;
      }
    },
    { immediate: true }
  );

  return {
    isAdmin,
    roleName,
    updateRoleName,
    isLoading,
  };
}
