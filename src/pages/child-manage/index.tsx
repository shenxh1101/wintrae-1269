import React, { useState } from 'react';
import { View, Text, Image, Button, Input, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useApp } from '@/store/AppContext';
import classNames from 'classnames';

const grades = [
  '幼儿园小班', '幼儿园中班', '幼儿园大班',
  '一年级', '二年级', '三年级',
  '四年级', '五年级', '六年级'
];

const ChildManagePage: React.FC = () => {
  const { children, currentChild, setCurrentChild } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [childName, setChildName] = useState('');
  const [childAge, setChildAge] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');

  const handleSwitchChild = (childId: string) => {
    const child = children.find(c => c.id === childId);
    if (child) {
      setCurrentChild(child);
      Taro.showToast({ title: '已切换', icon: 'success' });
    }
  };

  const handleAddChild = () => {
    if (!childName.trim()) {
      Taro.showToast({ title: '请输入孩子姓名', icon: 'none' });
      return;
    }
    if (!selectedGrade) {
      Taro.showToast({ title: '请选择年级', icon: 'none' });
      return;
    }

    Taro.showToast({ title: '添加成功', icon: 'success' });
    setShowAddModal(false);
    setChildName('');
    setChildAge('');
    setSelectedGrade('');
  };

  const handleEditChild = (childId: string) => {
    Taro.showToast({ title: '编辑功能开发中', icon: 'none' });
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <Text className={styles.tip}>点击卡片可切换当前孩子</Text>
      
      <View className={styles.childList}>
        {children.map(child => (
          <View 
            key={child.id}
            className={classNames(styles.childCard, currentChild?.id === child.id && styles.active)}
            onClick={() => handleSwitchChild(child.id)}
          >
            <Image 
              className={styles.childAvatar} 
              src={child.avatar}
              mode="aspectFill"
            />
            <View className={styles.childInfo}>
              <Text className={styles.childName}>
                {child.name}
                {currentChild?.id === child.id && (
                  <Text className={styles.childBadge}>当前</Text>
                )}
              </Text>
              <Text className={styles.childDesc}>
                {child.grade} · {child.age}岁
              </Text>
            </View>
            <Button 
              className={styles.childAction}
              onClick={(e) => {
                e.stopPropagation();
                handleEditChild(child.id);
              }}
            >
              编辑
            </Button>
          </View>
        ))}

        <Button 
          className={styles.addChildBtn}
          onClick={() => setShowAddModal(true)}
        >
          <Text className={styles.addChildIcon}>+</Text>
          添加孩子
        </Button>
      </View>

      {showAddModal && (
        <View className={styles.modal} onClick={() => setShowAddModal(false)}>
          <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <Text className={styles.modalTitle}>添加孩子</Text>
            
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>姓名 *</Text>
              <Input
                className={styles.formInput}
                value={childName}
                onInput={(e) => setChildName(e.detail.value)}
                placeholder="请输入孩子姓名"
                maxlength={10}
              />
            </View>

            <View className={styles.formItem}>
              <Text className={styles.formLabel}>年龄</Text>
              <Input
                className={styles.formInput}
                type="number"
                value={childAge}
                onInput={(e) => setChildAge(e.detail.value)}
                placeholder="请输入年龄"
              />
            </View>

            <View className={styles.formItem}>
              <Text className={styles.formLabel}>年级 *</Text>
              <View className={styles.gradeOptions}>
                {grades.map(grade => (
                  <View
                    key={grade}
                    className={classNames(styles.gradeOption, selectedGrade === grade && styles.active)}
                    onClick={() => setSelectedGrade(grade)}
                  >
                    {grade}
                  </View>
                ))}
              </View>
            </View>

            <View className={styles.modalActions}>
              <Button 
                className={classNames(styles.modalBtn, styles.cancel)}
                onClick={() => setShowAddModal(false)}
              >
                取消
              </Button>
              <Button 
                className={classNames(styles.modalBtn, styles.confirm)}
                onClick={handleAddChild}
              >
                确定
              </Button>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default ChildManagePage;
