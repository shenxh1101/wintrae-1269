import React, { useState } from 'react';
import { View, Text, Button, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

const RewardSettingPage: React.FC = () => {
  const [dailyMinutes, setDailyMinutes] = useState(30);
  const [dailyPages, setDailyPages] = useState(10);
  const [weeklyDays, setWeeklyDays] = useState(5);
  const [weeklyBooks, setWeeklyBooks] = useState(1);
  const [dailyReward, setDailyReward] = useState('获得10积分');
  const [weeklyReward, setWeeklyReward] = useState('周末看电影');

  const handleSave = () => {
    Taro.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => {
      Taro.navigateBack();
    }, 1500);
  };

  const handleMinus = (setter: (value: number) => void, current: number, min: number = 1) => {
    if (current > min) {
      setter(current - 1);
    }
  };

  const handlePlus = (setter: (value: number) => void, current: number, max: number = 999) => {
    if (current < max) {
      setter(current + 1);
    }
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>📅</Text>
          每日目标
        </Text>
        
        <View className={styles.settingItem}>
          <Text className={styles.settingLabel}>阅读时长</Text>
          <View className={styles.settingValue}>
            <View className={styles.counter}>
              <Button 
                className={styles.counterBtn}
                onClick={() => handleMinus(setDailyMinutes, dailyMinutes, 5)}
              >
                -
              </Button>
              <Text className={styles.counterValue}>{dailyMinutes}</Text>
              <Button 
                className={styles.counterBtn}
                onClick={() => handlePlus(setDailyMinutes, dailyMinutes, 180)}
              >
                +
              </Button>
            </View>
            <Text className={styles.unit}>分钟</Text>
          </View>
        </View>

        <View className={styles.settingItem}>
          <Text className={styles.settingLabel}>阅读页数</Text>
          <View className={styles.settingValue}>
            <View className={styles.counter}>
              <Button 
                className={styles.counterBtn}
                onClick={() => handleMinus(setDailyPages, dailyPages, 1)}
              >
                -
              </Button>
              <Text className={styles.counterValue}>{dailyPages}</Text>
              <Button 
                className={styles.counterBtn}
                onClick={() => handlePlus(setDailyPages, dailyPages, 100)}
              >
                +
              </Button>
            </View>
            <Text className={styles.unit}>页</Text>
          </View>
        </View>

        <View className={styles.rewardSection}>
          <Text className={styles.settingLabel}>每日奖励</Text>
          <Input
            className={styles.rewardInput}
            value={dailyReward}
            onInput={(e) => setDailyReward(e.detail.value)}
            placeholder="完成目标后的奖励"
          />
          <Text className={styles.tip}>完成每日目标可获得的奖励</Text>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>🏆</Text>
          每周目标
        </Text>
        
        <View className={styles.settingItem}>
          <Text className={styles.settingLabel}>阅读天数</Text>
          <View className={styles.settingValue}>
            <View className={styles.counter}>
              <Button 
                className={styles.counterBtn}
                onClick={() => handleMinus(setWeeklyDays, weeklyDays, 1)}
              >
                -
              </Button>
              <Text className={styles.counterValue}>{weeklyDays}</Text>
              <Button 
                className={styles.counterBtn}
                onClick={() => handlePlus(setWeeklyDays, weeklyDays, 7)}
              >
                +
              </Button>
            </View>
            <Text className={styles.unit}>天</Text>
          </View>
        </View>

        <View className={styles.settingItem}>
          <Text className={styles.settingLabel}>读完书籍</Text>
          <View className={styles.settingValue}>
            <View className={styles.counter}>
              <Button 
                className={styles.counterBtn}
                onClick={() => handleMinus(setWeeklyBooks, weeklyBooks, 1)}
              >
                -
              </Button>
              <Text className={styles.counterValue}>{weeklyBooks}</Text>
              <Button 
                className={styles.counterBtn}
                onClick={() => handlePlus(setWeeklyBooks, weeklyBooks, 10)}
              >
                +
              </Button>
            </View>
            <Text className={styles.unit}>本</Text>
          </View>
        </View>

        <View className={styles.rewardSection}>
          <Text className={styles.settingLabel}>每周奖励</Text>
          <Input
            className={styles.rewardInput}
            value={weeklyReward}
            onInput={(e) => setWeeklyReward(e.detail.value)}
            placeholder="完成周目标后的奖励"
          />
          <Text className={styles.tip}>完成每周目标可获得的特别奖励</Text>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitle}>
          <Text className={styles.sectionIcon}>🔔</Text>
          阅读提醒
        </Text>
        
        <View className={styles.settingItem}>
          <Text className={styles.settingLabel}>每日提醒</Text>
          <View className={styles.settingValue}>
            <Text className={styles.valueText}>20:00</Text>
          </View>
        </View>

        <View className={styles.settingItem}>
          <Text className={styles.settingLabel}>借阅到期提醒</Text>
          <View className={styles.settingValue}>
            <Text className={styles.valueText}>提前3天</Text>
          </View>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <Button 
          className={styles.saveBtn}
          onClick={handleSave}
        >
          保存设置
        </Button>
      </View>
    </ScrollView>
  );
};

export default RewardSettingPage;
