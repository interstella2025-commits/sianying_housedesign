import NewProjectsPage, { metadata } from "../../new/projects/new/page";
import { NewDesignFrame } from "@/components/sites/senjin-design-com-dd40b413/root-8a5edab2/new-design-frame";

export { metadata };

export default function ProjectsNewPage() {
  return <NewDesignFrame><NewProjectsPage /></NewDesignFrame>;
}
