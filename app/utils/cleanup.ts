export const createCleanup = () => {
    const cleanupFns: (() => void)[] = [];

    const addCleanup = (fn: () => void) => {
        cleanupFns.push(fn);
    };

    const runCleanup = () => {
        cleanupFns.forEach(fn => fn());
        cleanupFns.length = 0;
    };

    return {
        addCleanup,
        runCleanup
    };
};