export const useUserMeta = () => {
    const userAvatars = useState<Record<string, string>>("userMeta:avatars", () => ({}));
    const userLocations = useState<Record<string, string>>("userMeta:locations", () => ({}));

    const getUserAvatarUrl = (userId: string, avatarId: string | null): string | null => {
        if (!avatarId) return null;
        if (!userAvatars.value[userId]) {
            userAvatars.value[userId] = avatarId;
        }
        return userAvatars.value[userId];
    };

    const getUserLocation = (userId: string, fallback?: string): string | null => {
        return userLocations.value[userId] || fallback || null;
    };

    // 可选：暴露设置方法，供订阅时更新缓存
    const setUserAvatar = (userId: string, avatarId: string) => {
        userAvatars.value[userId] = avatarId;
    };
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