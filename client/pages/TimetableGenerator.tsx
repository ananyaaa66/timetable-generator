import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { CalendarPlus, Download, RefreshCcw, Save, Users2 } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  calculateRequiredSessions,
  generateTimetable,
  getPeriodLabel,
  getPeriodTimeRange,
  type SubjectConfig,
  type TimetableResult,
  updateSectionCell,
  type ClassCategory,
  type ClassType,
  type HalfPreference,
} from "@/utils/timetable";

const dayOptions = [
  { value: "Monday", short: "Mon" },
  { value: "Tuesday", short: "Tue" },
  { value: "Wednesday", short: "Wed" },
  { value: "Thursday", short: "Thu" },
  { value: "Friday", short: "Fri" },
  { value: "Saturday", short: "Sat" },
  { value: "Sunday", short: "Sun" },
];

const sortByCalendarOrder = (a: string, b: string) =>
  dayOptions.findIndex((option) => option.value === a) -
  dayOptions.findIndex((option) => option.value === b);

const STORAGE_KEY = "teacher-timetable-generator-v1";

interface StoredState {
  teacherName: string;
  subjects: SubjectConfig[];
  selectedDays: string[];
  periodsPerDay: number;
  sections: number;
  sectionNames: string[];
  timetable: TimetableResult | null;
}

const defaultSubjectTemplates: SubjectConfig[] = [
  {
    name: "Mathematics",
    sessionsPerWeek: 4,
    classType: "Theory",
    category: "Regular",
    preferredHalf: "First",
  },
  {
    name: "Science",
    sessionsPerWeek: 3,
    classType: "Theory",
    category: "Regular",
    preferredHalf: "First",
  },
  {
    name: "English",
    sessionsPerWeek: 3,
    classType: "Theory",
    category: "Regular",
    preferredHalf: "First",
  },
  {
    name: "History",
    sessionsPerWeek: 2,
    classType: "Theory",
    category: "Regular",
    preferredHalf: "Second",
  },
  {
    name: "Computer Science",
    sessionsPerWeek: 2,
    classType: "Lab",
    category: "Regular",
    preferredHalf: "Second",
  },
  {
    name: "Physical Education",
    sessionsPerWeek: 2,
    classType: "Theory",
    category: "Regular",
    preferredHalf: "Second",
  },
  {
    name: "Music",
    sessionsPerWeek: 1,
    classType: "Theory",
    category: "Remedial",
    preferredHalf: "Second",
  },
  {
    name: "Art",
    sessionsPerWeek: 1,
    classType: "Theory",
    category: "Remedial",
    preferredHalf: "Second",
  },
];

const createEmptySubject = (): SubjectConfig => ({
  name: "",
  sessionsPerWeek: 1,
  classType: "Theory",
  category: "Regular",
  preferredHalf: "First",
});

function normalizeSubject(subject: SubjectConfig): SubjectConfig {
  return {
    name: subject.name.trim(),
    sessionsPerWeek: Math.max(0, Math.round(subject.sessionsPerWeek || 0)),
    classType: subject.classType ?? "Theory",
    category: subject.category ?? "Regular",
    preferredHalf: subject.preferredHalf ?? "First",
  } satisfies SubjectConfig;
}

