import { auth } from "@/auth";
import { signIn } from "next-auth/react";
import Link from "next/link";

export default async function Home() {
  const session = await auth();
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] my-12 bg-white max-w-[800px] mx-auto">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        {session === null ? (
          <button onClick={() => signIn("strava")}>Logg inn med Strava</button>
        ) : (
          <>
            <p>Hei, {session.user?.name}</p>
            <Link href="/velg-luke/2024" className="p-4 border border-dashed">
              Julekalenderen 2024
            </Link>
          </>
        )}
      </main>
    </div>
  );
}
