import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classNames from 'classnames';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: string;
  color?: 'primary' | 'success' | 'warning' | 'accent';
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  unit, 
  icon, 
  color = 'primary',
  onClick 
}) => {
  return (
    <View 
      className={classNames(styles.statCard, styles[color])}
      onClick={onClick}
    >
      <View className={styles.iconArea}>
        <Text className={styles.icon}>{icon}</Text>
      </View>
      <View className={styles.content}>
        <View className={styles.valueRow}>
          <Text className={styles.value}>{value}</Text>
          {unit && <Text className={styles.unit}>{unit}</Text>}
        </View>
        <Text className={styles.title}>{title}</Text>
      </View>
    </View>
  );
};

export default StatCard;
