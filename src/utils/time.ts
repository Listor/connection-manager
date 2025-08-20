export function formatDate(date: Date): string {
  return date.toLocaleDateString();
}

export function daysSince(date: Date): number {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function isRecent(date: Date, days: number = 7): boolean {
  return daysSince(date) <= days;
}
