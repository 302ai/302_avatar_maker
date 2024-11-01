import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface IAiAvatarMaker {
  id?: number;
  url: string;
  created_at: string;
}

const DB_NAME = 'ai-avatar-maker-database';
const STORE_NAME = 'ai-avatar-maker-store';

// Number of entries per page
const PAGE_SIZE = 30;

interface MyDB extends DBSchema {
  [STORE_NAME]: {
    key: number;
    value: IAiAvatarMaker
  };
}

export async function initDB(): Promise<IDBPDatabase<MyDB>> {
  const db = await openDB<MyDB>(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
  return db;
}

export async function addData(data: IAiAvatarMaker): Promise<IAiAvatarMaker> {
  delete data.id;
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const id = await store.add(data);
  await tx.done;

  return { ...data, id };
}

export async function getData(quantity: number = PAGE_SIZE): Promise<IAiAvatarMaker[]> {
  const db = await initDB();
  const store = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME);
  const allRecords = await store.getAll();
  //@ts-ignore
  allRecords.sort((a, b) => b.id - a.id);
  const endIndex = quantity + PAGE_SIZE;
  const paginatedData = allRecords.slice(0, endIndex);
  return paginatedData;
}

export async function deleteData(id: number): Promise<void> {
  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.objectStore(STORE_NAME).delete(id);
  await tx.done;
}