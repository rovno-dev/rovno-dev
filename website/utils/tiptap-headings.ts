import { slugify } from "@/utils/slugify";
import { TocHeading } from "@/components/layout/toc/toc";

function getTextFromNode(node: any): string {
  if (node.text) return node.text;
  if (node.content) return node.content.map(getTextFromNode).join("");
  return "";
}

/**
 * Extracts headings from a Tiptap JSON document for the table of contents.
 * Uses the same `slugify` function the `ReadonlyHeading` extension uses to
 * generate the anchor IDs, so TOC links always resolve.
 *
 * Every heading level is included and clamped to the two that the `Toc`
 * component renders distinctly:
 *
 *   h1, h2  ->  2  (top-level TOC entry)
 *   h3, h4+ ->  3  (indented sub-entry)
 *
 * Filtering on `=== 2 || === 3` — the previous behaviour — silently
 * dropped h1 headings and everything below h3, which is what made the
 * TOC look incomplete on documents that started with a title heading or
 * used h4 for deep sub-sections.
 */
export function extractTiptapHeadings(content: any): TocHeading[] {
  const headings: TocHeading[] = [];
  if (!content || !content.content) return headings;

  const traverse = (node: any) => {
    if (node.type === "heading") {
      const raw = node.attrs?.level ?? 2;
      const level: 2 | 3 = raw === 3 || raw >= 4 ? 3 : 2;
      const text = getTextFromNode(node).trim();
      if (text) {
        headings.push({ id: slugify(text), text, level });
      }
    }
    if (node.content) {
      node.content.forEach(traverse);
    }
  };

  traverse(content);
  return headings;
}
