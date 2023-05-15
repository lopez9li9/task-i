export const isValidDateFormat = (date: string): boolean => {
  const regex = /^(\d{2})\/(\d{2})\/(\d{2}) - (\d{2}):(\d{2})$/;

  const match = date.match(regex);
  if (!match) return false;

  const [, day, month, year, hours, minutes] = match;
  const testDate = new Date(`${year}-${month}-${day}T${hours}:${minutes}:00Z`);

  return !isNaN(testDate.getTime());
};

export const arraysEqual = <T extends string[]>(arr1: T, arr2: T): boolean => arr1.length === arr2.length && arraysContains(arr1, arr2);

export const arraysContains = <T extends string[]>(arr: T, items: T): boolean => items.every((item) => arr.includes(item));

export const arraysIntersect = <T extends string[]>(arr1: T, arr2: T): boolean => arr1.some((item) => arr2.includes(item));
