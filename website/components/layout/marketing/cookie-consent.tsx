"use client";
import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

/**
 * ponytail: Standard bottom-right cookie consent using shadcn/ui Card.
 * Avoids blocking the UI (non-modal) for better UX.
 */
export function CookieConsent() {
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    const hasConsent = localStorage.getItem("cookie-consent");
    if (!hasConsent) {
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie-consent", "true");
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed right-0 bottom-25 md:bottom-4 z-50 md:right-8 md:bottom-8 animate-reveal">
      <Card className="flex mx-4 max-w-full sm:max-w-[320px] flex-col gap-4 p-5 shadow-2xl bg-(--card)/95 backdrop-blur-md border-(--outline)">
        <div className="space-y-2">
          <h4 className="text-heading-4">
            Про Cookie-файлы 🍪
          </h4>
          <p className="text-xs leading-relaxed text-(--on-bg-medium)">
            Для корректной и ровной работы сайта нужны Cookie
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="flex-1"
            size="small"
            variant="filled"
            onClick={handleAccept}
          >
            Принять
          </Button>
          {/* <Button
            size="small"
            variant="text"
            asChild
          >
            <a href="https://t.me/rovno_dev" target="_blank">
              Детали
            </a>
          </Button> */}
        </div>
      </Card>
    </div>
  );
}
