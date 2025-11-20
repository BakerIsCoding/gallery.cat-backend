export function getDateUtc(dateStr: string): {
  hasTimezone: boolean;
  dateUTC?: Date;
} {
  const dateTrimmed = dateStr.trim();

  const hasTz = /(Z|[+\-]\d{2}(?::?\d{2})?)\s*$/i.test(dateTrimmed);
  if (!hasTz) return { hasTimezone: false };

  let normalized = dateTrimmed.replace(" ", "T");
  normalized = normalized.replace(
    /([+\-]\d{2})(\d{2})$/,
    (_m, h, m) => `${h}:${m}`
  );

  const date = new Date(normalized);
  if (isNaN(date.getTime())) {
    return { hasTimezone: false };
  }

  return { hasTimezone: true, dateUTC: date };
}
