import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import Taro from '@tarojs/taro';
import { 
  Child, Book, ReadingRecord, Review, RewardTask, 
  ReadingStats, GoalSettings, RewardRedemption 
} from '@/types';
import { 
  mockChildren, mockBooks, mockReadingRecords, mockReviews, 
  mockRewardTasks, mockStats 
} from '@/data';
import { storage, STORAGE_KEYS } from '@/utils/storage';
import { isToday, isThisWeek, getStreakDays } from '@/utils/date';

interface PointsMap {
  [childId: string]: number;
}

interface GoalSettingsMap {
  [childId: string]: GoalSettings;
}

interface AppContextType {
  currentChild: Child | null;
  children: Child[];
  books: Book[];
  readingRecords: ReadingRecord[];
  reviews: Review[];
  rewardTasks: RewardTask[];
  stats: ReadingStats | null;
  points: number;
  goalSettings: GoalSettings | null;
  redemptions: RewardRedemption[];

  setCurrentChild: (child: Child) => void;
  addChild: (child: Omit<Child, 'id'>) => Child | null;

  addBook: (book: Omit<Book, 'id' | 'addedAt'>) => void;
  addReadingRecord: (record: Omit<ReadingRecord, 'id'>) => void;
  addReview: (review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>) => void;

  getBooksByChild: (childId: string) => Book[];
  getRecordsByBook: (bookId: string) => ReadingRecord[];
  getReviewsByBook: (bookId: string) => Review[];

  claimTask: (taskId: string) => boolean;
  redeemReward: (reward: { id: string; name: string; icon: string; points: number }) => boolean;

