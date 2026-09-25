/**
 * Renders an iframe so its content covers the parent, like `object-fit: cover`
 * for <img>. iframes don't honour object-fit — they render their content at
 * whatever aspect ratio the source page decides — so we oversize the iframe
 * itself and let the parent clip it.
 *
 * The iframe is sized to whichever dimension is larger of:
 *   - 100vw × 56.25vw   (16:9 locked to viewport width)
 *   - 177.78vh × 100vh  (16:9 locked to viewport height)
 * then centred. Any mismatch between the viewport's aspect ratio and 16:9 is
 * pushed outside the parent and hidden.
 */
export function CoverIframe({
  src,
  title,
  className,
}: {
  src: string;
  title: string;
  className?: string;
}) {
  return (
    <div
      className={
        "absolute inset-0 overflow-hidden pointer-events-none " +
        (className ?? "")
      }
    >
      <iframe
        src={src}
        title={title}
        aria-hidden
        tabIndex={-1}
        allow="autoplay; encrypted-media; picture-in-picture"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-0"
        style={{
          width: "max(100vw, calc(100vh * 16 / 9))",
          height: "max(100vh, calc(100vw * 9 / 16))",
        }}
      />
    </div>
  );
}
