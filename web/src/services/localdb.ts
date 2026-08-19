/**
 * Minimal IndexedDB wrapper for device-local identification records.
 *
 * Why IndexedDB rather than localStorage: records carry the animal photograph.
 * localStorage is synchronous, capped around 5 MB, and stores strings only, so
 * images would have to be base64-encoded — roughly a third larger, on the main
 * thread. IndexedDB stores Blobs natively and asynchronously.
 *
 * This is also the storage layer Phase 13 (offline capture and sync) needs, so
 * it is built once here rather than retrofitted later. Every record carries a
 * `syncState` from the start.
 */

import type { GeoLocation, Prediction } from "@/types";

const DB_NAME = "breedvision";
const DB_VERSION = 1;
const STORE = "records";

/** How a record stands with respect to a backend that does not exist yet. */
export type SyncState = "local-only" | "pending" | "synced";

export interface StoredRecord {
  id: string;
  createdAt: string;
  prediction: Prediction;
  location: GeoLocation | null;
  note: string | null;
  image: Blob;
  imageWidth: number;
  imageHeight: number;
  syncState: SyncState;
}

function isAvailable(): boolean {
  return typeof indexedDB !== "undefined";
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        // History is shown newest first, so index the sort key.
        store.createIndex("createdAt", "createdAt");
        store.createIndex("syncState", "syncState");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("indexedDB open failed"));
  });
}

function tx<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(STORE, mode);
        const req = run(transaction.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error ?? new Error("indexedDB request failed"));
        transaction.oncomplete = () => db.close();
      }),
  );
}

export async function putRecord(record: StoredRecord): Promise<void> {
  if (!isAvailable()) throw new Error("storage unavailable");
  await tx("readwrite", (s) => s.put(record) as IDBRequest<IDBValidKey>);
}

export async function getAllRecords(): Promise<StoredRecord[]> {
  if (!isAvailable()) return [];
  const all = await tx<StoredRecord[]>("readonly", (s) => s.getAll());
  // Newest first.
  return all.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function getRecordById(
  id: string,
): Promise<StoredRecord | undefined> {
  if (!isAvailable()) return undefined;
  return tx<StoredRecord | undefined>("readonly", (s) => s.get(id));
}

export async function deleteRecordById(id: string): Promise<void> {
  if (!isAvailable()) return;
  await tx("readwrite", (s) => s.delete(id) as unknown as IDBRequest<undefined>);
}

export async function countRecords(): Promise<number> {
  if (!isAvailable()) return 0;
  return tx<number>("readonly", (s) => s.count());
}
