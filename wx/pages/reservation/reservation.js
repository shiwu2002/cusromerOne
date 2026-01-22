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
    console.log('Reservation Page onLoad options:', options);
    // 处理 labId 可能为 undefined 或其他假值的情况
    // 并尝试从 options 中解析出有效的 labId
    let labId = options.labId;
    
    // 如果没有直接传递 labId，尝试解析 scene (小程序码扫描进入)
    if (!labId && options.scene) {
        const scene = decodeURIComponent(options.scene);
        // 假设 scene 格式为 labId=123
        const match = scene.match(/labId=(\d+)/);
        if (match) {
            labId = match[1];
        }
    }

    if (labId) {
      this.setData({ labId: labId });
      this.loadLaboratoryDetail();
      this.initDateRange();
      
      // 如果传入了日期和时间段ID，直接设置
      if (options.date) {
        this.setData({ reservationDate: options.date });
        // 确保 loadTimeslots 在 setData 完成后调用，虽然 setData 是同步更新数据字段，但为了稳妥可以这样写
        this.loadTimeslots();
      }
      if (options.timeslotId) {
        // 确保 timeslotId 转为数字，与 timeslots 数组中的 id 类型一致
        this.setData({ selectedTimeslotId: parseInt(options.timeslotId, 10) });
      }
    } else {
      console.error('Reservation page missing labId parameter');
      wx.showToast({
        title: '参数错误: 缺少实验室ID',
        icon: 'none',
        duration: 2000
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 2000);
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
    // 允许输入过程中的空值或数字
    const value = e.detail.value;
    this.setData({ numberOfPeople: value });
  },

  // 人数输入框失焦处理
  onNumberBlur(e) {
    let value = parseInt(e.detail.value) || 1;
    if (value < 1) value = 1;
    
    // 如果容量已加载，则进行校验
    if (this.data.laboratory.capacity && value > this.data.laboratory.capacity) {
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
      // 获取当前选择的时间段信息
      const selectedTimeslot = this.data.timeslots.find(t => t.id === this.data.selectedTimeslotId);
      if (!selectedTimeslot) {
        throw new Error('无效的时间段');
      }

      // 构建时间段字符串 HH:mm-HH:mm
      const timeSlotStr = `${selectedTimeslot.startTime}-${selectedTimeslot.endTime}`;

      // 先检查冲突
      const conflictResponse = await api.reservation.checkConflict(
        this.data.labId,
        this.data.reservationDate,
        timeSlotStr
      );
      
      // 注意：根据接口文档，成功响应（无冲突）返回200，错误响应（有冲突）返回500
      // utils/request.js 封装中，code != 200 会进入 catch，或者在 then 中 resolve 但 data.success 为 false (取决于具体实现，这里假设 checkConflict 返回标准结构)
      // 如果后端在有冲突时直接抛出错误状态码，则会在 catch 块中处理
      // 这里根据 API 描述: 成功响应(无冲突) code: 200; 错误响应(有冲突) code: 500
      
      // 创建预约
      // 根据提供的 API 文档，参数为 userId(必填), labId(必填), reserveDate(必填), timeSlot(必填), purpose(可选), remark(可选)
      
      const userInfo = wx.getStorageSync('userInfo');
      if (!userInfo || !userInfo.userId) {
        throw new Error('获取用户信息失败，请重新登录');
      }

      // 最终确认字段名：
      // userId: 从token获取或显式传递
      // labId: 实验室ID (注意后端日志显示 labId 为 null，说明之前传递 laboratoryId 也是错的，或者后端期望 labId)
      // reserveDate: 预约日期
      // timeSlot: 时间段字符串 (注意后端日志显示 timeSlot 为 null)
      // peopleNum: 人数
      // purpose: 目的
      // remark: 备注
      
      const reservationData = {
        userId: userInfo.userId,
        // 修正字段名：userInfo中存储的是username(小写)，同时兼容realName
        userName: userInfo.username || userInfo.realName || userInfo.nickName,
        labId: parseInt(this.data.labId),
        labName: this.data.laboratory.name, // 保留标准字段
        reserveDate: this.data.reservationDate,
        timeSlot: timeSlotStr,
        purpose: this.data.purpose,
        peopleNum: this.data.numberOfPeople,
        // 根据反馈调整字段映射：
        // experimentName 存放 实验室名称
        experimentName: this.data.laboratory.name,
        // equipment 存放 备注信息
        equipment: this.data.notes || '',
        remark: this.data.notes || '' // 保留标准备注字段
      };

      // 如果有文档，将文档链接追加到备注中（临时方案，直至 API 支持文档字段）
      if (this.data.documents.length > 0) {
         const docLinks = this.data.documents.map(d => `[文档: ${d.name}](${d.url})`).join('\n');
         const appendText = '\n' + docLinks;
         
         // 追加到 equipment (备注信息)
         reservationData.equipment = (reservationData.equipment || '') + appendText;
         // 追加到 remark
         reservationData.remark = (reservationData.remark || '') + appendText;
      }
      
      await api.reservation.createReservation(reservationData);
      
      wx.showToast({
        title: '预约成功',
        icon: 'success',
        duration: 2000
      });
      
      setTimeout(() => {
        // 使用 switchTab 跳转到 tabbar 页面，或者 redirectTo 跳转到普通页面
        // 假设 my-reservations 是普通页面
        wx.navigateTo({
          url: '/pages/my-reservations/my-reservations'
        });
      }, 2000);
      
    } catch (error) {
      console.error('预约提交失败:', error);
      let errorMessage = '预约失败';
      
      // 处理冲突检测返回的 500 错误或其他业务错误
      if (error && error.msg) {
        errorMessage = error.msg;
      } else if (error && error.message) {
        errorMessage = error.message;
      }
      
      wx.showToast({
        title: errorMessage,
        icon: 'none'
      });
      this.setData({ submitting: false });
    }
  },

  // 取消
  cancel() {
    wx.navigateBack();
  }
});
