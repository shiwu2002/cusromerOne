// pages/index/index.js
import api from '../../api/index'
const request = require('../../utils/request')

// 常量定义
const CACHE_KEY = {
  LABORATORIES: 'cache_laboratories',
  STATISTICS: 'cache_statistics',
  TIMESTAMP: 'cache_timestamp'
}
const CACHE_DURATION = 5 * 60 * 1000 // 缓存5分钟

Page({
  data: {
    // 轮播图数据
    banners: [
      { id: 1, image: '/images/shiyanshi.png', title: '实验室预约系统' },
      { id: 2, image: '/images/shiyanshiguanli.png', title: '实验室管理' }
    ],
    // 公告列表
    notices: [
      '欢迎使用实验室预约系统，请合理安排预约时间',
      '请提前15分钟到达实验室，做好实验准备',
      '实验结束后请及时清理实验台，关闭设备电源'
    ],
    // 推荐实验室列表
    laboratories: [],
    // 未读消息数量
    unreadCount: 0,
    // 用户统计数据
    statistics: null,
    // 加载状态
    loading: false,
    // 骨架屏状态
    showSkeleton: true,
    // 用户信息
    userInfo: null,
    // 刷新状态
    isRefreshing: false,
    // 上次刷新时间
    lastRefreshTime: 0
  },

  onLoad() {
    this.checkLoginStatus()
  },

  onShow() {
    // 每次显示页面时检查是否需要刷新数据
    if (this.data.userInfo) {
      const now = Date.now()
      const shouldRefresh = now - this.data.lastRefreshTime > CACHE_DURATION
      
      if (shouldRefresh) {
        this.loadPageData()
      } else {
        // 仅刷新未读消息数
        this.loadUnreadCount()
      }
    }
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus() {
    const token = request.getToken()
    const userInfo = wx.getStorageSync('userInfo')
    
    if (!token || !userInfo) {
      // 未登录，跳转到登录页
      wx.redirectTo({
        url: '/pages/login/login'
      })
      return
    }

    this.setData({ userInfo }, () => {
      // 先尝试从缓存加载数据
      this.loadFromCache()
      // 然后加载最新数据
      this.loadPageData()
    })
  },

  /**
   * 从缓存加载数据
   */
  loadFromCache() {
    try {
      const cachedLabs = wx.getStorageSync(CACHE_KEY.LABORATORIES)
      const cachedStats = wx.getStorageSync(CACHE_KEY.STATISTICS)
      const timestamp = wx.getStorageSync(CACHE_KEY.TIMESTAMP)
      
      if (cachedLabs && Date.now() - timestamp < CACHE_DURATION) {
        this.setData({
          laboratories: cachedLabs,
          statistics: cachedStats,
          showSkeleton: false
        })
      }
    } catch (error) {
      console.error('从缓存加载失败:', error)
    }
  },

  /**
   * 加载页面数据
   */
  async loadPageData() {
    this.setData({ 
      loading: true,
      lastRefreshTime: Date.now()
    })
    
    try {
      // 使用 Promise.allSettled 确保一个失败不影响其他
      const results = await Promise.allSettled([
        this.loadLaboratories(),
        this.loadUnreadCount(),
        this.loadStatistics()
      ])
      
      // 检查是否有失败的请求
      const failedRequests = results.filter(r => r.status === 'rejected')
      if (failedRequests.length > 0) {
        console.warn('部分数据加载失败:', failedRequests)
      }
    } catch (error) {
      console.error('加载页面数据失败:', error)
      this.showError('数据加载失败，请稍后重试')
    } finally {
      this.setData({ 
        loading: false,
        showSkeleton: false
      })
    }
  },

  /**
   * 加载推荐实验室
   */
  async loadLaboratories() {
    try {
      const response = await api.laboratory.getAvailableLaboratories()
      const res = response.data // 提取实际数据
      
      if (res && Array.isArray(res)) {
        // 只显示前6个推荐实验室
        const laboratories = res.slice(0, 6)
        
        // 处理数据：添加默认图片
        const processedLabs = laboratories.map(lab => ({
          ...lab,
          imageUrl: lab.imageUrl || '/images/shiyanshi.png'
        }))
        
        this.setData({ laboratories: processedLabs })
        
        // 缓存数据
        wx.setStorageSync(CACHE_KEY.LABORATORIES, processedLabs)
        wx.setStorageSync(CACHE_KEY.TIMESTAMP, Date.now())
      }
    } catch (error) {
      console.error('加载实验室失败:', error)
      throw error
    }
  },

  /**
   * 加载未读消息数量
   */
  async loadUnreadCount() {
    try {
      const response = await api.message.getUnreadCount()
      const count = response.data // 提取实际数据
      
      if (typeof count === 'number') {
        this.setData({ unreadCount: count })
        
        // 更新tabBar徽章
        if (count > 0) {
          wx.setTabBarBadge({
            index: 3, // 消息tab的索引
            text: count > 99 ? '99+' : String(count)
          })
        } else {
          wx.removeTabBarBadge({ index: 3 })
        }
      }
    } catch (error) {
      console.error('加载未读消息数量失败:', error)
    }
  },

  /**
   * 加载用户统计数据
   */
  async loadStatistics() {
    try {
      const response = await api.user.getUserStatistics()
      const res = response.data // 提取实际数据
      
      if (res) {
        this.setData({ statistics: res })
        
        // 缓存统计数据
        wx.setStorageSync(CACHE_KEY.STATISTICS, res)
      }
    } catch (error) {
      console.error('加载统计数据失败:', error)
      throw error
    }
  },

  /**
   * 下拉刷新（带防抖）
   */
  async onPullDownRefresh() {
    // 防止频繁刷新
    const now = Date.now()
    if (now - this.data.lastRefreshTime < 2000) {
      wx.stopPullDownRefresh()
      return
    }
    
    this.setData({ isRefreshing: true })
    
    try {
      await this.loadPageData()
      wx.showToast({
        title: '刷新成功',
        icon: 'success',
        duration: 1500
      })
    } catch (error) {
      wx.showToast({
        title: '刷新失败',
        icon: 'none',
        duration: 1500
      })
    } finally {
      this.setData({ isRefreshing: false })
      wx.stopPullDownRefresh()
    }
  },

  /**
   * 显示错误信息
   */
  showError(message, showRetry = true) {
    if (showRetry) {
      wx.showModal({
        title: '提示',
        content: message,
        confirmText: '重试',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            this.loadPageData()
          }
        }
      })
    } else {
      wx.showToast({
        title: message,
        icon: 'none',
        duration: 2000
      })
    }
  },

  /**
   * 导航到预约页面
   */
  navigateToReservation() {
    // 改为跳转到实验室选择页面，让用户先选择实验室
    wx.navigateTo({
      url: '/pages/lab-selection/lab-selection'
    })
  },

  /**
   * 导航到我的预约列表
   */
  navigateToMyReservations() {
    wx.switchTab({
      url: '/pages/my-reservations/my-reservations'
    })
  },

  /**
   * 导航到消息列表
   */
  navigateToMessages() {
    wx.switchTab({
      url: '/pages/messages/messages'
    })
  },

  /**
   * 导航到个人中心
   */
  navigateToProfile() {
    wx.switchTab({
      url: '/pages/profile/profile'
    })
  },

  /**
   * 导航到实验室列表
   */
  navigateToLaboratoryList() {
    wx.switchTab({
      url: '/pages/laboratory-list/laboratory-list'
    })
  },

  /**
   * 导航到实验室详情
   */
  navigateToLaboratoryDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/laboratory-detail/laboratory-detail?id=${id}`
    })
  },

  /**
   * 分享给朋友
   */
  onShareAppMessage() {
    return {
      title: '实验室预约系统',
      path: '/pages/index/index'
    }
  },

  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    return {
      title: '实验室预约系统 - 便捷高效的实验室管理',
      query: ''
    }
  }
})
