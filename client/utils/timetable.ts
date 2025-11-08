export type ClassType = "Theory" | "Lab";
export type ClassCategory = "Regular" | "Remedial";
export type HalfPreference = "First" | "Second";

export interface SubjectConfig {
  name: string;
  sessionsPerWeek: number;
  classType?: ClassType;
  category?: ClassCategory;
  preferredHalf?: HalfPreference;
}

export interface TimetableConfig {
  subjects: SubjectConfig[];
  days: string[];
  periodsPerDay: number;
  sections: number;
  sectionNames?: string[];
  teacherName?: string;
}

export interface TimetableSection {
  name: string;
  grid: string[][]; // [periodIndex][dayIndex]
}

export interface TimetableResult {
  sections: TimetableSection[];
  days: string[];
  subjects: SubjectConfig[];
  teacherGrid: string[][]; // [periodIndex][dayIndex]
  unassignedSessions: number;
  totalSlots: number;
  requiredSessions: number;
  periodLabels: string[];
  sectionNames: string[];
  teacherName?: string;
}

const PERIOD_LABELS = [
  "Period 1",
  "Period 2",
  "Period 3",
  "Period 4",
  "Period 5",
  "Period 6",
  "Period 7",
  "Period 8",
  "Period 9",
  "Period 10",
  "Period 11",
  "Period 12",
];

export function getPeriodLabel(index: number) {
  if (index < PERIOD_LABELS.length) {
    return PERIOD_LABELS[index];
  }

  return `Period ${index + 1}`;
}

function createSectionName(index: number): string {
  const alphabetIndex = index % 26;
  const cycle = Math.floor(index / 26);
  const base = String.fromCharCode(65 + alphabetIndex);
  return cycle === 0 ? `Section ${base}` : `Section ${base}${cycle + 1}`;
}

function createEmptyGrid(periods: number, days: number): string[][] {
  return Array.from({ length: periods }, () => Array(days).fill(""));
}

function createSlotTracker(days: number, periods: number): boolean[][] {
  return Array.from({ length: periods }, () => Array(days).fill(false));
}

interface Slot {
  dayIndex: number;
  periodIndex: number;
  slotIndex: number;
  half: HalfPreference;
}

function splitHalves(periodCount: number) {
  const mid = Math.ceil(periodCount / 2);
  const first = new Set<number>();
  const second = new Set<number>();
  for (let p = 0; p < periodCount; p += 1) {
    if (p < mid) first.add(p);
    else second.add(p);
  }
  return { first, second };
}

function generateSlots(dayCount: number, periodCount: number): Slot[] {
  const { first, second } = splitHalves(periodCount);
  const slots: Slot[] = [];
  for (let periodIndex = 0; periodIndex < periodCount; periodIndex += 1) {
    for (let dayIndex = 0; dayIndex < dayCount; dayIndex += 1) {
      const half: HalfPreference = first.has(periodIndex) ? "First" : "Second";
      slots.push({ dayIndex, periodIndex, slotIndex: slots.length, half });
    }
  }
  return slots;
}

function findNextAvailableSingle(
  slots: Slot[],
  teacherTracker: boolean[][],
  sectionGrid: string[][],
  cursor: number,
  preferredHalf?: HalfPreference,
): Slot | null {
  const total = slots.length;
  for (let iter = 0; iter < total; iter += 1) {
    const idx = (cursor + iter) % total;
    const s = slots[idx];
    if (preferredHalf && s.half !== preferredHalf) continue;
    if (!teacherTracker[s.periodIndex][s.dayIndex] && !sectionGrid[s.periodIndex][s.dayIndex]) {
      return { ...s, slotIndex: idx };
    }
  }
  return null;
}

function findNextAvailableDouble(
  slots: Slot[],
  teacherTracker: boolean[][],
  sectionGrid: string[][],
  cursor: number,
  preferredHalf?: HalfPreference,
): { first: Slot; second: Slot } | null {
  const total = slots.length;
  for (let iter = 0; iter < total; iter += 1) {
    const idx = (cursor + iter) % total;
    const s = slots[idx];
    if (preferredHalf && s.half !== preferredHalf) continue;
    const nextPeriod = s.periodIndex + 1;
    if (nextPeriod >= teacherTracker.length) continue;
    // Must be on same day and consecutive periods
    const secondIdx = slots.findIndex(
      (sl) => sl.dayIndex === s.dayIndex && sl.periodIndex === nextPeriod,
    );
    if (secondIdx === -1) continue;
    const s2 = slots[secondIdx];
    if (preferredHalf && s2.half !== preferredHalf) continue;
    if (
      !teacherTracker[s.periodIndex][s.dayIndex] &&
      !teacherTracker[s2.periodIndex][s2.dayIndex] &&
      !sectionGrid[s.periodIndex][s.dayIndex] &&
      !sectionGrid[s2.periodIndex][s2.dayIndex]
    ) {
      return { first: { ...s, slotIndex: idx }, second: s2 };
    }
  }
  return null;
}

export function calculateRequiredSessions(
  subjects: SubjectConfig[],
  sections: number,
): number {
  return subjects.reduce((total, subject) => total + subject.sessionsPerWeek * sections, 0);
}

