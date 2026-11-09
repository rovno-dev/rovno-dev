"use client";

import { Badge } from "@/components/ui/badge";
import { resolveExpertTagIcon } from "@/components/icons/expert-icon-map";

export function ExpertTags({ tags }: { tags: any[] }) {
  if (!tags.length) return null;
  
  return (
    <div className="flex flex-wrap gap-2 lg:justify-end">
      {tags.map((tag, idx) => {
        const icon = resolveExpertTagIcon(tag.icon_key);
        return (
          <Badge key={idx} suppressHydrationWarning variant="tonal-card-static" size="chip-medium" className="gap-2">
            {icon && <span className="size-3.5 inline-flex items-center justify-center">{icon}</span>}
            {tag.label}
          </Badge>
        );
      })}
    </div>
  );
}
