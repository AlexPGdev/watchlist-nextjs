"use client";

import React from "react";
import SvgComponent from "../components/HomeIcon";
import settings from "../constants/settings.json";
import { useAuth } from "../hooks/useAuth";

interface HeaderProps {
    onOpen: () => void;
}

export const Header = React.memo(function Header({ onOpen }: HeaderProps) {

    const {isLoggedIn, user} = useAuth();
    
    return (
        <div className="flex flex-col items-center text-center relative select-none">
            <div className="flex flex-row items-center flex-wrap justify-between w-full gap-10">
                <a href="/" className="flex items-center gap-2.5 flex-wrap justify-center">
                    <SvgComponent width={120} height={80} fill="#fff" />

                    <span
                        className="text-4xl tracking-[6px] text-transparent bg-clip-text font-bold"
                        style={{
                            // backgroundImage: `linear-gradient(135deg, rgba(${settings.primaryColorDark},1), rgba(${settings.secondaryColor},1))`
                            backgroundColor: `rgba(${settings.primaryColorDark},1)`
                        }}
                    >
                        SPECTAER
                    </span>
                </a>

                <input type="text" placeholder="Search..." className="bg-black/50 rounded-2xl flex-1 border-1 border-cyan-800 p-2 px-4 shadow-xs shadow-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-500" />

                <a href="/explore" className="text-cyan-400 text-lg hover:text-cyan-500 hover:underline transition-all duration-300">
                    Explore
                </a>

                {!isLoggedIn ? (
                    <button 
                        className="p-3 px-6 uppercase rounded-full bg-cyan-800/80 font-bold tracking-widest text-sm shadow-inner shadow-cyan-200/30 cursor-pointer hover:scale-105 transition-all" 
                        style={{color: `rgba(${settings.primaryColor}, 1)`}}
                        onClick={onOpen}
                    >
                        Login
                    </button>
                ) : (
                    <h1 className="text-xl font-bold" style={{ color: `rgba(${settings.primaryColorDark}, 1)` }}>
                        {user}
                    </h1>
                )}
            </div>
        </div>
    );
});