import React from "react";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  change?: {
    value: string | number;
    type: "increase" | "decrease";
    label: string;
  };
  iconBgClassName?: string;
  iconClassName?: string;
}

export default function StatCard({
  icon,
  title,
  value,
  change,
  iconBgClassName = "bg-blue-100",
  iconClassName = "text-primary"
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className={cn("p-3 rounded-full", iconBgClassName)}>
            {React.cloneElement(icon as React.ReactElement, {
              className: cn("text-2xl", iconClassName)
            })}
          </div>
          <div className="ml-4">
            <h3 className="text-sm font-medium text-slate-500">{title}</h3>
            <p className="text-2xl font-semibold text-slate-900">{value}</p>
          </div>
        </div>
        {change && (
          <div className="mt-4 flex items-center text-sm">
            <span
              className={cn(
                "flex items-center font-medium",
                change.type === "increase" ? "text-green-500" : "text-red-500"
              )}
            >
              {change.type === "increase" ? (
                <ArrowUp className="mr-1 h-4 w-4" />
              ) : (
                <ArrowDown className="mr-1 h-4 w-4" />
              )}
              {change.value}
            </span>
            <span className="text-slate-500 ml-2">{change.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