function SubjectInputs({
  subjects,
  onNameChange,
  onSessionChange,
  onTypeChange,
  onCategoryChange,
  onHalfChange,
}: {
  subjects: SubjectConfig[];
  onNameChange: (index: number, value: string) => void;
  onSessionChange: (index: number, value: number) => void;
  onTypeChange: (index: number, value: ClassType) => void;
  onCategoryChange: (index: number, value: ClassCategory) => void;
  onHalfChange: (index: number, value: HalfPreference) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {subjects.map((subject, index) => (
        <div
          key={`subject-${index}`}
          className="rounded-2xl border border-border bg-white/70 p-4 shadow-sm transition focus-within:border-primary/60 focus-within:shadow-glow"
        >
          <div className="flex items-start justify-between gap-4">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/45">
              Subject {index + 1}
            </span>
            <span className="text-[11px] font-medium text-foreground/45">
              Weekly sessions
            </span>
          </div>
          <input
            value={subject.name}
            onChange={(event) => onNameChange(index, event.target.value)}
            placeholder={
              defaultSubjectTemplates[index]?.name ?? "Add subject name"
            }
            className="mt-2 h-10 w-full rounded-xl border border-border bg-white/80 px-3 text-sm text-foreground outline-none transition placeholder:text-foreground/40 focus:border-primary/70"
          />
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              type="number"
              min={1}
              max={10}
              value={subject.sessionsPerWeek}
              onChange={(event) =>
                onSessionChange(index, Number(event.target.value))
              }
              className="h-10 w-24 rounded-xl border border-border bg-white/80 px-3 text-sm text-foreground outline-none transition focus:border-primary/70"
            />
            <span className="text-xs text-foreground/55">per section</span>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
            <select
              value={subject.classType ?? "Theory"}
              onChange={(e) => onTypeChange(index, e.target.value as ClassType)}
              className="h-9 rounded-xl border border-border bg-white/80 px-2"
            >
              <option value="Theory">Theory (50 mins)</option>
              <option value="Lab">Lab (1 hr 30 mins)</option>
            </select>
            <select
              value={subject.category ?? "Regular"}
              onChange={(e) =>
                onCategoryChange(index, e.target.value as ClassCategory)
              }
              className="h-9 rounded-xl border border-border bg-white/80 px-2"
            >
              <option value="Regular">Regular</option>
              <option value="Remedial">Remedial</option>
            </select>
            <select
              value={subject.preferredHalf ?? "First"}
              onChange={(e) =>
                onHalfChange(index, e.target.value as HalfPreference)
              }
              className="h-9 rounded-xl border border-border bg-white/80 px-2"
            >
              <option value="First">First Half (9 AM–1 PM)</option>
              <option value="Second">Second Half (1 PM–6 PM)</option>
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}

function DaySelector({
  selectedDays,
  onToggle,
}: {
  selectedDays: string[];
  onToggle: (day: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {dayOptions.map((day) => {
        const active = selectedDays.includes(day.value);
        return (
          <button
            key={day.value}
            type="button"
            onClick={() => onToggle(day.value)}
            className={cn(
              "flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition",
              active
                ? "border-transparent bg-primary text-primary-foreground shadow-glow"
                : "border-border bg-white/50 text-foreground/70 hover:border-primary/40 hover:text-primary",
            )}
          >
            <span className="inline-flex size-5 items-center justify-center rounded-full border border-white/60 bg-white/40 text-[11px] font-medium text-foreground/65">
              {day.short}
            </span>
            {day.value}
          </button>
        );
      })}
    </div>
  );
}

function TeacherPreview({ timetable }: { timetable: TimetableResult | null }) {
  if (!timetable || timetable.teacherGrid.length === 0) return null;
  return (
    <div className="glass-panel space-y-4 p-6">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-display text-lg font-semibold text-foreground">
          {timetable.teacherName?.trim() || "Teacher"} – Timetable
        </h3>
        <span className="chip">{timetable.days.length} day rotation</span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full table-fixed border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 rounded-tl-2xl bg-primary/10 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Periods
              </th>
              {timetable.days.map((day) => (
                <th
                  key={`teacher-${day}`}
                  className="bg-primary/10 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-primary"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timetable.teacherGrid.map((row, periodIndex) => (
              <tr key={`teacher-period-${periodIndex}`}>
                <td className="sticky left-0 z-10 border-y border-l border-white/60 bg-white/80 px-4 py-3 font-semibold text-foreground/90">
                  {getPeriodLabel(periodIndex)}
                  <span className="ml-2 text-xs text-foreground/60">{getPeriodTimeRange(periodIndex, timetable.sections[0].grid.length)}</span>
                </td>
                {row.map((cell, dayIndex) => (
                  <td
                    key={`teacher-cell-${periodIndex}-${dayIndex}`}
                    className="border border-white/60 bg-white/70 px-3 py-3 align-top"
                  >
                    <div className="min-h-[44px] rounded-xl border border-transparent bg-white/70 p-3 text-sm text-foreground/85">
                      {cell}
                    </div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TimetablePreview({
  timetable,
  onCellEdit,
  tableRef,
}: {
  timetable: TimetableResult | null;
  onCellEdit: (
    sectionIndex: number,
    periodIndex: number,
    dayIndex: number,
    value: string,
  ) => void;
  tableRef: React.RefObject<HTMLDivElement>;
}) {
  if (!timetable || timetable.sections.length === 0) {
    return (
      <div className="glass-panel flex flex-col items-center justify-center gap-3 p-10 text-center text-foreground/60">
        <CalendarPlus className="size-10 text-primary" />
        <p className="font-semibold">
          Your timetable will appear here after generation.
        </p>
        <p className="max-w-sm text-sm text-foreground/55">
          Configure the form above, then select “Generate timetable” to populate
          your teaching rotation.
        </p>
      </div>
    );
  }

  const assignedSessions =
    timetable.requiredSessions - timetable.unassignedSessions;

  return (
    <div ref={tableRef} className="space-y-6">
      <div className="glass-panel flex flex-wrap items-center justify-between gap-4 p-6 text-sm text-foreground/70">
        <div className="space-y-1">
          <p className="text-base font-semibold text-foreground">
            Scheduling summary
          </p>
          <p>
            {assignedSessions} of {timetable.requiredSessions} sessions
            scheduled across {timetable.sections.length} sections.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
            Total slots: {timetable.totalSlots}
          </span>
          <span className="rounded-full bg-accent/40 px-3 py-1 text-accent-foreground">
            Teaching days: {timetable.days.length}
          </span>
          <span className="rounded-full bg-secondary/40 px-3 py-1 text-secondary-foreground">
            Periods/day:{" "}
            {timetable.sections[0].grid.length > 0
              ? timetable.sections[0].grid.length
              : 0}
          </span>
        </div>
      </div>
      {timetable.unassignedSessions > 0 ? (
        <div className="glass-panel border-destructive/40 bg-destructive/10 p-5 text-sm text-destructive-foreground">
          Not enough periods to place all sessions. Increase periods per day,
          add more teaching days, or reduce weekly sessions to schedule the
          remaining {timetable.unassignedSessions} lesson(s).
        </div>
      ) : null}
      <TeacherPreview timetable={timetable} />
      <div className="grid gap-6 xl:grid-cols-2">
        {timetable.sections.map((section, sectionIndex) => (
          <div key={section.name} className="glass-panel space-y-4 p-6">
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-display text-lg font-semibold text-foreground">
                {section.name}
              </h3>
              <span className="chip">{timetable.days.length} day rotation</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full table-fixed border-separate border-spacing-0 text-sm">
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 rounded-tl-2xl bg-primary/10 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                      Periods
                    </th>
                    {timetable.days.map((day) => (
                      <th
                        key={`${section.name}-${day}`}
                        className="bg-primary/10 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-primary"
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.grid.map((row, periodIndex) => (
                    <tr key={`${section.name}-period-${periodIndex}`}>
                      <td className="sticky left-0 z-10 border-y border-l border-white/60 bg-white/80 px-4 py-3 font-semibold text-foreground/90">
                        {getPeriodLabel(periodIndex)}
                        <span className="ml-2 text-xs text-foreground/60">{getPeriodTimeRange(periodIndex, timetable.sections[0].grid.length)}</span>
                      </td>
                      {row.map((cell, dayIndex) => (
                        <td
                          key={`${section.name}-cell-${periodIndex}-${dayIndex}`}
                          className="border border-white/60 bg-white/70 px-3 py-3 align-top transition hover:bg-highlight/60"
                        >
                          <div
                            contentEditable
                            suppressContentEditableWarning
                            onBlur={(event) =>
                              onCellEdit(
                                sectionIndex,
                                periodIndex,
                                dayIndex,
                                event.currentTarget.textContent?.trim() ?? "",
                              )
                            }
                            className="min-h-[60px] rounded-xl border border-transparent bg-white/70 p-3 text-sm text-foreground/85 outline-none transition focus:border-primary/70 focus:shadow-glow"
                          >
                            {cell}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function TimetableGenerator() {
  const [teacherName, setTeacherName] = useState("");
  const [subjectCount, setSubjectCount] = useState(5);
  const [subjects, setSubjects] = useState<SubjectConfig[]>(() =>
    defaultSubjectTemplates.slice(0, 5),
  );
  const [selectedDays, setSelectedDays] = useState<string[]>([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ]);
  const [periodsPerDay, setPeriodsPerDay] = useState(6);
  const [sectionCount, setSectionCount] = useState(3);
  const [sectionNames, setSectionNames] = useState<string[]>([
    "Section A",
    "Section B",
    "Section C",
  ]);
  const [timetable, setTimetable] = useState<TimetableResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const tableRef = useRef<HTMLDivElement>(null);

  const formSubjects = useMemo(
    () => subjects.slice(0, subjectCount),
    [subjectCount, subjects],
  );

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as StoredState;
      if (typeof parsed.teacherName === "string")
        setTeacherName(parsed.teacherName);
      if (Array.isArray(parsed.sectionNames) && parsed.sectionNames.length)
        setSectionNames(parsed.sectionNames);
      if (parsed.subjects?.length) {
        const normalized = parsed.subjects.map((subject) => ({
          name: subject.name,
          sessionsPerWeek: Math.max(1, subject.sessionsPerWeek || 1),
          classType: subject.classType ?? "Theory",
          category: subject.category ?? "Regular",
          preferredHalf: subject.preferredHalf ?? "First",
        }));
        setSubjects(normalized);
        setSubjectCount(normalized.length);
      }
      if (parsed.selectedDays?.length) {
        setSelectedDays(parsed.selectedDays);
      }
      if (parsed.periodsPerDay) {
        setPeriodsPerDay(parsed.periodsPerDay);
      }
      if (parsed.sections) {
        setSectionCount(Math.max(1, parsed.sections));
      }
      if (parsed.timetable?.sections?.length) {
        setTimetable(parsed.timetable);
      }
    } catch (error) {
      console.error("Failed to parse saved timetable", error);
    }
  }, []);

  useEffect(() => {
    // Ensure sectionNames length tracks sectionCount
    setSectionNames((prev) => {
      const next = [...prev];
      if (sectionCount > next.length) {
        for (let i = next.length; i < sectionCount; i += 1) {
          const label = String.fromCharCode(65 + i);
          next.push(`Section ${label}`);
        }
      } else if (sectionCount < next.length) {
        next.length = sectionCount;
      }
      return next;
    });
  }, [sectionCount]);

  const handleSubjectCountChange = (value: number) => {
    const safeValue = Math.min(Math.max(value, 1), 16);
    setSubjectCount(safeValue);
    setSubjects((prev) => {
      if (safeValue > prev.length) {
        const additional = Array.from(
          { length: safeValue - prev.length },
          (_, index) => {
            const template = defaultSubjectTemplates[prev.length + index];
            return template ? { ...template } : createEmptySubject();
          },
        );
        return [...prev, ...additional];
      }
      return prev.slice(0, safeValue);
    });
  };

  const handleSubjectNameChange = (index: number, value: string) => {
    setSubjects((prev) =>
      prev.map((subject, i) =>
        i === index ? { ...subject, name: value } : subject,
      ),
    );
  };

  const handleSubjectSessionsChange = (index: number, value: number) => {
    const safeValue = Math.min(
      Math.max(Number.isFinite(value) ? value : 1, 1),
      10,
    );
    setSubjects((prev) =>
      prev.map((subject, i) =>
        i === index ? { ...subject, sessionsPerWeek: safeValue } : subject,
      ),
    );
  };

  const handleSubjectTypeChange = (index: number, value: ClassType) => {
    setSubjects((prev) =>
      prev.map((subject, i) =>
        i === index ? { ...subject, classType: value } : subject,
      ),
    );
  };

  const handleSubjectCategoryChange = (index: number, value: ClassCategory) => {
    setSubjects((prev) =>
      prev.map((subject, i) =>
        i === index ? { ...subject, category: value } : subject,
      ),
    );
  };

  const handleSubjectHalfChange = (index: number, value: HalfPreference) => {
    setSubjects((prev) =>
      prev.map((subject, i) =>
        i === index ? { ...subject, preferredHalf: value } : subject,
      ),
    );
  };

  const handleToggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day)
        ? prev.filter((item) => item !== day)
        : [...prev, day].sort(sortByCalendarOrder),
    );
  };

  const handleGenerate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedSubjects = formSubjects.map(normalizeSubject);
    const sanitizedSubjects = normalizedSubjects.filter(
      (subject) => subject.name.length > 0 && subject.sessionsPerWeek > 0,
    );

    if (!teacherName.trim()) {
      toast.warning("Enter the teacher's name.");
      return;
    }

    if (!sanitizedSubjects.length) {
      toast.warning("Add at least one subject with a weekly session count.");
      return;
    }

    if (!selectedDays.length) {
      toast.warning("Select at least one teaching day.");
      return;
    }

    if (periodsPerDay < 1) {
      toast.warning("Add at least one period per day.");
      return;
    }

    const totalSlots = selectedDays.length * periodsPerDay;
    const requiredSessions = calculateRequiredSessions(
      sanitizedSubjects,
      sectionCount,
    );

    if (requiredSessions > totalSlots) {
      toast.error(
        `You need ${requiredSessions} sessions but only ${totalSlots} slots are available. Add more periods or reduce weekly sessions.`,
      );
    }

    const result = generateTimetable({
      subjects: sanitizedSubjects,
      days: selectedDays,
      periodsPerDay,
      sections: sectionCount,
      sectionNames,
      teacherName: teacherName.trim(),
    });

    const updatedSubjects = subjects.map((subject, index) => {
      if (index < normalizedSubjects.length) {
        return {
          name: normalizedSubjects[index].name,
          sessionsPerWeek: Math.max(
            1,
            normalizedSubjects[index].sessionsPerWeek || 1,
          ),
          classType: normalizedSubjects[index].classType,
          category: normalizedSubjects[index].category,
          preferredHalf: normalizedSubjects[index].preferredHalf,
        } satisfies SubjectConfig;
      }
      return subject;
    });

    setSubjects(updatedSubjects);
    setTimetable(result);

    if (result.unassignedSessions > 0) {
      toast.warning(
        `Scheduled ${result.requiredSessions - result.unassignedSessions} sessions. ${result.unassignedSessions} could not be placed.`,
      );
    } else {
      toast.success("Timetable generated. You can now edit or save it.");
    }
  };

  const handleCellEdit = (
    sectionIndex: number,
    periodIndex: number,
    dayIndex: number,
    value: string,
  ) => {
    setTimetable((prev) => {
      if (!prev) return prev;
      const sections = updateSectionCell(
        prev.sections,
        sectionIndex,
        periodIndex,
        dayIndex,
        value,
      );
      // keep teacher grid unchanged here; it can be regenerated on next run
      return { ...prev, sections };
    });
  };

  const persistState = (
    result: TimetableResult | null,
    snapshot: SubjectConfig[],
  ) => {
    const sanitizedSnapshot = snapshot.map((subject) => ({
      name: subject.name.trim(),
      sessionsPerWeek: Math.max(1, subject.sessionsPerWeek || 1),
      classType: subject.classType ?? "Theory",
      category: subject.category ?? "Regular",
      preferredHalf: subject.preferredHalf ?? "First",
    }));

    const state: StoredState = {
      teacherName: teacherName.trim(),
      subjects: sanitizedSnapshot,
      selectedDays,
      periodsPerDay,
      sections: sectionCount,
      sectionNames,
      timetable: result,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  };

  const handleSave = async () => {
    if (!timetable) {
      toast.info("Generate a timetable before saving.");
      return;
    }
    try {
      setIsSaving(true);
      persistState(timetable, subjects);
      toast.success("Timetable saved locally.");
    } catch (error) {
      console.error("Saving failed", error);
      toast.error("Unable to save timetable.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!timetable || !tableRef.current) {
      toast.info("Generate a timetable before exporting.");
      return;
    }

    try {
      setIsExporting(true);
      const canvas = await html2canvas(tableRef.current, {
        scale: window.devicePixelRatio || 1.5,
        useCORS: true,
      });
      const imageData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "a4",
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 48;
      const availableWidth = pageWidth - margin * 2;
      const availableHeight = pageHeight - margin * 2;
      const aspectRatio = canvas.width / canvas.height;

      let renderWidth = availableWidth;
      let renderHeight = renderWidth / aspectRatio;

      if (renderHeight > availableHeight) {
        renderHeight = availableHeight;
        renderWidth = renderHeight * aspectRatio;
      }

      const offsetX = (pageWidth - renderWidth) / 2;
      const offsetY = (pageHeight - renderHeight) / 2;

      pdf.addImage(
        imageData,
        "PNG",
        offsetX,
        offsetY,
        renderWidth,
        renderHeight,
      );
      pdf.save(
        `teacher-timetable-${new Date().toISOString().slice(0, 10)}.pdf`,
      );
      toast.success("Timetable exported as PDF.");
    } catch (error) {
      console.error("Export failed", error);
      toast.error("Could not export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadCsv = () => {
    if (!timetable) {
      toast.info("Generate a timetable before exporting.");
      return;
    }
    const lines: string[] = [];

    const buildCsvFromGrid = (title: string, grid: string[][]) => {
      lines.push(title);
      lines.push(["Periods", ...timetable.days].join(","));
      for (let p = 0; p < grid.length; p += 1) {
        const row = [getPeriodLabel(p), ...grid[p]];
        lines.push(
          row.map((v) => `"${(v || "").replace(/"/g, '""')}"`).join(","),
        );
      }
      lines.push("");
    };

    buildCsvFromGrid(
      `${timetable.teacherName || "Teacher"} Timetable`,
      timetable.teacherGrid,
    );

    timetable.sections.forEach((section) => {
      buildCsvFromGrid(section.name, section.grid);
    });

    const blob = new Blob([lines.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `timetable-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Timetable exported as CSV.");
  };

  const handleReset = () => {
    const defaultCount = 5;
    setTeacherName("");
    setSubjectCount(defaultCount);
    setSubjects(defaultSubjectTemplates.slice(0, defaultCount));
    setSelectedDays(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
    setPeriodsPerDay(6);
    setSectionCount(3);
    setSectionNames(["Section A", "Section B", "Section C"]);
    setTimetable(null);
    localStorage.removeItem(STORAGE_KEY);
    toast("Form reset", {
      description: "Default teaching values restored.",
    });
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold md:text-4xl">
            timetable generator
          </h1>
          <p className="max-w-2xl text-sm text-foreground/70 md:text-base">
            Capture the subjects you teach, weekly contact hours, and number of
            sections. Generate a conflict-free plan that keeps every class on a
            unique slot while protecting your prep time.
          </p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="soft-button bg-white/80 text-foreground/75 shadow-card transition hover:bg-white"
        >
          <RefreshCcw className="mr-2 size-4" /> Reset form
        </button>
      </div>

      <form
        onSubmit={handleGenerate}
        className="glass-panel space-y-10 bg-white/85 p-8 shadow-glow"
      >
        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-foreground/80">
                Teacher's name
              </label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                placeholder="e.g., Dr. Ananya Singh"
                className="h-12 rounded-2xl border border-border bg-white/80 px-4 text-sm text-foreground outline-none transition focus:border-primary/70"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-foreground/80">
                Number of subjects
              </label>
              <input
                type="number"
                min={1}
                max={16}
                value={subjectCount}
                onChange={(event) =>
                  handleSubjectCountChange(Number(event.target.value))
                }
                className="h-12 rounded-2xl border border-border bg-white/80 px-4 text-sm text-foreground outline-none transition focus:border-primary/70"
              />
              <p className="text-xs text-foreground/50">
                Add every subject you teach and specify how many times each
                section meets per week.
              </p>
            </div>

            <SubjectInputs
              subjects={formSubjects}
              onNameChange={handleSubjectNameChange}
              onSessionChange={handleSubjectSessionsChange}
              onTypeChange={handleSubjectTypeChange}
              onCategoryChange={handleSubjectCategoryChange}
              onHalfChange={handleSubjectHalfChange}
            />
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground/80">
                Number of sections
              </label>
              <input
                type="number"
                min={1}
                max={12}
                value={sectionCount}
                onChange={(event) =>
                  setSectionCount(
                    Math.min(Math.max(Number(event.target.value) || 1, 1), 12),
                  )
                }
                className="h-12 rounded-2xl border border-border bg-white/80 px-4 text-sm text-foreground outline-none transition focus:border-primary/70"
              />
              <p className="text-xs text-foreground/50">
                Provide section names below (e.g., Section A, Section B). Labs
                consume consecutive slots automatically.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground/80">
                Section names
              </label>
              <div className="grid grid-cols-2 gap-2">
                {sectionNames.slice(0, sectionCount).map((name, idx) => (
                  <input
                    key={`section-${idx}`}
                    type="text"
                    value={name}
                    onChange={(e) =>
                      setSectionNames((prev) =>
                        prev.map((n, i) => (i === idx ? e.target.value : n)),
                      )
                    }
                    className="h-10 rounded-xl border border-border bg-white/80 px-3 text-sm text-foreground outline-none transition focus:border-primary/70"
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground/80">
                Days of the week (selectable checkboxes)
              </label>
              <DaySelector
                selectedDays={selectedDays}
                onToggle={handleToggleDay}
              />
              <div className="flex flex-wrap gap-2 text-xs text-foreground/50">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedDays(dayOptions.slice(0, 5).map((d) => d.value))
                  }
                  className="underline-offset-4 transition hover:text-primary"
                >
                  Weekdays
                </button>
                <span className="hidden h-3 w-px bg-foreground/20 sm:block" />
                <button
                  type="button"
                  onClick={() =>
                    setSelectedDays(dayOptions.slice(0, 7).map((d) => d.value))
                  }
                  className="underline-offset-4 transition hover:text-primary"
                >
                  Full week
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground/80">
                Number of periods per day
              </label>
              <input
                type="number"
                min={1}
                max={12}
                value={periodsPerDay}
                onChange={(event) =>
                  setPeriodsPerDay(
                    Math.min(Math.max(Number(event.target.value) || 1, 1), 12),
                  )
                }
                className="h-12 rounded-2xl border border-border bg-white/80 px-4 text-sm text-foreground outline-none transition focus:border-primary/70"
              />
              <p className="text-xs text-foreground/50">
                First half maps to the first half of periods; second half to the
                latter. Remedials use free slots by default.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-foreground/60">
            Tip: Hover any cell to edit rooms, co-teachers, or lesson notes
            after scheduling.
          </p>
          <button
            type="submit"
            className="soft-button-primary inline-flex items-center"
          >
            <CalendarPlus className="mr-2 size-4" /> Generate timetable
          </button>
        </div>
      </form>

      <div className="flex flex-col gap-4 rounded-[2.5rem] border border-white/40 bg-white/80 p-6 shadow-card xl:flex-row xl:items-center xl:justify-between">
        <div className="space-y-1">
          <p className="text-lg font-semibold text-foreground">
            Output controls
          </p>
          <p className="text-sm text-foreground/65">
            Save a draft or export to share with leadership teams and faculty.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="soft-button-secondary inline-flex items-center disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Save className="mr-2 size-4" />{" "}
            {isSaving ? "Saving..." : "Save timetable"}
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="soft-button-primary inline-flex items-center disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Download className="mr-2 size-4" />{" "}
            {isExporting ? "Exporting..." : "Download as PDF"}
          </button>
          <button
            type="button"
            onClick={handleDownloadCsv}
            className="soft-button bg-white/80 text-foreground/75"
          >
            <Download className="mr-2 size-4" /> Download as Excel (CSV)
          </button>
        </div>
      </div>

      <div className="rounded-[2.5rem] border border-white/40 bg-white/80 p-6 shadow-card">
        <div className="mb-4 flex items-center gap-3 text-sm text-foreground/70">
          <Users2 className="size-4 text-primary" />
          <span>
            Generated timetables stagger sessions across sections so the same
            teacher is never scheduled in two rooms at once.
          </span>
        </div>
        <TimetablePreview
          timetable={timetable}
          onCellEdit={handleCellEdit}
          tableRef={tableRef}
        />
      </div>
    </div>
  );
}
