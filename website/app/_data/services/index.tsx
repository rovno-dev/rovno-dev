import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { slugify, stripMdTokens } from "@/utils/slugify";
import { SERVICES_META, findServiceMeta, type ServiceMeta } from "./meta";

export type { ServiceMeta };
export { SERVICES_META, findServiceMeta };

export interface ServiceHeading {
  id: string;
  text: string;
  level: 2 | 3;
}

export interface ServiceDoc extends ServiceMeta {
  /** Body with frontmatter stripped, ready for compileMDX. */
  body: string;
  headings: ServiceHeading[];
}

const CONTENT_DIR = path.join(process.cwd(), "app/_data/services/content");

/** Extract h2/h3 headings for the TOC. Uses the same slugify as the renderer. */
function extractHeadings(body: string): ServiceHeading[] {
  const headings: ServiceHeading[] = [];
  const regex = /^(#{2,3})\s+(.+?)\s*$/gm;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(body)) !== null) {
    const level = match[1].length as 2 | 3;
    const text = stripMdTokens(match[2].trim());
    headings.push({ id: slugify(text), text, level });
  }
  return headings;
}

function loadDoc(meta: ServiceMeta): ServiceDoc | null {
  const filePath = path.join(CONTENT_DIR, `${meta.slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;
  const source = fs.readFileSync(filePath, "utf8");
  const { content } = matter(source);
  return {
    ...meta,
    body: content,
    headings: extractHeadings(content),
  };
}

export const SERVICES_DOCS: Record<string, ServiceDoc> = Object.fromEntries(
  SERVICES_META.map((meta) => [meta.slug, loadDoc(meta)]).filter(
    (entry): entry is [string, ServiceDoc] => entry[1] !== null,
  ),
);

export function loadServiceDoc(slug: string): ServiceDoc | null {
  return SERVICES_DOCS[slug] ?? null;
}
