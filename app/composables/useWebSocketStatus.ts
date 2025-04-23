const WS_URL = 'wss://api.ericdit.com/websocket' // 请替换为你的 WebSocket 地址

const status = ref<'OPEN' | 'CONNECTING' | 'CLOSED'>('CLOSED')
const { status: wsStatus } = useWebSocket(WS_URL, {
    onConnected: () => { status.value = 'OPEN' },
    onDisconnected: () => { status.value = 'CLOSED' },
    onError: () => { status.value = 'CLOSED' },

    autoReconnect: {
        retries: 3,
        delay: 3000,
    },
    heartbeat: {
        message: 'ping',
        interval: 30000,
        pongTimeout: 5000,
    },
})

export function useWebSocketStatus() {
    // 也可以直接暴露 wsStatus，下面做了一个映射
    const connectionStatus = computed(() => wsStatus.value)
    return {
        status: connectionStatus,
    }
}