  updateGoalSettings: (childId: string, settings: GoalSettings) => void;
  regenerateRewardTasks: (childId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_GOAL_SETTINGS: GoalSettings = {
  dailyMinutes: 30,
  dailyPages: 10,
  weeklyDays: 5,
  weeklyBooks: 1,
  dailyReward: '获得10积分',
  weeklyReward: '周末看电影'
};

const generateId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const recomputeStats = (
  childId: string,
  books: Book[],
  records: ReadingRecord[],
  goalSettings: GoalSettings
): ReadingStats => {
  const childBooks = books.filter(b => b.childId === childId);
  const childRecords = records.filter(r => r.childId === childId);

  const totalMinutes = childRecords.reduce((sum, r) => sum + r.duration, 0);
  const finishedBooks = childBooks.filter(b => b.status === 'finished').length;

  const recordDates = childRecords.map(r => r.date);
  const streakDays = getStreakDays(recordDates);

  const weekRecords = childRecords.filter(r => isThisWeek(r.date));
  const weekUniqueDays = new Set(weekRecords.map(r => r.date)).size;
  const weekMinutes = weekRecords.reduce((sum, r) => sum + r.duration, 0);

  const categoryCount: { [key: string]: number } = {};
  childBooks.forEach(book => {
    categoryCount[book.category] = (categoryCount[book.category] || 0) + 1;
  });
  const categoryDistribution = Object.entries(categoryCount).map(([category, count]) => ({
    category, count
  }));

  return {
    childId,
    totalBooks: childBooks.length,
    finishedBooks,
    totalMinutes,
    streakDays,
    currentWeekDays: weekUniqueDays,
    categoryDistribution,
    weeklyGoal: {
      targetDays: goalSettings.weeklyDays,
      completedDays: Math.min(weekUniqueDays, goalSettings.weeklyDays),
      targetMinutes: goalSettings.weeklyDays * goalSettings.dailyMinutes,
      completedMinutes: weekMinutes
    }
  };
};

const buildRewardTasks = (
  childId: string,
  records: ReadingRecord[],
  claimedTaskIds: Set<string>,
  goal: GoalSettings
): RewardTask[] => {
  const todayRecords = records.filter(r => r.childId === childId && isToday(r.date));
  const weekRecords = records.filter(r => r.childId === childId && isThisWeek(r.date));

  const todayMinutes = todayRecords.reduce((sum, r) => sum + r.duration, 0);
  const todayPages = todayRecords.reduce((sum, r) => sum + Math.max(0, r.endPage - r.startPage), 0);
  const weekDays = new Set(weekRecords.map(r => r.date)).size;
  const weekFinishedBooks = records
    .filter(r => r.childId === childId)
    .map(r => r.bookId)
    .filter((id, idx, arr) => arr.indexOf(id) === idx)
    .length;

  const makeTask = (
    id: string,
    type: RewardTask['type'],
    title: string,
    target: number,
    current: number,
    reward: string,
    rewardPoints: number,
    period: 'daily' | 'weekly'
  ): RewardTask => {
    const completed = current >= target;
    const claimed = claimedTaskIds.has(id);
    return { id, childId, type, title, target, current, reward, rewardPoints, period, completed, claimed };
  };

  return [
    makeTask(
      `${childId}_daily_min_${new Date().toISOString().slice(0, 10)}`,
      'daily_minutes',
      `每日阅读${goal.dailyMinutes}分钟`,
      goal.dailyMinutes,
      todayMinutes,
      goal.dailyReward,
      10,
      'daily'
    ),
    makeTask(
      `${childId}_daily_pages_${new Date().toISOString().slice(0, 10)}`,
      'daily_pages',
      `每日阅读${goal.dailyPages}页`,
      goal.dailyPages,
      todayPages,
      '获得5积分',
      5,
      'daily'
    ),
    makeTask(
      `${childId}_weekly_days_${new Date().getFullYear()}_${Math.ceil((new Date().getDate() + new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay()) / 7)}`,
      'weekly_days',
      `本周阅读${goal.weeklyDays}天`,
      goal.weeklyDays,
      weekDays,
      goal.weeklyReward,
      50,
      'weekly'
    ),
    makeTask(
      `${childId}_weekly_books_${new Date().getFullYear()}_${Math.ceil((new Date().getDate() + new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay()) / 7)}`,
      'weekly_books',
      `本周读完${goal.weeklyBooks}本书`,
      goal.weeklyBooks,
      weekFinishedBooks,
      '获得30积分',
      30,
      'weekly'
    )
  ];
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [currentChildId, setCurrentChildId] = useState<string | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [readingRecords, setReadingRecords] = useState<ReadingRecord[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [claimedTaskIds, setClaimedTaskIds] = useState<string[]>([]);
  const [pointsMap, setPointsMap] = useState<PointsMap>({});
  const [goalSettingsMap, setGoalSettingsMap] = useState<GoalSettingsMap>({});
  const [redemptions, setRedemptions] = useState<RewardRedemption[]>([]);

  useEffect(() => {
    const isInitialized = storage.get<boolean>(STORAGE_KEYS.IS_INITIALIZED, false);

    if (!isInitialized) {
      console.log('[AppContext] Initializing with mock data...');
      storage.set(STORAGE_KEYS.CHILDREN, mockChildren);
      storage.set(STORAGE_KEYS.CURRENT_CHILD_ID, mockChildren[0].id);
      storage.set(STORAGE_KEYS.BOOKS, mockBooks);
      storage.set(STORAGE_KEYS.READING_RECORDS, mockReadingRecords);
      storage.set(STORAGE_KEYS.REVIEWS, mockReviews);
      storage.set(STORAGE_KEYS.REWARD_TASKS, []);
      storage.set<string[]>(STORAGE_KEYS.REWARD_TASKS + '_claimed', []);
      storage.set<PointsMap>(STORAGE_KEYS.POINTS, { [mockChildren[0].id]: 128, [mockChildren[1].id]: 50 });
      
      const defaultSettings = { [mockChildren[0].id]: DEFAULT_GOAL_SETTINGS, [mockChildren[1].id]: { ...DEFAULT_GOAL_SETTINGS, dailyMinutes: 15 } };
      storage.set<GoalSettingsMap>(STORAGE_KEYS.GOAL_SETTINGS, defaultSettings);
      storage.set<RewardRedemption[]>(STORAGE_KEYS.REDEMPTIONS, []);
      storage.set(STORAGE_KEYS.IS_INITIALIZED, true);
    }

    setChildrenList(storage.get<Child[]>(STORAGE_KEYS.CHILDREN, mockChildren));
    setCurrentChildId(storage.get<string | null>(STORAGE_KEYS.CURRENT_CHILD_ID, null));
    setBooks(storage.get<Book[]>(STORAGE_KEYS.BOOKS, []));
    setReadingRecords(storage.get<ReadingRecord[]>(STORAGE_KEYS.READING_RECORDS, []));
    setReviews(storage.get<Review[]>(STORAGE_KEYS.REVIEWS, []));
    setClaimedTaskIds(storage.get<string[]>(STORAGE_KEYS.REWARD_TASKS + '_claimed', []));
    setPointsMap(storage.get<PointsMap>(STORAGE_KEYS.POINTS, {}));
    setGoalSettingsMap(storage.get<GoalSettingsMap>(STORAGE_KEYS.GOAL_SETTINGS, {}));
    setRedemptions(storage.get<RewardRedemption[]>(STORAGE_KEYS.REDEMPTIONS, []));
  }, []);

  const currentChild = useMemo(
    () => childrenList.find(c => c.id === currentChildId) || null,
    [childrenList, currentChildId]
  );

  const currentGoalSettings = useMemo(() => {
    if (!currentChildId) return null;
    return goalSettingsMap[currentChildId] || DEFAULT_GOAL_SETTINGS;
  }, [currentChildId, goalSettingsMap]);

  const currentPoints = useMemo(() => {
    if (!currentChildId) return 0;
    return pointsMap[currentChildId] || 0;
  }, [currentChildId, pointsMap]);

  const rewardTasks = useMemo(() => {
    if (!currentChildId || !currentGoalSettings) return [];
    return buildRewardTasks(
      currentChildId,
      readingRecords,
      new Set(claimedTaskIds),
      currentGoalSettings
    );
  }, [currentChildId, readingRecords, claimedTaskIds, currentGoalSettings]);

  const stats = useMemo(() => {
    if (!currentChildId || !currentGoalSettings) return null;
    return recomputeStats(currentChildId, books, readingRecords, currentGoalSettings);
  }, [currentChildId, books, readingRecords, currentGoalSettings]);

  const setCurrentChild = (child: Child) => {
    setCurrentChildId(child.id);
    storage.set(STORAGE_KEYS.CURRENT_CHILD_ID, child.id);
    console.log('[AppContext] Switched to child:', child.name);
  };

  const addChild = (childData: Omit<Child, 'id'>): Child | null => {
    const newChild: Child = {
      ...childData,
      id: generateId('child')
    };
    const newChildren = [...childrenList, newChild];
    setChildrenList(newChildren);
    storage.set(STORAGE_KEYS.CHILDREN, newChildren);

    const newGoals = { ...goalSettingsMap, [newChild.id]: DEFAULT_GOAL_SETTINGS };
    setGoalSettingsMap(newGoals);
    storage.set(STORAGE_KEYS.GOAL_SETTINGS, newGoals);

    const newPoints = { ...pointsMap, [newChild.id]: 0 };
    setPointsMap(newPoints);
    storage.set(STORAGE_KEYS.POINTS, newPoints);

    setCurrentChildId(newChild.id);
    storage.set(STORAGE_KEYS.CURRENT_CHILD_ID, newChild.id);

    console.log('[AppContext] Added new child:', newChild.name);
    return newChild;
  };

  const addBook = (bookData: Omit<Book, 'id' | 'addedAt'>) => {
    const newBook: Book = {
      ...bookData,
      id: generateId('book'),
      addedAt: new Date().toISOString()
    };
    const newBooks = [newBook, ...books];
    setBooks(newBooks);
    storage.set(STORAGE_KEYS.BOOKS, newBooks);
    console.log('[AppContext] Added book:', newBook.title, 'ISBN:', newBook.isbn);
  };

  const addReadingRecord = (recordData: Omit<ReadingRecord, 'id'>) => {
    const newRecord: ReadingRecord = {
      ...recordData,
      id: generateId('record')
    };
    const newRecords = [newRecord, ...readingRecords];
    setReadingRecords(newRecords);
    storage.set(STORAGE_KEYS.READING_RECORDS, newRecords);

    const newBooks = books.map(book => {
      if (book.id === recordData.bookId) {
        return {
          ...book,
          currentPage: Math.max(book.currentPage, recordData.endPage),
          status: recordData.endPage >= book.totalPages ? 'finished' as const : book.status,
          finishedAt: recordData.endPage >= book.totalPages && !book.finishedAt
            ? new Date().toISOString()
            : book.finishedAt
        };
      }
      return book;
    });
    setBooks(newBooks);
    storage.set(STORAGE_KEYS.BOOKS, newBooks);

    console.log('[AppContext] Added reading record, duration:', recordData.duration, 'min, audio:', !!recordData.audioUrl);
  };

  const addReview = (reviewData: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newReview: Review = {
      ...reviewData,
      id: generateId('review'),
      createdAt: now,
      updatedAt: now
    };
    const newReviews = [newReview, ...reviews];
    setReviews(newReviews);
    storage.set(STORAGE_KEYS.REVIEWS, newReviews);
    console.log('[AppContext] Added review:', newReview.title);
  };

  const claimTask = (taskId: string): boolean => {
    if (!currentChildId) return false;
    if (claimedTaskIds.includes(taskId)) {
      console.log('[AppContext] Task already claimed:', taskId);
      Taro.showToast({ title: '已领取过', icon: 'none' });
      return false;
    }

    const task = rewardTasks.find(t => t.id === taskId);
    if (!task) return false;
    if (!task.completed) {
      Taro.showToast({ title: '任务未完成', icon: 'none' });
      return false;
    }

    const newClaimedIds = [...claimedTaskIds, taskId];
    setClaimedTaskIds(newClaimedIds);
    storage.set(STORAGE_KEYS.REWARD_TASKS + '_claimed', newClaimedIds);

    const currentPts = pointsMap[currentChildId] || 0;
    const newPtsMap = { ...pointsMap, [currentChildId]: currentPts + task.rewardPoints };
    setPointsMap(newPtsMap);
    storage.set(STORAGE_KEYS.POINTS, newPtsMap);

    console.log('[AppContext] Claimed task:', task.title, '+', task.rewardPoints, 'points');
    Taro.showToast({ title: `+${task.rewardPoints} 积分!`, icon: 'success' });
    return true;
  };

  const redeemReward = (reward: { id: string; name: string; icon: string; points: number }): boolean => {
    if (!currentChildId) return false;
    const currentPts = pointsMap[currentChildId] || 0;

    if (currentPts < reward.points) {
      Taro.showToast({ title: '积分不足', icon: 'none' });
      return false;
    }

    const redemption: RewardRedemption = {
      id: reward.id,
      childId: currentChildId,
      rewardName: reward.name,
      rewardIcon: reward.icon,
      pointsCost: reward.points,
      redeemedAt: new Date().toISOString()
    };
    const newRedemptions = [redemption, ...redemptions];
    setRedemptions(newRedemptions);
    storage.set(STORAGE_KEYS.REDEMPTIONS, newRedemptions);

    const newPtsMap = { ...pointsMap, [currentChildId]: currentPts - reward.points };
    setPointsMap(newPtsMap);
    storage.set(STORAGE_KEYS.POINTS, newPtsMap);

    console.log('[AppContext] Redeemed reward:', reward.name, '-', reward.points, 'points');
    return true;
  };

  const updateGoalSettings = (childId: string, settings: GoalSettings) => {
    const newSettingsMap = { ...goalSettingsMap, [childId]: settings };
    setGoalSettingsMap(newSettingsMap);
    storage.set(STORAGE_KEYS.GOAL_SETTINGS, newSettingsMap);
    console.log('[AppContext] Updated goal settings for child:', childId);
  };

  const regenerateRewardTasks = (childId: string) => {
    console.log('[AppContext] Regenerating tasks for child:', childId);
  };

  const getBooksByChild = (childId: string) => 
    books.filter(book => book.childId === childId);

  const getRecordsByBook = (bookId: string) =>
    readingRecords.filter(record => record.bookId === bookId).sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

  const getReviewsByBook = (bookId: string) =>
    reviews.filter(review => review.bookId === bookId).sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  return (
    <AppContext.Provider
      value={{
        currentChild,
        children: childrenList,
        books,
        readingRecords,
        reviews,
        rewardTasks,
        stats,
        points: currentPoints,
        goalSettings: currentGoalSettings,
        redemptions,
        setCurrentChild,
        addChild,
        addBook,
        addReadingRecord,
        addReview,
        getBooksByChild,
        getRecordsByBook,
        getReviewsByBook,
        claimTask,
        redeemReward,
        updateGoalSettings,
        regenerateRewardTasks
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
