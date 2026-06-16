import dayjs from 'dayjs';

export const formatDate = (date: string | Date, format: string = 'YYYY-MM-DD'): string => {
  return dayjs(date).format(format);
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
};

export const getStreakDays = (dates: string[]): number => {
  if (dates.length === 0) return 0;
  
  const sortedDates = [...new Set(dates)].sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );
  
  let streak = 0;
  let currentDate = dayjs();
  
  for (let i = 0; i < sortedDates.length; i++) {
    const recordDate = dayjs(sortedDates[i]);
    const diff = currentDate.diff(recordDate, 'day');
    
    if (diff === streak) {
      streak++;
    } else if (diff > streak) {
      break;
    }
  }
  
  return streak;
};

export const isToday = (dateStr: string): boolean => {
  return dayjs(dateStr).isSame(dayjs(), 'day');
};

export const isThisWeek = (dateStr: string): boolean => {
  return dayjs(dateStr).isSame(dayjs(), 'week');
};

export const daysUntil = (dateStr: string): number => {
  return dayjs(dateStr).diff(dayjs(), 'day');
};

export const generateId = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
