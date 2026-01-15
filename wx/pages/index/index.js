// pages/index/index.js
import api from '../../api/index'

Page({
  data: {
    // 轮播图数据（暂时为空，后续可添加实际图片）
    banners: [],
    // 公告
    notice: '欢迎使用实验室预约系统，请合理安排预约时间',
    // 推荐实验室列表
    laboratories: [],
    // 未读消息数量
    unreadCount: 0,
    // 用户统计数据
    statistics: null,
    // 加载状态
    loading: false,
    // 用户信息
    userInfo: null
  },

  onLoad() {
    this.checkLoginStatus()
  },

  onShow() {
    // 每次显示页面时刷新数据
    if (this.data.userInfo) {
      this.loadPageData()
    }
  },

  /**
   * 检查登录状态
   */
  checkLoginStatus() {
    const token = wx.getStorageSync('token')
    const userInfo = wx.getStorageSync('userInfo')
    
    if (!token || !userInfo) {
      // 未登录，跳转到登录页
      wx.redirectTo({
        url: '/pages/login/login'
      })
      return
    }

    this.setData({ userInfo }, () => {
      this.loadPageData()
    })
  },

  /**
   * 加载页面数据
   */
  async loadPageData() {
    await Promise.all([
      this.loadLaboratories(),
      this.loadUnreadCount(),
      this.loadStatistics()
    ])
  },

  /**
   * 加载推荐实验室
   */
  async loadLaboratories() {
    try {
      this.setData({ loading: true })
      
      const res = await api.laboratory.getAvailableLaboratories()
      
      if (res.success && res.data) {
        // 只显示前5个推荐实验室
        const laboratories = Array.isArray(res.data) ? res.data.slice(0, 5) : []
        this.setData({ laboratories })
      }
    } catch (error) {
      console.error('加载实验室失败:', error)
      wx.showToast({
        title: '加载实验室失败',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  /**
   * 加载未读消息数量
   */
  async loadUnreadCount() {
    try {
      const res = await api.message.getUnreadCount()
      
      if (res.success && typeof res.data === 'number') {
        this.setData({ unreadCount: res.data })
        
        // 更新tabBar徽章
        if (res.data > 0) {
          wx.setTabBarBadge({
            index: 3, // 消息tab的索引
            text: res.data > 99 ? '99+' : String(res.data)
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
      const res = await api.user.getUserStatistics()
      
      if (res.success && res.data) {
        this.setData({ statistics: res.data })
      }
    } catch (error) {
      console.error('加载统计数据失败:', error)
    }
  },

  /**
   * 下拉刷新
   */
  async onPullDownRefresh() {
    await this.loadPageData()
    wx.stopPullDownRefresh()
  },

  /**
   * 导航到预约页面
   */
  navigateToReservation() {
    wx.navigateTo({
      url: '/pages/reservation/reservation'
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
