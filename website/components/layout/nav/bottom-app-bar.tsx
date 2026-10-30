"use client";

import { FloatingMenu } from "./floating-menu";

export default function BottomAppBar() {
  return (
    <nav 
      aria-label="Bottom app bar" 
      className="sm:hidden fixed bottom-6 right-6 z-50"
    >
      {/* Just the sexy burger menu button */}
      <FloatingMenu
        position="bottom"
        triggerSize="icon-large"
        triggerShape="round"
        triggerClassName="size-14! bg-(--primary)! text-(--on-primary)! shadow-2xl p-0! flex items-center justify-center transition-transform active:scale-95 border-0!"
        triggerIconClassName="size-6! p-0!"
      />
    </nav>
  );
}
