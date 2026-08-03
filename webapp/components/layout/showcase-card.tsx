/* LLM context: Refactoring ShowcaseCard to support href and children-based content pattern */

import { ReactNode } from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import Link from "next/link";

export const servicesIconsStyles = 'size-[85px]! [&_*]:fill-(--on-bg-low)';

export interface ShowcaseCardProps {
  id?: string,
  count?: string,
  href?: string,
  children?: ReactNode,
}

export function ShowcaseCard({ id, count, href, children }: ShowcaseCardProps) {
  const content = (
    <>
      {count && (
        <Badge variant={'glass-static'} className="absolute top-3 right-3">
          {count}
        </Badge>
      )}
      {children}
    </>
  );

  return (
    <Button
      id={id}
      variant={'tonal-card'}
      asChild={!!href}
      className="relative flex flex-col w-full! h-full! rounded-4xl border-(--primary-glass)! py-6"
    >
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {content}
        </a>
      ) : (
        content
      )}
    </Button>
  )
}