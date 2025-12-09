/**
 * 用于实现滑动删除功能的组合式函数。
 * @param canDelete - 判断当前是否允许删除的函数
 * @returns 提供滑动删除所需的响应式数据和事件处理函数
 */
export function useSwipeToDelete(canDelete: () => boolean) {
    // 每个项目的偏移量（用于滑动动画）
    const offsets = ref<number[]>([0]);
    // 记录每个项目拖拽开始时的 X 坐标
    const dragStartX = ref<number[]>([]);
    // 记录每个项目拖拽开始时的 Y 坐标
    const dragStartY = ref<number[]>([]);
    // 标记每个项目当前是否处于拖拽状态
    const isDragging = ref<boolean[]>([]);
    // 拖拽方向判定的阈值
    const dragThreshold = 10;
    // 当前已打开（显示删除按钮）的项目索引
    const currentOpenIndex = ref<number | null>(null);
    // 记录每个项目当前锁定的拖拽方向（水平/垂直/未锁定）
    const directionLocked = ref<('horizontal' | 'vertical' | null)[]>([]);
    // 用于存储requestAnimationFrame的ID，以便取消动画
    let animationFrameId: number | null = null;

    /**
     * 拖拽开始事件处理
     * @param event 鼠标或触摸事件
     * @param index 当前操作的项目索引
     */
    const handleDragStart = (event: MouseEvent | TouchEvent, index: number) => {
        if (!canDelete()) return;
        if (currentOpenIndex.value !== null && currentOpenIndex.value !== index) {
            offsets.value[currentOpenIndex.value] = 0;
        }
        isDragging.value[index] = true;
        dragStartX.value[index] = event instanceof MouseEvent ? event.clientX : event.touches?.[0]?.clientX ?? 0;
        dragStartY.value[index] = event instanceof MouseEvent ? event.clientY : event.touches?.[0]?.clientY ?? 0;
        offsets.value[index] = offsets.value[index] || 0;
        directionLocked.value[index] = null;
    };

    /**
     * 拖拽移动事件处理
     * @param event 鼠标或触摸事件
     * @param index 当前操作的项目索引
     */
    const handleDragMove = (event: MouseEvent | TouchEvent, index: number) => {
        if (!canDelete()) return;
        if (!isDragging.value[index]) return;
        
        // 使用可选链和空值合并运算符优化事件坐标获取
        const currentX = event instanceof MouseEvent ? event.clientX : event.touches?.[0]?.clientX ?? 0;
        const currentY = event instanceof MouseEvent ? event.clientY : event.touches?.[0]?.clientY ?? 0;
        
        // 预计算差值
        const startX = dragStartX.value[index] ?? 0;
        const startY = dragStartY.value[index] ?? 0;
        const diff = currentX - startX;
        const diffY = currentY - startY;

        // 优化方向锁定判断，减少计算量
        const currentLockedDirection = directionLocked.value[index];
        if (currentLockedDirection === null) {
            const absDiff = Math.abs(diff);
            const absDiffY = Math.abs(diffY);
            if (absDiff > dragThreshold || absDiffY > dragThreshold) {
                directionLocked.value[index] = absDiff > absDiffY ? 'horizontal' : 'vertical';
            }
        }

        // 阻止页面滚动（仅在横向滑动时）
        if (
            event.type === 'touchmove' &&
            directionLocked.value[index] === 'horizontal'
        ) {
            event.preventDefault();
        }

        // 只处理横向滑动，优化偏移量计算
        if (directionLocked.value[index] === 'horizontal') {
            // 使用requestAnimationFrame优化动画性能
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
            
            animationFrameId = requestAnimationFrame(() => {
                const isCurrentlyOpen = currentOpenIndex.value === index;
                const baseDiff = isCurrentlyOpen ? diff - 75 : diff;
                // 使用Math.max和Math.min限制偏移量范围
                const newOffset = Math.max(Math.min(baseDiff, 0), -75);
                offsets.value[index] = newOffset;
            });
        }
    };

    /**
     * 拖拽结束事件处理
     * @param index 当前操作的项目索引
     */
    const handleDragEnd = (index: number) => {
        if (!canDelete()) return;
        if (!isDragging.value[index]) return;
        
        // 取消任何挂起的动画帧请求
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
        }
        
        const offset = offsets.value[index];
        const isOpen = Math.abs(offset || 0) > 35;
        offsets.value[index] = isOpen ? -75 : 0;
        currentOpenIndex.value = isOpen ? index : null;
        isDragging.value[index] = false;
        directionLocked.value[index] = null;
    };

    return {
        offsets,
        dragStartX,
        dragStartY,
        isDragging,
        currentOpenIndex,
        directionLocked,
        handleDragStart,
        handleDragMove,
        handleDragEnd,
    };
}