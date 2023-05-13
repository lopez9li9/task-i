export const arraysEqual = (a: any[], b: any[]): boolean => {
  if (a === b) return true;
  if (a.length !== b.length) return false;

  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }

  return true;
};

export const isValidDateFormat = (date: string): boolean => {
  const regex = /^(\d{2})\/(\d{2})\/(\d{2}) - (\d{2}):(\d{2})$/;

  const match = date.match(regex);

  if (!match) return false;

  const [, day, month, year, hours, minutes] = match;

  const testDate = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00Z`);

  return !isNaN(testDate.getTime());
};
