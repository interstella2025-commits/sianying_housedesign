import type { Metadata } from "next";
import { MotionDirector } from "../components/MotionDirector";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { WorksArchive } from "../components/WorksArchive";

export const metadata: Metadata = {
  title: "完工作品集",
  description: "翔胤室內設計完工作品集，閱讀住宅空間中的光線、材質、動線與生活細節。",
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
