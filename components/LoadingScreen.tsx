import React from "react";

const steps = ["Calendar", "Tasks", "Study", "Progress"];

type LoadingScreenProps = {
  label?: string;
};

export default function LoadingScreen({
  label = "Loading your planner",
}: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="flex min-h-screen items-center justify-center px-6 py-12">
        <section className="w-full max-w-2xl text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-border bg-card shadow-sm">
            <div className="h-3 w-3 rounded-full bg-primary animate-[plannerPulse_1.4s_ease-in-out_infinite]" />
          </div>

          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            MyStudyPlanner
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your school life, connected.
          </p>

          <div className="mx-auto mt-9 max-w-xl">
            <div className="grid grid-cols-4 items-start gap-2">
              {steps.map((step, index) => (
                <div key={step} className="relative flex flex-col items-center">
                  {index < steps.length - 1 ? (
                    <div className="absolute left-1/2 top-3 h-px w-full bg-border">
                      <div
                        className="h-full w-full origin-left bg-primary/50 animate-[plannerLink_1.8s_ease-in-out_infinite]"
                        style={{ animationDelay: `${index * 180}ms` }}
                      />
                    </div>
                  ) : null}

                  <div
                    className="relative z-10 h-6 w-6 rounded-full border border-border bg-card p-[5px] shadow-sm"
                    style={{ animationDelay: `${index * 180}ms` }}
                  >
                    <div className="h-full w-full rounded-full bg-primary/70 animate-[plannerNode_1.8s_ease-in-out_infinite]" />
                  </div>

                  <div className="mt-2 text-[11px] font-medium text-muted-foreground sm:text-xs">
                    {step}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-medium text-muted-foreground shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            {label}
          </div>
        </section>
      </main>

      <style jsx global>{`
        @keyframes plannerPulse {
          0%,
          100% {
            transform: scale(0.8);
            opacity: 0.55;
          }
          50% {
            transform: scale(1.15);
            opacity: 1;
          }
        }

        @keyframes plannerNode {
          0%,
          20%,
          100% {
            opacity: 0.28;
            transform: scale(0.72);
          }
          45%,
          70% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes plannerLink {
          0%,
          25% {
            transform: scaleX(0);
            opacity: 0.2;
          }
          55%,
          80% {
            transform: scaleX(1);
            opacity: 0.8;
          }
          100% {
            transform: scaleX(1);
            opacity: 0.25;
          }
        }
      `}</style>
    </div>
  );
}