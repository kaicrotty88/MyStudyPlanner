import React from "react";

type LoadingScreenProps = {
  label?: string;
};

export default function LoadingScreen({ label = "Loading…" }: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 md:px-10">
        <header className="pt-10">
          <div className="leading-tight">
            <div className="text-base font-semibold text-foreground">
              MyStudyPlanner
            </div>
            <div className="text-[11px] text-muted-foreground">
              Made by students, for students
            </div>
          </div>
        </header>

        <div className="flex flex-1 items-start justify-center pt-10 pb-12">
          <section className="w-full max-w-[460px]">
            <div className="rounded-2xl border border-border bg-card shadow-sm">
              <div className="p-6 md:p-7">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-foreground">
                    {label}
                  </div>

                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-pulse" />
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-pulse [animation-delay:120ms]" />
                    <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 animate-pulse [animation-delay:240ms]" />
                  </div>
                </div>

                <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-muted/40">
                  <div className="h-full w-1/2 rounded-full bg-primary/30 animate-[loadingbar_900ms_ease-in-out_infinite]" />
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <style jsx global>{`
        @keyframes loadingbar {
          0% {
            transform: translateX(-60%);
          }
          50% {
            transform: translateX(40%);
          }
          100% {
            transform: translateX(140%);
          }
        }
      `}</style>
    </div>
  );
}
