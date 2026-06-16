import React, { useState, useMemo } from 'react';
import { View, Text, Image, Button, Input, Textarea, ScrollView } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import styles from './index.module.scss';
import { useApp } from '@/store/AppContext';
import classNames from 'classnames';
import { formatDate } from '@/utils/date';

const ReviewEditPage: React.FC = () => {
  const router = useRouter();
  const { currentChild, books, reviews, addReview } = useApp();
  
  const mode = router.params.mode || 'create';
  const reviewId = router.params.id;
  const bookIdParam = router.params.bookId;

  const existingReview = useMemo(() => {
    if (mode === 'view' && reviewId) {
      return reviews.find(r => r.id === reviewId);
    }
    return null;
  }, [mode, reviewId, reviews]);

  const childBooks = useMemo(() => {
    if (!currentChild) return [];
    return books.filter(b => b.childId === currentChild.id);
  }, [currentChild, books]);

  const [selectedBookId, setSelectedBookId] = useState(
    bookIdParam || (childBooks.length > 0 ? childBooks[0].id : '')
  );
  const [title, setTitle] = useState(existingReview?.title || '');
  const [content, setContent] = useState(existingReview?.content || '');
  const [rating, setRating] = useState(existingReview?.rating || 4);
  const [showBookPicker, setShowBookPicker] = useState(false);

  const selectedBook = useMemo(() => {
    return books.find(b => b.id === selectedBookId);
  }, [books, selectedBookId]);

  const ratingLabels = ['', '很差', '一般', '还行', '推荐', '力荐'];

  const handleSelectBook = (bookId: string) => {
    setSelectedBookId(bookId);
    setShowBookPicker(false);
  };

  const handleSubmit = () => {
    if (!selectedBookId) {
      Taro.showToast({ title: '请选择书籍', icon: 'none' });
      return;
    }
    if (!title.trim()) {
      Taro.showToast({ title: '请输入标题', icon: 'none' });
      return;
    }
    if (!content.trim()) {
      Taro.showToast({ title: '请写点感想吧', icon: 'none' });
      return;
    }
    if (!currentChild) {
      Taro.showToast({ title: '请先选择孩子', icon: 'none' });
      return;
    }

    addReview({
      bookId: selectedBookId,
      childId: currentChild.id,
      title: title.trim(),
      content: content.trim(),
      rating
    });

    Taro.showToast({ title: '保存成功', icon: 'success' });
    setTimeout(() => {
      Taro.navigateBack();
    }, 1500);
  };

  const handleEdit = () => {
    Taro.navigateTo({
      url: `/pages/review-edit/index?id=${reviewId}&mode=edit&bookId=${existingReview?.bookId}`
    });
  };

  if (mode === 'view' && existingReview) {
    const book = books.find(b => b.id === existingReview.bookId);
    return (
      <ScrollView scrollY className={classNames(styles.page, styles.viewMode)}>
        <View className={styles.bookSelector}>
          <Text className={styles.sectionTitle}>书籍</Text>
          <View className={styles.selectedBook}>
            {book && (
              <>
                <Image 
                  className={styles.bookCover} 
                  src={book.cover} 
                  mode="aspectFill"
                />
                <View className={styles.bookInfo}>
                  <Text className={styles.bookTitle}>{book.title}</Text>
                  <Text className={styles.bookAuthor}>{book.author}</Text>
                </View>
              </>
            )}
          </View>
        </View>

        <View className={styles.formSection}>
          <View className={styles.formItem}>
            <Text className={styles.formLabel}>{existingReview.title}</Text>
            <View className={styles.ratingSection} style={{ marginTop: '16rpx' }}>
              <View className={styles.stars}>
                {[1, 2, 3, 4, 5].map(star => (
                  <Text
                    key={star}
                    className={classNames(styles.star, star <= existingReview.rating ? styles.filled : styles.empty)}
                  >
                    ★
                  </Text>
                ))}
              </View>
              <Text className={styles.ratingText}>
                {formatDate(existingReview.createdAt, 'YYYY年MM月DD日')}
              </Text>
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.contentTextarea} style={{ display: 'block' }}>
              {existingReview.content}
            </Text>
          </View>
        </View>

        <View className={styles.bottomBar}>
          <Button 
            className={classNames(styles.btn, styles.primary)}
            onClick={handleEdit}
          >
            编辑
          </Button>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.bookSelector}>
        <Text className={styles.sectionTitle}>选择书籍</Text>
        <View className={styles.selectedBook} onClick={() => setShowBookPicker(true)}>
          {selectedBook ? (
            <>
              <Image 
                className={styles.bookCover} 
                src={selectedBook.cover} 
                mode="aspectFill"
              />
              <View className={styles.bookInfo}>
                <Text className={styles.bookTitle}>{selectedBook.title}</Text>
                <Text className={styles.bookAuthor}>{selectedBook.author}</Text>
              </View>
              <Text style={{ color: '#4F7CFF' }}>切换</Text>
            </>
          ) : (
            <Text style={{ color: '#A0AEC0' }}>点击选择书籍</Text>
          )}
        </View>
      </View>

      <View className={styles.formSection}>
        <View className={styles.formItem}>
          <Text className={styles.formLabel}>标题</Text>
          <Input
            className={styles.titleInput}
            value={title}
            onInput={(e) => setTitle(e.detail.value)}
            placeholder="给你的读后感起个标题"
            maxlength={30}
          />
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>评分</Text>
          <View className={styles.ratingSection}>
            <View className={styles.stars}>
              {[1, 2, 3, 4, 5].map(star => (
                <Text
                  key={star}
                  className={classNames(styles.star, star <= rating ? styles.filled : styles.empty)}
                  onClick={() => setRating(star)}
                >
                  ★
                </Text>
              ))}
            </View>
            <Text className={styles.ratingText}>{ratingLabels[rating]}</Text>
          </View>
        </View>

        <View className={styles.formItem}>
          <Text className={styles.formLabel}>读后感</Text>
          <Textarea
            className={styles.contentTextarea}
            value={content}
            onInput={(e) => setContent(e.detail.value)}
            placeholder="写下你的阅读感悟吧..."
            maxlength={500}
            autoHeight
          />
        </View>
      </View>

      <View className={styles.bottomBar}>
        <Button 
          className={classNames(styles.btn, styles.secondary)}
          onClick={() => Taro.navigateBack()}
        >
          取消
        </Button>
        <Button 
          className={classNames(styles.btn, styles.primary)}
          onClick={handleSubmit}
        >
          保存
        </Button>
      </View>

      {showBookPicker && (
        <View 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'flex-end',
            zIndex: 1000
          }}
          onClick={() => setShowBookPicker(false)}
        >
          <View 
            style={{
              width: '100%',
              maxHeight: '60vh',
              background: '#fff',
              borderRadius: '24rpx 24rpx 0 0',
              padding: '32rpx'
            }}
            onClick={e => e.stopPropagation()}
          >
            <Text style={{ fontSize: '32rpx', fontWeight: '600', marginBottom: '24rpx' }}>
              选择书籍
            </Text>
            <ScrollView scrollY style={{ maxHeight: '50vh' }}>
              {childBooks.map(book => (
                <View
                  key={book.id}
                  className={styles.selectedBook}
                  style={{ marginBottom: '16rpx' }}
                  onClick={() => handleSelectBook(book.id)}
                >
                  <Image 
                    className={styles.bookCover} 
                    src={book.cover} 
                    mode="aspectFill"
                  />
                  <View className={styles.bookInfo}>
                    <Text className={styles.bookTitle}>{book.title}</Text>
                    <Text className={styles.bookAuthor}>{book.author}</Text>
                  </View>
                  {selectedBookId === book.id && <Text style={{ color: '#4F7CFF' }}>✓</Text>}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default ReviewEditPage;
