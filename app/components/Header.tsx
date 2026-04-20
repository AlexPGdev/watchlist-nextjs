"use client";

import React from "react";
import SvgComponent from "../components/HomeIcon";
import settings from "../constants/settings.json";

export const Header = React.memo(function Header() {
    return (
        <div className="flex flex-col items-center text-center mb-2 relative">
            <div>
                <div className="flex flex-row items-center gap-2.5">
                <SvgComponent width={140} height={100} fill="#fff" />

                <span
                    className="text-[60px] tracking-[6px] text-transparent bg-clip-text font-bold"
                    style={{
                        backgroundImage: `linear-gradient(135deg, rgba(${settings.primaryColorDark},1), rgba(${settings.secondaryColor},1))`
                    }}
                >
                    SPECTAER
                </span>
                </div>

                {/* Alpha text */}
                <div className="mt-[-15px] px-2.5">
                <p
                    className="text-right text-[30px] tracking-[2px] text-transparent bg-clip-text font-bold"
                    style={{
                        backgroundImage: `linear-gradient(135deg, rgba(${settings.primaryColorDark},1), rgba(${settings.secondaryColor},1))`,
                        textShadow: `2px 2px 4px rgba(${settings.secondaryColor}, 0.5)`,
                    }}
                >
                    Alpha
                </p>
                </div>
            </div>
        </div>
    );
});