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

      // 如果不是全部，添加状态筛选（转换为后端需要的数字状态码）
      if (this.data.currentTab !== 'all') {
        const statusMap = {
          'PENDING': 0,
          'APPROVED': 1,
          'REJECTED': 2,
          'CANCELLED': 3,
          'COMPLETED': 4
        };
        // 只有当映射存在时才添加筛选，避免传递undefined
        if (statusMap[this.data.currentTab] !== undefined) {
          params.status = statusMap[this.data.currentTab];
        }
      }

      const response = await api.reservation.getMyReservations(params);
      
      // 修复：处理不同的响应结构 (数组 vs 分页对象)
      let res = [];
      if (Array.isArray(response.data)) {
        res = response.data;
      } else if (response.data && (Array.isArray(response.data.records) || Array.isArray(response.data.list))) {
        res = response.data.records || response.data.list;
      } else if (response.data && typeof response.data === 'object') {
          // 兼容单条对象返回的情况（虽然不太可能是列表接口，但为了稳健）
          res = [response.data];
      } else {
        console.warn('Load reservations unexpected data format:', response.data);
        res = [];
      }

      // 格式化数据以匹配 WXML 视图层绑定
      const formattedList = res.map(item => {
        // 状态码转换：数字 -> 字符串枚举
        const statusEnumMap = {
          0: 'PENDING',
          1: 'APPROVED',
          2: 'REJECTED',
          3: 'CANCELLED',
          4: 'COMPLETED'
        };
        
        // 解析时间段字符串 "08:00-10:00"
        let startTime = '';
        let endTime = '';
        if (item.timeSlot && typeof item.timeSlot === 'string' && item.timeSlot.includes('-')) {
          [startTime, endTime] = item.timeSlot.split('-');
        }

        // 数据字段映射
        return {
          ...item,
          id: item.id,
          // 转换状态码，默认为 PENDING
          status: statusEnumMap[item.status] || 'PENDING',
          
          // 适配 laboratory 对象结构
          laboratory: {
            name: item.labName || '',
            location: item.labLocation || '' // API可能未返回 location
          },
          
          // 适配日期字段名 reserveDate -> reservationDate
          reservationDate: this.formatDate(item.reserveDate || item.reservationDate),
          
          // 适配时间段对象结构
          timeslot: {
            startTime: startTime,
            endTime: endTime
          },
          
          // 适配人数字段 peopleNum -> numberOfPeople
          numberOfPeople: item.peopleNum || item.numberOfPeople,
          
          // 适配目的字段
          purpose: item.purpose,
          
          // 适配拒绝原因 (优先使用 rejectReason，没有则尝试 cancelReason)
          rejectionReason: item.rejectReason || item.cancelReason,
          
          // 格式化创建时间 createTime -> createdAt
          createdAt: this.formatDateTime(item.createTime || item.createdAt)
        };
      });

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
