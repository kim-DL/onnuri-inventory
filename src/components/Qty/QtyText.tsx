export default function QtyText({ value }: { value: number }) {
  const color = value === 0 ? "text-slate-400" : "text-slate-900";
  return (
    <span
      className={`select-none tabular-nums tracking-tight text-[22px] font-black ${color}`}
    >
      {value}
    </span>
  );
}
