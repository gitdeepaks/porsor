"use client";
import { useMutation, useQuery } from "convex/react";
import { Button } from "@/components/ui/button";
import { api } from "../../convex/_generated/api";

const Page = () => {
  const projects = useQuery(api.projects.get);
  const createProject = useMutation(api.projects.create);
  return (
    <div className="flex flex-col gap-2 p-4">
      <Button
        onClick={() =>
          createProject({
            name: "New Project123",
          })
        }
      >
        Add a label
      </Button>
      {projects?.map((task) => {
        return (
          <div className="border rounded p-2 gap-4" key={task._id}>
            <p>{task.name}</p>
            <p>Its completed: {task.ownerId}</p>
          </div>
        );
      })}
    </div>
  );
};

export default Page;
