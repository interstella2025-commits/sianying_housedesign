import type { Metadata } from "next";
import { MotionDirector } from "../components/MotionDirector";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { WorksArchive } from "../components/WorksArchive";

export const metadata: Metadata = {
  title: "完工作品集",
  description: "翔胤室內設計住宅完工作品集，收錄 12 個住宅案例的格局、收納、採光、材質與完工細節。",
};

export default function WorksPage() {
  return (
    <>
      <SiteHeader />
      <MotionDirector />
      <main className="works-page">
        <WorksArchive />
      </main>
      <SiteFooter />
    </>
  );
}
