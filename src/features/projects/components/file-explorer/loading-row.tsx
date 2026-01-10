import { Spinner } from "@/components/ui/spinner";
import { getItemPadding } from "@/features/projects/components/file-explorer/constansts";
import { cn } from "@/lib/utils";

interface LoadingRowProps {
  className?: string;
  level?: number;
}

export const LoadingRow = ({ className, level = 0 }: LoadingRowProps) => {
  return (
    <div
      className={cn("h-5.5 flex items-center text-muted-foreground", className)}
      style={{
        paddingLeft: getItemPadding(level, true),
      }}
    >
      <Spinner className="size-4 text-ring ml-0.5" />
    </div>
  );
};
