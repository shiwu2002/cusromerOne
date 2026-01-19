// pages/messages/messages.js
const api = require('../../api/index');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    messageList: [],
    unreadCount: 0,
    page: 1,
    pageSize: 20,
    loading: false,
    loadingMore: false,
    noMore: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.loadMessages();
    this.loadUnreadCount();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 每次显示页面时刷新未读数量
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
      const response = await api.message.getMessages({
        page: this.data.page,
        pageSize: this.data.pageSize
      });
      const res = response.data; // 提取实际数据

      const newList = this.data.page === 1 ? res : [...this.data.messageList, ...res];
      
      this.setData({
        messageList: newList,
        noMore: res.length < this.data.pageSize
      });

      if (this.data.page === 1) {
        wx.stopPullDownRefresh();
      }
    } catch (error) {
      console.error('加载消息列表失败:', error);
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
    this.setData({
      page: this.data.page + 1,
      loadingMore: true
    });

    try {
      const response = await api.message.getMessages({
        page: this.data.page,
        pageSize: this.data.pageSize
      });
      const res = response.data; // 提取实际数据

      this.setData({
        messageList: [...this.data.messageList, ...res],
        noMore: res.length < this.data.pageSize
      });
    } catch (error) {
      console.error('加载更多消息失败:', error);
      // 加载失败时回退页码
      this.setData({
        page: this.data.page - 1
      });
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loadingMore: false });
    }
  },

  /**
   * 加载未读消息数量
   */
  async loadUnreadCount() {
    try {
      const response = await api.message.getUnreadCount();
      const res = response.data; // 提取实际数据
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
  getTypeIcon(type) {
    const iconMap = {
      'RESERVATION_CREATED': '📝',
      'RESERVATION_APPROVED': '✅',
      'RESERVATION_REJECTED': '❌',
      'RESERVATION_CANCELLED': '🚫',
      'RESERVATION_COMPLETED': '✔️',
      'SYSTEM': '🔔'
    };
    return iconMap[type] || '📬';
  },

  /**
   * 获取消息类型文本
   */
  getTypeText(type) {
    const textMap = {
      'RESERVATION_CREATED': '预约创建',
      'RESERVATION_APPROVED': '预约通过',
      'RESERVATION_REJECTED': '预约拒绝',
      'RESERVATION_CANCELLED': '预约取消',
      'RESERVATION_COMPLETED': '预约完成',
      'SYSTEM': '系统通知'
    };
    return textMap[type] || '通知';
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
  }
});
