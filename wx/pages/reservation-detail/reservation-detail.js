// pages/reservation-detail/reservation-detail.js
const api = require('../../api/index');

Page({
  data: {
    reservationId: null,
    reservation: {
      laboratory: {},
      timeslot: {}
    },
    statusMap: {
      'PENDING': '待审核',
      'APPROVED': '已通过',
      'REJECTED': '已拒绝',
      'CANCELLED': '已取消',
      'COMPLETED': '已完成'
    }
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ reservationId: options.id });
      this.loadReservationDetail();
    }
  },

  onPullDownRefresh() {
    this.loadReservationDetail();
  },

  // 加载预约详情
  async loadReservationDetail() {
    try {
      wx.showLoading({ title: '加载中...' });
      const res = await api.reservation.getReservationDetail(this.data.reservationId);
      
      // 格式化日期时间
      const reservation = {
        ...res.data,
        createdAt: this.formatDateTime(res.data.createdAt),
        updatedAt: this.formatDateTime(res.data.updatedAt),
        reservationDate: this.formatDate(res.data.reservationDate)
      };

      this.setData({ reservation });
      wx.hideLoading();
      wx.stopPullDownRefresh();
    } catch (error) {
      wx.hideLoading();
      wx.stopPullDownRefresh();
      console.error('加载预约详情失败:', error);
      wx.showModal({
        title: '加载失败',
        content: error.message || '无法加载预约详情',
        showCancel: false,
        success: () => {
          wx.navigateBack();
        }
      });
    }
  },

  // 跳转到实验室详情
  goToLaboratory() {
    wx.navigateTo({
      url: `/pages/laboratory-detail/laboratory-detail?id=${this.data.reservation.laboratory.id}`
    });
  },

  // 预览文档
  previewDocument(e) {
    const url = e.currentTarget.dataset.url;
    
    // 判断文件类型
    const fileType = this.getFileType(url);
    
    if (fileType === 'image') {
      // 图片预览
      wx.previewImage({
        urls: [url],
        current: url
      });
    } else if (fileType === 'pdf') {
      // PDF预览
      wx.downloadFile({
        url: url,
        success: (res) => {
          const filePath = res.tempFilePath;
          wx.openDocument({
            filePath: filePath,
            fileType: 'pdf',
            success: () => {
              console.log('打开文档成功');
            },
            fail: (err) => {
              console.error('打开文档失败:', err);
              wx.showToast({
                title: '无法打开该文档',
                icon: 'none'
              });
            }
          });
        },
        fail: (err) => {
          console.error('下载文档失败:', err);
          wx.showToast({
            title: '下载失败',
            icon: 'none'
          });
        }
      });
    } else {
      // 其他文件类型，尝试下载
      wx.downloadFile({
        url: url,
        success: (res) => {
          const filePath = res.tempFilePath;
          wx.openDocument({
            filePath: filePath,
            success: () => {
              console.log('打开文档成功');
            },
            fail: (err) => {
              console.error('打开文档失败:', err);
              wx.showToast({
                title: '无法打开该文档',
                icon: 'none'
              });
            }
          });
        },
        fail: (err) => {
          console.error('下载文档失败:', err);
          wx.showToast({
            title: '下载失败',
            icon: 'none'
          });
        }
      });
    }
  },

  // 获取文件类型
  getFileType(url) {
    const extension = url.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return 'image';
    } else if (extension === 'pdf') {
      return 'pdf';
    } else if (['doc', 'docx'].includes(extension)) {
      return 'doc';
    } else if (['xls', 'xlsx'].includes(extension)) {
      return 'excel';
    }
    return 'other';
  },

  // 取消预约
  cancelReservation() {
    wx.showModal({
      title: '确认取消',
      content: '确定要取消这个预约吗？',
      confirmColor: '#ff9800',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '取消中...' });
            await api.reservation.cancelReservation(this.data.reservationId);
            wx.hideLoading();
            
            wx.showToast({
              title: '取消成功',
              icon: 'success'
            });

            // 重新加载详情
            setTimeout(() => {
              this.loadReservationDetail();
            }, 1500);
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
  completeReservation() {
    wx.showModal({
      title: '确认完成',
      content: '确认已完成这个预约吗？',
      confirmColor: '#4CAF50',
      success: async (res) => {
        if (res.confirm) {
          try {
            wx.showLoading({ title: '提交中...' });
            await api.reservation.completeReservation(this.data.reservationId);
            wx.hideLoading();
            
            wx.showToast({
              title: '操作成功',
              icon: 'success'
            });

            // 重新加载详情
            setTimeout(() => {
              this.loadReservationDetail();
            }, 1500);
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
