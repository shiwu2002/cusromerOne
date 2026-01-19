// pages/reservation/reservation.js
const api = require('../../api/index');

Page({
  data: {
    labId: null,
    laboratory: {},
    timeslotId: null,
    reservationDate: '',
    minDate: '',
    maxDate: '',
    timeslots: [],
    selectedTimeslotId: null,
    numberOfPeople: 1,
    purpose: '',
    notes: '',
    documents: [],
    submitting: false
  },

  onLoad(options) {
    if (options.labId) {
      this.setData({ labId: options.labId });
      this.loadLaboratoryDetail();
      this.initDateRange();
      
      // 如果传入了日期和时间段ID，直接设置
      if (options.date) {
        this.setData({ reservationDate: options.date });
        this.loadTimeslots();
      }
      if (options.timeslotId) {
        this.setData({ selectedTimeslotId: parseInt(options.timeslotId) });
      }
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

  // 初始化日期范围
  initDateRange() {
    const today = new Date();
    const maxDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    this.setData({
      minDate: this.formatDate(today),
      maxDate: this.formatDate(maxDate)
    });
  },

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 加载实验室详情
  async loadLaboratoryDetail() {
    try {
      const response = await api.laboratory.getLaboratoryDetail(this.data.labId);
      const res = response.data; // 提取实际数据
      
      // 数据字段映射
      const laboratory = {
        id: res.id,
        name: res.labName || res.name,
        type: res.labType || res.type,
        location: res.labLocation || res.location,
        capacity: res.labCapacity || res.capacity,
        description: res.labDescription || res.description,
        imageUrl: res.imageUrl || '/images/shiyanshi.png',
        status: res.status
      };
      
      this.setData({ 
        laboratory,
        numberOfPeople: 1
      });
    } catch (error) {
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'error'
      });
    }
  },

  // 加载时间段
  async loadTimeslots() {
    if (!this.data.reservationDate) {
      return;
    }
    
    try {
      const response = await api.timeslot.getAvailableTimeslots(
        this.data.labId,
        this.data.reservationDate
      );
      const res = response.data; // 提取实际数据
      this.setData({ timeslots: Array.isArray(res) ? res : [] });
    } catch (error) {
      console.error('加载时间段失败:', error);
      this.setData({ timeslots: [] });
    }
  },

  // 日期改变
  onDateChange(e) {
    this.setData({
      reservationDate: e.detail.value,
      selectedTimeslotId: null
    });
    this.loadTimeslots();
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
    
    this.setData({
      selectedTimeslotId: timeslot.id
    });
  },

  // 减少人数
  decreaseNumber() {
    if (this.data.numberOfPeople > 1) {
      this.setData({
        numberOfPeople: this.data.numberOfPeople - 1
      });
    }
  },

  // 增加人数
  increaseNumber() {
    if (this.data.numberOfPeople < this.data.laboratory.capacity) {
      this.setData({
        numberOfPeople: this.data.numberOfPeople + 1
      });
    } else {
      wx.showToast({
        title: `最多可预约${this.data.laboratory.capacity}人`,
        icon: 'none'
      });
    }
  },

  // 人数输入
  onNumberInput(e) {
    let value = parseInt(e.detail.value) || 1;
    if (value < 1) value = 1;
    if (value > this.data.laboratory.capacity) {
      value = this.data.laboratory.capacity;
      wx.showToast({
        title: `最多可预约${this.data.laboratory.capacity}人`,
        icon: 'none'
      });
    }
    this.setData({ numberOfPeople: value });
  },

  // 目的输入
  onPurposeInput(e) {
    this.setData({ purpose: e.detail.value });
  },

  // 备注输入
  onNotesInput(e) {
    this.setData({ notes: e.detail.value });
  },

  // 上传文档
  uploadDocument() {
    if (this.data.documents.length >= 3) {
      wx.showToast({
        title: '最多上传3个文件',
        icon: 'none'
      });
      return;
    }
    
    wx.chooseMessageFile({
      count: 3 - this.data.documents.length,
      type: 'file',
      success: async (res) => {
        wx.showLoading({ title: '上传中...' });
        
        try {
          const uploadPromises = res.tempFiles.map(async (file) => {
            const response = await api.file.uploadDocument(file.path);
            const uploadRes = response.data; // 提取实际数据
            return {
              name: file.name,
              url: uploadRes.url
            };
          });
          
          const uploadedDocs = await Promise.all(uploadPromises);
          const documents = [...this.data.documents, ...uploadedDocs];
          
          this.setData({ documents });
          
          wx.showToast({
            title: '上传成功',
            icon: 'success'
          });
        } catch (error) {
          wx.showToast({
            title: error.message || '上传失败',
            icon: 'error'
          });
        } finally {
          wx.hideLoading();
        }
      }
    });
  },

  // 删除文档
  removeDocument(e) {
    const index = e.currentTarget.dataset.index;
    const documents = this.data.documents.filter((_, i) => i !== index);
    this.setData({ documents });
  },

  // 验证表单
  validateForm() {
    if (!this.data.reservationDate) {
      wx.showToast({
        title: '请选择预约日期',
        icon: 'none'
      });
      return false;
    }
    
    if (!this.data.selectedTimeslotId) {
      wx.showToast({
        title: '请选择预约时间段',
        icon: 'none'
      });
      return false;
    }
    
    if (!this.data.numberOfPeople || this.data.numberOfPeople < 1) {
      wx.showToast({
        title: '请输入预约人数',
        icon: 'none'
      });
      return false;
    }
    
    if (!this.data.purpose || this.data.purpose.trim() === '') {
      wx.showToast({
        title: '请填写预约目的',
        icon: 'none'
      });
      return false;
    }
    
    return true;
  },

  // 提交预约
  async submitReservation() {
    if (!this.validateForm()) {
      return;
    }
    
    this.setData({ submitting: true });
    
    try {
      // 先检查冲突
      const conflictResponse = await api.reservation.checkConflict(
        this.data.labId,
        this.data.selectedTimeslotId,
        this.data.reservationDate
      );
      const conflictCheck = conflictResponse.data; // 提取实际数据
      
      if (conflictCheck && conflictCheck.hasConflict) {
        wx.showModal({
          title: '预约冲突',
          content: '该时间段已被其他用户预约，请选择其他时间段',
          showCancel: false
        });
        this.setData({ submitting: false });
        return;
      }
      
      // 创建预约
      const documentUrls = this.data.documents.map(doc => doc.url);
      
      await api.reservation.createReservation({
        laboratoryId: this.data.labId,
        timeslotId: this.data.selectedTimeslotId,
        reservationDate: this.data.reservationDate,
        numberOfPeople: this.data.numberOfPeople,
        purpose: this.data.purpose,
        notes: this.data.notes || undefined,
        documents: documentUrls.length > 0 ? documentUrls : undefined
      });
      
      wx.showToast({
        title: '预约成功',
        icon: 'success',
        duration: 2000
      });
      
      setTimeout(() => {
        wx.navigateTo({
          url: '/pages/my-reservations/my-reservations'
        });
      }, 2000);
      
    } catch (error) {
      wx.showToast({
        title: error.message || '预约失败',
        icon: 'error'
      });
      this.setData({ submitting: false });
    }
  },

  // 取消
  cancel() {
    wx.navigateBack();
  }
});
