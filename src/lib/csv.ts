import { dDay } from "./date";
import type { Product } from "@/types/domain";

const BOM = "\uFEFF";

export const downloadCsv = (rows: string[][], filename: string) => {
  const csvContent = rows.map((row) =>
    row
      .map((cell) => {
        if (cell == null) return "";
        const safe = String(cell).replace(/"/g, '""');
        return `"${safe}"`;
      })
      .join(","),
  );
  const blob = new Blob([BOM + csvContent.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const productsToCsv = (products: Product[]) => {
  const header = [
    "품명",
    "제조사",
    "수량",
    "단위",
    "규격/중량",
    "보관구분",
    "유통기한",
    "D-일수",
    "최근수정",
    "비고",
  ];
  const rows = products.map((product) => [
    product.name,
    product.manufacturer ?? "",
    String(product.qty),
    product.unit,
    product.spec ?? "",
    product.zone,
    product.exp,
    String(dDay(product.exp)),
    product.updatedAt,
    "",
  ]);
  downloadCsv([header, ...rows], `onnuri-products-${new Date().toISOString().slice(0, 10)}.csv`);
};
