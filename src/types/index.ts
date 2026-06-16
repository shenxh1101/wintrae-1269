export interface Child {
  id: string;
  name: string;
  avatar: string;
  grade: string;
  age: number;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  category: string;
  totalPages: number;
  currentPage: number;
  status: 'reading' | 'finished' | 'borrowed';
  isbn?: string;
  publisher?: string;
  publishDate?: string;
  description?: string;
  borrowedFrom?: string;
  borrowDueDate?: string;
  childId: string;
  addedAt: string;
  finishedAt?: string;
}

export interface ReadingRecord {
  id: string;
  bookId: string;
  childId: string;
  date: string;
  duration: number;
  startPage: number;
  endPage: number;
  audioUrl?: string;
  favoriteSentences: string[];
  difficultWords: {
    word: string;
    meaning?: string;
  }[];
  notes?: string;
}

export interface Review {
  id: string;
  bookId: string;
  childId: string;
  title: string;
  content: string;
  rating: number;
  createdAt: string;
  updatedAt: string;
}

export interface RewardTask {
  id: string;
  childId: string;
  type: 'daily_minutes' | 'daily_pages' | 'weekly_books' | 'weekly_days';
  title: string;
  target: number;
  current: number;
  reward: string;
  rewardPoints: number;
  period: 'daily' | 'weekly';
  completed: boolean;
  claimed: boolean;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  points: number;
  icon: string;
  redeemed: boolean;
  redeemedAt?: string;
}

export interface ReadingStats {
  childId: string;
  totalBooks: number;
  finishedBooks: number;
  totalMinutes: number;
  streakDays: number;
  currentWeekDays: number;
  categoryDistribution: {
    category: string;
    count: number;
  }[];
  weeklyGoal: {
    targetDays: number;
    completedDays: number;
    targetMinutes: number;
    completedMinutes: number;
  };
}

export interface DiscussionQuestion {
  id: string;
  bookId: string;
  question: string;
  category: string;
}

export interface GoalSettings {
  dailyMinutes: number;
  dailyPages: number;
  weeklyDays: number;
  weeklyBooks: number;
  dailyReward: string;
  weeklyReward: string;
}

export interface RewardRedemption {
  id: string;
  childId: string;
  rewardName: string;
  rewardIcon: string;
  pointsCost: number;
  redeemedAt: string;
}

export interface AudioRecord {
  duration: number;
  filePath: string;
  size?: number;
}

export type BookCategory = 'fiction' | 'science' | 'history' | 'art' | 'other';

export const categoryLabels: Record<BookCategory, string> = {
  fiction: '文学小说',
  science: '科普百科',
  history: '历史人文',
  art: '艺术绘本',
  other: '其他'
};
