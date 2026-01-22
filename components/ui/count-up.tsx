"use client";

import { useEffect, useState } from "react";

interface CountUpProps {
    end: number;
    duration?: number;
    decimals?: number;
    prefix?: string;
    suffix?: string;
    className?: string;
}

export function CountUp({
    end,
    duration = 2000,
    decimals = 0,
    prefix = "",
    suffix = "",
    className,
}: CountUpProps) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number | null = null;
        let animationFrame: number;

        const animate = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);

            // Easing function: easeOutExpo
            const easeOut = percentage === 1 ? 1 : 1 - Math.pow(2, -10 * percentage);

            const currentCount = easeOut * end;
            setCount(currentCount);

            if (progress < duration) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration]);

    return (
        <span className={className}>
            {prefix}
            {count.toFixed(decimals)}
            {suffix}
        </span>
    );
}
