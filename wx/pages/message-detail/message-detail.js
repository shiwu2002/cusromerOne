// pages/message-detail/message-detail.js
const api = require('../../api/index');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    messageId: null,
    messageDetail: {},
    reservationDetail: {},
    showActions: false,
    primaryActionText: '',
    secondaryActionText: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (options.id) {
      this.setData({ messageId: options.id });
      this.loadMessageDetail();
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.loadMessageDetail();
  },

  /**
   * 加载消息详情
   */
  async loadMessageDetail() {
    if (!this.data.messageId) return;

    wx.showLoading({ title: '加载中...' });

    try {
      const response = await api.message.getMessageById(this.data.messageId);
      const res = response.data; // 提取实际数据
      this.setData({
        messageDetail: res
      });

      // 如果消息关联了预约，加载预约详情
      if (res.reservationId) {
        await this.loadReservationDetail(res.reservationId);
      }

      // 根据消息类型设置操作按钮
      this.setupActions();

      wx.stopPullDownRefresh();
    } catch (error) {
      console.error('加载消息详情失败:', error);
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  /**
   * 加载预约详情
   */
  async loadReservationDetail(reservationId) {
    try {
      const response = await api.reservation.getReservationById(reservationId);
      const res = response.data; // 提取实际数据
      this.setData({
        reservationDetail: res
      });
    } catch (error) {
      console.error('加载预约详情失败:', error);
    }
  },

  /**
   * 设置操作按钮
   */
  setupActions() {
    const { type, reservationId } = this.data.messageDetail;
    const { status } = this.data.reservationDetail;

    let showActions = false;
    let primaryActionText = '';
    let secondaryActionText = '';

    // 根据消息类型和预约状态设置按钮
    if (reservationId && status) {
      switch (type) {
        case 'RESERVATION_CREATED':
          if (status === 'PENDING') {
            showActions = true;
            primaryActionText = '查看预约详情';
          }
          break;
        case 'RESERVATION_APPROVED':
          showActions = true;
          primaryActionText = '查看预约详情';
          if (status === 'APPROVED') {
            secondaryActionText = '取消预约';
          }
          break;
        case 'RESERVATION_REJECTED':
          showActions = true;
          primaryActionText = '重新预约';
          secondaryActionText = '查看详情';
          break;
        case 'RESERVATION_CANCELLED':
        case 'RESERVATION_COMPLETED':
          showActions = true;
          primaryActionText = '查看详情';
          break;
      }
    }

    this.setData({
      showActions,
      primaryActionText,
      secondaryActionText
    });
  },

  /**
   * 主要操作
   */
  handlePrimaryAction() {
    const { type, reservationId } = this.data.messageDetail;
    const { laboratoryId } = this.data.reservationDetail;

    switch (type) {
      case 'RESERVATION_REJECTED':
        // 重新预约 - 跳转到预约页面
        if (laboratoryId) {
          wx.redirectTo({
            url: `/pages/reservation/reservation?laboratoryId=${laboratoryId}`
          });
        }
        break;
      default:
        // 查看预约详情
        if (reservationId) {
          wx.navigateTo({
            url: `/pages/reservation-detail/reservation-detail?id=${reservationId}`
          });
        }
        break;
    }
  },

  /**
   * 次要操作
   */
  handleSecondaryAction() {
    const { type, reservationId } = this.data.messageDetail;

    switch (type) {
      case 'RESERVATION_APPROVED':
        // 取消预约
        this.cancelReservation();
        break;
      case 'RESERVATION_REJECTED':
        // 查看详情
        if (reservationId) {
          wx.navigateTo({
            url: `/pages/reservation-detail/reservation-detail?id=${reservationId}`
          });
        }
        break;
    }
  },

  /**
   * 取消预约
   */
  cancelReservation() {
    const { reservationId } = this.data.messageDetail;
    
    wx.showModal({
      title: '确认取消',
      content: '确定要取消这个预约吗？',
      confirmColor: '#07c160',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '取消中...' });
            const response = await api.reservation.cancelReservation(reservationId);
            wx.hideLoading();
            
            wx.showToast({
              title: '取消成功',
              icon: 'success'
            });

            // 刷新页面数据
            setTimeout(() => {
              this.loadMessageDetail();
            }, 1500);
          } catch (error) {
            wx.hideLoading();
            console.error('取消预约失败:', error);
            wx.showToast({
              title: error.message || '取消失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  /**
   * 跳转到预约详情
   */
  goToReservation() {
    const reservationId = this.data.messageDetail.reservationId;
    if (reservationId) {
      wx.navigateTo({
        url: `/pages/reservation-detail/reservation-detail?id=${reservationId}`
      });
    }
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
   * 获取预约状态文本
   */
  getStatusText(status) {
    const statusMap = {
      'PENDING': '待审核',
      'APPROVED': '已通过',
      'REJECTED': '已拒绝',
      'CANCELLED': '已取消',
      'COMPLETED': '已完成'
    };
    return statusMap[status] || status;
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
