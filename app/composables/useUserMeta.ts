/**
 * useUserMeta
 * 用户元信息（如头像、地理位置）缓存与获取的组合式函数
 * - 支持全局缓存用户头像和地理位置信息
 * - 提供通用的获取和设置方法，便于扩展
 */
type UserMeta = {
  avatarId?: string;
  location?: string;
};
type UserMetaKey = keyof UserMeta;

export const useUserMeta = () => {
  // 全局缓存用户元信息（userId -> meta对象）
  const userMetas = useState<Record<string, UserMeta>>("userMeta:metas", () => ({}));

  /**
   * 通用获取用户元信息
   * @param userId 用户ID
   * @param key 元信息key（如 avatarId, location）
   * @param fallback 兜底值
   * @returns 元信息值或null
   */
  const getUserMeta = (userId: string, key: UserMetaKey, fallback?: string): string | null => {
    return userMetas.value[userId]?.[key] || fallback || null;
  };

  /**
   * 通用设置用户元信息
   * @param userId 用户ID
   * @param key 元信息key
   * @param value 元信息值
   */
  const setUserMeta = (userId: string, key: UserMetaKey, value: string) => {
    if (!userMetas.value[userId]) userMetas.value[userId] = {};
    userMetas.value[userId][key] = value;
  };

  /**
   * 获取用户头像URL（保持原有副作用逻辑）
   */
  const getUserAvatarUrl = (userId: string, avatarId: string | null): string | null => {
    if (!avatarId) return null;
    if (!userMetas.value[userId]?.avatarId) {
      setUserMeta(userId, "avatarId", avatarId);
    }
    return userMetas.value[userId]?.avatarId || null;
  };

  /**
   * 获取用户地理位置
   */
  const getUserLocation = (userId: string, fallback?: string): string | null => {
    return getUserMeta(userId, "location", fallback);
  };

  /**
   * 设置用户头像
   */
  const setUserAvatar = (userId: string, avatarId: string) => {
    setUserMeta(userId, "avatarId", avatarId);
  };

  /**
   * 设置用户地理位置
   */
  const setUserLocation = (userId: string, location: string) => {
    setUserMeta(userId, "location", location);
  };

  return {
    getUserAvatarUrl,
    getUserLocation,
    setUserAvatar,
    setUserLocation,
    userMetas,
    getUserMeta,
    setUserMeta,
  };
};
