import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface Project {
  id: string;
  slug: string;
  title: string;
  description?: string;
  shortDescription?: string;
  cover: {
    videoSrc?: string;
    imageSrc: string;
  };
  href?: string;
  category?: string;
  clientId: string;
  platform?: string;
  period?: string;
  techStack?: string[];
}

// Helper to read all MDX files and extract frontmatter
export function getAllProjects(): Project[] {
  const contentDir = path.join(process.cwd(), "_data/projects/content");
  let files: string[];
  try {
    files = fs.readdirSync(contentDir);
  } catch (err) {
    // Directory doesn't exist – return empty array
    return [];
  }
  const projects: Project[] = [];
  for (const file of files) {
    if (!file.endsWith(".mdx")) continue;
    const filePath = path.join(contentDir, file);
    const source = fs.readFileSync(filePath, "utf8");
    const { data } = matter(source);
    // Ensure cover is an object
    const cover = data.cover || { imageSrc: "" };
    if (typeof cover === "string") {
      // If someone put a string, convert
      data.cover = { imageSrc: cover };
    }
    projects.push({
      id: data.id || "",
      slug: data.slug || file.replace(".mdx", ""),
      title: data.title || "",
      description: data.description || "",
      shortDescription: data.shortDescription || "",
      cover: data.cover || { imageSrc: "" },
      href: data.href || "",
      category: data.category || "",
      clientId: data.clientId || "",
      platform: data.platform || "",
      period: data.period || "",
      techStack: data.techStack || [],
    });
  }
  return projects;
}

// Also export a PROJECTS object for compatibility (but we'll use the function)
export const PROJECTS: Record<string, Project> = Object.fromEntries(
  getAllProjects().map((p) => [p.slug, p])
);
