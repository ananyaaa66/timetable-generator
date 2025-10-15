import { useState, type ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface RootLayoutProps {
  children: ReactNode;
}

const navItems = [
  { label: "Home", to: "/" },
  { label: "Generator", to: "/generator" },
  { label: "About", to: "/about" },
  { label: "Resources", to: "/about#resources" },
];

export function RootLayout({ children }: RootLayoutProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-gradient-mesh">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-white/40">
        <div className="container flex h-20 items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="chip">Faculty Suite</span>
            <span className="font-display text-lg font-semibold tracking-tight">
              Teacher Timetable Generator
            </span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-all",
                    "hover:bg-primary/10 hover:text-primary",
                    isActive ? "bg-primary text-primary-foreground shadow-glow" : "text-foreground/80",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="md:hidden inline-flex size-11 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-card transition hover:border-primary/40 hover:text-primary"
            aria-label="Toggle navigation"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
        {open ? (
          <div className="md:hidden border-t border-white/40 bg-background/95 backdrop-blur-xl">
            <nav className="container flex flex-col gap-2 py-4">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "rounded-full px-4 py-2 text-sm font-semibold",
                      "hover:bg-primary/10 hover:text-primary",
                      isActive ? "bg-primary text-primary-foreground shadow" : "text-foreground/85",
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        ) : null}
      </header>

      <main className="relative flex-1 pb-24">
        <span className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[420px] w-[min(720px,90vw)] rounded-[50%] bg-primary/10 blur-3xl" />
        <div className="relative container py-12 lg:py-16">{children}</div>
      </main>

      <footer className="border-t border-white/40 bg-background/80 backdrop-blur-xl">
        <div className="container flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="font-display text-lg font-semibold text-foreground">
              Teacher Timetable Generator
            </p>
            <p className="text-sm text-foreground/70">
              Crafted to keep instructors in sync across sections, rooms, and weekly teaching loads.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-foreground/70">
            <span>Guiding teachers toward organised, conflict-free schedules.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
