import { create } from "zustand";
import { db, exportDb, importDb, productStore, txnStore, userStore } from "@/lib/db";
import { hashString } from "@/lib/hash";
import { productsToCsv } from "@/lib/csv";
import type { Product, Txn, TxnType, User, TempZone } from "@/types/domain";

const createId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
};

type ProductInput = {
  name: string;
  manufacturer?: string;
  qty: number;
  unit: Product["unit"];
  spec?: string;
  exp: string;
  zone: TempZone;
  thumb?: string;
};

type InventoryState = {
  ready: boolean;
  loading: boolean;
  products: Product[];
  txns: Txn[];
  users: User[];
  bootstrap: () => Promise<void>;
  refresh: () => Promise<void>;
  addProduct: (input: ProductInput) => Promise<Product>;
  recordTxn: (productId: string, type: TxnType, payload: { amount: number; memo?: string }) => Promise<void>;
  addUser: (user: { username: string; name: string; password: string; role: User["role"] }) => Promise<void>;
  toggleUser: (id: string) => Promise<void>;
  exportCsv: (filtered?: Product[]) => void;
  backup: () => Promise<void>;
  restore: (file: File) => Promise<void>;
  getProduct: (id: string) => Product | undefined;
  getTxns: (productId: string) => Txn[];
  ensureAdmin: () => Promise<void>;
};

const initialState = {
  ready: false,
  loading: false,
  products: [] as Product[],
  txns: [] as Txn[],
  users: [] as User[],
};

export const useInventoryStore = create<InventoryState>((set, get) => ({
  ...initialState,
  bootstrap: async () => {
    if (get().ready || get().loading) return;
    set({ loading: true });
    await get().refresh();
    await get().ensureAdmin();
    set({ ready: true, loading: false });
  },
  refresh: async () => {
    const [products, txns, users] = await Promise.all([
      db.getAll<Product>(productStore),
      db.getAll<Txn>(txnStore),
      db.getAll<User>(userStore),
    ]);
    products.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    txns.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    set({ products, txns, users });
  },
  ensureAdmin: async () => {
    const { users } = get();
    if (users.length === 0) {
      const passwordHash = await hashString("admin1234");
      const admin: User = {
        id: createId(),
        username: "admin",
        name: "시스템 관리자",
        role: "admin",
        active: true,
        passwordHash,
        createdAt: new Date().toISOString(),
      };
      await db.put(userStore, admin);
      set((state) => ({ users: [...state.users, admin] }));
    }
  },
  addProduct: async (input) => {
    const now = new Date().toISOString();
    const product: Product = {
      id: createId(),
      createdAt: now,
      updatedAt: now,
      ...input,
    };
    await db.put(productStore, product);
    set((state) => ({ products: [product, ...state.products] }));
    return product;
  },
  recordTxn: async (productId, type, payload) => {
    const { products } = get();
    const product = products.find((p) => p.id === productId);
    if (!product) throw new Error("제품을 찾을 수 없습니다.");
    if (type === "adj" && payload.amount < 0) {
      throw new Error("조정 수량은 0 이상이어야 합니다.");
    }
    const diff =
      type === "adj" ? payload.amount - product.qty : type === "in" ? payload.amount : -payload.amount;
    if (product.qty + diff < 0) {
      throw new Error("재고가 부족합니다.");
    }
    const txn: Txn = {
      id: createId(),
      productId,
      type,
      diff,
      memo: payload.memo,
      createdAt: new Date().toISOString(),
    };
    const updatedProduct: Product = {
      ...product,
      qty: product.qty + diff,
      updatedAt: txn.createdAt,
    };
    await Promise.all([db.put(txnStore, txn), db.put(productStore, updatedProduct)]);
    set((state) => {
      const products = state.products
        .map((p) => (p.id === productId ? updatedProduct : p))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      return {
        txns: [txn, ...state.txns],
        products,
      };
    });
  },
  addUser: async ({ username, name, password, role }) => {
    const exists = get().users.find((user) => user.username === username);
    if (exists) throw new Error("이미 존재하는 아이디입니다.");
    const user: User = {
      id: createId(),
      username,
      name,
      role,
      active: true,
      passwordHash: await hashString(password),
      createdAt: new Date().toISOString(),
    };
    await db.put(userStore, user);
    set((state) => ({ users: [...state.users, user] }));
  },
  toggleUser: async (id) => {
    const user = get().users.find((u) => u.id === id);
    if (!user || user.role === "admin") return;
    const updated = { ...user, active: !user.active };
    await db.put(userStore, updated);
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? updated : u)),
    }));
  },
  exportCsv: (filtered) => {
    const list = filtered ?? get().products;
    productsToCsv(list);
  },
  backup: async () => {
    const dump = await exportDb();
    const blob = new Blob([JSON.stringify(dump, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `onnuri-backup-${new Date().toISOString().slice(0, 19)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  },
  restore: async (file: File) => {
    const text = await file.text();
    const payload = JSON.parse(text);
    await importDb(payload);
    await get().refresh();
    await get().ensureAdmin();
  },
  getProduct: (id) => get().products.find((product) => product.id === id),
  getTxns: (productId) => get().txns.filter((txn) => txn.productId === productId),
}));
