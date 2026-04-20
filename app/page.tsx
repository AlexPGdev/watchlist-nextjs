import Image from "next/image";
import { Header } from "./components/Header";
import { Stats } from "./components/Stats";
import settings from "./constants/settings.json";

export default function Home() {
  return (
    <div className="page flex flex-col p-10 px-[15%] gap-10">
      <Header />
      <Stats />

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Watchlist</h1>
        <input type="text" placeholder="Search..." className="w-full bg-black/50 rounded-2xl border-1 border-cyan-800 p-2 px-4 shadow-xs shadow-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-500" />

        <div className="flex w-full bg-black/50 rounded-2xl border-1 border-cyan-800 p-2 gap-2">
          <button className="p-2 px-4 uppercase rounded-xl bg-cyan-800/40 font-bold tracking-widest text-sm shadow-inner shadow-cyan-200/30 cursor-pointer hover:scale-105 transition-all" style={{color: `rgba(${settings.primaryColor}, 1)`}}>
            Watched
          </button>
          <button className="p-2 px-4 uppercase rounded-xl bg-cyan-800/40 font-bold tracking-widest text-sm shadow-inner shadow-cyan-200/30 cursor-pointer hover:scale-105 transition-all" style={{color: `rgba(${settings.primaryColor}, 1)`}}>
            To Watch
          </button>
        </div>

        
      </div>
    </div>
  )
}