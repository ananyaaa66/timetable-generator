import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, Clock, Download, PenSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const highlights = [
  {
    icon: CalendarDays,
    title: "Plan by subject",
    description:
      "Add every subject and map them across the days that work best for your schedule.",
  },
  {
    icon: Clock,
    title: "Smart spacing",
    description:
      "Balance study sessions across the week with automatic timetable distribution.",
  },
  {
    icon: PenSquare,
    title: "Editable cells",
    description:
      "Fine-tune each period with inline editing right from the generated timetable.",
  },
  {
    icon: Download,
    title: "Save or export",
    description:
      "Store timetables locally or download polished PDFs to share with classmates.",
  },
];

const steps = [
  {
    label: "Step 1",
    title: "Define your subjects",
    description: "Tell us how many subjects you have and give each a name.",
  },
  {
    label: "Step 2",
    title: "Pick teaching days",
    description: "Choose the exact days you want to schedule and set periods per day.",
  },
  {
    label: "Step 3",
    title: "Generate & refine",
    description: "Create your timetable, edit on the fly, then save or export instantly.",
  },
];

const gradients = ["from-primary/15 to-primary/5", "from-accent/20 to-accent/5", "from-secondary/20 to-secondary/5"];

export default function Home() {
  return (
    <div className="space-y-20">
      <section className="relative overflow-hidden rounded-4xl border border-white/40 bg-white/80 p-10 shadow-card sm:p-14 lg:p-16">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/20" />
        <div className="relative flex flex-col gap-10 lg:flex-row">
          <div className="flex-1 space-y-6">
            <span className="chip w-max animate-fade-up">Personalized schedules</span>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              Design beautiful, balanced study weeks in minutes
            </h1>
            <p className="max-w-xl text-base text-foreground/75 md:text-lg">
              The Timetable Generator helps students and teams organise learning plans with ease. Spread
              out your subjects, tailor days and periods, and edit every detail on a canvas built for focus.
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
          <div className="flex flex-1 flex-col gap-4 rounded-3xl bg-white/55 p-6 shadow-glow backdrop-blur">
            <h2 className="font-display text-xl font-semibold text-foreground">Preview your week</h2>
            <div className="grid grid-cols-5 gap-2 text-xs font-medium text-foreground/70">
              {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day) => (
                <div key={day} className="rounded-xl bg-primary/10 px-3 py-2 text-center">
                  {day}
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-3 text-sm">
              {["08:30", "10:00", "12:00", "14:00"].map((time, index) => (
                <div key={time} className="grid grid-cols-5 gap-2">
                  {new Array(5).fill(null).map((_, dayIndex) => (
                    <div
                      key={dayIndex}
                      className={cn(
                        "rounded-xl border border-border/70 bg-white/70 px-3 py-2 text-foreground/70 shadow-sm",
                        gradients[(index + dayIndex) % gradients.length],
                      )}
                    >
                      <p className="text-xs font-semibold">Subject {(index + dayIndex) % 4 + 1}</p>
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
                <h3 className="font-display text-xl font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm text-foreground/70">{item.description}</p>
              </div>
              <span className="ml-auto text-xs font-semibold text-foreground/40">0{index + 1}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="rounded-4xl border border-white/40 bg-white/80 p-10 shadow-card">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="chip mb-4">How it works</p>
            <h2 className="text-3xl font-semibold md:text-4xl">
              Create a timetable tailored to your rhythm
            </h2>
          </div>
          <p className="max-w-lg text-sm text-foreground/70">
            This tool was designed to feel flexible and friendly—perfect for classrooms, tutoring centres, or
            personal study plans. Timelines stay in sync across devices thanks to local storage persistence.
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
              <h3 className="font-display text-xl font-semibold text-foreground">{step.title}</h3>
              <p className="text-sm text-foreground/65">{step.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
