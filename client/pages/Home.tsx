import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  Download,
  PenSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

const highlights = [
  {
    icon: CalendarDays,
    title: "Coordinate sections",
    description:
      "Assign subject blocks across sections so every homeroom receives face time without conflict.",
  },
  {
    icon: Clock,
    title: "Conflict-free timing",
    description:
      "We stagger periods automatically so teachers are never double-booked between sections.",
  },
  {
    icon: PenSquare,
    title: "Editable lesson blocks",
    description:
      "Fine-tune room numbers, co-teachers, or notes directly inside the generated schedule.",
  },
  {
    icon: Download,
    title: "Save or export",
    description:
      "Store faculty timetables locally or download polished PDFs to share with administration.",
  },
];

const steps = [
  {
    label: "Step 1",
    title: "Gather teaching load",
    description:
      "List every subject and how many weekly touchpoints each class requires.",
  },
  {
    label: "Step 2",
    title: "Set sections & days",
    description:
      "Choose the sections you teach and the instructional windows available.",
  },
  {
    label: "Step 3",
    title: "Generate & refine",
    description:
      "Produce a conflict-free teacher plan, adjust details, then share with your team.",
  },
];

const gradients = [
  "from-primary/15 to-primary/5",
  "from-accent/20 to-accent/5",
  "from-secondary/20 to-secondary/5",
];

export default function Home() {
  return (
    <div className="space-y-20">
      <section className="relative overflow-hidden rounded-[2.75rem] border border-white/40 bg-white/80 p-10 shadow-card sm:p-14 lg:p-16">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/20" />
        <div className="relative flex flex-col gap-10 lg:flex-row">
          <div className="flex-1 space-y-6">
            <span className="chip w-max animate-fade-up">
              Teacher-first scheduling
            </span>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Orchestrate sections, subjects, and contact hours without clashes
            </h1>
            <p className="max-w-xl text-base text-foreground/75 md:text-lg">
              Build a teaching timetable that balances every section, honours
              instructional minutes, and ensures your faculty is never
              double-booked. Configure once, then iterate with live editing and
              exports.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/generator" className="soft-button-primary group">
                Get Started
                <ArrowRight className="ml-2 size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              <Link to="/about" className="soft-button-secondary">
                Learn about the project
              </Link>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-4 rounded-[2rem] bg-white/55 p-6 shadow-glow backdrop-blur">
            <h2 className="font-display text-xl font-semibold text-foreground">
              Preview your faculty rotation
            </h2>
            <div className="grid grid-cols-6 gap-2 text-xs font-medium text-foreground/70">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="rounded-xl bg-primary/10 px-3 py-2 text-center uppercase tracking-wide"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3 text-sm">
              {["08:00", "09:45", "11:30", "13:15"].map((time, index) => (
                <div key={time} className="grid grid-cols-6 gap-2">
                  {new Array(6).fill(null).map((_, dayIndex) => (
                    <div
                      key={dayIndex}
                      className={cn(
                        "rounded-xl border border-border/70 bg-white/70 px-3 py-2 text-foreground/70 shadow-sm",
                        gradients[(index + dayIndex) % gradients.length],
                      )}
                    >
                      <p className="text-xs font-semibold">
                        Section{" "}
                        {String.fromCharCode(65 + ((index + dayIndex) % 3))}
                      </p>
                      <p className="text-[11px] text-foreground/60">{time}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        {highlights.map((item, index) => (
          <div
            key={item.title}
            className="group relative overflow-hidden rounded-3xl border border-white/40 bg-white/70 p-7 shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-glow"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-primary/5 opacity-0 transition group-hover:opacity-100" />
            <div className="relative flex items-start gap-4">
              <span className="rounded-2xl bg-primary/10 p-3 text-primary">
                <item.icon className="size-6" />
              </span>
              <div className="space-y-2">
                <h3 className="font-display text-xl font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="text-sm text-foreground/70">{item.description}</p>
              </div>
              <span className="ml-auto text-xs font-semibold text-foreground/40">
                0{index + 1}
              </span>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-[2.5rem] border border-white/40 bg-white/80 p-10 shadow-card">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="chip mb-4">Scheduling workflow</p>
            <h2 className="text-3xl font-semibold md:text-4xl">
              Create a staff timetable tailored to your teaching load
            </h2>
          </div>
          <p className="max-w-lg text-sm text-foreground/70">
            Capture every section, distribute contact hours evenly, and adapt
            instantly when calendars shift. Local storage keeps your draft
            aligned across sessions until you are ready to export.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <div
              key={step.label}
              className="glass-panel h-full space-y-3 p-6 transition duration-300 hover:-translate-y-1 hover:shadow-glow"
            >
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/50">
                {step.label}
              </span>
              <h3 className="font-display text-xl font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="text-sm text-foreground/70">{step.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
