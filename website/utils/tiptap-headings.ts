import { slugify } from "@/utils/slugify";
import { TocHeading } from "@/components/layout/toc/toc";

function getTextFromNode(node: any): string {
  if (node.text) return node.text;
  if (node.content) return node.content.map(getTextFromNode).join("");
  return "";
}

/**
 * Extracts h2/h3 headings from a Tiptap JSON document for the table of
 * contents. Uses the same `slugify` function the `ReadonlyHeading`
 * extension uses to generate the anchor IDs, so TOC links always resolve.
 */
export function extractTiptapHeadings(content: any): TocHeading[] {
  const headings: TocHeading[] = [];
  if (!content || !content.content) return headings;

  const traverse = (node: any) => {
    if (
      node.type === "heading" &&
      (node.attrs?.level === 2 || node.attrs?.level === 3)
    ) {
      const text = getTextFromNode(node);
      if (text) {
        headings.push({
          id: slugify(text),
          text: text,
          level: node.attrs.level as 2 | 3,
        });
      }
    }
    if (node.content) {
      node.content.forEach(traverse);
    }
  };

  traverse(content);
  return headings;
}
