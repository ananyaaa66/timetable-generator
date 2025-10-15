import { Sparkles, Target, Users } from "lucide-react";

const missionPoints = [
  {
    title: "Purpose-built for faculty",
    description:
      "No more whiteboards or overlapping sessions—teachers receive a clear path through every section they instruct.",
    icon: Sparkles,
  },
  {
    title: "Designed for leadership",
    description:
      "Department heads can visualise staffing coverage, reassign lessons, and keep mentors where they are needed most.",
    icon: Target,
  },
  {
    title: "Collaboration-ready",
    description:
      "Export timetables to share with administrators, coordinators, and co-teachers in seconds.",
    icon: Users,
  },
];

const values = [
  {
    heading: "Clarity first",
    body: "Visual layouts, pastel palettes, and accessible typography make staff planning feel calm and intentional.",
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
            Built by Ananya Singh to streamline teaching rotations and faculty
            coverage
          </h1>
          <p className="text-base text-foreground/70 md:text-lg">
            Teachers deserve a planning companion that prioritises their time.
            The Timetable Generator keeps sections in sync, honours subject
            contact hours, and gives leadership an instant snapshot of coverage
            across the week.
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
            <h2 className="font-display text-xl font-semibold text-foreground">
              {mission.title}
            </h2>
            <p className="text-sm text-foreground/70">{mission.description}</p>
          </div>
        ))}
      </section>

      <section
        id="resources"
        className="rounded-[2.5rem] border border-white/50 bg-white/80 p-10 shadow-card"
      >
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="space-y-4">
            <h2 className="text-3xl font-semibold">Meet the maker</h2>
            <p className="text-sm text-foreground/70 md:text-base">
              Hi, I am{" "}
              <span className="font-semibold text-primary">Ananya Singh</span>.
              I created this generator for teachers who juggle multiple sections
              daily. It adapts to changing timetables and keeps every class on a
              unique slot so you never sprint between rooms.
            </p>
            <p className="text-sm text-foreground/70 md:text-base">
              The roadmap includes richer analytics for subject loads, support
              for co-teaching, and seamless exports into school communication
              platforms.
            </p>
          </div>
          <aside className="glass-panel space-y-5 p-6">
            <h3 className="text-lg font-semibold text-foreground">
              Core values
            </h3>
            <ul className="space-y-4 text-sm text-foreground/70">
              {values.map((value) => (
                <li key={value.heading}>
                  <p className="font-semibold text-foreground">
                    {value.heading}
                  </p>
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
