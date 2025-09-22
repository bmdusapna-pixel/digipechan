const getStoredTimerEndTime = (key: string): number | null => {
    const storedEndTime = localStorage.getItem(key);
    if (!storedEndTime) {
        return null;
    }

    const endTime = parseInt(storedEndTime, 10);
    if (isNaN(endTime)) {
        localStorage.removeItem(key);
        return null;
    }

    return endTime;
};

const calculateRemainingTime = (endTime: number): number => {
    const now = Date.now();
    return Math.max(Math.ceil((endTime - now) / 1000), 0);
};

const startCooldownTimer = (key: string, duration: number): void => {
    const endTime = Date.now() + duration * 1000;
    localStorage.setItem(key, endTime.toString());
};

const clearCooldownTimer = (key: string): void => {
    localStorage.removeItem(key);
};

export { calculateRemainingTime, clearCooldownTimer, getStoredTimerEndTime, startCooldownTimer };
