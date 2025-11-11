export const MS_PER_DAY = 86_400_000;

export const dDay = (expISO: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(expISO);
  exp.setHours(0, 0, 0, 0);
  return Math.ceil((+exp - +today) / MS_PER_DAY);
};

export const formatYMD = (iso: string) => iso.replace(/-/g, ".");
