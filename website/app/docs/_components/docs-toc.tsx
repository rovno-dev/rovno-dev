"use client";
import { Toc } from "@/components/layout/toc/toc";
import type { LegalHeading } from "@/app/_data/legal";
interface DocsTOCProps {
  headings: LegalHeading[];
}
// LLM context: docs-specific wrapper. The actual TOC lives in
// components/layout/toc/toc.tsx so blog and docs share one implementation.
export function DocsTOC({ headings }: DocsTOCProps) {
  return (
    <Toc
      headings={headings}
      label="Содержание"
      ariaLabel="Содержание документа"
    />
  );
}
