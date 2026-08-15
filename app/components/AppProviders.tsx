"use client";

import type { ReactNode } from "react";
import { SiteMusicProvider } from "./SiteMusicProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  return <SiteMusicProvider>{children}</SiteMusicProvider>;
}
