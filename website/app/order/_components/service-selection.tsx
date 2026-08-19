"use client"
import { CheckboxCard } from "@/components/ui/checkbox-card";
import { cn } from "@/lib/utils";

const SERVICE_TYPES = [
  "Логотип",
  "Фирменный стиль",
  "Брендбук",
  "Дизайн презентации",
  "Сайт",
  "Монтаж, Склейка",
  "2д анимация",
  "3D-моделирование, 3D-анимация",
  "Реклама и продвижение (SEO, Таргет, Контекст)",
  "Что-либо другое (опишу в графе «О проекте»)"
];

interface ServiceSelectionProps {
  selectedServices: string[];
  setSelectedServices: React.Dispatch<React.SetStateAction<string[]>>;
  error?: string;
}

export function ServiceSelection({ selectedServices, setSelectedServices, error }: ServiceSelectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-display-4 uppercase tracking-tight text-(--on-bg-medium)">
        1. Тип услуги <span className="text-destructive">*</span>
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {SERVICE_TYPES.map((service) => (
          <CheckboxCard
            key={service}
            checked={selectedServices.includes(service)}
            onCheckedChange={(checked) => {
              if (checked) setSelectedServices(p => [...p, service]);
              else setSelectedServices(p => p.filter(s => s !== service));
            }}
          >
            {service}
          </CheckboxCard>
        ))}
      </div>
      {error && <p className="text-sm text-destructive font-medium">{error}</p>}
    </div>
  );
}
