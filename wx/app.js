// app.js
const api = require('./api/index')
const request = require('./utils/request')

App({
  // 全局数据
  globalData: {
    userInfo: null,
    token: null,
    unreadCount: 0,
    baseUrl: 'https://your-api-domain.com/api' // 请替换为实际的API域名
  },

  // 应用启动
  onLaunch() {
    console.log('小程序启动')
    
    // 检查更新
    this.checkUpdate()
    
    // 初始化应用设置
    this.initSettings()
    
    // 检查登录状态
    this.checkLoginStatus()
  },

  // 应用显示
  onShow() {
    console.log('小程序显示')
    
    // 如果已登录，更新未读消息数
    if (this.globalData.token) {
      this.updateUnreadCount()
    }
  },

  // 应用隐藏
  onHide() {
    console.log('小程序隐藏')
  },

  // 检查更新
  checkUpdate() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      
      updateManager.onCheckForUpdate((res) => {
        console.log('检查更新:', res.hasUpdate)
      })
      
      updateManager.onUpdateReady(() => {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success: (res) => {
            if (res.confirm) {
              updateManager.applyUpdate()
            }
          }
        })
      })
      
      updateManager.onUpdateFailed(() => {
        console.error('新版本下载失败')
      })
    }
  },

  // 初始化应用设置
  initSettings() {
    try {
      const settings = wx.getStorageSync('app_settings')
      if (!settings) {
        // 设置默认配置
        const defaultSettings = {
          messageNotification: true,
          soundReminder: true,
          vibrationReminder: true,
          showReservationHistory: true,
          showContactInfo: false
        }
        wx.setStorageSync('app_settings', defaultSettings)
      }
    } catch (error) {
      console.error('初始化设置失败:', error)
    }
  },

  // 检查登录状态
  checkLoginStatus() {
    try {
      const token = request.getToken()
      const userInfo = wx.getStorageSync('userInfo')
      
      if (token && userInfo) {
        this.globalData.token = token
        this.globalData.userInfo = userInfo
        console.log('已登录:', userInfo.username)
        
        // 更新未读消息数
        this.updateUnreadCount()
      } else {
        console.log('未登录')
      }
    } catch (error) {
      console.error('检查登录状态失败:', error)
    }
  },

  // 更新未读消息数
  async updateUnreadCount() {
    try {
      const result = await api.message.getUnreadCount()
      this.globalData.unreadCount = result.count || 0
      
      // 更新tabBar徽标
      this.updateTabBarBadge()
    } catch (error) {
      console.error('更新未读消息数失败:', error)
    }
  },

  // 更新tabBar徽标
  updateTabBarBadge() {
    const count = this.globalData.unreadCount
    
    if (count > 0) {
      wx.setTabBarBadge({
        index: 2, // 消息tab的索引
        text: count > 99 ? '99+' : count.toString()
      })
    } else {
      wx.removeTabBarBadge({
        index: 2
      })
    }
  },

  // 设置用户信息
  setUserInfo(userInfo) {
    this.globalData.userInfo = userInfo
    try {
      wx.setStorageSync('userInfo', userInfo)
    } catch (error) {
      console.error('保存用户信息失败:', error)
    }
  },

  // 设置token
  setToken(token) {
    this.globalData.token = token
    try {
      request.setToken(token)
    } catch (error) {
      console.error('保存token失败:', error)
    }
  },

  // 清除登录信息
  clearLoginInfo() {
    this.globalData.userInfo = null
    this.globalData.token = null
    this.globalData.unreadCount = 0
    
    try {
      request.removeToken()
      wx.removeStorageSync('userInfo')
      wx.removeTabBarBadge({ index: 2 })
    } catch (error) {
      console.error('清除登录信息失败:', error)
    }
  },

  // 检查是否登录
  checkAuth() {
    const token = this.globalData.token || request.getToken()
    if (!token) {
      wx.showModal({
        title: '提示',
        content: '您还未登录，是否前往登录？',
        success: (res) => {
          if (res.confirm) {
            wx.redirectTo({
              url: '/pages/login/login'
            })
          }
        }
      })
      return false
    }
    return true
  },

  // 格式化日期时间
  formatDateTime(date) {
    if (!date) return ''
    
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hour = String(d.getHours()).padStart(2, '0')
    const minute = String(d.getMinutes()).padStart(2, '0')
    
    return `${year}-${month}-${day} ${hour}:${minute}`
  },

  // 格式化日期
  formatDate(date) {
    if (!date) return ''
    
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    
    return `${year}-${month}-${day}`
  },

  // 格式化时间
  formatTime(date) {
    if (!date) return ''
    
    const d = new Date(date)
    const hour = String(d.getHours()).padStart(2, '0')
    const minute = String(d.getMinutes()).padStart(2, '0')
    
    return `${hour}:${minute}`
  },

  // 获取相对时间
  getRelativeTime(date) {
    if (!date) return ''
    
    const now = new Date()
    const target = new Date(date)
    const diff = now - target
    
    const minute = 60 * 1000
    const hour = 60 * minute
    const day = 24 * hour
    
    if (diff < minute) {
      return '刚刚'
    } else if (diff < hour) {
      return Math.floor(diff / minute) + '分钟前'
    } else if (diff < day) {
      return Math.floor(diff / hour) + '小时前'
    } else if (diff < 7 * day) {
      return Math.floor(diff / day) + '天前'
    } else {
      return this.formatDate(date)
    }
  },

  // 显示加载提示
  showLoading(title = '加载中...') {
    wx.showLoading({
      title,
      mask: true
    })
  },

  // 隐藏加载提示
  hideLoading() {
    wx.hideLoading()
  },

  // 显示成功提示
  showSuccess(title = '操作成功') {
    wx.showToast({
      title,
      icon: 'success',
      duration: 2000
    })
  },

  // 显示错误提示
  showError(title = '操作失败') {
    wx.showToast({
      title,
      icon: 'error',
      duration: 2000
    })
  },

  // 显示普通提示
  showToast(title) {
    wx.showToast({
      title,
      icon: 'none',
      duration: 2000
    })
  },

  // 确认对话框
  showConfirm(options = {}) {
    return new Promise((resolve) => {
      wx.showModal({
        title: options.title || '提示',
        content: options.content || '',
        confirmText: options.confirmText || '确定',
        cancelText: options.cancelText || '取消',
        confirmColor: options.confirmColor || '#576b95',
        success: (res) => {
          resolve(res.confirm)
        }
      })
    })
  }
})
