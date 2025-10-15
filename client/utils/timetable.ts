export interface SubjectConfig {
  name: string;
  sessionsPerWeek: number;
}

export interface TimetableConfig {
  subjects: SubjectConfig[];
  days: string[];
  periodsPerDay: number;
  sections: number;
}

export interface TimetableSection {
  name: string;
  grid: string[][];
}

export interface TimetableResult {
  sections: TimetableSection[];
  days: string[];
  subjects: SubjectConfig[];
  unassignedSessions: number;
  totalSlots: number;
  requiredSessions: number;
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

export function generateTimetable(config: TimetableConfig): TimetableResult {
  const subjects = config.subjects.map((subject) => ({
    name: subject.name.trim(),
    sessionsPerWeek: Math.max(0, subject.sessionsPerWeek),
  }));
  const days = config.days;
  const periods = Math.max(0, config.periodsPerDay);
  const sectionsCount = Math.max(1, config.sections);

  if (!subjects.length || !days.length || periods === 0) {
    return {
      sections: [],
      days,
      subjects,
      unassignedSessions: 0,
      totalSlots: days.length * periods,
      requiredSessions: 0,
    };
  }

  const totalSlots = days.length * periods;
  const requiredSessions = subjects.reduce(
    (total, subject) => total + subject.sessionsPerWeek * sectionsCount,
    0,
  );

  const slots = generateSlots(days.length, periods);
  const sectionNames = Array.from({ length: sectionsCount }, (_, index) => createSectionName(index));
  const sectionGrids = sectionNames.map(() => createEmptyGrid(periods, days.length));
  const slotTracker = createSlotTracker(days.length, periods);

  let unassigned = 0;
  let cursor = 0;

  subjects.forEach((subject) => {
    for (let sectionIndex = 0; sectionIndex < sectionsCount; sectionIndex += 1) {
      for (let session = 0; session < subject.sessionsPerWeek; session += 1) {
        const slot = findNextAvailableSlot(slots, slotTracker, cursor);
        if (!slot) {
          unassigned += 1;
          continue;
        }

        sectionGrids[sectionIndex][slot.periodIndex][slot.dayIndex] = subject.name;
        slotTracker[slot.periodIndex][slot.dayIndex] = true;
        cursor = (slot.slotIndex + 1) % slots.length;
      }
    }
  });

  return {
    sections: sectionNames.map((name, index) => ({
      name,
      grid: sectionGrids[index],
    })),
    days,
    subjects,
    unassignedSessions: unassigned,
    totalSlots,
    requiredSessions,
  };
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
}

function generateSlots(dayCount: number, periodCount: number): Slot[] {
  const slots: Slot[] = [];
  for (let periodIndex = 0; periodIndex < periodCount; periodIndex += 1) {
    for (let dayIndex = 0; dayIndex < dayCount; dayIndex += 1) {
      slots.push({ dayIndex, periodIndex, slotIndex: slots.length });
    }
  }
  return slots;
}

function findNextAvailableSlot(slots: Slot[], tracker: boolean[][], cursor: number): Slot | null {
  const totalSlots = slots.length;
  for (let iteration = 0; iteration < totalSlots; iteration += 1) {
    const index = (cursor + iteration) % totalSlots;
    const slot = slots[index];
    if (!tracker[slot.periodIndex][slot.dayIndex]) {
      return { ...slot, slotIndex: index };
    }
  }
  return null;
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

export function calculateRequiredSessions(subjects: SubjectConfig[], sections: number): number {
  return subjects.reduce((total, subject) => total + subject.sessionsPerWeek * sections, 0);
}
