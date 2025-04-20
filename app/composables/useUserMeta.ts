/**
 * useUserMeta
 * 用户元信息（如头像、地理位置）缓存与获取的组合式函数
 * - 支持全局缓存用户头像和地理位置信息
 * - 提供获取和设置方法，便于订阅实时数据时更新
 */
export const useUserMeta = () => {
    // 全局缓存用户头像（userId -> avatarId）
    const userAvatars = useState<Record<string, string>>("userMeta:avatars", () => ({}));
    // 全局缓存用户地理位置（userId -> location）
    const userLocations = useState<Record<string, string>>("userMeta:locations", () => ({}));

    /**
     * 获取用户头像URL（如未缓存则先写入）
     * @param userId 用户ID
     * @param avatarId 头像ID
     * @returns 头像URL或null
     */
    const getUserAvatarUrl = (userId: string, avatarId: string | null): string | null => {
        if (!avatarId) return null;
        if (!userAvatars.value[userId]) {
            userAvatars.value[userId] = avatarId;
        }
        return userAvatars.value[userId];
    };

    /**
     * 获取用户地理位置
     * @param userId 用户ID
     * @param fallback 兜底值
     * @returns 地理位置字符串或null
     */
    const getUserLocation = (userId: string, fallback?: string): string | null => {
        return userLocations.value[userId] || fallback || null;
    };

    /**
     * 设置用户头像（用于实时订阅时更新缓存）
     * @param userId 用户ID
     * @param avatarId 头像ID
     */
    const setUserAvatar = (userId: string, avatarId: string) => {
        userAvatars.value[userId] = avatarId;
    };

    /**
     * 设置用户地理位置（用于实时订阅时更新缓存）
     * @param userId 用户ID
     * @param location 地理位置
     */
    const setUserLocation = (userId: string, location: string) => {
        userLocations.value[userId] = location;
    };

    return {
        getUserAvatarUrl,
        getUserLocation,
        setUserAvatar,
        setUserLocation,
        userAvatars,
        userLocations,
    };
};