"use client";

import Link from "next/link";

interface LogoProps {
  className?: string;
  light?: boolean;
}

export default function SkillFlowLogo({ className = "h-8", light = false }: LogoProps) {
  return (
    <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 text-white shadow-md shadow-indigo-500/20">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path fillRule="evenodd" d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 0 1 .75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 0 1 9.75 22.5a.75.75 0 0 1-.75-.75v-4.131A15.838 15.838 0 0 1 6.382 15H2.25a.75.75 0 0 1-.628-1.157 15.837 15.837 0 0 1 7.693-6.259Zm3.14 8.766a5.25 5.25 0 0 0 6.64-6.64 14.364 14.364 0 0 0-6.64 6.64Z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className={`text-xl font-extrabold tracking-tight ${light ? "text-white" : "text-gray-900 dark:text-white"}`}>
          Skill<span className="text-indigo-600 dark:text-indigo-400">Flow</span>
        </span>
        <span className="text-[10px] font-medium uppercase tracking-widest text-gray-400 dark:text-gray-400">
          Talent Platform
        </span>
      </div>
    </Link>
  );
}
