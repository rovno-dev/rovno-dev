/* LLM context: Updating expert page with immersive transitions and dynamic project card entry */

"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import TatarstanIcon from "@/components/layout/experts-icons/Tatarstan-icon";
import { ExpertData } from "./_data";
import { Project, PROJECTS } from "../(Project)/data";
import Link from "next/link";
import ProjectCard from "@/components/layout/project-card/project-card";

function ExpertHeroSection({ expert }: { expert: ExpertData }) {
  return (
    <Container variant="full-width" className="pt-4 md:pt-10">
      <div className="relative w-full max-w-[1200px] mx-auto h-[520px] md:h-[480px] rounded-6xl md:rounded-8xl overflow-hidden bg-card border border-(--outline) group animate-in fade-in zoom-in-95 duration-1000">
        <Image
          src={expert.avatar}
          fill
          className="object-cover object-center transition-transform duration-[2000ms]"
          alt={expert.name}
          priority
        />

        <div className="absolute inset-0 bg-gradient-to-t from-(--bg) via-transparent to-transparent z-10" />

        <div className="absolute top-4 right-4 md:top-6 md:right-6 z-30 flex flex-col gap-1">
          {expert.socials.map((social, key) => (
            <Button variant={'text'} key={key} size={'icon-large'} asChild className="animate-reveal" style={{ animationDelay: `${400 + key * 100}ms` }}>
              <Link href={social.href} target="_blank" rel="noopener noreferrer">
                {social.icon}
              </Link>
            </Button>
          ))}
        </div>

        <div className="absolute inset-0 z-20 flex flex-col justify-end items-start md:items-center p-6 md:p-10">
          <div className="flex items-center gap-3 mb-4 md:mb-6 animate-reveal delay-200 fill-mode-both">
            <h1 className="text-display-3 md:text-display-1 text-(--on-bg-high)">{expert.name}</h1>
            <TatarstanIcon className="size-9 md:size-14 shrink-0 shadow-lg rounded-full duration-[2000ms]" />
          </div>

          <div className="w-full overflow-x-auto overflow-y-hidden no-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
            <div className="flex flex-nowrap gap-2 md:flex-wrap md:justify-center pb-1">
              {expert.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="tonal-card-static"
                  size="chip-large"
                  className="bg-(--card)/50 backdrop-blur-md border-(--outline)/50 text-(--on-bg-high) whitespace-nowrap px-4 py-5 md:py-1 animate-reveal fill-mode-both"
                  style={{ animationDelay: `${300 + index * 50}ms` }}
                >
                  {tag.icon && React.cloneElement(tag.icon as React.ReactElement<{ className?: string }>, { className: "size-4 fill-current" })}
                  {tag.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}

export default function ExpertPage({ expert }: { expert: ExpertData }) {
  const [activeTab, setActiveTab] = useState("Проекты");
  const tabs = [
    "Проекты",
    // "Будни",
    // "Речи", 
    // "События", 
    // "Награды", 
    // "Мысли вслух"
  ];

  return (
    <div className="pb-20">
      <ExpertHeroSection expert={expert} />

      <Container variant="full-width" className="py-4 md:py-12">
        <div className="max-w-[1200px] mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6 md:mb-10 animate-reveal delay-500 fill-mode-both">
            <TabsList variant="line" className="w-full justify-start md:justify-center overflow-x-auto overflow-y-hidden no-scrollbar border-b border-(--outline) rounded-none gap-2 md:gap-8 bg-transparent!">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="px-4 md:px-0 data-[state=active]:text-(--primary)"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {activeTab === "Проекты" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              {expert.projects.map((project, idx) => (
                <ProjectCard key={idx} project={project} index={idx} />
              ))}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
