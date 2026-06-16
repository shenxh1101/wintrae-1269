import Taro from '@tarojs/taro';

const STORAGE_PREFIX = 'reading_tracker_';

export const STORAGE_KEYS = {
  CHILDREN: `${STORAGE_PREFIX}children`,
  CURRENT_CHILD_ID: `${STORAGE_PREFIX}current_child_id`,
  BOOKS: `${STORAGE_PREFIX}books`,
  READING_RECORDS: `${STORAGE_PREFIX}reading_records`,
  REVIEWS: `${STORAGE_PREFIX}reviews`,
  REWARD_TASKS: `${STORAGE_PREFIX}reward_tasks`,
  POINTS: `${STORAGE_PREFIX}points`,
  GOAL_SETTINGS: `${STORAGE_PREFIX}goal_settings`,
  REDEMPTIONS: `${STORAGE_PREFIX}redemptions`,
  IS_INITIALIZED: `${STORAGE_PREFIX}is_initialized`
} as const;

export const storage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const val = Taro.getStorageSync(key);
      if (val === '' || val === null || val === undefined) {
        return defaultValue;
      }
      return val as T;
    } catch (e) {
      console.error('[Storage] get error:', key, e);
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      Taro.setStorageSync(key, value);
    } catch (e) {
      console.error('[Storage] set error:', key, e);
    }
  },

  remove(key: string): void {
    try {
      Taro.removeStorageSync(key);
    } catch (e) {
      console.error('[Storage] remove error:', key, e);
    }
  }
};

export default storage;
