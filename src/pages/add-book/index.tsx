import React, { useState } from 'react';
import { View, Text, Button, Input, Textarea, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { useApp } from '@/store/AppContext';
import { BookCategory, categoryLabels } from '@/types';
import classNames from 'classnames';

const AddBookPage: React.FC = () => {
  const router = useRouter();
  const { currentChild, addBook } = useApp();
  const isbnParam = router.params.isbn;

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [totalPages, setTotalPages] = useState('');
  const [category, setCategory] = useState<BookCategory>('fiction');
  const [status, setStatus] = useState<'reading' | 'borrowed'>('reading');
  const [description, setDescription] = useState('');
  const [borrowedFrom, setBorrowedFrom] = useState('');
  const [borrowDueDate, setBorrowDueDate] = useState('');

  const categories: { key: BookCategory; label: string; icon: string }[] = [
    { key: 'fiction', label: '文学小说', icon: '📖' },
    { key: 'science', label: '科普百科', icon: '🔬' },
    { key: 'history', label: '历史人文', icon: '🏛️' },
    { key: 'art', label: '艺术绘本', icon: '🎨' },
    { key: 'other', label: '其他', icon: '📚' }
  ];

  const handleScan = () => {
    Taro.scanCode({
      success: (res) => {
        Taro.showToast({
          title: '已获取ISBN',
          icon: 'success'
        });
      },
      fail: () => {
        Taro.showToast({
          title: '扫码失败',
          icon: 'none'
        });
      }
    });
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      Taro.showToast({ title: '请输入书名', icon: 'none' });
      return;
    }
    if (!author.trim()) {
      Taro.showToast({ title: '请输入作者', icon: 'none' });
      return;
    }
    if (!totalPages || parseInt(totalPages) <= 0) {
      Taro.showToast({ title: '请输入总页数', icon: 'none' });
      return;
    }
    if (!currentChild) {
      Taro.showToast({ title: '请先选择孩子', icon: 'none' });
      return;
    }

    addBook({
      title: title.trim(),
      author: author.trim(),
      cover: `https://picsum.photos/id/${Math.floor(Math.random() * 100) + 1000}/300/400`,
      category,
      totalPages: parseInt(totalPages),
      currentPage: 0,
      status,
      description: description.trim() || undefined,
      borrowedFrom: status === 'borrowed' ? borrowedFrom.trim() || undefined : undefined,
      borrowDueDate: status === 'borrowed' ? borrowDueDate || undefined : undefined,
      childId: currentChild.id
    });

    Taro.showToast({ title: '添加成功', icon: 'success' });
    setTimeout(() => {
      Taro.navigateBack();
    }, 1500);
  };

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.scanSection} onClick={handleScan}>
        <Text className={styles.scanIcon}>📷</Text>
        <View className={styles.scanText}>
          <Text className={styles.scanTitle}>扫码添加</Text>
          <Text className={styles.scanDesc}>扫描书籍条码，自动获取书籍信息</Text>
        </View>
        <Text className={styles.scanArrow}>›</Text>
      </View>

      <View className={styles.formSection}>
        <Text className={styles.formTitle}>书籍信息</Text>
        
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>书名 *</Text>
          <Input
            className={styles.formInput}
            value={title}
            onInput={(e) => setTitle(e.detail.value)}
            placeholder="请输入书名"
            maxlength={50}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>作者 *</Text>
          <Input
            className={styles.formInput}
            value={author}
            onInput={(e) => setAuthor(e.detail.value)}
            placeholder="请输入作者"
            maxlength={30}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>总页数 *</Text>
          <Input
            className={styles.formInput}
            type="number"
            value={totalPages}
            onInput={(e) => setTotalPages(e.detail.value)}
            placeholder="请输入总页数"
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>分类</Text>
          <View className={styles.categoryGrid}>
            {categories.map(cat => (
              <View
                key={cat.key}
                className={classNames(styles.categoryItem, category === cat.key && styles.active)}
                onClick={() => setCategory(cat.key)}
              >
                <Text className={styles.categoryIcon}>{cat.icon}</Text>
                <Text className={styles.categoryName}>{cat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>阅读状态</Text>
          <View className={styles.statusSelector}>
            <View
              className={classNames(styles.statusOption, status === 'reading' && styles.active)}
              onClick={() => setStatus('reading')}
            >
              正在阅读
            </View>
            <View
              className={classNames(styles.statusOption, status === 'borrowed' && styles.active)}
              onClick={() => setStatus('borrowed')}
            >
              借阅书籍
            </View>
          </View>
        </View>

        {status === 'borrowed' && (
          <View className={styles.borrowInfo}>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>借阅来源</Text>
              <Input
                className={styles.formInput}
                value={borrowedFrom}
                onInput={(e) => setBorrowedFrom(e.detail.value)}
                placeholder="如图书馆、朋友等"
                maxlength={20}
              />
            </View>
            <View className={styles.formItem}>
              <Text className={styles.formLabel}>归还日期</Text>
              <Input
                className={styles.formInput}
                type="date"
                value={borrowDueDate}
                onInput={(e) => setBorrowDueDate(e.detail.value)}
                placeholder="请选择归还日期"
              />
            </View>
          </View>
        )}

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>内容简介</Text>
          <Textarea
            className={styles.formTextarea}
            value={description}
            onInput={(e) => setDescription(e.detail.value)}
            placeholder="书籍的简单介绍（选填）"
            maxlength={200}
          />
        </View>
      </View>

      <View className={styles.bottomBar}>
        <Button 
          className={styles.submitBtn}
          onClick={handleSubmit}
        >
          添加书籍
        </Button>
      </View>
    </ScrollView>
  );
};

export default AddBookPage;
