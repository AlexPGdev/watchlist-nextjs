"use client";

import { Header } from "@/components/Header";

export default function Page() {
    return (
        <div className="page flex flex-col p-4 sm:p-4 md:p-4 lg:px-[10%] xl:px-[18%] gap-5 md:gap-5 tracking-wider">
            <Header onOpenSearchResult={() => {}} />

            <div className="flex flex-col gap-5 justify-center">
                <img src={`/peepoHey.gif`} alt="user" className="w-10 h-10 rounded-full" />
            </div>
        </div>
    );
}