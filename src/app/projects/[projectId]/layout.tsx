import { ProjectIdLayOut } from "@/features/projects/components/project-id-layout";

const layout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) => {
  const { projectId } = await params;
  return <ProjectIdLayOut projectId={projectId}>{children}</ProjectIdLayOut>;
};

export default layout;
