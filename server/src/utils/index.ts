export const isValidDate = (date: string): boolean => {
  const regex = /^(\d{2})\/(\d{2})\/(\d{2}) - (\d{2}):(\d{2})$/;
  const match = date.match(regex);

  if (!match) {
    return false;
  }

  const [, day, month, year, hours, minutes] = match;

  const dayNumber = Number(day);
  const monthNumber = Number(month);
  const yearNumber = Number(year);
  const hoursNumber = Number(hours);
  const minutesNumber = Number(minutes);

  const isValidComponents =
    !isNaN(dayNumber) &&
    !isNaN(monthNumber) &&
    !isNaN(yearNumber) &&
    !isNaN(hoursNumber) &&
    !isNaN(minutesNumber) &&
    dayNumber >= 1 &&
    dayNumber <= 31 &&
    monthNumber >= 1 &&
    monthNumber <= 12 &&
    yearNumber >= 0 &&
    hoursNumber >= 0 &&
    hoursNumber <= 23 &&
    minutesNumber >= 0 &&
    minutesNumber <= 59;

  return isValidComponents;
};

export const arraysEqual = <T extends string[]>(arr1: T, arr2: T): boolean => arr1.length === arr2.length && arraysContains(arr1, arr2);

export const arraysContains = <T extends string[]>(arr: T, items: T): boolean => items.every((item) => arr.includes(item));

export const arraysIntersect = <T extends string[]>(arr1: T, arr2: T): boolean => arr1.some((item) => arr2.includes(item));
