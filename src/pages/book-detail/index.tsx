import React, { useMemo } from 'react';
import { View, Text, Image, Button, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { useApp } from '@/store/AppContext';
import { categoryLabels } from '@/types';
import classNames from 'classnames';
import { formatDate } from '@/utils/date';

const BookDetailPage: React.FC = () => {
  const router = useRouter();
  const { books, getRecordsByBook, getReviewsByBook } = useApp();
  const bookId = router.params.id;

  const book = useMemo(() => {
    return books.find(b => b.id === bookId);
  }, [books, bookId]);

  const records = useMemo(() => {
    if (!bookId) return [];
    return getRecordsByBook(bookId);
  }, [bookId, getRecordsByBook]);

  const reviews = useMemo(() => {
    if (!bookId) return [];
    return getReviewsByBook(bookId);
  }, [bookId, getReviewsByBook]);

  const progress = book && book.totalPages > 0
    ? Math.min(Math.round((book.currentPage / book.totalPages) * 100), 100)
    : 0;

  const statusText = {
    reading: '阅读中',
    finished: '已读完',
    borrowed: '借阅中'
  };

  const handleStartReading = () => {
    Taro.switchTab({
      url: '/pages/reading/index'
    });
  };

  const handleWriteReview = () => {
    Taro.navigateTo({
      url: `/pages/review-edit/index?bookId=${bookId}&mode=create`
    });
  };

  if (!book) {
    return (
      <View className={styles.page}>
        <Text style={{ padding: '40rpx', color: '#A0AEC0' }}>书籍不存在</Text>
      </View>
    );
  }

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.bookHeader}>
        <View className={styles.bookInfo}>
          <Image 
            className={styles.bookCover} 
            src={book.cover}
            mode="aspectFill"
          />
          <View className={styles.bookDetails}>
            <View>
              <Text className={styles.bookTitle}>{book.title}</Text>
              <Text className={styles.bookAuthor}>{book.author}</Text>
            </View>
            <View className={classNames(styles.statusBadge, styles[book.status])}>
              {statusText[book.status]}
            </View>
          </View>
        </View>
      </View>

      <View className={styles.progressCard}>
        <View className={styles.progressHeader}>
          <Text className={styles.progressLabel}>阅读进度</Text>
          <Text className={styles.progressPercent}>{progress}%</Text>
        </View>
        <View className={styles.progressBar}>
          <View 
            className={styles.progressFill} 
            style={{ width: `${progress}%` }}
          />
        </View>
        <View className={styles.progressInfo}>
          <Text>已读 {book.currentPage} 页</Text>
          <Text>共 {book.totalPages} 页</Text>
        </View>
      </View>

      {book.description && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>内容简介</Text>
          <Text className={styles.description}>{book.description}</Text>
        </View>
      )}

      {book.borrowedFrom && (
        <View className={styles.section}>
          <Text className={styles.sectionTitle}>借阅信息</Text>
          <Text className={styles.description}>
            来源：{book.borrowedFrom}
            {book.borrowDueDate && `\n到期时间：${formatDate(book.borrowDueDate, 'YYYY年MM月DD日')}`}
          </Text>
        </View>
      )}

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text>阅读记录</Text>
          <Text className={styles.sectionMore}>共 {records.length} 次</Text>
        </View>
        {records.length > 0 ? (
          records.slice(0, 3).map(record => (
            <View key={record.id} className={styles.recordItem}>
              <View className={styles.recordHeader}>
                <Text className={styles.recordDate}>
                  {formatDate(record.date, 'MM月DD日')}
                </Text>
                <Text className={styles.recordDuration}>{record.duration} 分钟</Text>
              </View>
              <Text className={styles.recordPages}>
                第 {record.startPage} - {record.endPage} 页
              </Text>
              {record.favoriteSentences.length > 0 && (
                <View className={styles.recordContent}>
                  <Text className={styles.recordLabel}>喜欢的句子</Text>
                  {record.favoriteSentences.slice(0, 1).map((sentence, idx) => (
                    <Text key={idx} className={styles.recordText}>
                      "{sentence}"
                    </Text>
                  ))}
                </View>
              )}
            </View>
          ))
        ) : (
          <Text className={styles.emptyRecords}>还没有阅读记录，开始阅读吧~</Text>
        )}
      </View>

      {reviews.length > 0 && (
        <View className={styles.section}>
          <View className={styles.sectionTitle}>
            <Text>读后感</Text>
            <Text className={styles.sectionMore}>查看全部</Text>
          </View>
          {reviews.slice(0, 2).map(review => (
            <View key={review.id} className={styles.recordItem}>
              <Text className={styles.recordHeader}>
                <Text className={styles.recordDate}>{review.title}</Text>
              </Text>
              <Text className={styles.recordPages}>
                {formatDate(review.createdAt, 'YYYY年MM月DD日')}
              </Text>
              <Text className={styles.description} style={{ marginTop: '8rpx' }}>
                {review.content.substring(0, 80)}...
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={{ height: '40rpx' }} />

      <View className={styles.bottomBar}>
        <Button 
          className={classNames(styles.btn, styles.secondary)}
          onClick={handleWriteReview}
        >
          写读后感
        </Button>
        <Button 
          className={classNames(styles.btn, styles.primary)}
          onClick={handleStartReading}
        >
          开始阅读
        </Button>
      </View>
    </ScrollView>
  );
};

export default BookDetailPage;
