import React from 'react';
import { View, Text } from '@tarojs/components';
import styles from './index.module.scss';
import classNames from 'classnames';

interface ProgressBarProps {
  percent: number;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'success' | 'warning' | 'accent';
  label?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  percent,
  showLabel = false,
  size = 'medium',
  color = 'primary',
  label
}) => {
  const safePercent = Math.min(Math.max(percent, 0), 100);

  return (
    <View className={classNames(styles.progressBar, styles[size])}>
      {showLabel && (
        <View className={styles.labelRow}>
          <Text className={styles.label}>{label || `${safePercent}%`}</Text>
        </View>
      )}
      <View className={styles.track}>
        <View 
          className={classNames(styles.fill, styles[color])}
          style={{ width: `${safePercent}%` }}
        />
      </View>
    </View>
  );
};

export default ProgressBar;
