import { Child, Book, ReadingRecord, Review, RewardTask, ReadingStats } from '@/types';

export const mockChildren: Child[] = [
  {
    id: 'child_1',
    name: '小明',
    avatar: 'https://picsum.photos/id/64/200/200',
    grade: '三年级',
    age: 9
  },
  {
    id: 'child_2',
    name: '小红',
    avatar: 'https://picsum.photos/id/91/200/200',
    grade: '一年级',
    age: 7
  }
];

export const mockBooks: Book[] = [
  {
    id: 'book_1',
    title: '小王子',
    author: '圣埃克苏佩里',
    cover: 'https://picsum.photos/id/1015/300/400',
    category: 'fiction',
    totalPages: 120,
    currentPage: 68,
    status: 'reading',
    isbn: '9787020042494',
    publisher: '人民文学出版社',
    description: '这是一本足以让人永葆童心的不朽经典，被全球亿万读者誉为最值得收藏的书。',
    childId: 'child_1',
    addedAt: '2024-01-15T00:00:00.000Z'
  },
  {
    id: 'book_2',
    title: '夏洛的网',
    author: 'E.B.怀特',
    cover: 'https://picsum.photos/id/1018/300/400',
    category: 'fiction',
    totalPages: 184,
    currentPage: 184,
    status: 'finished',
    isbn: '9787532767386',
    publisher: '上海译文出版社',
    description: '一只小猪和一只蜘蛛的友谊，讲述生命、友情和爱的故事。',
    childId: 'child_1',
    addedAt: '2024-01-10T00:00:00.000Z',
    finishedAt: '2024-01-25T00:00:00.000Z'
  },
  {
    id: 'book_3',
    title: '十万个为什么',
    author: '米·伊林',
    cover: 'https://picsum.photos/id/201/300/400',
    category: 'science',
    totalPages: 256,
    currentPage: 45,
    status: 'reading',
    isbn: '9787532489091',
    publisher: '少年儿童出版社',
    description: '科普经典，激发孩子对科学的好奇心和探索欲。',
    childId: 'child_1',
    addedAt: '2024-02-01T00:00:00.000Z'
  },
  {
    id: 'book_4',
    title: '中华上下五千年',
    author: '林汉达',
    cover: 'https://picsum.photos/id/1039/300/400',
    category: 'history',
    totalPages: 320,
    currentPage: 120,
    status: 'reading',
    isbn: '9787530213150',
    publisher: '北京出版社',
    description: '讲述中华五千年历史文明，让孩子了解中国历史。',
    childId: 'child_1',
    addedAt: '2024-01-20T00:00:00.000Z'
  },
  {
    id: 'book_5',
    title: '爷爷一定有办法',
    author: '菲比·吉尔曼',
    cover: 'https://picsum.photos/id/1044/300/400',
    category: 'art',
    totalPages: 32,
    currentPage: 32,
    status: 'finished',
    isbn: '9787533273462',
    publisher: '明天出版社',
    description: '一个充满智慧和爱的故事，讲述祖孙之间的深厚情感。',
    childId: 'child_2',
    addedAt: '2024-02-05T00:00:00.000Z',
    finishedAt: '2024-02-10T00:00:00.000Z'
  },
  {
    id: 'book_6',
    title: '猜猜我有多爱你',
    author: '山姆·麦克布雷尼',
    cover: 'https://picsum.photos/id/1025/300/400',
    category: 'art',
    totalPages: 28,
    currentPage: 15,
    status: 'borrowed',
    isbn: '9787533276286',
    publisher: '明天出版社',
    description: '一大一小两只兔子的对话，表达了最纯真的爱。',
    borrowedFrom: '市图书馆',
    borrowDueDate: '2024-02-28T00:00:00.000Z',
    childId: 'child_2',
    addedAt: '2024-02-12T00:00:00.000Z'
  },
  {
    id: 'book_7',
    title: '草房子',
    author: '曹文轩',
    cover: 'https://picsum.photos/id/1036/300/400',
    category: 'fiction',
    totalPages: 280,
    currentPage: 0,
    status: 'reading',
    isbn: '9787534678178',
    publisher: '江苏少年儿童出版社',
    description: '讲述了男孩桑桑刻骨铭心、终身难忘的六年小学生活。',
    childId: 'child_1',
    addedAt: '2024-02-15T00:00:00.000Z'
  },
  {
    id: 'book_8',
    title: '神奇校车',
    author: '乔安娜·柯尔',
    cover: 'https://picsum.photos/id/237/300/400',
    category: 'science',
    totalPages: 96,
    currentPage: 96,
    status: 'finished',
    isbn: '9787221143839',
    publisher: '贵州人民出版社',
    description: '最受孩子欢迎的科普绘本，跟着卷毛老师探索科学的奥秘。',
    childId: 'child_2',
    addedAt: '2024-01-25T00:00:00.000Z',
    finishedAt: '2024-02-05T00:00:00.000Z'
  }
];

