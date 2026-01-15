// pages/settings/settings.js
const app = getApp()
const api = require('../../api/index')

Page({
  data: {
    // 设置项状态
    settings: {
      messageNotification: true,
      soundReminder: true,
      vibrationReminder: true,
      showReservationHistory: true,
      showContactInfo: false
    },
    
    // 缓存信息
    cacheSize: '0 KB',
    
    // 应用版本
    appVersion: '1.0.0',
    
    // 弹窗显示状态
    showAboutDialog: false,
    showFeedbackDialog: false,
    
    // 反馈表单
    feedbackForm: {
      type: 'bug',
      content: '',
      contact: ''
    },
    
    // 反馈类型选项
    feedbackTypes: [
      { value: 'bug', label: 'Bug反馈' },
      { value: 'feature', label: '功能建议' },
      { value: 'other', label: '其他' }
    ]
  },

  onLoad() {
    this.loadSettings()
    this.calculateCacheSize()
  },

  onShow() {
    // 每次显示页面时重新加载设置
    this.loadSettings()
  },

  // 加载设置
  loadSettings() {
    try {
      const settings = wx.getStorageSync('app_settings')
      if (settings) {
        this.setData({ settings })
      }
    } catch (error) {
      console.error('加载设置失败:', error)
    }
  },

  // 保存设置
  saveSettings() {
    try {
      wx.setStorageSync('app_settings', this.data.settings)
    } catch (error) {
      console.error('保存设置失败:', error)
      wx.showToast({
        title: '保存失败',
        icon: 'error'
      })
    }
  },

  // 通用开关切换处理
  onSwitchChange(e) {
    const { key } = e.currentTarget.dataset
    const value = e.detail.value
    
    this.setData({
      [`settings.${key}`]: value
    }, () => {
      this.saveSettings()
    })
    
    // 特殊处理：消息通知关闭时，同时关闭声音和震动
    if (key === 'messageNotification' && !value) {
      this.setData({
        'settings.soundReminder': false,
        'settings.vibrationReminder': false
      }, () => {
        this.saveSettings()
      })
    }
  },

  // 计算缓存大小
  calculateCacheSize() {
    try {
      const res = wx.getStorageInfoSync()
      const sizeKB = res.currentSize
      let sizeStr = ''
      
      if (sizeKB < 1024) {
        sizeStr = sizeKB.toFixed(2) + ' KB'
      } else {
        sizeStr = (sizeKB / 1024).toFixed(2) + ' MB'
      }
      
      this.setData({ cacheSize: sizeStr })
    } catch (error) {
      console.error('计算缓存大小失败:', error)
    }
  },

  // 清除缓存
  clearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除所有缓存吗？这不会影响您的登录状态和个人设置。',
      confirmText: '清除',
      confirmColor: '#ff4444',
      success: (res) => {
        if (res.confirm) {
          this.doClearCache()
        }
      }
    })
  },

  doClearCache() {
    wx.showLoading({ title: '清除中...' })
    
    try {
      // 获取需要保留的数据
      const token = wx.getStorageSync('token')
      const userInfo = wx.getStorageSync('userInfo')
      const settings = wx.getStorageSync('app_settings')
      
      // 清除所有缓存
      wx.clearStorageSync()
      
      // 恢复需要保留的数据
      if (token) wx.setStorageSync('token', token)
      if (userInfo) wx.setStorageSync('userInfo', userInfo)
      if (settings) wx.setStorageSync('app_settings', settings)
      
      wx.hideLoading()
      wx.showToast({
        title: '清除成功',
        icon: 'success'
      })
      
      // 重新计算缓存大小
      setTimeout(() => {
        this.calculateCacheSize()
      }, 500)
    } catch (error) {
      wx.hideLoading()
      console.error('清除缓存失败:', error)
      wx.showToast({
        title: '清除失败',
        icon: 'error'
      })
    }
  },

  // 检查更新
  checkUpdate() {
    wx.showLoading({ title: '检查中...' })
    
    // 模拟检查更新
    setTimeout(() => {
      wx.hideLoading()
      
      if (wx.getUpdateManager) {
        const updateManager = wx.getUpdateManager()
        
        updateManager.onCheckForUpdate((res) => {
          if (res.hasUpdate) {
            wx.showModal({
              title: '发现新版本',
              content: '发现新版本，是否立即更新？',
              confirmText: '更新',
              success: (res) => {
                if (res.confirm) {
                  updateManager.onUpdateReady(() => {
                    wx.showModal({
                      title: '更新提示',
                      content: '新版本已准备好，是否重启应用？',
                      success: (res) => {
                        if (res.confirm) {
                          updateManager.applyUpdate()
                        }
                      }
                    })
                  })
                  
                  updateManager.onUpdateFailed(() => {
                    wx.showModal({
                      title: '更新失败',
                      content: '新版本下载失败，请删除当前小程序后重新搜索打开',
                      showCancel: false
                    })
                  })
                }
              }
            })
          } else {
            wx.showToast({
              title: '已是最新版本',
              icon: 'success'
            })
          }
        })
        
        updateManager.onUpdateFailed(() => {
          wx.showToast({
            title: '检查更新失败',
            icon: 'error'
          })
        })
      } else {
        wx.showToast({
          title: '已是最新版本',
          icon: 'success'
        })
      }
    }, 1000)
  },

  // 显示关于我们弹窗
  showAbout() {
    this.setData({ showAboutDialog: true })
  },

  // 关闭关于我们弹窗
  closeAbout() {
    this.setData({ showAboutDialog: false })
  },

  // 查看隐私政策
  viewPrivacy() {
    wx.showModal({
      title: '隐私政策',
      content: '隐私政策内容将在此展示...',
      showCancel: false
    })
  },

  // 查看服务条款
  viewTerms() {
    wx.showModal({
      title: '服务条款',
      content: '服务条款内容将在此展示...',
      showCancel: false
    })
  },

  // 显示意见反馈弹窗
  showFeedback() {
    this.setData({ 
      showFeedbackDialog: true,
      feedbackForm: {
        type: 'bug',
        content: '',
        contact: ''
      }
    })
  },

  // 关闭意见反馈弹窗
  closeFeedback() {
    this.setData({ showFeedbackDialog: false })
  },

  // 选择反馈类型
  onFeedbackTypeChange(e) {
    this.setData({
      'feedbackForm.type': e.detail.value
    })
  },

  // 输入反馈内容
  onFeedbackContentInput(e) {
    this.setData({
      'feedbackForm.content': e.detail.value
    })
  },

  // 输入联系方式
  onContactInput(e) {
    this.setData({
      'feedbackForm.contact': e.detail.value
    })
  },

  // 提交反馈
  async submitFeedback() {
    const { type, content, contact } = this.data.feedbackForm
    
    if (!content.trim()) {
      wx.showToast({
        title: '请输入反馈内容',
        icon: 'none'
      })
      return
    }
    
    if (content.length > 500) {
      wx.showToast({
        title: '反馈内容不能超过500字',
        icon: 'none'
      })
      return
    }
    
    try {
      wx.showLoading({ title: '提交中...' })
      
      // 这里应该调用实际的反馈提交API
      // 由于接口文档中没有反馈相关的API，这里使用模拟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      wx.hideLoading()
      wx.showToast({
        title: '提交成功',
        icon: 'success'
      })
      
      this.closeFeedback()
      
      // 记录反馈到本地
      console.log('用户反馈:', { type, content, contact, time: new Date() })
    } catch (error) {
      wx.hideLoading()
      console.error('提交反馈失败:', error)
      wx.showToast({
        title: '提交失败',
        icon: 'error'
      })
    }
  },

  // 注销账号
  deleteAccount() {
    wx.showModal({
      title: '注销账号',
      content: '注销账号后，您的所有数据将被永久删除，且无法恢复。确定要注销吗？',
      confirmText: '确定注销',
      confirmColor: '#ff4444',
      success: (res) => {
        if (res.confirm) {
          this.confirmDeleteAccount()
        }
      }
    })
  },

  confirmDeleteAccount() {
    wx.showModal({
      title: '最后确认',
      content: '这是您最后一次机会。注销后，账号和所有相关数据将被永久删除。',
      confirmText: '我已明白',
      confirmColor: '#ff4444',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '注销中...' })
            
            await api.user.deleteAccount()
            
            wx.hideLoading()
            
            // 清除所有本地数据
            wx.clearStorageSync()
            
            wx.showToast({
              title: '注销成功',
              icon: 'success',
              duration: 2000
            })
            
            // 延迟跳转到登录页
            setTimeout(() => {
              wx.reLaunch({
                url: '/pages/login/login'
              })
            }, 2000)
          } catch (error) {
            wx.hideLoading()
            console.error('注销账号失败:', error)
            wx.showToast({
              title: error.message || '注销失败',
              icon: 'error'
            })
          }
        }
      }
    })
  },

  // 阻止弹窗冒泡
  stopPropagation() {
    return false
  }
})
