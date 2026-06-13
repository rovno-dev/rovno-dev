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
    "Мысли вслух",
    "Будни",
    "События",
    "Награды",
    // "Речи", 
    // "Награды", 
    // "Мысли вслух"
  ];

  return (
    <div className="pb-20">
      <ExpertHeroSection expert={expert} />

      <Container variant="full-width" className="pt-6 pb-4 md:pt-8 md:pb-4">
        <div className="max-w-[1200px] mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6 md:mb-10 animate-reveal delay-500 fill-mode-both">
            <TabsList variant="line" className="w-full justify-start md:justify-center overflow-x-auto overflow-y-hidden no-scrollbar border-b border-(--outline) rounded-none gap-2 md:gap-8 bg-transparent!">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className={`px-4 md:px-0 ${activeTab === tab ? "text-(--primary) after:opacity-100" : ""}`}
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

          {activeTab === "Мысли вслух" && (
            <div className="space-y-4">
              {expert.thoughts.length === 0 ? (
                <p className="text-body-2 text-(--on-bg-medium) text-center py-20">
                  Пока нет мыслей вслух
                </p>
              ) : (
                expert.thoughts.map((thought, idx) => (
                  <Card
                    key={thought.id}
                    className="rounded-3xl border border-(--outline) bg-(--card) p-6 ring-0 animate-reveal fill-mode-both"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <p className="text-body-2 text-(--on-bg-high) leading-relaxed mb-3">
                      {thought.text}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {thought.tags?.map((tag) => (
                          <Badge
                            key={tag}
                            variant="tonal-card-static"
                            size="chip-small"
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                      <span className="text-body-5 text-(--on-bg-low)">
                        {new Date(thought.date).toLocaleDateString("ru-RU", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === "Будни" && (
            <div className="space-y-4">
              {expert.dailyPosts.length === 0 ? (
                <p className="text-body-2 text-(--on-bg-medium) text-center py-20">
                  Пока нет записей
                </p>
              ) : (
                expert.dailyPosts.map((post, idx) => (
                  <Card
                    key={post.id}
                    className="rounded-3xl border border-(--outline) bg-(--card) p-6 ring-0 animate-reveal fill-mode-both"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    {/* Optional image */}
                    {post.image && (
                      <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-4 border border-(--outline)">
                        <Image
                          src={post.image}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <p className="text-body-2 text-(--on-bg-high) leading-relaxed mb-3">
                      {post.text}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {post.tags?.map((tag) => (
                          <Badge
                            key={tag}
                            variant="tonal-card-static"
                            size="chip-small"
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                      <span className="text-body-5 text-(--on-bg-low)">
                        {new Date(post.date).toLocaleDateString("ru-RU", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === "События" && (
            <div className="space-y-4">
              {expert.events.length === 0 ? (
                <p className="text-body-2 text-(--on-bg-medium) text-center py-20">
                  Пока нет событий
                </p>
              ) : (
                expert.events.map((event, idx) => (
                  <Card
                    key={event.id}
                    className="rounded-3xl border border-(--outline) bg-(--card) p-6 ring-0 animate-reveal fill-mode-both"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    {/* Optional image */}
                    {event.image && (
                      <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-4 border border-(--outline)">
                        <Image
                          src={event.image}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <h3 className="text-display-4 text-(--on-bg-high) mb-2">
                      {event.title}
                    </h3>
                    {/* <p className="text-body-2 text-(--on-bg-high) leading-relaxed mb-3">
                      {event.description}
                    </p> */}
                    <div className="flex items-center justify-between">
                      {event.tags && (
                        <div className="flex flex-wrap gap-1">
                          {event.tags.map((tag: string) => (
                            <Badge
                              key={tag}
                              variant="tonal-card-static"
                              size="chip-small"
                            >
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {event.date && (
                        <span className="text-body-5 text-(--on-bg-low)">
                          {new Date(event.date).toLocaleDateString("ru-RU", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {activeTab === "Награды" && (
            <div className="space-y-4">
              {expert.awards.length === 0 ? (
                <p className="text-body-2 text-(--on-bg-medium) text-center py-20">
                  Пока нет наград
                </p>
              ) : (
                expert.awards.map((award, idx) => (
                  <Card
                    key={award.id}
                    className="rounded-3xl border border-(--outline) bg-(--card) p-6 ring-0 animate-reveal fill-mode-both"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    <h3 className="text-display-4 text-(--on-bg-high) mb-2">
                      {award.title}
                    </h3>
                    <p className="text-body-2 text-(--on-bg-high) leading-relaxed mb-3">
                      {award.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {award.tags?.map((tag) => (
                          <Badge
                            key={tag}
                            variant="tonal-card-static"
                            size="chip-small"
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                      <span className="text-body-5 text-(--on-bg-low)">
                        {new Date(award.date).toLocaleDateString("ru-RU", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
