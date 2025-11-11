import { dDay } from "@/lib/date";

export default function ExpiryBadge({ exp }: { exp: string }) {
  const days = dDay(exp);
  const tone =
    days < 0
      ? "bg-red-600 text-white"
      : days <= 7
      ? "bg-amber-100 text-amber-800"
      : days <= 30
      ? "bg-yellow-100 text-yellow-800"
      : "bg-slate-100 text-slate-700";

  return (
    <span
      className={`shrink-0 inline-flex h-6 items-center px-2.5 rounded-full text-[12px] ${tone}`}
    >
      D-{days}
    </span>
  );
}
