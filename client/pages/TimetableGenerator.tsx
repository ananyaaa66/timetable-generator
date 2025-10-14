import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { CalendarPlus, Download, RefreshCcw, Save } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  generateTimetable,
  getPeriodLabel,
  updateGridCell,
  type TimetableResult,
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

const STORAGE_KEY = "timetable-generator-state-v1";

interface StoredState {
  subjects: string[];
  selectedDays: string[];
  periodsPerDay: number;
  timetable: TimetableResult | null;
}

const defaultSubjectNames = [
  "Mathematics",
  "Science",
  "History",
  "Language Arts",
  "Computer Studies",
  "Physical Education",
];

function SubjectInputs({
  subjects,
  onChange,
}: {
  subjects: string[];
  onChange: (index: number, value: string) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {subjects.map((subject, index) => (
        <label
          key={`subject-${index}`}
          className="flex flex-col gap-1 rounded-2xl border border-border bg-white/70 p-4 shadow-sm transition focus-within:border-primary/60 focus-within:shadow-glow"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/45">
            Subject {index + 1}
          </span>
          <input
            value={subject}
            onChange={(event) => onChange(index, event.target.value)}
            placeholder={defaultSubjectNames[index] ?? "Add subject name"}
            className="h-10 rounded-xl border border-border bg-white/80 px-3 text-sm text-foreground outline-none transition placeholder:text-foreground/40 focus:border-primary/70"
          />
        </label>
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

function TimetablePreview({
  timetable,
  onCellEdit,
  tableRef,
}: {
  timetable: TimetableResult | null;
  onCellEdit: (periodIndex: number, dayIndex: number, value: string) => void;
  tableRef: React.RefObject<HTMLDivElement>;
}) {
  if (!timetable || timetable.grid.length === 0) {
    return (
      <div className="glass-panel flex flex-col items-center justify-center gap-3 p-10 text-center text-foreground/60">
        <CalendarPlus className="size-10 text-primary" />
        <p className="font-semibold">Your timetable will appear here after generation.</p>
        <p className="max-w-sm text-sm text-foreground/55">
          Configure the form above, then select “Generate timetable” to populate your weekly plan.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={tableRef}
      className="glass-panel overflow-hidden border border-white/50 bg-white/85 p-6 shadow-glow"
    >
      <div className="overflow-x-auto">
        <table className="min-w-full table-fixed border-separate border-spacing-0 text-sm">
          <thead>
            <tr>
              <th className="sticky left-0 z-10 rounded-tl-2xl bg-primary/10 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Periods
              </th>
              {timetable.days.map((day) => (
                <th
                  key={day}
                  className="rounded-tr-2xl bg-primary/10 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] text-primary"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timetable.grid.map((row, periodIndex) => (
              <tr key={`period-${periodIndex}`}>
                <td className="sticky left-0 z-10 border-y border-l border-white/60 bg-white/80 px-4 py-3 font-semibold text-foreground/90">
                  {getPeriodLabel(periodIndex)}
                </td>
                {row.map((cell, dayIndex) => (
                  <td
                    key={`cell-${periodIndex}-${dayIndex}`}
                    className="border border-white/60 bg-white/70 px-3 py-3 align-top transition hover:bg-highlight/60"
                  >
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(event) =>
                        onCellEdit(periodIndex, dayIndex, event.currentTarget.textContent?.trim() ?? "")
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
  );
}

export default function TimetableGenerator() {
  const [subjectCount, setSubjectCount] = useState(5);
  const [subjects, setSubjects] = useState<string[]>(() => defaultSubjectNames.slice(0, 5));
  const [selectedDays, setSelectedDays] = useState<string[]>([
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ]);
  const [periodsPerDay, setPeriodsPerDay] = useState(6);
  const [timetable, setTimetable] = useState<TimetableResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const tableRef = useRef<HTMLDivElement>(null);

  const formSubjects = useMemo(() => subjects.slice(0, subjectCount), [subjectCount, subjects]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const parsed: StoredState = JSON.parse(stored);
      if (parsed.subjects?.length) {
        setSubjects(parsed.subjects);
        setSubjectCount(parsed.subjects.length);
      }
      if (parsed.selectedDays?.length) {
        setSelectedDays(parsed.selectedDays);
      }
      if (parsed.periodsPerDay) {
        setPeriodsPerDay(parsed.periodsPerDay);
      }
      if (parsed.timetable?.grid?.length) {
        setTimetable(parsed.timetable);
      }
    } catch (error) {
      console.error("Failed to parse saved timetable", error);
    }
  }, []);

  const handleSubjectCountChange = (value: number) => {
    const safeValue = Math.min(Math.max(value, 1), 12);
    setSubjectCount(safeValue);
    setSubjects((prev) => {
      if (safeValue > prev.length) {
        return [...prev, ...Array.from({ length: safeValue - prev.length }, () => "")];
      }
      return prev.slice(0, safeValue);
    });
  };

  const handleSubjectChange = (index: number, value: string) => {
    setSubjects((prev) => prev.map((subject, i) => (i === index ? value : subject)));
  };

  const handleToggleDay = (day: string) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((item) => item !== day) : [...prev, day].sort(sortByCalendarOrder),
    );
  };

  const sortByCalendarOrder = (a: string, b: string) =>
    dayOptions.findIndex((option) => option.value === a) -
    dayOptions.findIndex((option) => option.value === b);

  const handleGenerate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const sanitizedSubjects = formSubjects.map((subject) => subject.trim()).filter(Boolean);
    if (!sanitizedSubjects.length) {
      toast.warning("Please add at least one subject name before generating.");
      return;
    }

    if (!selectedDays.length) {
      toast.warning("Select at least one day of the week.");
      return;
    }

    if (periodsPerDay < 1) {
      toast.warning("Add at least one period per day.");
      return;
    }

    const result = generateTimetable({
      subjects: sanitizedSubjects,
      days: selectedDays,
      periodsPerDay,
    });
    setTimetable(result);
    toast.success("Timetable generated. You can now edit or save it.");
  };

  const handleCellEdit = (periodIndex: number, dayIndex: number, value: string) => {
    setTimetable((prev) => {
      if (!prev) return prev;
      const updatedGrid = updateGridCell(prev.grid, periodIndex, dayIndex, value);
      return { ...prev, grid: updatedGrid };
    });
  };

  const persistState = (result: TimetableResult | null) => {
    const state: StoredState = {
      subjects,
      selectedDays,
      periodsPerDay,
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
      persistState(timetable);
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
      const canvas = await html2canvas(tableRef.current, { scale: window.devicePixelRatio || 1.5, useCORS: true });
      const imageData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
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

      pdf.addImage(imageData, "PNG", offsetX, offsetY, renderWidth, renderHeight);
      pdf.save(`timetable-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success("Timetable exported as PDF.");
    } catch (error) {
      console.error("Export failed", error);
      toast.error("Could not export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleReset = () => {
    setSubjects(defaultSubjectNames.slice(0, subjectCount));
    setSelectedDays(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
    setPeriodsPerDay(6);
    setTimetable(null);
    localStorage.removeItem(STORAGE_KEY);
    toast("Form reset", {
      description: "Default values restored.",
    });
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold md:text-4xl">Timetable Generator</h1>
          <p className="max-w-2xl text-sm text-foreground/70 md:text-base">
            Provide your subjects, select the study days, and choose how many periods you need. Generate a
            structured schedule in a single click, customise it inline, then save or export when you are ready.
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
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-foreground/80">Number of subjects</label>
              <input
                type="number"
                min={1}
                max={12}
                value={subjectCount}
                onChange={(event) => handleSubjectCountChange(Number(event.target.value))}
                className="h-12 rounded-2xl border border-border bg-white/80 px-4 text-sm text-foreground outline-none transition focus:border-primary/70"
              />
              <p className="text-xs text-foreground/50">You can add up to 12 subjects. Personalise each name below.</p>
            </div>
            <SubjectInputs subjects={formSubjects} onChange={handleSubjectChange} />
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground/80">Days of the week (selectable checkboxes)</label>
              <DaySelector selectedDays={selectedDays} onToggle={handleToggleDay} />
              <div className="flex flex-wrap gap-2 text-xs text-foreground/50">
                <button
                  type="button"
                  onClick={() => setSelectedDays(dayOptions.slice(0, 5).map((day) => day.value))}
                  className="underline-offset-4 transition hover:text-primary"
                >
                  Weekdays
                </button>
                <span className="hidden h-3 w-px bg-foreground/20 sm:block" />
                <button
                  type="button"
                  onClick={() =>
                    setSelectedDays(dayOptions.slice(0, 7).map((day) => day.value))
                  }
                  className="underline-offset-4 transition hover:text-primary"
                >
                  Full week
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground/80">Number of periods per day</label>
              <input
                type="number"
                min={1}
                max={12}
                value={periodsPerDay}
                onChange={(event) => setPeriodsPerDay(Number(event.target.value))}
                className="h-12 rounded-2xl border border-border bg-white/80 px-4 text-sm text-foreground outline-none transition focus:border-primary/70"
              />
              <p className="text-xs text-foreground/50">
                Set how many learning sessions take place each day. You can still edit individual cells later.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-foreground/60">
            Tip: Hover over any generated cell to reveal editable fields, perfect for adding room numbers or notes.
          </p>
          <button type="submit" className="soft-button-primary inline-flex items-center">
            <CalendarPlus className="mr-2 size-4" /> Generate timetable
          </button>
        </div>
      </form>

      <div className="flex flex-col gap-4 rounded-[2.5rem] border border-white/40 bg-white/80 p-6 shadow-card lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <p className="text-lg font-semibold text-foreground">Output controls</p>
          <p className="text-sm text-foreground/65">
            Save a draft to your browser or export a polished PDF to share with classmates or team members.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="soft-button-secondary inline-flex items-center disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Save className="mr-2 size-4" /> {isSaving ? "Saving..." : "Save timetable"}
          </button>
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="soft-button-primary inline-flex items-center disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Download className="mr-2 size-4" /> {isExporting ? "Exporting..." : "Download as PDF"}
          </button>
        </div>
      </div>

      <TimetablePreview timetable={timetable} onCellEdit={handleCellEdit} tableRef={tableRef} />
    </div>
  );
}
