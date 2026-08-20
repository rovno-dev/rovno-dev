"use client"

import { ROUTES } from "@/utils/constants/routes";
import { Container } from "../../ui/container";
import { useState } from "react";
// import MakeOrderModal from "./make-order-modal/make-order-modal";
import { Button } from "../../ui/button";
import { Box, Newspaper, Lightbulb } from "lucide-react"
import Link from "next/link";
import RovnoLogotypeIconEmpty from "../logo/logo-icon-empty";

export default function BottomAppBar() {
  const [open, setOpen] = useState(false);

  const links = [
    // Pass the COMPONENT, not <Component />
    { ...ROUTES.projects, icon: Box },
    { ...ROUTES.about, icon: RovnoLogotypeIconEmpty },
    { href: ROUTES.blog.href, title: "Журнал", icon: Newspaper },
    // { ...ROUTES.job, icon: BriefcaseBusiness  },
  ]

  return (
    <nav className="md:hidden bg-(--g-dark) pt-[32px] fixed bottom-0 left-0 pb-[12px] justify-center w-full z-50">
      <Container aria-label="Bottom app bar">
        <div className="p-2 grid grid-cols-[1fr_125px] gap-1 rounded-full bg-(--primary-glass) backdrop-blur-glass border border-(--primary-glass) items-center">
          <div className="w-full h-full grid grid-cols-3 items-center">
            {links.map((link, key) => {
              const Icon = link.icon;
              return (
                <Button
                  asChild
                  className="w-full h-[60px]! p-0"
                  variant={'text'}
                  shape={'round'}
                  size="icon-medium"
                  key={key}
                >
                  <Link href={link.href} className="flex items-center justify-center flex-col! gap-2 w-full h-full">
                    <Icon className="size-6" />
                    <p className="text-body-5">{link.title}</p>
                  </Link>
                </Button>
              );
            })}
          </div>

          <Button
            asChild
            shape={'round'}
            className="w-full h-[60px] gap-2"
            size="medium"
            onClick={() => setOpen(true)}
          >
            <Link href={ROUTES.order.href}>
              <Lightbulb className="size-[26px]!" />
              <span className="text-display-4">Заказ</span>
            </Link>
          </Button>

        </div>
      </Container>
    </nav>
  );
}
