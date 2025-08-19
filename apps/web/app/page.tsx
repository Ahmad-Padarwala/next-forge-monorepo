'use client';

import React from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white px-6">
      
      {/* Title */}
      <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-500 mb-6">
        Mini Event Manager
      </h1>

      {/* Description */}
      <p className="text-lg text-gray-300 max-w-xl text-center mb-10">
        Create, manage and explore your upcoming events effortlessly. 
        Stay organized with a modern, minimal, and elegant event experience.
      </p>

      {/* Button */}
      <button
        onClick={() => router.push("/events")}
        className="cursor-pointer relative px-8 py-3 font-semibold rounded-lg 
                   bg-indigo-600 hover:bg-indigo-700 
                   transition-all duration-300 
                   shadow-lg hover:shadow-indigo-500/40
                   hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        Go to Event Page →
      </button>
    </main>
  );
}
