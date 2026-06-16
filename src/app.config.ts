export default defineAppConfig({
  pages: [
    'pages/bookshelf/index',
    'pages/reading/index',
    'pages/review/index',
    'pages/reward/index',
    'pages/profile/index',
    'pages/book-detail/index',
    'pages/add-book/index',
    'pages/review-edit/index',
    'pages/child-manage/index',
    'pages/reward-setting/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#4F7CFF',
    navigationBarTitleText: '悦读时光',
    navigationBarTextStyle: 'white',
    backgroundColor: '#F7F9FF'
  },
  tabBar: {
    color: '#A0AEC0',
    selectedColor: '#4F7CFF',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/bookshelf/index',
        text: '书架'
      },
      {
        pagePath: 'pages/reading/index',
        text: '打卡'
      },
      {
        pagePath: 'pages/review/index',
        text: '读后感'
      },
      {
        pagePath: 'pages/reward/index',
        text: '奖励'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的'
      }
    ]
  }
})
