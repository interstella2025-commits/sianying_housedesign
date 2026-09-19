import ProjectPage, {
  generateMetadata,
  generateStaticParams,
} from "../../new/projects/[slug]/page";
import { NewDesignFrame } from "@/components/sites/senjin-design-com-dd40b413/root-8a5edab2/new-design-frame";

export { generateMetadata, generateStaticParams };

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export default function PublicProjectPage(props: ProjectPageProps) {
  return (
    <NewDesignFrame>
      <ProjectPage {...props} />
    </NewDesignFrame>
  );
}
