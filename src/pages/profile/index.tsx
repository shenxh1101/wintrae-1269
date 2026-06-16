import React, { useMemo, useState } from 'react';
import { View, Text, Image, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useApp } from '@/store/AppContext';
import { categoryLabels, BookCategory } from '@/types';
import classNames from 'classnames';
import { formatDuration, daysUntil } from '@/utils/date';
import { mockDiscussionQuestions } from '@/data';

const ProfilePage: React.FC = () => {
  const { currentChild, books, stats, children, setCurrentChild } = useApp();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const borrowedBooks = useMemo(() => {
    if (!currentChild) return [];
    return books.filter(
      b => b.childId === currentChild.id && b.status === 'borrowed'
    );
  }, [currentChild, books]);

  const categoryDistribution = useMemo(() => {
    if (!currentChild || !stats) return [];
    return stats.categoryDistribution.map(item => ({
      category: item.category as BookCategory,
      count: item.count,
      label: categoryLabels[item.category as BookCategory] || item.category
    }));
  }, [currentChild, stats]);

  const currentQuestion = useMemo(() => {
    if (mockDiscussionQuestions.length === 0) return null;
    return mockDiscussionQuestions[currentQuestionIndex % mockDiscussionQuestions.length];
  }, [currentQuestionIndex]);

  const handleSwitchChild = () => {
    const childNames = children.map(c => c.name);
    Taro.showActionSheet({
      itemList: [...childNames, '管理孩子'],
      success: (res) => {
        if (res.tapIndex < children.length) {
          setCurrentChild(children[res.tapIndex]);
        } else {
          Taro.navigateTo({ url: '/pages/child-manage/index' });
        }
      }
    });
  };

  const handleNextQuestion = () => {
    setCurrentQuestionIndex(prev => prev + 1);
  };

  const handleMenuClick = (url: string) => {
    Taro.navigateTo({ url });
  };

  if (!currentChild || !stats) {
    return (
      <View className={styles.page}>
        <View className={styles.header}>
          <View className={styles.profileCard}>
            <View className={styles.profileInfo}>
              <Text className={styles.childName}>欢迎使用</Text>
              <Text className={styles.childGrade}>开始记录阅读之旅</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  const totalBooks = stats.totalBooks;
  const finishedBooks = stats.finishedBooks;
  const streakDays = stats.streakDays;
  const totalMinutes = stats.totalMinutes;

  const weeklyGoal = stats.weeklyGoal;
  const daysProgress = weeklyGoal.targetDays > 0 
    ? Math.min(Math.round((weeklyGoal.completedDays / weeklyGoal.targetDays) * 100), 100)
    : 0;
  const minutesProgress = weeklyGoal.targetMinutes > 0
    ? Math.min(Math.round((weeklyGoal.completedMinutes / weeklyGoal.targetMinutes) * 100), 100)
    : 0;

  const maxCategoryCount = Math.max(...categoryDistribution.map(c => c.count), 1);

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <View className={styles.profileCard}>
          <Image 
            className={styles.avatar} 
            src={currentChild.avatar}
            mode="aspectFill"
          />
          <View className={styles.profileInfo}>
            <Text className={styles.childName}>{currentChild.name}</Text>
            <Text className={styles.childGrade}>
              {currentChild.grade} · {currentChild.age}岁
            </Text>
          </View>
          <Button 
            className={styles.switchBtn}
            onClick={handleSwitchChild}
          >
            切换
          </Button>
        </View>

        <View className={styles.statsOverview}>
          <View className={styles.statCard}>
            <Text className={styles.statValue}>{streakDays}</Text>
            <Text className={styles.statLabel}>连续打卡</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statValue}>{finishedBooks}</Text>
            <Text className={styles.statLabel}>读完书籍</Text>
          </View>
          <View className={styles.statCard}>
            <Text className={styles.statValue}>{totalBooks}</Text>
            <Text className={styles.statLabel}>累计藏书</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>🎯</Text>
          本周目标
        </Text>
        <View className={styles.weeklyGoal}>
          <View className={styles.goalItem}>
            <View className={styles.goalIcon}>📅</View>
            <View className={styles.goalInfo}>
              <View className={styles.goalProgress}>
                <Text className={styles.goalText}>
                  {weeklyGoal.completedDays} / {weeklyGoal.targetDays} 天
                </Text>
              </View>
              <View className={styles.progressTrack}>
                <View 
                  className={classNames(styles.progressFill, styles.primary)}
                  style={{ width: `${daysProgress}%` }}
                />
              </View>
            </View>
          </View>
          <View className={styles.goalItem}>
            <View className={styles.goalIcon}>⏱️</View>
            <View className={styles.goalInfo}>
              <View className={styles.goalProgress}>
                <Text className={styles.goalText}>
                  {weeklyGoal.completedMinutes} / {weeklyGoal.targetMinutes} 分钟
                </Text>
              </View>
              <View className={styles.progressTrack}>
                <View 
                  className={classNames(styles.progressFill, styles.success)}
                  style={{ width: `${minutesProgress}%` }}
                />
              </View>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.categorySection}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📊</Text>
          阅读类型分布
        </Text>
        <View className={styles.categoryList}>
          {categoryDistribution.map(item => (
            <View key={item.category} className={styles.categoryItem}>
              <View className={classNames(styles.categoryDot, styles[item.category])} />
              <View className={styles.categoryInfo}>
                <Text className={styles.categoryName}>{item.label}</Text>
                <Text className={styles.categoryCount}>{item.count} 本</Text>
              </View>
              <View className={styles.categoryBar}>
                <View 
                  className={classNames(styles.categoryBarFill, styles[item.category])}
                  style={{ 
                    width: `${(item.count / maxCategoryCount) * 100}%`,
                    background: item.category === 'fiction' ? '#4F7CFF' :
                               item.category === 'science' ? '#2ED573' :
                               item.category === 'history' ? '#FF9F43' :
                               item.category === 'art' ? '#FF6B6B' : '#A0AEC0'
                  }}
                />
              </View>
            </View>
          ))}
          {categoryDistribution.length === 0 && (
            <Text style={{ color: '#A0AEC0', fontSize: '24rpx', textAlign: 'center', padding: '20rpx 0' }}>
              暂无数据
            </Text>
          )}
        </View>
      </View>

      {currentQuestion && (
        <View className={styles.discussionCard}>
          <Text className={styles.discussionTitle}>💡 亲子讨论</Text>
          <Text className={styles.discussionQuestion}>
            {currentQuestion.question}
          </Text>
          <Button 
            className={styles.discussionBtn}
            onClick={handleNextQuestion}
          >
            换一个
          </Button>
        </View>
      )}

      {borrowedBooks.length > 0 && (
        <View className={styles.borrowReminder}>
          <View className={styles.reminderHeader}>
            <Text className={styles.reminderTitle}>
              <Text className={styles.sectionIcon}>📚</Text>
              借阅提醒
            </Text>
            <Text className={styles.reminderCount}>{borrowedBooks.length} 本</Text>
          </View>
          {borrowedBooks.map(book => {
            const daysLeft = book.borrowDueDate ? daysUntil(book.borrowDueDate) : 0;
            return (
              <View key={book.id} className={styles.reminderItem}>
                <Image 
                  className={styles.reminderBookCover} 
                  src={book.cover}
                  mode="aspectFill"
                />
                <View className={styles.reminderInfo}>
                  <Text className={styles.reminderBookTitle}>{book.title}</Text>
                  <Text className={styles.reminderFrom}>来源：{book.borrowedFrom}</Text>
                  <Text className={styles.reminderDue}>
                    {daysLeft > 0 ? `还剩 ${daysLeft} 天到期` : 
                     daysLeft === 0 ? '今天到期' : `已逾期 ${Math.abs(daysLeft)} 天`}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <View className={styles.menuSection}>
        <View 
          className={styles.menuItem}
          onClick={() => handleMenuClick('/pages/child-manage/index')}
        >
          <View className={styles.menuIcon}>👶</View>
          <Text className={styles.menuText}>孩子管理</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View 
          className={styles.menuItem}
          onClick={() => handleMenuClick('/pages/reward-setting/index')}
        >
          <View className={styles.menuIcon}>🎯</View>
          <Text className={styles.menuText}>目标设置</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View 
          className={styles.menuItem}
          onClick={() => Taro.showToast({ title: '数据统计', icon: 'none' })}
        >
          <View className={styles.menuIcon}>📈</View>
          <Text className={styles.menuText}>阅读报告</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
        <View 
          className={styles.menuItem}
          onClick={() => Taro.showToast({ title: '提醒设置', icon: 'none' })}
        >
          <View className={styles.menuIcon}>🔔</View>
          <Text className={styles.menuText}>阅读提醒</Text>
          <Text className={styles.menuArrow}>›</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default ProfilePage;
