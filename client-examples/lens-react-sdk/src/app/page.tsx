"use client";

import { WelcomeToLens } from "@/components/WelcomeToLens";
import FrameEmbed from "@/components/debug/FrameEmbed";
import Image from "next/image";

export default function Home({
  searchParams,
}: {
  searchParams: Record<string, string>;
}): JSX.Element {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 lg:p-16">
      <div className="flex place-items-center flex-col max-w-lg">
        <h1 className="mb-3 text-3xl font-semibold position-absolute">
          Lens Frames Client Demo
        </h1>
        <WelcomeToLens />
        {/*   <FrameEmbed searchParams={searchParams} /> */}
      </div>
    </main>
  );
}
