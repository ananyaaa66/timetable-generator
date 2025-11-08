import { RequestHandler } from "express";

interface SaveBody {
  id?: string;
  teacherName?: string;
  payload: unknown;
}

const store = new Map<string, SaveBody>();

function genId() {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${Date.now().toString(36)}-${rand}`;
}

export const createTimetable: RequestHandler = (req, res) => {
  const body = req.body as SaveBody;
  if (!body || typeof body !== "object" || !("payload" in body)) {
    res.status(400).json({ error: "Invalid payload" });
    return;
  }
  const id = body.id && typeof body.id === "string" ? body.id : genId();
  const record: SaveBody = {
    id,
    teacherName: body.teacherName,
    payload: body.payload,
  };
  store.set(id, record);
  res.status(201).json({ id });
};

export const getTimetable: RequestHandler = (req, res) => {
  const { id } = req.params;
  if (!id || !store.has(id)) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.status(200).json(store.get(id));
};

export const listTimetables: RequestHandler = (_req, res) => {
  const items = Array.from(store.values()).map((r) => ({
    id: r.id,
    teacherName: r.teacherName,
  }));
  res.status(200).json({ items });
};
