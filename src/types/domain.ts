export type TempZone = "냉동" | "냉장" | "상온";

export type Role = "admin" | "staff";

export interface Product {
  id: string;
  name: string;
  manufacturer?: string;
  qty: number;
  unit: "개" | "봉" | "박스" | "팩";
  spec?: string;
  exp: string;
  zone: TempZone;
  thumb?: string; // data URL
  createdAt: string;
  updatedAt: string;
}

export type TxnType = "in" | "out" | "adj";

export interface Txn {
  id: string;
  productId: string;
  type: TxnType;
  diff: number;
  memo?: string;
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: Role;
  active: boolean;
  passwordHash: string;
  createdAt: string;
}

export interface Credentials {
  username: string;
  password: string;
}
