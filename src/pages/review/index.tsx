import React, { useState, useMemo } from 'react';
import { View, Text, Image, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useApp } from '@/store/AppContext';
import EmptyState from '@/components/EmptyState';
import { Review, Book } from '@/types';
import classNames from 'classnames';
import { formatDate } from '@/utils/date';

const ReviewPage: React.FC = () => {
  const { currentChild, reviews, books } = useApp();
  const [selectedBookId, setSelectedBookId] = useState<string | 'all'>('all');

  const childBooks = useMemo(() => {
    if (!currentChild) return [];
    return books.filter(b => b.childId === currentChild.id);
  }, [currentChild, books]);

  const childReviews = useMemo(() => {
    if (!currentChild) return [];
    let result = reviews.filter(r => r.childId === currentChild.id);
    
    if (selectedBookId !== 'all') {
      result = result.filter(r => r.bookId === selectedBookId);
    }
    
    return result.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [currentChild, reviews, selectedBookId]);

  const getBookById = (bookId: string): Book | undefined => {
    return books.find(b => b.id === bookId);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Text 
          key={i} 
          className={classNames(styles.star, i <= rating ? styles.filled : styles.empty)}
        >
          ★
        </Text>
      );
    }
    return stars;
  };

  const handleReviewClick = (review: Review) => {
    Taro.navigateTo({
      url: `/pages/review-edit/index?id=${review.id}&mode=view`
    });
  };

  const handleAddReview = () => {
    Taro.navigateTo({
      url: '/pages/review-edit/index?mode=create'
    });
  };

  const handlePullDownRefresh = () => {
    setTimeout(() => {
      Taro.stopPullDownRefresh();
    }, 1000);
  };

  React.useEffect(() => {
    Taro.onPullDownRefresh(handlePullDownRefresh);
    return () => {
      Taro.offPullDownRefresh(handlePullDownRefresh);
    };
  }, []);

  const stats = {
    total: childReviews.length,
    books: new Set(childReviews.map(r => r.bookId)).size
  };

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>我的读后感</Text>
        <Text className={styles.headerDesc}>记录每一次阅读的感悟与思考</Text>
        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{stats.total}</Text>
            <Text className={styles.statLabel}>读后感</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{stats.books}</Text>
            <Text className={styles.statLabel}>涉及书籍</Text>
          </View>
        </View>
      </View>

      <View className={styles.filterSection}>
        <Text className={styles.filterLabel}>按书籍筛选</Text>
        <ScrollView scrollX className={styles.bookFilter}>
          <View
            className={classNames(styles.filterItem, selectedBookId === 'all' && styles.active)}
            onClick={() => setSelectedBookId('all')}
          >
            <Text className={styles.filterItemText}>全部</Text>
          </View>
          {childBooks.map(book => (
            <View
              key={book.id}
              className={classNames(styles.filterItem, selectedBookId === book.id && styles.active)}
              onClick={() => setSelectedBookId(book.id)}
            >
              <Text className={styles.filterItemText}>{book.title}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      <ScrollView scrollY className={styles.reviewsList}>
        {childReviews.length > 0 ? (
          childReviews.map(review => {
            const book = getBookById(review.bookId);
            return (
              <View 
                key={review.id} 
                className={styles.reviewCard}
                onClick={() => handleReviewClick(review)}
              >
                <View className={styles.reviewHeader}>
                  {book && (
                    <Image 
                      className={styles.reviewBookCover} 
                      src={book.cover}
                      mode="aspectFill"
                    />
                  )}
                  <View className={styles.reviewInfo}>
                    <Text className={styles.reviewBookTitle}>
                      {book?.title || '未知书籍'}
                    </Text>
                    <View className={styles.rating}>
                      {renderStars(review.rating)}
                    </View>
                    <Text className={styles.reviewDate}>
                      {formatDate(review.createdAt, 'YYYY年MM月DD日')}
                    </Text>
                  </View>
                </View>
                
                <Text className={styles.reviewTitle}>{review.title}</Text>
                <Text className={styles.reviewContent}>{review.content}</Text>
                
                <View className={styles.reviewFooter}>
                  <View className={styles.reviewTags}>
                    <Text className={styles.reviewTag}>读后感</Text>
                  </View>
                  <Text className={styles.readMore}>查看详情 →</Text>
                </View>
              </View>
            );
          })
        ) : (
          <View className={styles.emptyWrapper}>
            <EmptyState
              icon="✍️"
              title="还没有读后感"
              description="读完一本书后，写下你的感想和收获吧"
              actionText="写第一篇"
              onAction={handleAddReview}
            />
          </View>
        )}
      </ScrollView>

      <View 
        className={styles.addBtn}
        onClick={handleAddReview}
      >
        <Text className={styles.addBtnText}>+</Text>
      </View>
    </View>
  );
};

export default ReviewPage;
