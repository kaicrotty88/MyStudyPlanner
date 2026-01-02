import React from "react";

export default function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 md:px-10">
        {/* Brand */}
        <header className="pt-10">
          <div className="leading-tight">
            <div className="text-base font-semibold text-gray-900">MyStudyPlanner</div>
            <div className="text-[11px] text-gray-500">Made by students, for students</div>
          </div>
        </header>

        {/* Centered content (slightly lifted) */}
        <div className="flex flex-1 justify-center pt-10">
          <section className="w-full max-w-115">
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="p-8">
                <div className="space-y-1">
                  <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
                  <p className="text-sm text-gray-500">{subtitle}</p>
                </div>

                <div className="mt-7 w-full">{children}</div>

                <p className="mt-6 text-xs text-gray-500">
                  Stay organised. Everything in one place.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
