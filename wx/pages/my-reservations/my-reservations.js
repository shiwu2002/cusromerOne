// pages/my-reservations/my-reservations.js
const api = require('../../api/index');

Page({
  data: {
    currentTab: 'all', // 当前选中的tab
    reservations: [], // 预约列表
    page: 1,
    pageSize: 10,
    loading: false,
    hasMore: true,
    statusMap: {
      'PENDING': '待审核',
      'APPROVED': '已通过',
      'REJECTED': '已拒绝',
      'CANCELLED': '已取消',
      'COMPLETED': '已完成'
    }
  },

  onLoad() {
    this.loadReservations();
  },

  onShow() {
    // 从详情页返回时刷新列表
    if (this.data.reservations.length > 0) {
      this.refreshReservations();
    }
  },

  onPullDownRefresh() {
    this.refreshReservations();
  },

  // 切换Tab
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.currentTab) return;

    this.setData({
      currentTab: tab,
      reservations: [],
      page: 1,
      hasMore: true
    });
    this.loadReservations();
  },

  // 加载预约列表
  async loadReservations() {
    if (this.data.loading || !this.data.hasMore) return;

    this.setData({ loading: true });

    try {
      const params = {
        page: this.data.page,
        pageSize: this.data.pageSize
      };

      // 如果不是全部，添加状态筛选
      if (this.data.currentTab !== 'all') {
        params.status = this.data.currentTab;
      }

      const response = await api.reservation.getMyReservations(params);
      const res = response.data; // 提取实际数据

      // 格式化日期时间
      const formattedList = res.map(item => ({
        ...item,
        createdAt: this.formatDateTime(item.createdAt),
        reservationDate: this.formatDate(item.reservationDate)
      }));

      this.setData({
        reservations: [...this.data.reservations, ...formattedList],
        page: this.data.page + 1,
        hasMore: res.length === this.data.pageSize,
        loading: false
      });
    } catch (error) {
      console.error('加载预约列表失败:', error);
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  // 刷新列表
  async refreshReservations() {
    this.setData({
      reservations: [],
      page: 1,
      hasMore: true
    });
    await this.loadReservations();
    wx.stopPullDownRefresh();
  },

  // 加载更多
  loadMore() {
    this.loadReservations();
  },

  // 查看详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/reservation-detail/reservation-detail?id=${id}`
    });
  },

  // 取消预约
  cancelReservation(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认取消',
      content: '确定要取消这个预约吗？',
      confirmColor: '#ff9800',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '取消中...' });
            const response = await api.reservation.cancelReservation(id);
            wx.hideLoading();
            
            wx.showToast({
              title: '取消成功',
              icon: 'success'
            });

            // 刷新列表
            this.refreshReservations();
          } catch (error) {
            wx.hideLoading();
            wx.showToast({
              title: error.message || '取消失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 完成预约
  completeReservation(e) {
    const id = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认完成',
      content: '确认已完成这个预约吗？',
      confirmColor: '#4CAF50',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '提交中...' });
            const response = await api.reservation.completeReservation(id);
            wx.hideLoading();
            
            wx.showToast({
              title: '操作成功',
              icon: 'success'
            });

            // 刷新列表
            this.refreshReservations();
          } catch (error) {
            wx.hideLoading();
            wx.showToast({
              title: error.message || '操作失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 阻止事件冒泡
  preventBubble() {
    // 空函数，用于阻止冒泡
  },

  // 格式化日期时间
  formatDateTime(datetime) {
    if (!datetime) return '';
    const date = new Date(datetime);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  },

  // 格式化日期
  formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
});
