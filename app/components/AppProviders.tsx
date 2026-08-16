"use client";

import type { ReactNode } from "react";
import { ExternalLinkModalProvider } from "./ExternalLinkModalProvider";
import { RouteScrollReset } from "./RouteScrollReset";
import { SiteMusicProvider } from "./SiteMusicProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SiteMusicProvider>
      <ExternalLinkModalProvider>
        <RouteScrollReset />
        {children}
      </ExternalLinkModalProvider>
    </SiteMusicProvider>
  );
}