function normalizeSubjects(subjects: SubjectConfig[]): Required<SubjectConfig>[] {
  return subjects.map((s) => ({
    name: s.name.trim(),
    sessionsPerWeek: Math.max(0, Math.round(s.sessionsPerWeek || 0)),
    classType: s.classType ?? "Theory",
    category: s.category ?? "Regular",
    preferredHalf: s.preferredHalf ?? "First",
  }));
}

export function generateTimetable(config: TimetableConfig): TimetableResult {
  const normalized = normalizeSubjects(config.subjects).filter((s) => s.name && s.sessionsPerWeek > 0);
  const days = [...config.days];
  const periods = Math.max(0, config.periodsPerDay);
  const sectionsCount = Math.max(1, config.sections);

  const sectionNames = (config.sectionNames && config.sectionNames.length === sectionsCount
    ? config.sectionNames
    : Array.from({ length: sectionsCount }, (_, i) => createSectionName(i))
  ).map((n) => n.trim() || "Section");

  if (!normalized.length || !days.length || periods === 0) {
    return {
      sections: [],
      days,
      subjects: normalized,
      teacherGrid: [],
      unassignedSessions: 0,
      totalSlots: days.length * periods,
      requiredSessions: 0,
      periodLabels: Array.from({ length: periods }, (_, i) => getPeriodLabel(i)),
      sectionNames,
      teacherName: config.teacherName,
    };
  }

  const totalSlots = days.length * periods;
  const requiredSessions = calculateRequiredSessions(normalized, sectionsCount);

  const slots = generateSlots(days.length, periods);
  const sectionGrids = sectionNames.map(() => createEmptyGrid(periods, days.length));
  const teacherTracker = createSlotTracker(days.length, periods);

  let unassigned = 0;
  let cursor = 0;

  // Order: Regular Labs -> Regular Theory -> Remedial Labs -> Remedial Theory
  const buckets = [
    normalized.filter((s) => s.category === "Regular" && s.classType === "Lab"),
    normalized.filter((s) => s.category === "Regular" && s.classType === "Theory"),
    normalized.filter((s) => s.category === "Remedial" && s.classType === "Lab"),
    normalized.filter((s) => s.category === "Remedial" && s.classType === "Theory"),
  ];

  for (const list of buckets) {
    for (const subject of list) {
      for (let sectionIndex = 0; sectionIndex < sectionsCount; sectionIndex += 1) {
        for (let session = 0; session < subject.sessionsPerWeek; session += 1) {
          const grid = sectionGrids[sectionIndex];
          let placed = false;

          if (subject.classType === "Lab") {
            // Try preferred half first
            const preferred = findNextAvailableDouble(slots, teacherTracker, grid, cursor, subject.preferredHalf);
            const anyHalf = preferred ?? findNextAvailableDouble(slots, teacherTracker, grid, cursor, undefined);
            if (anyHalf) {
              const { first, second } = anyHalf;
              grid[first.periodIndex][first.dayIndex] = subject.name;
              grid[second.periodIndex][second.dayIndex] = subject.name;
              teacherTracker[first.periodIndex][first.dayIndex] = true;
              teacherTracker[second.periodIndex][second.dayIndex] = true;
              cursor = (second.slotIndex + 1) % slots.length;
              placed = true;
            }
          } else {
            const preferred = findNextAvailableSingle(slots, teacherTracker, grid, cursor, subject.preferredHalf);
            const anyHalf = preferred ?? findNextAvailableSingle(slots, teacherTracker, grid, cursor, undefined);
            if (anyHalf) {
              grid[anyHalf.periodIndex][anyHalf.dayIndex] = subject.name;
              teacherTracker[anyHalf.periodIndex][anyHalf.dayIndex] = true;
              cursor = (anyHalf.slotIndex + 1) % slots.length;
              placed = true;
            }
          }

          if (!placed) {
            unassigned += 1;
          }
        }
      }
    }
  }

  // Build teacher grid from section grids (union); thanks to teacherTracker, at most one placement per slot
  const teacherGrid = createEmptyGrid(periods, days.length);
  for (let p = 0; p < periods; p += 1) {
    for (let d = 0; d < days.length; d += 1) {
      // find the first non-empty cell and annotate section
      for (let s = 0; s < sectionsCount; s += 1) {
        const val = sectionGrids[s][p][d];
        if (val) {
          teacherGrid[p][d] = `${val} (${sectionNames[s]})`;
          break;
        }
      }
    }
  }

  return {
    sections: sectionNames.map((name, index) => ({ name, grid: sectionGrids[index] })),
    days,
    subjects: normalized,
    teacherGrid,
    unassignedSessions: unassigned,
    totalSlots,
    requiredSessions,
    periodLabels: Array.from({ length: periods }, (_, i) => getPeriodLabel(i)),
    sectionNames,
    teacherName: config.teacherName,
  };
}

export function updateSectionCell(
  sections: TimetableSection[],
  sectionIndex: number,
  periodIndex: number,
  dayIndex: number,
  value: string,
): TimetableSection[] {
  return sections.map((section, currentIndex) => {
    if (currentIndex !== sectionIndex) {
      return section;
    }
    const updatedGrid = section.grid.map((row, rowIndex) =>
      rowIndex === periodIndex
        ? row.map((cell, cellIndex) => (cellIndex === dayIndex ? value : cell))
        : row,
    );
    return {
      ...section,
      grid: updatedGrid,
    };
  });
}
