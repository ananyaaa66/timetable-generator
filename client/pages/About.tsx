import { Sparkles, Target, Users } from "lucide-react";

const missionPoints = [
  {
    title: "Purpose-built for clarity",
    description:
      "We wanted students, mentors, and coordinators to craft schedules without spreadsheets or manual juggling.",
    icon: Sparkles,
  },
  {
    title: "Designed for flexibility",
    description:
      "Every timetable is editable after generation, making it simple to adjust lessons, rooms, or facilitators.",
    icon: Target,
  },
  {
    title: "Community collaboration",
    description:
      "Timetables can be exported and shared instantly, encouraging collaborative planning across teams.",
    icon: Users,
  },
];

const values = [
  {
    heading: "Clarity first",
    body: "Visual layouts, pastel palettes, and accessible typography make planning feel calm and intentional.",
  },
  {
    heading: "Time well spent",
    body: "Automations keep repetitive tasks away so teams can focus on mentoring and creative teaching.",
  },
  {
    heading: "Built for the future",
    body: "Exporting, saving, and editing features ensure the timetable evolves alongside your goals.",
  },
];

export default function About() {
  return (
    <div className="space-y-16">
      <section className="rounded-[2.75rem] border border-white/40 bg-white/80 p-10 shadow-card lg:p-16">
        <div className="max-w-3xl space-y-6">
          <span className="chip">About Timetable Generator</span>
          <h1 className="text-4xl font-semibold md:text-5xl">
            Thoughtfully crafted by Ananya Singh to bring calm to your weekly planning
          </h1>
          <p className="text-base text-foreground/70 md:text-lg">
            This project began as a personal quest to simplify the chaos of class schedules. With a modern user
            experience and a focus on accessibility, the Timetable Generator empowers classrooms, project teams, and
            individual learners to achieve more with structured, editable timetables.
          </p>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {missionPoints.map((mission) => (
          <div
            key={mission.title}
            className="glass-panel h-full space-y-4 p-6 transition duration-300 hover:-translate-y-1 hover:shadow-glow"
          >
            <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <mission.icon className="size-6" />
            </span>
            <h2 className="font-display text-xl font-semibold text-foreground">{mission.title}</h2>
            <p className="text-sm text-foreground/70">{mission.description}</p>
          </div>
        ))}
      </section>

      <section className="rounded-[2.5rem] border border-white/50 bg-white/80 p-10 shadow-card">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold">Meet the maker</h2>
            <p className="text-sm text-foreground/70 md:text-base">
              Hi, I am <span className="font-semibold text-primary">Ananya Singh</span>. I created the Timetable
              Generator as a collaborative tool for educators and learners. Whether you are organising study groups or
              coordinating faculty schedules, this application keeps everyone aligned and informed.
            </p>
            <p className="text-sm text-foreground/70 md:text-base">
              The project continues to grow with feedback from real classrooms and remote teams. Expect a steady stream of
              enhancements—from advanced export formats to intelligent subject balancing.
            </p>
          </div>
          <aside className="glass-panel space-y-5 p-6">
            <h3 className="text-lg font-semibold text-foreground">Core values</h3>
            <ul className="space-y-4 text-sm text-foreground/70">
              {values.map((value) => (
                <li key={value.heading}>
                  <p className="font-semibold text-foreground">{value.heading}</p>
                  <p>{value.body}</p>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
    </div>
  );
}
