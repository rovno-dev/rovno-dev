import CtaSection from "@/app/_components/cta-section";
import ServicesSection from "@/app/_components/services-section";
import { pageMetadata, buildOgImageUrl } from "@/utils/seo";

export const metadata = pageMetadata({
  title: "Услуги",
  description:
    "Аудит, цифровизация и запуск стартапов под ключ. Дизайн, разработка, 3D, маркетинг.",
  path: "/services",
  ogImage: buildOgImageUrl("Услуги", "Rovno.dev"),
});

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-(--bg) mt-header">
      {/* The ServicesSection's own "УСЛУГИ" heading is an <h2>; this sr-only
          <h1> carries the page-level heading for SEO and screen readers so
          the outline is <h1> Услуги → <h2> Услуги Rovno.dev → … */}
      <h1 className="sr-only">Услуги Rovno.dev</h1>
      <ServicesSection />
      <CtaSection />
    </main>
  );
}
