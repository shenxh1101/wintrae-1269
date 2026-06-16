import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Taro from '@tarojs/taro';
import { Child, Book, ReadingRecord, Review, RewardTask, ReadingStats } from '@/types';
import { mockChildren, mockBooks, mockReadingRecords, mockReviews, mockRewardTasks, mockStats } from '@/data';

interface AppContextType {
  currentChild: Child | null;
  children: Child[];
  books: Book[];
  readingRecords: ReadingRecord[];
  reviews: Review[];
  rewardTasks: RewardTask[];
  stats: ReadingStats | null;
  setCurrentChild: (child: Child) => void;
  addBook: (book: Omit<Book, 'id' | 'addedAt'>) => void;
  addReadingRecord: (record: Omit<ReadingRecord, 'id'>) => void;
  addReview: (review: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>) => void;
  getBooksByChild: (childId: string) => Book[];
  getRecordsByBook: (bookId: string) => ReadingRecord[];
  getReviewsByBook: (bookId: string) => Review[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentChild, setCurrentChild] = useState<Child | null>(null);
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [readingRecords, setReadingRecords] = useState<ReadingRecord[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rewardTasks, setRewardTasks] = useState<RewardTask[]>([]);
  const [stats, setStats] = useState<ReadingStats | null>(null);

  useEffect(() => {
    setChildrenList(mockChildren);
    setBooks(mockBooks);
    setReadingRecords(mockReadingRecords);
    setReviews(mockReviews);
    setRewardTasks(mockRewardTasks);
    if (mockChildren.length > 0) {
      setCurrentChild(mockChildren[0]);
      setStats(mockStats);
    }
  }, []);

  const addBook = (bookData: Omit<Book, 'id' | 'addedAt'>) => {
    const newBook: Book = {
      ...bookData,
      id: `book_${Date.now()}`,
      addedAt: new Date().toISOString()
    };
    setBooks(prev => [newBook, ...prev]);
  };

  const addReadingRecord = (recordData: Omit<ReadingRecord, 'id'>) => {
    const newRecord: ReadingRecord = {
      ...recordData,
      id: `record_${Date.now()}`
    };
    setReadingRecords(prev => [newRecord, ...prev]);
    
    setBooks(prev => prev.map(book => {
      if (book.id === recordData.bookId) {
        return {
          ...book,
          currentPage: Math.max(book.currentPage, recordData.endPage),
          status: recordData.endPage >= book.totalPages ? 'finished' : book.status
        };
      }
      return book;
    }));
  };

  const addReview = (reviewData: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newReview: Review = {
      ...reviewData,
      id: `review_${Date.now()}`,
      createdAt: now,
      updatedAt: now
    };
    setReviews(prev => [newReview, ...prev]);
  };

  const getBooksByChild = (childId: string) => {
    return books.filter(book => book.childId === childId);
  };

  const getRecordsByBook = (bookId: string) => {
    return readingRecords.filter(record => record.bookId === bookId).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  };

  const getReviewsByBook = (bookId: string) => {
    return reviews.filter(review => review.bookId === bookId).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

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
        setCurrentChild,
        addBook,
        addReadingRecord,
        addReview,
        getBooksByChild,
        getRecordsByBook,
        getReviewsByBook
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
