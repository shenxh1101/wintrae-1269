import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, Button, Input, Textarea, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';
import { useApp } from '@/store/AppContext';
import { Book } from '@/types';
import classNames from 'classnames';

const ReadingPage: React.FC = () => {
  const { currentChild, getBooksByChild, addReadingRecord } = useApp();
  
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showBookPicker, setShowBookPicker] = useState(false);
  
  const [isReading, setIsReading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  
  const [startPage, setStartPage] = useState('');
  const [endPage, setEndPage] = useState('');
  
  const [sentences, setSentences] = useState<string[]>([]);
  const [showSentenceModal, setShowSentenceModal] = useState(false);
  const [sentenceInput, setSentenceInput] = useState('');
  
  const [words, setWords] = useState<{ word: string; meaning?: string }[]>([]);
  const [showWordModal, setShowWordModal] = useState(false);
  const [wordInput, setWordInput] = useState('');
  const [meaningInput, setMeaningInput] = useState('');
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const readingBooks = currentChild 
    ? getBooksByChild(currentChild.id).filter(b => b.status === 'reading')
    : [];

  useEffect(() => {
    if (readingBooks.length > 0 && !selectedBook) {
      setSelectedBook(readingBooks[0]);
      setStartPage(String(readingBooks[0].currentPage));
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    };
  }, [readingBooks]);

  const startReading = () => {
    if (!selectedBook) {
      Taro.showToast({ title: '请先选择书籍', icon: 'none' });
      return;
    }
    setIsReading(true);
    setIsPaused(false);
    timerRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
  };

  const pauseReading = () => {
    setIsPaused(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const resumeReading = () => {
    setIsPaused(false);
    timerRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
  };

  const stopReading = () => {
    setIsReading(false);
    setIsPaused(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
    setStartPage(String(book.currentPage));
    setShowBookPicker(false);
  };

  const addSentence = () => {
    if (!sentenceInput.trim()) return;
    setSentences(prev => [...prev, sentenceInput.trim()]);
    setSentenceInput('');
    setShowSentenceModal(false);
  };

  const removeSentence = (index: number) => {
    setSentences(prev => prev.filter((_, i) => i !== index));
  };

  const addWord = () => {
    if (!wordInput.trim()) return;
    setWords(prev => [...prev, { word: wordInput.trim(), meaning: meaningInput.trim() || undefined }]);
    setWordInput('');
    setMeaningInput('');
    setShowWordModal(false);
  };

  const removeWord = (index: number) => {
    setWords(prev => prev.filter((_, i) => i !== index));
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }
      Taro.showToast({ title: '录音已保存', icon: 'success' });
    } else {
      setIsRecording(true);
      setRecordDuration(0);
      recordTimerRef.current = setInterval(() => {
        setRecordDuration(prev => prev + 1);
      }, 1000);
    }
  };

  const handleSubmit = () => {
    if (!selectedBook) {
      Taro.showToast({ title: '请选择书籍', icon: 'none' });
      return;
    }
    if (duration === 0) {
      Taro.showToast({ title: '阅读时长不能为0', icon: 'none' });
      return;
    }
    if (!endPage) {
      Taro.showToast({ title: '请填写结束页码', icon: 'none' });
      return;
    }

    const startPageNum = parseInt(startPage) || selectedBook.currentPage;
    const endPageNum = parseInt(endPage);

    if (endPageNum < startPageNum) {
      Taro.showToast({ title: '结束页码不能小于起始页码', icon: 'none' });
      return;
    }

    addReadingRecord({
      bookId: selectedBook.id,
      childId: currentChild!.id,
      date: new Date().toISOString().split('T')[0],
      duration: Math.floor(duration / 60),
      startPage: startPageNum,
      endPage: endPageNum,
      favoriteSentences: sentences,
      difficultWords: words
    });

    Taro.showToast({ title: '打卡成功！', icon: 'success' });
    
    setDuration(0);
    setStartPage(String(endPageNum));
    setEndPage('');
    setSentences([]);
    setWords([]);
    setIsRecording(false);
    setRecordDuration(0);
  };

  const durationMinutes = Math.floor(duration / 60);

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.bookSelector}>
        <Text className={styles.selectorLabel}>选择阅读书籍</Text>
        {selectedBook ? (
          <View className={styles.selectedBook} onClick={() => setShowBookPicker(true)}>
            <Image 
              className={styles.selectedBookCover} 
              src={selectedBook.cover} 
              mode="aspectFill"
            />
            <View className={styles.selectedBookInfo}>
              <Text className={styles.selectedBookTitle}>{selectedBook.title}</Text>
              <Text className={styles.selectedBookProgress}>
                当前第 {selectedBook.currentPage} / {selectedBook.totalPages} 页
              </Text>
            </View>
            <Text className={styles.selectBookBtn}>切换</Text>
          </View>
        ) : (
          <Button 
            className={styles.selectBookBtn}
            onClick={() => setShowBookPicker(true)}
          >
            📚  选择正在阅读的书籍
          </Button>
        )}
      </View>

      <View className={styles.timerSection}>
        <View className={styles.timerCircle}>
          <View className={styles.timerInnerCircle}>
            <Text className={styles.timerText}>{formatTime(duration)}</Text>
            <Text className={styles.timerLabel}>
              {isReading ? (isPaused ? '已暂停' : '阅读中') : '准备阅读'}
            </Text>
          </View>
        </View>

        <View className={styles.timerControls}>
          {!isReading ? (
            <Button 
              className={classNames(styles.timerBtn, styles.primary)}
              onClick={startReading}
            >
              ▶
            </Button>
          ) : (
            <>
              {isPaused ? (
                <Button 
                  className={classNames(styles.timerBtn, styles.primary)}
                  onClick={resumeReading}
                >
                  ▶
                </Button>
              ) : (
                <Button 
                  className={classNames(styles.timerBtn, styles.secondary)}
                  onClick={pauseReading}
                >
                  ⏸
                </Button>
              )}
              <Button 
                className={classNames(styles.timerBtn, styles.accent)}
                onClick={stopReading}
              >
                ■
              </Button>
            </>
          )}
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>📖</Text>
            阅读页码
          </Text>
        </View>
        <View className={styles.pageInput}>
          <Text className={styles.pageInputLabel}>起始页</Text>
          <Input
            className={styles.pageInputField}
            type="number"
            value={startPage}
            onInput={(e) => setStartPage(e.detail.value)}
            placeholder="起始页码"
          />
        </View>
        <View className={styles.pageInput}>
          <Text className={styles.pageInputLabel}>结束页</Text>
          <Input
            className={styles.pageInputField}
            type="number"
            value={endPage}
            onInput={(e) => setEndPage(e.detail.value)}
            placeholder="结束页码"
          />
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>🎤</Text>
            朗读录音
          </Text>
        </View>
        <View className={styles.audioRecorder}>
          <Button
            className={classNames(styles.recordBtn, isRecording && styles.recording)}
            onClick={toggleRecording}
          >
            {isRecording ? '停止' : '录音'}
          </Button>
          <View className={styles.recordInfo}>
            <Text className={styles.recordStatus}>
              {isRecording ? '正在录音...' : '点击开始朗读录音'}
            </Text>
            {recordDuration > 0 && (
              <Text className={styles.recordDuration}>
                {formatTime(recordDuration)}
              </Text>
            )}
          </View>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>💬</Text>
            喜欢的句子
          </Text>
          <Button 
            className={styles.addBtn}
            onClick={() => setShowSentenceModal(true)}
          >
            + 添加
          </Button>
        </View>
        {sentences.length > 0 ? (
          <View className={styles.sentencesList}>
            {sentences.map((sentence, index) => (
              <View key={index} className={styles.sentenceItem}>
                <Text className={styles.sentenceText}>"{sentence}"</Text>
                <View 
                  className={styles.sentenceDelete}
                  onClick={() => removeSentence(index)}
                >
                  ×
                </View>
              </View>
            ))}
          </View>
        ) : (
          <Text className={styles.emptyReading}>还没有添加句子，记录下打动你的句子吧~</Text>
        )}
      </View>

      <View className={styles.section}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>
            <Text className={styles.sectionIcon}>📝</Text>
            难懂的词语
          </Text>
          <Button 
            className={styles.addBtn}
            onClick={() => setShowWordModal(true)}
          >
            + 添加
          </Button>
        </View>
        {words.length > 0 ? (
          <View className={styles.wordsList}>
            {words.map((item, index) => (
              <View key={index} className={styles.wordItem}>
                <Text className={styles.wordText}>{item.word}</Text>
                {item.meaning && <Text className={styles.wordText}>({item.meaning})</Text>}
                <Text 
                  className={styles.wordDelete}
                  onClick={() => removeWord(index)}
                >
                  ×
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text className={styles.emptyReading}>遇到不懂的词语？记下来一起学习~</Text>
        )}
      </View>

      <View style={{ height: '200rpx' }} />

      <View className={styles.submitSection}>
        <Button 
          className={styles.submitBtn}
          onClick={handleSubmit}
        >
          完成打卡 ({durationMinutes}分钟)
        </Button>
      </View>

      {showBookPicker && (
        <View className={styles.modal} onClick={() => setShowBookPicker(false)}>
          <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <Text className={styles.modalTitle}>选择阅读书籍</Text>
            <ScrollView scrollY style={{ maxHeight: '400rpx' }}>
              {readingBooks.length > 0 ? (
                readingBooks.map(book => (
                  <View 
                    key={book.id}
                    className={styles.selectedBook}
                    style={{ marginBottom: '16rpx' }}
                    onClick={() => handleSelectBook(book)}
                  >
                    <Image 
                      className={styles.selectedBookCover} 
                      src={book.cover} 
                      mode="aspectFill"
                    />
                    <View className={styles.selectedBookInfo}>
                      <Text className={styles.selectedBookTitle}>{book.title}</Text>
                      <Text className={styles.selectedBookProgress}>
                        第 {book.currentPage} / {book.totalPages} 页
                      </Text>
                    </View>
                    {selectedBook?.id === book.id && <Text>✓</Text>}
                  </View>
                ))
              ) : (
                <Text className={styles.emptyReading}>
                  还没有正在阅读的书籍，请先到书架添加
                </Text>
              )}
            </ScrollView>
            <View className={styles.modalActions}>
              <Button 
                className={classNames(styles.modalBtn, styles.cancel)}
                onClick={() => setShowBookPicker(false)}
              >
                取消
              </Button>
            </View>
          </View>
        </View>
      )}

      {showSentenceModal && (
        <View className={styles.modal} onClick={() => setShowSentenceModal(false)}>
          <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <Text className={styles.modalTitle}>添加喜欢的句子</Text>
            <Textarea
              className={styles.modalInput}
              value={sentenceInput}
              onInput={(e) => setSentenceInput(e.detail.value)}
              placeholder="记录下打动你的句子..."
              maxlength={200}
            />
            <View className={styles.modalActions}>
              <Button 
                className={classNames(styles.modalBtn, styles.cancel)}
                onClick={() => setShowSentenceModal(false)}
              >
                取消
              </Button>
              <Button 
                className={classNames(styles.modalBtn, styles.confirm)}
                onClick={addSentence}
              >
                添加
              </Button>
            </View>
          </View>
        </View>
      )}

      {showWordModal && (
        <View className={styles.modal} onClick={() => setShowWordModal(false)}>
          <View className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <Text className={styles.modalTitle}>添加难懂的词语</Text>
            <Input
              className={styles.pageInputField}
              style={{ marginBottom: '16rpx', height: '72rpx' }}
              value={wordInput}
              onInput={(e) => setWordInput(e.detail.value)}
              placeholder="词语"
            />
            <Input
              className={styles.pageInputField}
              style={{ marginBottom: '24rpx', height: '72rpx' }}
              value={meaningInput}
              onInput={(e) => setMeaningInput(e.detail.value)}
              placeholder="释义（选填）"
            />
            <View className={styles.modalActions}>
              <Button 
                className={classNames(styles.modalBtn, styles.cancel)}
                onClick={() => setShowWordModal(false)}
              >
                取消
              </Button>
              <Button 
                className={classNames(styles.modalBtn, styles.confirm)}
                onClick={addWord}
              >
                添加
              </Button>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default ReadingPage;
