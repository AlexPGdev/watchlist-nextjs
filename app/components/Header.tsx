"use client";

import React from "react";
import SvgComponent from "../components/HomeIcon";
import settings from "../constants/settings.json";

export const Header = React.memo(function Header() {
    return (
        <div className="flex flex-col items-center text-center mb-2 relative select-none">
            <div>
                <div className="flex flex-row items-center gap-2.5 flex-wrap justify-center">
                    <SvgComponent width={140} height={100} fill="#fff" />

                    <span
                        className="text-5xl tracking-[6px] text-transparent bg-clip-text font-bold"
                        style={{
                            backgroundImage: `linear-gradient(135deg, rgba(${settings.primaryColorDark},1), rgba(${settings.secondaryColor},1))`
                        }}
                    >
                        SPECTAER
                    </span>
                </div>
            </div>
        </div>
    );
});