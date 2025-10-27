export const toggleWeeklyCompleted = (weeklyCompleted: string[], task: string): string[] => {
  const set = new Set(weeklyCompleted || []);
  if (set.has(task)) {
    set.delete(task);
  } else {
    set.add(task);
  }
  return Array.from(set);
};