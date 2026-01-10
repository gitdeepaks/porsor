import { ProjectIdLayOut } from "@/features/projects/components/project-id-layout";
import type { Id } from "../../../../convex/_generated/dataModel";

const layout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: Id<"projects"> }>;
}) => {
  const { projectId } = await params;
  return <ProjectIdLayOut projectId={projectId}>{children}</ProjectIdLayOut>;
};

export default layout;
