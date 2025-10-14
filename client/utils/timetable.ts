export interface TimetableConfig {
  subjects: string[];
  days: string[];
  periodsPerDay: number;
}

export interface TimetableResult {
  grid: string[][];
  days: string[];
  subjects: string[];
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
];

export function getPeriodLabel(index: number) {
  if (index < PERIOD_LABELS.length) {
    return PERIOD_LABELS[index];
  }

  return `Period ${index + 1}`;
}

export function generateTimetable(config: TimetableConfig): TimetableResult {
  const subjects = config.subjects.map((subject) => subject.trim()).filter(Boolean);
  const days = config.days;
  const periods = Math.max(0, config.periodsPerDay);

  if (!subjects.length || !days.length || periods === 0) {
    return {
      grid: [],
      days,
      subjects,
    };
  }

  const grid: string[][] = Array.from({ length: periods }, () => Array(days.length).fill(""));
  let cursor = 0;

  for (let periodIndex = 0; periodIndex < periods; periodIndex += 1) {
    for (let dayIndex = 0; dayIndex < days.length; dayIndex += 1) {
      const subject = subjects[(cursor + dayIndex) % subjects.length];
      grid[periodIndex][dayIndex] = subject;
    }
    cursor = (cursor + 1) % subjects.length;
  }

  return { grid, days, subjects };
}

export function updateGridCell(
  grid: string[][],
  periodIndex: number,
  dayIndex: number,
  value: string,
): string[][] {
  return grid.map((row, rowIndex) =>
    rowIndex === periodIndex
      ? row.map((cell, cellIndex) => (cellIndex === dayIndex ? value : cell))
      : row,
  );
}
