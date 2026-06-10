"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DprofileLogotypeMonoIcon, KeyboardArrowRightIcon } from "@/components/icons";
import { Project } from "./data";

interface ProjectPageProps {
  project: Project;
}

export default function ProjectPage({ project }: ProjectPageProps) {
  return (
    <>
      {/* Hero Section – large image + title */}
      <section className="relative overflow-hidden pt-16 pb-10 md:pb-10">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center">
            {/* Left column – text */}
            <div className="animate-reveal">
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="glass-static" size="chip-small">
                  {project.category || "Проект"}
                </Badge>
              </div>

              <h1 className="text-display-2 md:text-display-1 text-(--on-bg-high) mb-6 leading-tight">
                {project.title}
              </h1>

              <p className="text-body-2 md:text-body-1 text-(--on-bg-medium) mb-8 max-w-[576px]">
                {project.description}
              </p>

              {/* Client / Platform / Period info */}
              <div className="flex flex-wrap gap-6 md:gap-10 mb-6">
                {project.client && (
                  <div>
                    <p className="text-body-5 text-(--on-bg-low) uppercase tracking-wider mb-1">КЛИЕНТ</p>
                    <p className="text-body-3 text-(--on-bg-high) font-medium">{project.client}</p>
                  </div>
                )}
                {project.platform && (
                  <div>
                    <p className="text-body-5 text-(--on-bg-low) uppercase tracking-wider mb-1">ПЛАТФОРМА</p>
                    <p className="text-body-3 text-(--on-bg-high) font-medium">{project.platform}</p>
                  </div>
                )}
                {project.period && (
                  <div>
                    <p className="text-body-5 text-(--on-bg-low) uppercase tracking-wider mb-1">ПЕРИОД</p>
                    <p className="text-body-3 text-(--on-bg-high) font-medium">{project.period}</p>
                  </div>
                )}
              </div>

              {/* Tech Stack */}
              {project.techStack && project.techStack.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {project.techStack.map((tech, idx) => (
                    <Badge
                      key={idx}
                      variant="tonal-card-static"
                      size="chip-medium"
                      className="animate-reveal fill-mode-both"
                      style={{ animationDelay: `${idx * 50}ms` }}
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              )}
              <Button size="large" shape="round" asChild className="mt-10 w-full max-w-[300px]">
                <Link href={project.href || "#"} target="_blank" rel="noopener noreferrer">
                  Посмотреть проект
                  <DprofileLogotypeMonoIcon className="size-7!" />
                </Link>
              </Button>
            </div>

            {/* Right column – large image */}
            <div className="relative aspect-[596/447] rounded-2xl overflow-hidden border border-(--outline) bg-(--card) animate-reveal delay-200 fill-mode-both">
              <Image
                src={project.image}
                alt={project.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>
        </Container>
      </section>

      {/* Impact & Results Section */}
      {project.metrics && project.metrics.length > 0 && (
        <section className="py-10 md:py-18 bg-(--bg)">
          <Container>
            <h2 className="text-display-2 text-(--on-bg-high) mb-10 animate-reveal">
              Результаты внедрения
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {project.metrics.map((metric, idx) => (
                <Card
                  key={idx}
                  className="rounded-3xl border border-(--outline) bg-(--card) p-8 ring-0 animate-reveal fill-mode-both"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <p className="text-body-5 text-(--on-bg-low) uppercase tracking-wider mb-2">
                    {metric.label}
                  </p>
                  <p className="text-display-1 text-(--on-bg-high) mb-2">
                    {metric.value}
                  </p>
                  <p className="text-body-3 text-(--on-bg-medium)">
                    {metric.description}
                  </p>
                </Card>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* CTA Section */}
      {/* <section className="py-16 md:py-24">
        <Container>
          <div className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-(--primary-card) to-(--card) border border-(--outline) p-8 md:p-16">
            <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-(--primary)/10 blur-3xl" />

            <div className="relative z-10 mx-auto max-w-[672px] text-center">
              <h3 className="text-display-3 text-(--on-bg-high) mb-4">
                Интерактивный прототип
              </h3>
              <p className="text-body-2 text-(--on-bg-medium) mb-8">
                Оцените плавность анимаций, логику навигации и внимание к деталям в интерактивном прототипе.
              </p>


            </div>
          </div>
        </Container>
      </section> */}
    </>
  );
}
