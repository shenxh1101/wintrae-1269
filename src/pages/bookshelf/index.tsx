import React, { useState, useMemo } from 'react';
import { View, Text, Image, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useApp } from '@/store/AppContext';
import BookCard from '@/components/BookCard';
import EmptyState from '@/components/EmptyState';
import classNames from 'classnames';
import { Book } from '@/types';

type FilterType = 'all' | 'reading' | 'finished' | 'borrowed';

const BookshelfPage: React.FC = () => {
  const { currentChild, getBooksByChild, children, setCurrentChild } = useApp();
  const [filter, setFilter] = useState<FilterType>('all');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showChildSelector, setShowChildSelector] = useState(false);

  const books = useMemo(() => {
    if (!currentChild) return [];
    const allBooks = getBooksByChild(currentChild.id);
    
    switch (filter) {
      case 'reading':
        return allBooks.filter(b => b.status === 'reading');
      case 'finished':
        return allBooks.filter(b => b.status === 'finished');
      case 'borrowed':
        return allBooks.filter(b => b.status === 'borrowed');
      default:
        return allBooks;
    }
  }, [currentChild, filter, getBooksByChild]);

  const stats = useMemo(() => {
    if (!currentChild) return { total: 0, reading: 0, finished: 0 };
    const allBooks = getBooksByChild(currentChild.id);
    return {
      total: allBooks.length,
      reading: allBooks.filter(b => b.status === 'reading').length,
      finished: allBooks.filter(b => b.status === 'finished').length
    };
  }, [currentChild, getBooksByChild]);

  const filterTabs = [
    { key: 'all' as FilterType, label: '全部' },
    { key: 'reading' as FilterType, label: '阅读中' },
    { key: 'finished' as FilterType, label: '已读完' },
    { key: 'borrowed' as FilterType, label: '借阅中' }
  ];

  const handleBookClick = (book: Book) => {
    Taro.navigateTo({
      url: `/pages/book-detail/index?id=${book.id}`
    });
  };

  const handleAddBook = (type: 'scan' | 'manual') => {
    setShowAddMenu(false);
    if (type === 'scan') {
      Taro.scanCode({
        success: (res) => {
          Taro.navigateTo({
            url: `/pages/add-book/index?isbn=${res.result}`
          });
        },
        fail: () => {
          Taro.showToast({
            title: '扫码失败',
            icon: 'none'
          });
        }
      });
    } else {
      Taro.navigateTo({
        url: '/pages/add-book/index'
      });
    }
  };

  const handleSwitchChild = () => {
    setShowChildSelector(true);
  };

  const handleSelectChild = (childId: string) => {
    const child = children.find(c => c.id === childId);
    if (child) {
      setCurrentChild(child);
      setShowChildSelector(false);
    }
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

  if (!currentChild) {
    return (
      <View className={styles.page}>
        <EmptyState 
          icon="👶"
          title="还没有添加孩子"
          description="请先添加孩子信息，开始记录阅读之旅"
          actionText="添加孩子"
          onAction={() => Taro.navigateTo({ url: '/pages/child-manage/index' })}
        />
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className={styles.header}>
        <View className={styles.childSelector}>
          <Image 
            className={styles.childAvatar} 
            src={currentChild.avatar}
            mode="aspectFill"
          />
          <View className={styles.childInfo}>
            <Text className={styles.childName}>{currentChild.name}</Text>
            <Text className={styles.childGrade}>{currentChild.grade} · {currentChild.age}岁</Text>
          </View>
          <Button 
            className={styles.switchBtn}
            onClick={handleSwitchChild}
          >
            切换
          </Button>
        </View>

        <View className={styles.statsRow}>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{stats.total}</Text>
            <Text className={styles.statLabel}>全部书籍</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{stats.reading}</Text>
            <Text className={styles.statLabel}>阅读中</Text>
          </View>
          <View className={styles.statItem}>
            <Text className={styles.statValue}>{stats.finished}</Text>
            <Text className={styles.statLabel}>已读完</Text>
          </View>
        </View>
      </View>

      <View className={styles.filterSection}>
        <View className={styles.filterTabs}>
          {filterTabs.map(tab => (
            <View
              key={tab.key}
              className={classNames(styles.filterTab, filter === tab.key && styles.active)}
              onClick={() => setFilter(tab.key)}
            >
              <Text className={styles.filterTabText}>{tab.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView scrollY className={styles.booksSection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            {filterTabs.find(t => t.key === filter)?.label}
          </Text>
          <Text className={styles.bookCount}>共 {books.length} 本</Text>
        </View>

        {books.length > 0 ? (
          <View className={styles.booksGrid}>
            {books.map(book => (
              <BookCard 
                key={book.id} 
                book={book} 
                size="medium"
                onClick={handleBookClick}
              />
            ))}
          </View>
        ) : (
          <View className={styles.emptyWrapper}>
            <EmptyState
              icon="📚"
              title="暂无书籍"
              description="点击右下角按钮添加你的第一本书"
            />
          </View>
        )}
      </ScrollView>

      <View 
        className={styles.addBtn}
        onClick={() => setShowAddMenu(true)}
      >
        <Text className={styles.addBtnText}>+</Text>
      </View>

      {showAddMenu && (
        <>
          <View className={styles.mask} onClick={() => setShowAddMenu(false)} />
          <View className={styles.addMenu}>
            <View 
              className={styles.addMenuItem}
              onClick={() => handleAddBook('scan')}
            >
              <Text className={styles.addMenuIcon}>📷</Text>
              <Text className={styles.addMenuText}>扫码添加</Text>
            </View>
            <View 
              className={styles.addMenuItem}
              onClick={() => handleAddBook('manual')}
            >
              <Text className={styles.addMenuIcon}>✏️</Text>
              <Text className={styles.addMenuText}>手动添加</Text>
            </View>
          </View>
        </>
      )}

      {showChildSelector && (
        <>
          <View className={styles.mask} onClick={() => setShowChildSelector(false)} />
          <View className={styles.addMenu}>
            {children.map(child => (
              <View 
                key={child.id}
                className={styles.addMenuItem}
                onClick={() => handleSelectChild(child.id)}
              >
                <Image 
                  src={child.avatar} 
                  className={styles.childAvatar}
                  style={{ width: 48, height: 48 }}
                  mode="aspectFill"
                />
                <Text className={styles.addMenuText}>{child.name}</Text>
              </View>
            ))}
            <View 
              className={styles.addMenuItem}
              onClick={() => {
                setShowChildSelector(false);
                Taro.navigateTo({ url: '/pages/child-manage/index' });
              }}
            >
              <Text className={styles.addMenuIcon}>➕</Text>
              <Text className={styles.addMenuText}>添加孩子</Text>
            </View>
          </View>
        </>
      )}
    </View>
  );
};

export default BookshelfPage;
