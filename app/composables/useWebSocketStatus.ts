// 获取运行时配置中的 WebSocket 地址
const {
    public: { directusWebSocketUrl },
} = useRuntimeConfig();

// 定义 WebSocket 连接状态的响应式变量，初始为 'CLOSED'
const status = ref<'OPEN' | 'CONNECTING' | 'CLOSED'>('CLOSED')

// 使用 useWebSocket 组合式管理 WebSocket 连接
// 配置连接、断开、错误时的回调，以及自动重连和心跳机制
const { status: wsStatus, open } = useWebSocket(directusWebSocketUrl as string, {
    // 连接成功时设置状态为 OPEN
    onConnected: () => { status.value = 'OPEN' },
    // 断开连接或出错时设置状态为 CLOSED
    onDisconnected: () => { status.value = 'CLOSED' },
    onError: () => { status.value = 'CLOSED' },

    // 自动重连配置：最多重试3次，每次间隔3秒
    autoReconnect: {
        retries: 3,
        delay: 3000,
    },
    // 心跳机制配置：每30秒发送一次 'ping'，5秒内未收到 'pong' 判为超时
    heartbeat: {
        message: 'ping',
        interval: 30000,
        pongTimeout: 5000,
    },
})

// 监听页面可见性变化，页面重新可见且连接已关闭时自动重连
const { isVisible } = useVisibilityChange()
watch([isVisible, wsStatus], ([visible, ws]) => {
    if (visible && ws === 'CLOSED') {
        open()
    }
})

/**
 * useWebSocketStatus
 * 暴露 WebSocket 连接状态的组合式函数
 * @returns {Object} status - 当前 WebSocket 连接状态（'OPEN' | 'CONNECTING' | 'CLOSED'）
 */
export function useWebSocketStatus(): object {
    // 也可以直接暴露 wsStatus，这里做了一个映射，便于后续扩展
    const connectionStatus = computed(() => wsStatus.value)
    return {
        status: connectionStatus,
    }
}