export const mockReadingRecords: ReadingRecord[] = [
  {
    id: 'record_1',
    bookId: 'book_1',
    childId: 'child_1',
    date: '2024-02-20',
    duration: 30,
    startPage: 45,
    endPage: 68,
    favoriteSentences: ['所有的大人都曾经是小孩，虽然，只有少数的人记得。', '真正重要的东西，眼睛是看不见的。'],
    difficultWords: [
      { word: '驯服', meaning: '使顺从' },
      { word: '仪式感', meaning: '使某一天与其他日子不同' }
    ],
    notes: '今天读到小王子遇到狐狸的部分，很有感触。'
  },
  {
    id: 'record_2',
    bookId: 'book_1',
    childId: 'child_1',
    date: '2024-02-19',
    duration: 25,
    startPage: 25,
    endPage: 45,
    favoriteSentences: ['只有用心才能看得清，实质性的东西，用眼睛是看不见的。'],
    difficultWords: [
      { word: '忧郁', meaning: '忧伤愁闷' }
    ]
  },
  {
    id: 'record_3',
    bookId: 'book_3',
    childId: 'child_1',
    date: '2024-02-20',
    duration: 20,
    startPage: 30,
    endPage: 45,
    favoriteSentences: ['科学的奥秘等待着我们去探索。'],
    difficultWords: [
      { word: '原子', meaning: '构成物质的最小粒子' },
      { word: '分子', meaning: '由原子组成的粒子' }
    ]
  },
  {
    id: 'record_4',
    bookId: 'book_4',
    childId: 'child_1',
    date: '2024-02-19',
    duration: 35,
    startPage: 100,
    endPage: 120,
    favoriteSentences: ['历史是一面镜子，照见过去，也照见未来。'],
    difficultWords: [
      { word: '诸侯', meaning: '古代分封的列国君主' },
      { word: '烽火', meaning: '古代报警的烟火' }
    ]
  },
  {
    id: 'record_5',
    bookId: 'book_6',
    childId: 'child_2',
    date: '2024-02-20',
    duration: 15,
    startPage: 1,
    endPage: 15,
    favoriteSentences: ['我爱你，一直到月亮那里，再从月亮上回到这里来。'],
    difficultWords: []
  }
];

export const mockReviews: Review[] = [
  {
    id: 'review_1',
    bookId: 'book_2',
    childId: 'child_1',
    title: '友谊的力量',
    content: '夏洛的网让我很感动，夏洛为了救威尔伯，用自己的丝织出了神奇的字。朋友之间应该互相帮助，夏洛是一个真正的好朋友。',
    rating: 5,
    createdAt: '2024-01-26T00:00:00.000Z',
    updatedAt: '2024-01-26T00:00:00.000Z'
  },
  {
    id: 'review_2',
    bookId: 'book_1',
    childId: 'child_1',
    title: '小王子的思考',
    content: '小王子是一个很特别的故事，它教会我什么是真正重要的东西。我们要用心去感受生活中那些看不见的美好。',
    rating: 4,
    createdAt: '2024-02-18T00:00:00.000Z',
    updatedAt: '2024-02-18T00:00:00.000Z'
  },
  {
    id: 'review_3',
    bookId: 'book_5',
    childId: 'child_2',
    title: '爷爷好厉害',
    content: '爷爷真的好厉害！什么东西都能变成新的。我也想有一个这样的爷爷。',
    rating: 5,
    createdAt: '2024-02-11T00:00:00.000Z',
    updatedAt: '2024-02-11T00:00:00.000Z'
  }
];

export const mockRewardTasks: RewardTask[] = [
  {
    id: 'task_1',
    childId: 'child_1',
    type: 'daily_minutes',
    title: '每日阅读30分钟',
    target: 30,
    current: 30,
    reward: '获得10积分',
    rewardPoints: 10,
    period: 'daily',
    completed: true,
    claimed: false
  },
  {
    id: 'task_2',
    childId: 'child_1',
    type: 'daily_pages',
    title: '每日阅读10页',
    target: 10,
    current: 23,
    reward: '获得5积分',
    rewardPoints: 5,
    period: 'daily',
    completed: true,
    claimed: true
  },
  {
    id: 'task_3',
    childId: 'child_1',
    type: 'weekly_days',
    title: '本周阅读5天',
    target: 5,
    current: 4,
    reward: '周末看电影',
    rewardPoints: 50,
    period: 'weekly',
    completed: false,
    claimed: false
  },
  {
    id: 'task_4',
    childId: 'child_1',
    type: 'weekly_books',
    title: '本周读完1本书',
    target: 1,
    current: 0,
    reward: '获得30积分',
    rewardPoints: 30,
    period: 'weekly',
    completed: false,
    claimed: false
  },
  {
    id: 'task_5',
    childId: 'child_2',
    type: 'daily_minutes',
    title: '每日阅读15分钟',
    target: 15,
    current: 15,
    reward: '获得8积分',
    rewardPoints: 8,
    period: 'daily',
    completed: true,
    claimed: false
  }
];

export const mockStats: ReadingStats = {
  childId: 'child_1',
  totalBooks: 5,
  finishedBooks: 2,
  totalMinutes: 360,
  streakDays: 7,
  currentWeekDays: 4,
  categoryDistribution: [
    { category: 'fiction', count: 3 },
    { category: 'science', count: 1 },
    { category: 'history', count: 1 }
  ],
  weeklyGoal: {
    targetDays: 5,
    completedDays: 4,
    targetMinutes: 150,
    completedMinutes: 110
  }
};

export const mockDiscussionQuestions = [
  { id: 'q1', bookId: 'book_1', question: '你觉得小王子为什么要离开他的星球？', category: '思考' },
  { id: 'q2', bookId: 'book_1', question: '什么是"驯服"？你有被驯服或者驯服过什么吗？', category: '情感' },
  { id: 'q3', bookId: 'book_1', question: '为什么说"真正重要的东西，眼睛是看不见的"？', category: '哲理' },
  { id: 'q4', bookId: 'book_2', question: '夏洛为什么要帮助威尔伯？', category: '友情' },
  { id: 'q5', bookId: 'book_2', question: '你认为真正的友谊是什么样的？', category: '思考' }
];
