import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { Task } from "@/lib/smarttask-domain-task-model-and-types";
import { normalizeTasksFromStorage } from "@/lib/smarttask-migrate-normalize-task-from-storage";
import type { SmarttaskAppSettingsV1 } from "@/lib/smarttask-app-settings-v1-model-and-defaults";

const DB_NAME = "smarttask-offline-db-v1";
const DB_VERSION = 1;
const STORE = "keyval";
const TASKS_KEY = "tasks";
const APP_SETTINGS_KEY = "app_settings_v1";

interface SmartTaskDB extends DBSchema {
  keyval: {
    key: string;
    value: Task[] | SmarttaskAppSettingsV1;
  };
}

let dbPromise: Promise<IDBPDatabase<SmartTaskDB>> | null = null;

function getDb(): Promise<IDBPDatabase<SmartTaskDB>> {
  if (!dbPromise) {
    dbPromise = openDB<SmartTaskDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          db.createObjectStore(STORE);
        }
      },
    });
  }
  return dbPromise;
}

export async function loadTasksFromIndexedDb(): Promise<Task[] | undefined> {
  if (typeof indexedDB === "undefined") return undefined;
  try {
    const db = await getDb();
    const raw = await db.get(STORE, TASKS_KEY);
    if (!raw || !Array.isArray(raw)) return [];
    return normalizeTasksFromStorage(raw);
  } catch {
    return undefined;
  }
}

export async function saveTasksToIndexedDb(tasks: Task[]): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const db = await getDb();
  await db.put(STORE, tasks, TASKS_KEY);
}

export async function loadAppSettingsFromIndexedDb(): Promise<
  SmarttaskAppSettingsV1 | undefined
> {
  if (typeof indexedDB === "undefined") return undefined;
  try {
    const db = await getDb();
    const raw = await db.get(STORE, APP_SETTINGS_KEY);
    if (!raw || typeof raw !== "object") return undefined;
    return raw as SmarttaskAppSettingsV1;
  } catch {
    return undefined;
  }
}

export async function saveAppSettingsToIndexedDb(
  settings: SmarttaskAppSettingsV1
): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const db = await getDb();
  await db.put(STORE, settings, APP_SETTINGS_KEY);
}
