"use client";

import Image from "next/image";
import { useState } from "react";

type Screenshot = {
  src: string;
  alt: string;
  title: string;
};

const screenshots: Screenshot[] = [
  {
    src: "/homepage/dashboard.png",
    alt: "MyStudyPlanner dashboard preview showing focus today and upcoming work.",
    title: "Dashboard",
  },
  {
    src: "/homepage/calendar.png",
    alt: "MyStudyPlanner calendar preview showing colour-coded assignments, reminders, exams, and study sessions.",
    title: "Calendar",
  },
  {
    src: "/homepage/tasks.png",
    alt: "MyStudyPlanner tasks preview showing grouped deadlines and assignments.",
    title: "Tasks",
  },
  {
    src: "/homepage/study-log.png",
    alt: "MyStudyPlanner study log preview showing logged sessions linked to assignments.",
    title: "Study Log",
  },
  {
    src: "/homepage/insights.png",
    alt: "MyStudyPlanner insights preview showing study and marks analytics.",
    title: "Insights",
  },
  {
    src: "/homepage/marks.png",
    alt: "MyStudyPlanner marks preview showing subject performance and progress.",
    title: "Marks",
  },
  {
    src: "/homepage/reminders.png",
    alt: "MyStudyPlanner reminders preview showing quick personal reminders.",
    title: "Reminders",
  },
];

export default function HomepagePreviewCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeShot = screenshots[activeIndex];

  function goToPrevious() {
    setActiveIndex((current) => (current === 0 ? screenshots.length - 1 : current - 1));
  }

  function goToNext() {
    setActiveIndex((current) => (current === screenshots.length - 1 ? 0 : current + 1));
  }

  function goToIndex(index: number) {
    setActiveIndex(index);
  }

  return (
    <div className="mt-10">
      <div className="overflow-hidden rounded-[30px] border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="text-sm font-semibold text-foreground">MyStudyPlanner</div>
          <div className="text-xs text-muted-foreground">{activeShot.title}</div>
        </div>

        <div className="relative aspect-[16/10] bg-muted/30">
          <Image
            key={activeShot.src}
            src={activeShot.src}
            alt={activeShot.alt}
            fill
            priority
            className="object-cover object-top"
          />

          <button
            type="button"
            onClick={goToPrevious}
            aria-label="Show previous screenshot"
            className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/90 text-lg text-foreground shadow-sm transition hover:bg-background"
          >
            ←
          </button>

          <button
            type="button"
            onClick={goToNext}
            aria-label="Show next screenshot"
            className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/90 text-lg text-foreground shadow-sm transition hover:bg-background"
          >
            →
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {screenshots.map((shot, index) => {
          const isActive = index === activeIndex;

          return (
            <button
              key={shot.title}
              type="button"
              onClick={() => goToIndex(index)}
              className={[
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                isActive
                  ? "border-[#7A9B7F] bg-[#E8F0E9] text-[#5E7A63]"
                  : "border-border bg-card text-muted-foreground hover:text-foreground",
              ].join(" ")}
              aria-label={`Show ${shot.title} preview`}
              aria-pressed={isActive}
            >
              {shot.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}