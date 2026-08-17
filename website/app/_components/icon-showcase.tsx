"use client";
import * as Icons from "lucide-react";
import { Container } from "@/components/ui/container";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function IconShowcase() {
  const allIcons = Object.entries(Icons).filter(([name]) => name.endsWith("Icon") && name !== "Icon");

  const copyToClipboard = (name: string) => {
    navigator.clipboard.writeText(`<${name} />`);
    toast.success("Copied to clipboard", { description: `<${name} />` });
  };

  return (
    <section className="py-20 bg-muted/30">
      <Container>
        <div className="mb-12">
          <h2 className="text-display-2 mb-4">UNIDOKA ICON PACK</h2>
          <p className="text-body-1 text-(--on-bg-medium)">
            Smooth universal minimalist icons for Rovno.dev ecosystem. {allIcons.length} icons available.
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {allIcons.map(([name, IconComponent]) => {
            const Icon = IconComponent as React.ComponentType<any>;
            return (
              <Card
                key={name}
                className="group flex flex-col items-center justify-center p-6 gap-3 cursor-pointer hover:bg-card transition-all active:scale-95"
                onClick={() => copyToClipboard(name)}
              >
                <div className="size-10 flex items-center justify-center text-(--on-bg-low) group-hover:text-(--primary) transition-colors">
                  <Icon className="size-8!" />
                </div>
                <span className="text-[10px] font-mono text-center truncate w-full opacity-60 group-hover:opacity-100 uppercase tracking-tighter">
                  {name.replace("Icon", "")}
                </span>
              </Card>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
