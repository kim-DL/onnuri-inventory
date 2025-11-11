import type { Product, Txn, User } from "@/types/domain";

const DB_NAME = "onnuri-inventory";
const DB_VERSION = 1;
const STORE_PRODUCTS = "products";
const STORE_TXNS = "txns";
const STORE_USERS = "users";

type StoreName = typeof STORE_PRODUCTS | typeof STORE_TXNS | typeof STORE_USERS;

const storeNames: StoreName[] = [STORE_PRODUCTS, STORE_TXNS, STORE_USERS];

let dbPromise: Promise<IDBDatabase> | null = null;

const getIndexedDB = () => {
  const idb = globalThis.indexedDB;
  if (!idb) {
    throw new Error("IndexedDB is not available in this environment.");
  }
  return idb;
};

const openDatabase = () => {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = getIndexedDB().open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);

    request.onupgradeneeded = () => {
      const db = request.result;
      storeNames.forEach((name) => {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, { keyPath: "id" });
        }
      });
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });
  return dbPromise;
};

const wrapRequest = <T>(req: IDBRequest<T>) =>
  new Promise<T>((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

const runTx = async <T>(
  storeName: StoreName,
  mode: IDBTransactionMode,
  handler: (store: IDBObjectStore) => IDBRequest<T>,
) => {
  const db = await openDatabase();
  const tx = db.transaction(storeName, mode);
  const store = tx.objectStore(storeName);
  return wrapRequest(handler(store));
};

export const db = {
  getAll: <T>(storeName: StoreName) => runTx<T[]>(storeName, "readonly", (store) => store.getAll()),
  get: <T>(storeName: StoreName, id: string) =>
    runTx<T | undefined>(storeName, "readonly", (store) => store.get(id)),
  put: <T extends { id: string }>(storeName: StoreName, value: T) =>
    runTx(storeName, "readwrite", (store) => store.put(value)),
  delete: (storeName: StoreName, id: string) =>
    runTx(storeName, "readwrite", (store) => store.delete(id)),
  clear: (storeName: StoreName) => runTx(storeName, "readwrite", (store) => store.clear()),
};

export const exportDb = async () => {
  const [products, txns, users] = await Promise.all([
    db.getAll<Product>(STORE_PRODUCTS),
    db.getAll<Txn>(STORE_TXNS),
    db.getAll<User>(STORE_USERS),
  ]);
  return { products, txns, users };
};

export const importDb = async (payload: {
  products?: any[];
  txns?: any[];
  users?: any[];
}) => {
  await Promise.all(storeNames.map((name) => db.clear(name)));
  await Promise.all([
    ...(payload.products ?? []).map((p) => db.put(STORE_PRODUCTS, p)),
    ...(payload.txns ?? []).map((t) => db.put(STORE_TXNS, t)),
    ...(payload.users ?? []).map((u) => db.put(STORE_USERS, u)),
  ]);
};

export const productStore = STORE_PRODUCTS;
export const txnStore = STORE_TXNS;
export const userStore = STORE_USERS;
