import { DeployedCodeIcon, DesignServicesIcon, DiamondIcon, StylusNoteIcon } from "@/components/icons";
import { Container } from "@/components/ui/container";


const services = [
  {
    number: "01",
    title: "РАЗРАБОТКА",
    description:
      "От лендингов до сложных высоконагруженных систем — пишем чистый код, который масштабируется.",
    icon: <DeployedCodeIcon className="size-10 text-(--on-bg-low)" />,
  },
  {
    number: "02",
    title: "UX/UI ДИЗАЙН",
    description:
      "Продуманные интерфейсы и сценарии, которые выдерживают тесты с пользователями и повышают конверсию.",
    icon: <DesignServicesIcon className="size-10 text-(--on-bg-low)" />,
  },
  {
    number: "03",
    title: "АЙДЕНТИКА",
    description:
      "Логотипы, фирменные стили и брендбуки, которые работают вдолгую и формируют сильный образ.",
    icon: <StylusNoteIcon className="size-10 text-(--on-bg-low)" />,
  },
  {
    number: "04",
    title: "3D-ГРАФИКА И MOTION",
    description:
      "3D и залипательные видео для вашего бренда или продукта для рекламы, на сайт, в приложение или для соц. сетей",
    icon: <DiamondIcon className="size-10 text-(--on-bg-low)" />,
  },
];

export default function ServicesSection() {
  return (
    <section className="py-12 md:py-20 bg-(--bg)">
      <Container>
        <h2 className="mb-8 text-left text-display-2 md:text-display-2 text-(--on-bg-high) tracking-tight uppercase">Наши услуги</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-4">
          {services.map((service) => (
            <div
              key={service.number}
              className="group rounded-3xl border border-(--outline) bg-(--card) p-6 md:p-10 ring-0 transition-all hover:bg-(--state-hover) hover:border-(--primary)/30"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-(--primary-glass) text-(--primary) border border-(--primary-glass)">
                  {service.icon}
                </div>
                <span className="text-display-3 font-heading text-(--on-bg-low) opacity-10 select-none">
                  {service.number}
                </span>
              </div>
              <h3 className="text-display-4 md:text-display-3 text-(--on-bg-high) mb-3 uppercase tracking-tight">{service.title}</h3>
              <p className="text-body-3 md:text-body-2 text-(--on-bg-medium) leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}