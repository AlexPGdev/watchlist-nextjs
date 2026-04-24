import React, { useEffect, useState } from "react";
import settings from "../constants/settings.json";

interface StatsProps {
    stats: {
        total: number;
        watched: number;
        toWatch: number;
        dailyStreak: number;
    }
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

function useAnimatedNumber(target: number, duration = 2500) {
    const [value, setValue] = useState(target)

    useEffect(() => {
        let start: number | null = null
        const from = value
        const to = target

        const step = (timestamp: number) => {
        if (start === null) start = timestamp
        const elapsed = timestamp - start
        const progress = Math.min(elapsed / duration, 1)
        const eased = easeOutCubic(progress)

        setValue(Math.round(from + (to - from) * eased))

        if (progress < 1) {
            requestAnimationFrame(step)
        }
        }

        requestAnimationFrame(step)
    }, [target, duration])

    return value
}

export const Stats = React.memo(function Stats({ stats }: StatsProps) {
    
    const animatedTotal = useAnimatedNumber(stats.total)
    const animatedWatched = useAnimatedNumber(stats.watched)
    const animatedToWatch = useAnimatedNumber(stats.toWatch)
    const animatedStreak = useAnimatedNumber(stats.dailyStreak)

    return (
        <div className="flex items-center justify-center gap-5 flex-wrap select-none">
            <div className="w-40 px-10 py-5 bg-cyan-800/10 rounded-2xl shadow-inner shadow-cyan-200/30">
                <h1 className="text-center text-3xl font-bold" style={{color: `rgba(${settings.secondaryColor}, 1)`}}>{animatedTotal}</h1>
                <p className="text-center" style={{color: `rgba(${settings.primaryColorDark}, 1)`}}>Total</p>
            </div>
            <div className="w-40 px-10 py-5 bg-cyan-800/10 rounded-2xl shadow-inner shadow-cyan-200/30">
                <h1 className="text-center text-3xl font-bold" style={{color: `rgba(${settings.secondaryColor}, 1)`}}>{animatedWatched}</h1>
                <p className="text-center" style={{color: `rgba(${settings.primaryColorDark}, 1)`}}>Watched</p>
            </div>
            <div className="w-40 px-10 py-5 bg-cyan-800/10 rounded-2xl shadow-inner shadow-cyan-200/30">
                <h1 className="text-center text-3xl font-bold" style={{color: `rgba(${settings.secondaryColor}, 1)`}}>{animatedToWatch}</h1>
                <p className="text-center" style={{color: `rgba(${settings.primaryColorDark}, 1)`}}>To Watch</p>
            </div>
        </div>
    )
});