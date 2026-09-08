import { Montserrat, Noto_Sans_TC } from "next/font/google";
import type { ReactNode } from "react";

const notoSansTc = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

export function NewDesignFrame({ children }: { children: ReactNode }) {
  return (
    <div className={`senjin-clone ${notoSansTc.variable} ${montserrat.variable}`}>
      {children}
    </div>
  );
}
