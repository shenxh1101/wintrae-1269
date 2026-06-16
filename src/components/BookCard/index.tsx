import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { Book, categoryLabels } from '@/types';
import classNames from 'classnames';

interface BookCardProps {
  book: Book;
  onClick?: (book: Book) => void;
  size?: 'small' | 'medium' | 'large';
}

const BookCard: React.FC<BookCardProps> = ({ book, onClick, size = 'medium' }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(book);
    } else {
      Taro.navigateTo({
        url: `/pages/book-detail/index?id=${book.id}`
      });
    }
  };

  const progress = book.totalPages > 0 
    ? Math.min(Math.round((book.currentPage / book.totalPages) * 100), 100) 
    : 0;

  const statusText = {
    reading: '阅读中',
    finished: '已读完',
    borrowed: '借阅中'
  }[book.status];

  const statusClass = {
    reading: styles.statusReading,
    finished: styles.statusFinished,
    borrowed: styles.statusBorrowed
  }[book.status];

  return (
    <View 
      className={classNames(styles.bookCard, styles[size])} 
      onClick={handleClick}
    >
      <View className={styles.coverWrapper}>
        <Image 
          className={styles.cover} 
          src={book.cover} 
          mode="aspectFill"
        />
        {book.status !== 'reading' && (
          <View className={classNames(styles.statusBadge, statusClass)}>
            <Text className={styles.statusText}>{statusText}</Text>
          </View>
        )}
        {size !== 'small' && (
          <View className={styles.progressBar}>
            <View 
              className={styles.progressFill} 
              style={{ width: `${progress}%` }}
            />
          </View>
        )}
      </View>
      <View className={styles.info}>
        <Text className={styles.title}>{book.title}</Text>
        <Text className={styles.author}>{book.author}</Text>
        {size !== 'small' && (
          <View className={styles.categoryTag}>
            <Text className={styles.categoryText}>
              {categoryLabels[book.category as keyof typeof categoryLabels] || book.category}
            </Text>
          </View>
        )}
        {size === 'large' && (
          <Text className={styles.progressText}>
            已读 {book.currentPage}/{book.totalPages} 页 ({progress}%)
          </Text>
        )}
      </View>
    </View>
  );
};

export default BookCard;
