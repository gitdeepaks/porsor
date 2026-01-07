"use client";

import { SparkleIcon } from "lucide-react";
import { Poppins } from "next/font/google";
import { useEffect, useState } from "react";
import { FaGithub } from "react-icons/fa";
import {
  adjectives,
  animals,
  colors,
  uniqueNamesGenerator,
} from "unique-names-generator";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { ProjectsCommandDailog } from "@/features/projects/components/project-command-dailog";
import { ProjectsList } from "@/features/projects/components/projects-lists";
import { useCreateProject } from "@/features/projects/hooks/use-projects";
import { cn } from "@/lib/utils";

const font = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const ProjectView = () => {
  const createProject = useCreateProject();
  const [commandDialogOpen, setCommandDailogOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandDailogOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <ProjectsCommandDailog
        open={commandDialogOpen}
        onOpenChange={setCommandDailogOpen}
      />
      <div className="min-h-screen bg-sidebar flex flex-col items-center justify-center p-6 md:p-16">
        <div className="w-full max-w-sm mx-auto flex flex-col gap-4 items-center">
          <div className="flex justify-between gap-4 w-full items-center">
            <div className="flex items-center gap-2 w-full group/logo">
              <img
                src="/logo.svg"
                alt="Porsor"
                className="size-[32px] md:size-[46px]"
              />
              <h1
                className={cn(
                  "text-4xl md:text-5xl font-semibold",
                  font.className,
                )}
              >
                Porsor
              </h1>
            </div>
          </div>
          <div className="flex flex-col gap-4 w-full">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-full items-start p-4 bg-background border flex flex-col gap-6 rounded-xl"
                onClick={() => {
                  const projectName = uniqueNamesGenerator({
                    dictionaries: [adjectives, animals, colors],
                    separator: "-",
                    length: 3,
                  });
                  createProject({
                    name: projectName,
                  });
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <SparkleIcon className="size-4" />
                  <Kbd className="bg-accent boder">⌘J</Kbd>
                </div>
                <div className="">
                  <span className="text-sm">New</span>
                </div>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-full items-start p-4 bg-background border flex flex-col gap-6 rounded-xl"
                onClick={() => {}}
              >
                <div className="flex items-center justify-between w-full">
                  <FaGithub className="size-4" />
                  <Kbd className="bg-accent boder">⌘I</Kbd>
                </div>
                <div className="">
                  <span className="text-sm">Import</span>
                </div>
              </Button>
            </div>
            <ProjectsList onViewAll={() => setCommandDailogOpen(true)} />
          </div>
        </div>
      </div>
    </>
  );
};
