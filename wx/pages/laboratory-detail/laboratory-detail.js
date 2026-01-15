// pages/laboratory-detail/laboratory-detail.js
const api = require('../../api/index');

Page({
  data: {
    labId: null,
    laboratory: {},
    statusColor: '',
    statusText: '',
    currentDate: '',
    currentDateText: '',
    timeslots: []
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ labId: options.id });
      this.loadLaboratoryDetail();
      this.initDate();
    } else {
      wx.showToast({
        title: '参数错误',
        icon: 'error'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  // 初始化日期为今天
  initDate() {
    const today = new Date();
    const dateStr = this.formatDate(today);
    const dateText = this.formatDateText(today);
    this.setData({
      currentDate: dateStr,
      currentDateText: dateText
    });
    this.loadTimeslots();
  },

  // 加载实验室详情
  async loadLaboratoryDetail() {
    try {
      wx.showLoading({ title: '加载中...' });
      const res = await api.laboratory.getLaboratoryById(this.data.labId);
      
      // 设置状态颜色和文本
      let statusColor = '';
      let statusText = '';
      switch (res.status) {
        case 'ACTIVE':
          statusColor = '#52c41a';
          statusText = '可用';
          break;
        case 'MAINTENANCE':
          statusColor = '#faad14';
          statusText = '维护中';
          break;
        case 'INACTIVE':
          statusColor = '#f5222d';
          statusText = '停用';
          break;
      }
      
      this.setData({
        laboratory: res,
        statusColor,
        statusText
      });
    } catch (error) {
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'error'
      });
    } finally {
      wx.hideLoading();
    }
  },

  // 加载时间段列表
  async loadTimeslots() {
    try {
      const res = await api.timeslot.getAvailableTimeslots(
        this.data.labId,
        this.data.currentDate
      );
      this.setData({ timeslots: res });
    } catch (error) {
      console.error('加载时间段失败:', error);
      this.setData({ timeslots: [] });
    }
  },

  // 格式化日期为YYYY-MM-DD
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 格式化日期为显示文本
  formatDateText(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const weekDay = weekDays[date.getDay()];
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    const diff = (targetDate - today) / (1000 * 60 * 60 * 24);
    
    if (diff === 0) {
      return `今天 ${month}月${day}日 ${weekDay}`;
    } else if (diff === 1) {
      return `明天 ${month}月${day}日 ${weekDay}`;
    } else if (diff === 2) {
      return `后天 ${month}月${day}日 ${weekDay}`;
    } else {
      return `${month}月${day}日 ${weekDay}`;
    }
  },

  // 上一天
  previousDay() {
    const currentDate = new Date(this.data.currentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (currentDate <= today) {
      wx.showToast({
        title: '不能选择过去的日期',
        icon: 'none'
      });
      return;
    }
    
    currentDate.setDate(currentDate.getDate() - 1);
    const dateStr = this.formatDate(currentDate);
    const dateText = this.formatDateText(currentDate);
    
    this.setData({
      currentDate: dateStr,
      currentDateText: dateText
    });
    this.loadTimeslots();
  },

  // 下一天
  nextDay() {
    const currentDate = new Date(this.data.currentDate);
    currentDate.setDate(currentDate.getDate() + 1);
    
    // 限制只能预约30天内
    const today = new Date();
    const maxDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    if (currentDate > maxDate) {
      wx.showToast({
        title: '最多只能预约30天内',
        icon: 'none'
      });
      return;
    }
    
    const dateStr = this.formatDate(currentDate);
    const dateText = this.formatDateText(currentDate);
    
    this.setData({
      currentDate: dateStr,
      currentDateText: dateText
    });
    this.loadTimeslots();
  },

  // 选择日期
  selectDate() {
    const today = new Date();
    const maxDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    wx.showModal({
      title: '选择日期',
      content: '请使用左右箭头切换日期，最多可预约30天内的时间段',
      showCancel: false
    });
  },

  // 选择时间段
  selectTimeslot(e) {
    const timeslot = e.currentTarget.dataset.timeslot;
    
    if (timeslot.reserved) {
      wx.showToast({
        title: '该时间段已被预约',
        icon: 'none'
      });
      return;
    }
    
    // 跳转到预约页面
    wx.navigateTo({
      url: `/pages/reservation/reservation?labId=${this.data.labId}&timeslotId=${timeslot.id}&date=${this.data.currentDate}`
    });
  },

  // 预览图片
  previewImage(e) {
    const url = e.currentTarget.dataset.url;
    wx.previewImage({
      current: url,
      urls: this.data.laboratory.images || []
    });
  },

  // 拨打电话
  makePhoneCall() {
    if (!this.data.laboratory.contactPhone) {
      return;
    }
    
    wx.makePhoneCall({
      phoneNumber: this.data.laboratory.contactPhone
    });
  },

  // 导航到预约页面
  navigateToReservation() {
    if (this.data.laboratory.status !== 'ACTIVE') {
      wx.showToast({
        title: '该实验室暂不可预约',
        icon: 'none'
      });
      return;
    }
    
    wx.navigateTo({
      url: `/pages/reservation/reservation?labId=${this.data.labId}`
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    Promise.all([
      this.loadLaboratoryDetail(),
      this.loadTimeslots()
    ]).finally(() => {
      wx.stopPullDownRefresh();
    });
  }
});
