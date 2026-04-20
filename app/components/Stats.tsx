import React from "react";
import settings from "../constants/settings.json";

export const Stats = React.memo(function Stats() {
    return (
        <div className="flex items-center justify-center gap-5">
            <div className="px-10 py-5 bg-cyan-800/10 rounded-2xl shadow-inner shadow-cyan-200/30">
                <h1 className="text-center text-3xl font-bold" style={{color: `rgba(${settings.secondaryColor}, 1)`}}>193</h1>
                <p className="text-center" style={{color: `rgba(${settings.primaryColorDark}, 1)`}}>Total</p>
            </div>
            <div className="px-10 py-5 bg-cyan-800/10 rounded-2xl shadow-inner shadow-cyan-200/30">
                <h1 className="text-center text-3xl font-bold" style={{color: `rgba(${settings.secondaryColor}, 1)`}}>109</h1>
                <p className="text-center" style={{color: `rgba(${settings.primaryColorDark}, 1)`}}>Watched</p>
            </div>
            <div className="px-10 py-5 bg-cyan-800/10 rounded-2xl shadow-inner shadow-cyan-200/30">
                <h1 className="text-center text-3xl font-bold" style={{color: `rgba(${settings.secondaryColor}, 1)`}}>84</h1>
                <p className="text-center" style={{color: `rgba(${settings.primaryColorDark}, 1)`}}>To Watch</p>
            </div>
        </div>
    )
});