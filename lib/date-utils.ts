/**
 * Utility to check if a drama was added recently.
 * @param isoDate - The ISO date string of when the content was inserted.
 * @param days - The number of days to consider "recent" (default 7).
 * @returns boolean
 */
export function isRecent(isoDate?: string, days: number = 7): boolean {
  if (!isoDate) return false;
  
  try {
    const insertedDate = new Date(isoDate);
    const now = new Date();
    const diffInMs = now.getTime() - insertedDate.getTime();
    const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
    
    return diffInDays >= 0 && diffInDays <= days;
  } catch (error) {
    console.error("Error parsing date in isRecent:", error);
    return false;
  }
}
