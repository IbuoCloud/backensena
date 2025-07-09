import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  items: {
    id: number;
    name: string;
    avatarUrl?: string | null;
  }[];
  maxItems?: number;
}

export function AvatarGroup({
  items,
  maxItems = 3,
  className,
  ...props
}: AvatarGroupProps) {
  const displayItems = items.slice(0, maxItems);
  const extraItems = items.length - maxItems;

  return (
    <div className={cn("flex -space-x-2", className)} {...props}>
      {displayItems.map((item) => (
        <Avatar key={item.id} className="h-6 w-6 border-2 border-white">
          {item.avatarUrl ? (
            <AvatarImage src={item.avatarUrl} alt={item.name} />
          ) : (
            <AvatarFallback className="text-xs">
              {item.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
      ))}
      
      {extraItems > 0 && (
        <div className="h-6 w-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-xs text-slate-500">
          +{extraItems}
        </div>
      )}
    </div>
  );
}
