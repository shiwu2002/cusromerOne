// pages/messages/messages.js
const api = require('../../api/index');
const userApi = require('../../api/user');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    messageList: [],
    filteredMessageList: [],  // 筛选后的消息列表
    unreadCount: 0,
    page: 1,
    pageSize: 20,
    loading: false,
    loadingMore: false,
    noMore: false,
    // 标签分类
    categories: [
      { type: 'all', name: '全部消息', count: 0, icon: '📬', active: true },
      { type: 'system', name: '系统消息', count: 0, icon: '🔔', active: false },
      { type: 'reservation', name: '预约通知', count: 0, icon: '📅', active: false },
      { type: 'approval', name: '审核通知', count: 0, icon: '✅', active: false },
      { type: 'reminder', name: '提醒消息', count: 0, icon: '⏰', active: false },
      { type: 'user', name: '用户消息', count: 0, icon: '👤', active: false }
    ],
    activeCategory: 'all',  // 当前选中的分类
    hasEmptyCategory: false // 是否存在空分类
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 安全检查：确保页面正常加载，避免路由错误
    try {
      // 检查登录状态，未登录则跳转到登录页
      if (!userApi.isLoggedIn()) {
        this.redirectToLogin('请先登录');
        return;
      }
      
      this.loadMessages();
      this.loadUnreadCount();
    } catch (error) {
      console.error('页面加载出错:', error);
      // 如果出现路由错误，尝试重新加载或跳转到首页
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        });
      }, 1000);
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 每次显示页面时检查登录状态，如果token失效则跳转登录
    if (!userApi.isLoggedIn()) {
      this.redirectToLogin('请重新登录');
      return;
    }
    
    // 刷新未读数量
    this.loadUnreadCount();
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.setData({
      page: 1,
      messageList: [],
      noMore: false
    });
    this.loadMessages();
    this.loadUnreadCount();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    if (!this.data.noMore && !this.data.loadingMore) {
      this.loadMore();
    }
  },

  /**
   * 加载消息列表
   */
  async loadMessages() {
    if (this.data.loading) return;

    this.setData({ loading: true });

    try {
      let response;
      
      // 根据当前分类选择不同的API调用
      if (this.data.activeCategory === 'all') {
        // 如果是"全部"，调用通用接口
        response = await api.message.getMessages({
          page: this.data.page,
          pageSize: this.data.pageSize
        });
      } else {
        // 如果是具体分类，调用分类接口（支持分页）
        response = await api.message.getMessagesByType(
          this.data.activeCategory, 
          this.data.page, 
          this.data.pageSize
        );
      }
      
      // 根据提供的接口数据结构，success=true时返回完整响应对象
      let messageData = [];
      if (response.success) {
        // 如果接口返回完整的响应结构，直接从response.data获取消息数组
        messageData = response.data || [];
      } else {
        // 如果接口直接返回消息数组
        messageData = response || [];
      }

      const newList = this.data.page === 1 ? messageData : [...this.data.messageList, ...messageData];
      
      this.setData({
        messageList: newList,
        filteredMessageList: newList, // 直接使用完整的消息列表，不再需要前端筛选
        noMore: messageData.length < this.data.pageSize
      });

      if (this.data.page === 1) {
        wx.stopPullDownRefresh();
      }
      
      // 更新分类统计信息
      this.updateCategoryStats();
    } catch (error) {
      console.error('加载消息列表失败:', error);
      
      // 如果是认证错误，处理token失效
      if (error.code === 401 || error.statusCode === 401 ||
          (error.message && error.message.includes('Token'))) {
        this.handleAuthError(error);
        return;
      }
      
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  /**
   * 加载更多消息
   */
  async loadMore() {
    if (this.data.noMore || this.data.loadingMore) return;
    
    this.setData({ 
      loadingMore: true,
      page: this.data.page + 1 
    });

    try {
      await this.loadMessages();
    } catch (error) {
      // 如果加载失败，恢复到之前的页面
      this.setData({
        page: this.data.page - 1
      });
      console.error('加载更多消息失败:', error);
      wx.showToast({
        title: '加载更多失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loadingMore: false });
    }
  },

  /**
   * 跳转到登录页面
   */
  redirectToLogin(message = '请先登录') {
    wx.showToast({
      title: message,
      icon: 'none'
    });
    setTimeout(() => {
      wx.redirectTo({
        url: '/pages/login/login'
      });
    }, 1500);
  },

  /**
   * 处理认证错误
   */
  handleAuthError(error) {
    console.error('认证错误:', error);
    
    // 清除本地token和用户信息
    userApi.logout();
    
    // 跳转到登录页面
    this.redirectToLogin('登录已过期，请重新登录');
  },

  /**
   * 加载未读消息数量
   */
  async loadUnreadCount() {
    try {
      const response = await api.message.getUnreadCount();
      
      // 兼容API响应格式：有些接口直接返回数据对象，有些返回 {data: {...}}
      let res = response;
      if (response && response.data) {
        res = response.data;
      }
      
      this.setData({
        unreadCount: res.count || 0
      });

      // 更新tabBar徽标
      if (res.count > 0) {
        wx.setTabBarBadge({
          index: 2, // 消息tab的索引
          text: res.count > 99 ? '99+' : res.count.toString()
        });
      } else {
        wx.removeTabBarBadge({
          index: 2
        });
      }
    } catch (error) {
      console.error('加载未读数量失败:', error);
      
      // 如果是认证错误，处理token失效
      if (error.code === 401 || error.statusCode === 401 ||
          (error.message && error.message.includes('Token'))) {
        this.handleAuthError(error);
      }
    }
  },

  /**
   * 全部标记为已读
   */
  async markAllAsRead() {
    try {
      const response = await api.message.markAllAsRead();
      
      // 更新列表中所有消息的已读状态
      const updatedList = this.data.messageList.map(item => ({
        ...item,
        isRead: true
      }));

      this.setData({
        messageList: updatedList,
        unreadCount: 0
      });

      // 移除tabBar徽标
      wx.removeTabBarBadge({
        index: 2
      });

      wx.showToast({
        title: '已全部标记为已读',
        icon: 'success'
      });
    } catch (error) {
      console.error('标记全部已读失败:', error);
      wx.showToast({
        title: error.message || '操作失败',
        icon: 'none'
      });
    }
  },

  /**
   * 跳转到消息详情
   */
  async goToDetail(e) {
    const messageId = e.currentTarget.dataset.id;
    const message = this.data.messageList.find(item => item.id === messageId);

    // 如果消息未读，先标记为已读
    if (message && !message.isRead) {
      try {
        const response = await api.message.markAsRead(messageId);
        
        // 更新列表中该消息的状态
        const updatedList = this.data.messageList.map(item => {
          if (item.id === messageId) {
            return { ...item, isRead: true };
          }
          return item;
        });

        this.setData({
          messageList: updatedList,
          unreadCount: Math.max(0, this.data.unreadCount - 1)
        });

        // 更新tabBar徽标
        const newCount = this.data.unreadCount;
        if (newCount > 0) {
          wx.setTabBarBadge({
            index: 2,
            text: newCount > 99 ? '99+' : newCount.toString()
          });
        } else {
          wx.removeTabBarBadge({
            index: 2
          });
        }
      } catch (error) {
        console.error('标记已读失败:', error);
      }
    }

    // 跳转到消息详情页
    wx.navigateTo({
      url: `/pages/message-detail/message-detail?id=${messageId}`
    });
  },

  /**
   * 获取消息类型图标
   */
  getTypeIcon(messageType) {
    const iconMap = {
      'system': '🔔',     // 系统消息
      'reservation': '📅', // 预约通知
      'approval': '✅',    // 审核通知
      'reminder': '⏰',    // 提醒消息
      'user': '👤',       // 用户消息
    };
    return iconMap[messageType] || '📬'; // 默认图标
  },

  /**
   * 获取消息类型文本
   */
  getTypeText(messageType) {
    const textMap = {
      'system': '系统消息',
      'reservation': '预约通知',
      'approval': '审核通知',
      'reminder': '提醒消息',
      'user': '用户消息',
    };
    return textMap[messageType] || '通知'; // 默认文本
  },

  /**
   * 获取优先级图标
   */
  getPriorityIcon(priority) {
    const priorityMap = {
      2: '🔴', // 高优先级
      1: '🟡', // 中优先级  
      0: '🟢'  // 低优先级
    };
    return priorityMap[priority] || '🔵'; // 默认
  },

  /**
   * 根据优先级获取样式类名
   */
  getPriorityClass(priority) {
    const classMap = {
      2: 'high',
      1: 'medium',  
      0: 'low'
    };
    return classMap[priority] || 'normal';
  },

  /**
   * 格式化时间
   */
  formatTime(dateTimeStr) {
    if (!dateTimeStr) return '';

    const date = new Date(dateTimeStr);
    const now = new Date();
    const diff = now - date;

    // 1分钟内
    if (diff < 60000) {
      return '刚刚';
    }

    // 1小时内
    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}分钟前`;
    }

    // 今天
    if (date.toDateString() === now.toDateString()) {
      return `今天 ${this.padZero(date.getHours())}:${this.padZero(date.getMinutes())}`;
    }

    // 昨天
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return `昨天 ${this.padZero(date.getHours())}:${this.padZero(date.getMinutes())}`;
    }

    // 今年
    if (date.getFullYear() === now.getFullYear()) {
      return `${date.getMonth() + 1}月${date.getDate()}日 ${this.padZero(date.getHours())}:${this.padZero(date.getMinutes())}`;
    }

    // 其他
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
  },

  /**
   * 补零
   */
  padZero(num) {
    return num < 10 ? `0${num}` : num;
  },

  /**
   * 更新分类统计信息
   */
  updateCategoryStats() {
    const { messageList, categories, activeCategory } = this.data;
    
    // 计算每种类型的消息数量
    const categoryCounts = {};
    messageList.forEach(message => {
      const type = message.messageType || 'other';
      categoryCounts[type] = (categoryCounts[type] || 0) + 1;
    });
    
    // 更新分类数据和激活状态
    const updatedCategories = categories.map(category => {
      let count = 0;
      
      if (category.type === 'all') {
        count = messageList.length;
      } else {
        count = categoryCounts[category.type] || 0;
      }
      
      return {
        ...category,
        count: count,
        active: category.type === activeCategory
      };
    });
    
    // 判断是否存在空分类（当前激活的分类不为'all'且该分类的数量为0）
    const hasEmptyCategory = activeCategory !== 'all' && 
                            updatedCategories.some(c => c.type === activeCategory && c.count === 0);
    
    this.setData({
      categories: updatedCategories,
      hasEmptyCategory: hasEmptyCategory
    });
  },

  /**
   * 切换分类标签
   */
  switchCategory(e) {
    const categoryType = e.currentTarget.dataset.type;
    
    // 重置分页状态
    this.setData({
      activeCategory: categoryType,
      page: 1,
      messageList: []
    }, () => {
      // 重新加载消息列表
      this.loadMessages();
    });
  },

});
