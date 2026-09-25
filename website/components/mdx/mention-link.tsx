import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Renders a markdown link. If the href uses the `mention://` protocol, it's
 * rewritten into the actual site route and shown as an inline chip.
 *
 *   mention://user/<username>    → /<username>
 *   mention://project/<slug>     → /projects/<slug>
 *   mention://client/<slug>      → /clients/<slug>
 *
 * Anything else renders as a normal link.
 */
export function MentionAwareLink({
  href,
  children,
  className,
}: {
  href?: string;
  children: React.ReactNode;
  className?: string;
}) {
  if (href && href.startsWith("mention://")) {
    const match = href.match(/^mention:\/\/(user|project|client)\/(.+)$/);
    if (match) {
      const [, type, id] = match;
      const to =
        type === "user"
          ? `/${id}`
          : type === "project"
          ? `/projects/${id}`
          : `/clients/${id}`;

      return (
        <Link
          href={to}
          className={cn(
            "inline-flex items-center gap-0.5 rounded-full bg-(--primary-card) px-1.5 py-0.5",
            "text-[0.95em] font-medium text-(--primary) no-underline",
            "hover:bg-(--primary-glass) transition-colors",
            className,
          )}
        >
          {children}
        </Link>
      );
    }
  }

  return (
    <a
      href={href}
      className={cn(
        "text-(--primary) underline underline-offset-2 hover:opacity-80",
        className,
      )}
    >
      {children}
    </a>
  );
}
