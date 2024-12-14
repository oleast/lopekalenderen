"use client";

import { signIn, signOut } from "next-auth/react";
import { Session } from "next-auth";
import { FC } from "react";

interface Props {
  session: Session | null;
}

export const MainAuth: FC<Props> = ({ session }) => {
  return (
    <>
      {session === null ? (
        <button onClick={() => signIn("strava")}>Logg inn med Strava</button>
      ) : (
        <>
          <p>Hei, {session.user?.name}</p>
          <button onClick={() => signOut()}>Logg ut</button>
        </>
      )}
    </>
  );
};
