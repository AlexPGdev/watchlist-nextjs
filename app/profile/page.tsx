"use client";

import { Header } from "../components/Header";

export default function Page() {
    return (
        <div className="page flex flex-col p-4 sm:p-4 md:p-4 md:px-[15%] lg:px-[18%] gap-5 md:gap-5 tracking-wider">
        <Header onOpen={() => {}} />
        </div>
    );
}