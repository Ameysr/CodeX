import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook for timer functionality
 * Used in ProblemPage and ContestEditorPage
 */
const useTimer = (autoStart = true) => {
    const [timer, setTimer] = useState(0);
    const [timerActive, setTimerActive] = useState(autoStart);

    useEffect(() => {
        let interval;
        if (timerActive) {
            interval = setInterval(() => {
                setTimer((prev) => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timerActive]);

    const toggleTimer = useCallback(() => {
        setTimerActive((prev) => !prev);
    }, []);

    const resetTimer = useCallback(() => {
        setTimer(0);
        setTimerActive(false);
    }, []);

    return { timer, timerActive, toggleTimer, resetTimer };
};

export default useTimer;
