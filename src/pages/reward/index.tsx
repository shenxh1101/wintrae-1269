import React, { useState, useMemo } from 'react';
import { View, Text, Button, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useApp } from '@/store/AppContext';
import classNames from 'classnames';

interface RewardItem {
  id: string;
  name: string;
  icon: string;
  points: number;
}

const availableRewards: RewardItem[] = [
  { id: 'r1', name: '看电影', icon: '🎬', points: 50 },
  { id: 'r2', name: '买玩具', icon: '🧸', points: 100 },
  { id: 'r3', name: '吃冰淇淋', icon: '🍦', points: 30 },
  { id: 'r4', name: '去公园', icon: '🎡', points: 40 },
  { id: 'r5', name: '买图书', icon: '📖', points: 80 },
  { id: 'r6', name: '玩游戏', icon: '🎮', points: 20 }
];

const RewardPage: React.FC = () => {
  const { currentChild, rewardTasks, points, claimTask, redeemReward, redemptions } = useApp();

  const dailyTasks = useMemo(() => {
    if (!currentChild) return [];
    return rewardTasks.filter(t => t.childId === currentChild.id && t.period === 'daily');
  }, [currentChild, rewardTasks]);

  const weeklyTasks = useMemo(() => {
    if (!currentChild) return [];
    return rewardTasks.filter(t => t.childId === currentChild.id && t.period === 'weekly');
  }, [currentChild, rewardTasks]);

  const redeemedIds = useMemo(() => {
    if (!currentChild) return new Set<string>();
    return new Set(
      redemptions
        .filter(r => r.childId === currentChild.id)
        .map(r => r.rewardName + '|' + r.redeemedAt.substring(0, 10))
    );
  }, [currentChild, redemptions]);

  const isRewardRedeemed = (rewardId: string) => {
    if (!currentChild) return false;
    return redemptions.some(r => r.childId === currentChild.id && r.id === rewardId);
  };

  const handleClaimReward = (taskId: string) => {
    if (!currentChild) {
      Taro.showToast({ title: '请先选择孩子', icon: 'none' });
      return;
    }
    const success = claimTask(taskId);
    if (success) {
      const task = rewardTasks.find(t => t.id === taskId);
      if (task) {
        Taro.showToast({ 
          title: `获得 ${task.rewardPoints} 积分！`, 
          icon: 'success' 
        });
      }
    }
  };

  const handleRedeemReward = (reward: RewardItem) => {
    if (!currentChild) {
      Taro.showToast({ title: '请先选择孩子', icon: 'none' });
      return;
    }
    if (points < reward.points) {
      Taro.showToast({ title: '积分不足', icon: 'none' });
      return;
    }
    Taro.showModal({
      title: '确认兑换',
      content: `确定使用 ${reward.points} 积分兑换"${reward.name}"吗？`,
      success: (res) => {
        if (res.confirm) {
          const success = redeemReward(reward);
          if (success) {
            Taro.showToast({ title: '兑换成功！', icon: 'success' });
          } else {
            Taro.showToast({ title: '兑换失败', icon: 'none' });
          }
        }
      }
    });
  };

  const handleGoToSetting = () => {
    Taro.navigateTo({ url: '/pages/reward-setting/index' });
  };

  const renderTaskItem = (task: any) => {
    const progress = task.target > 0 
      ? Math.min(Math.round((task.current / task.target) * 100), 100) 
      : 0;

    return (
      <View key={task.id} className={styles.taskItem}>
        <View className={styles.taskIcon}>
          {task.type === 'daily_minutes' && '⏱️'}
          {task.type === 'daily_pages' && '📄'}
          {task.type === 'weekly_days' && '📅'}
          {task.type === 'weekly_books' && '📚'}
        </View>
        <View className={styles.taskInfo}>
          <Text className={styles.taskTitle}>{task.title}</Text>
          <Text className={styles.taskProgress}>
            已完成 {task.current} / {task.target}
          </Text>
          <View className={styles.progressBar}>
            <View 
              className={styles.progressFill} 
              style={{ width: `${progress}%` }}
            />
          </View>
        </View>
        <View className={styles.taskReward}>
          {task.completed && !task.claimed ? (
            <Button 
              className={styles.claimBtn}
              onClick={() => handleClaimReward(task.id)}
            >
              领取
            </Button>
          ) : task.claimed ? (
            <Text className={classNames(styles.taskStatus, styles.claimed)}>已领取</Text>
          ) : (
            <>
              <Text className={styles.rewardPoints}>+{task.rewardPoints}</Text>
              <Text className={styles.rewardLabel}>积分</Text>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.header}>
        <Text className={styles.pointsLabel}>我的积分</Text>
        <Text className={styles.pointsValue}>{points}</Text>
        <Text className={styles.pointsDesc}>坚持阅读，收获成长与奖励</Text>
        
        <View className={styles.quickActions}>
          <View 
            className={styles.quickAction}
            onClick={handleGoToSetting}
          >
            <Text className={styles.quickActionIcon}>⚙️</Text>
            <Text className={styles.quickActionText}>目标设置</Text>
          </View>
          <View 
            className={styles.quickAction}
            onClick={() => Taro.showToast({ title: `已兑换 ${redemptions.filter(r => r.childId === currentChild?.id).length} 次`, icon: 'none' })}
          >
            <Text className={styles.quickActionIcon}>📋</Text>
            <Text className={styles.quickActionText}>兑换记录</Text>
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>🌟</Text>
            每日任务
          </Text>
          <Button 
            className={styles.settingBtn}
            onClick={handleGoToSetting}
          >
            设置
          </Button>
        </View>
        {dailyTasks.length > 0 ? (
          <View className={styles.taskList}>
            {dailyTasks.map(task => renderTaskItem(task))}
          </View>
        ) : (
          <Text className={styles.emptyTask}>暂无每日任务，快去设置吧~</Text>
        )}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>🏆</Text>
            每周挑战
          </Text>
        </View>
        {weeklyTasks.length > 0 ? (
          <View className={styles.taskList}>
            {weeklyTasks.map(task => renderTaskItem(task))}
          </View>
        ) : (
          <Text className={styles.emptyTask}>暂无每周任务</Text>
        )}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>🎁</Text>
            奖励兑换
          </Text>
          <Text className={styles.sectionMore}>查看更多</Text>
        </View>
        <View className={styles.rewardsGrid}>
          {availableRewards.map(reward => {
            const redeemed = isRewardRedeemed(reward.id);
            return (
              <View
                key={reward.id}
                className={classNames(styles.rewardCard, redeemed && styles.redeemed)}
                onClick={() => handleRedeemReward(reward)}
              >
                <Text className={styles.rewardIcon}>{reward.icon}</Text>
                <Text className={styles.rewardName}>{reward.name}</Text>
                {redeemed ? (
                  <Text className={styles.redeemedBadge}>已兑换</Text>
                ) : (
                  <Text className={styles.rewardCost}>{reward.points} 积分</Text>
                )}
              </View>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
};

export default RewardPage;
