import { useEffect, useRef, useState } from "react";

import {
    calculateRemainingTime,
    clearCooldownTimer,
    getStoredTimerEndTime,
    startCooldownTimer,
} from "@/lib/helpers/timer";

export function useCooldownTimer(key: string, duration: number) {
    const [remainingTime, setRemainingTime] = useState(0);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const endTime = getStoredTimerEndTime(key);
        if (endTime) {
            const secondsLeft = calculateRemainingTime(endTime);
            if (secondsLeft > 0) {
                setRemainingTime(secondsLeft);
            } else {
                clearCooldownTimer(key);
            }
        }
    }, [key]);

    useEffect(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        if (remainingTime > 0) {
            intervalRef.current = setInterval(() => {
                setRemainingTime((prev) => {
                    if (prev <= 1) {
                        clearCooldownTimer(key);
                        clearInterval(intervalRef.current!);
                        intervalRef.current = null;
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [remainingTime, key]);

    const startTimer = () => {
        startCooldownTimer(key, duration);
        setRemainingTime(duration);
    };

    return {
        remainingTime,
        startTimer,
        isTimerActive: remainingTime > 0,
    };
}
