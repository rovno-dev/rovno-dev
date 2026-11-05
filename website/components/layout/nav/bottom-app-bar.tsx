"use client";

import { QuickOrderDialog } from "@/components/ui/quick-order-dialog";
import { FloatingMenu } from "./floating-menu";
import { CycleText } from "./cycle-text";
import { TelemostStackIcon } from "@/components/icons/telemost-stack-icon";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/providers/language-provider";

export default function BottomAppBar() {
  const { t } = useLanguage();

  return (
    <nav
      aria-label="Bottom app bar"
      className="sm:hidden fixed bottom-6 right-6 z-50 flex gap-2 items-center justify-center"
    >
      <QuickOrderDialog serviceName="Консультация">
        <Button
          size="small"
          shape="square"
          variant="tonal-card"
          className="h-14! w-fit justify-center gap-1.5"
        >
          <TelemostStackIcon className="-ml-0.5" />
          <CycleText
            labels={[
              t("nav.order_cycle_1"),
              t("nav.order_cycle_2"),
              t("nav.order_cycle_3"),
            ]}
          />
        </Button>
      </QuickOrderDialog>
      <FloatingMenu
        position="bottom"
        triggerSize="icon-medium"
        triggerShape="round"
        triggerClassName="size-14! bg-(--primary)! text-(--on-primary)! shadow-2xl p-0! flex items-center justify-center transition-transform active:scale-95 border-0!"
        triggerIconClassName="size-6! p-0!"
      />
    </nav>
  );
}
