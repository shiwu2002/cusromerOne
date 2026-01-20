// pages/profile/profile.js
const api = require('../../api/index');

Page({
  data: {
    userInfo: {},
    stats: {
      totalReservations: 0,
      completedReservations: 0,
      unreadMessages: 0
    },
    showEditModal: false,
    showPasswordModal: false,
    editForm: {
      username: ''
    },
    passwordForm: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  },

  onLoad() {
    this.loadUserInfo();
    this.loadUserStats();
  },

  onShow() {
    // 每次显示页面时刷新统计数据和未读消息数
    this.loadUserStats();
    this.updateTabBarBadge();
  },

  onPullDownRefresh() {
    Promise.all([
      this.loadUserInfo(),
      this.loadUserStats()
    ]).finally(() => {
      wx.stopPullDownRefresh();
    });
  },

  // 加载用户信息
  async loadUserInfo() {
    try {
      wx.showLoading({ title: '加载中...' });
      
      // 先检查是否已登录
      if (!api.user.isLoggedIn()) {
        // 清除本地存储的用户信息避免显示错误数据
        wx.removeStorageSync('userInfo');
        this.setData({ userInfo: {} });
        throw new Error('未登录');
      }
      
      const response = await api.user.getProfile();
      const userInfo = response.data; // 提取实际数据
      
      // 如果使用了模拟数据，显示提示
      if (userInfo.apiFallback) {
        wx.showToast({ title: '使用本地缓存数据', icon: 'none' });
      }
      
      this.setData({ userInfo });
    } catch (error) {
      console.error('加载用户信息失败:', error);
      if (error.message === '未登录') {
        // 清除可能存在的数据并跳转登录页
        this.setData({ userInfo: {} });
        wx.showToast({ title: '请先登录', icon: 'none' });
        setTimeout(() => {
          wx.redirectTo({ url: '/pages/login/login' });
        }, 1500);
      }
    } finally {
      wx.hideLoading();
    }
  },

  // 加载用户统计数据
  async loadUserStats() {
    try {
      // 并行加载预约统计和未读消息数
      const [reservationsResponse, messagesResponse] = await Promise.all([
        api.reservation.getMyReservations({ page: 1, limit: 1 }).catch(() => ({ data: { data: { total: 0 } } })),
        api.message.getUnreadCount().catch(() => ({ data: 0 }))
      ]);
      
      const reservationsData = reservationsResponse.data || { total: 0 };
      const messagesCount = messagesResponse.data || 0;

      // 获取已完成的预约数
      const completedResponse = await api.reservation.getMyReservations({
        page: 1,
        limit: 1,
        status: 'COMPLETED'
      }).catch(() => ({ data: { data: { total: 0 } } }));
      
      const completedData = completedResponse.data || { total: 0 };

      this.setData({
        stats: {
          totalReservations: reservationsData.total || 0,
          completedReservations: completedData.total || 0,
          unreadMessages: messagesCount || 0
        }
      });
    } catch (error) {
      console.error('加载统计数据失败:', error);
    }
  },

  // 更新tabBar徽标
  async updateTabBarBadge() {
    try {
      const response = await api.message.getUnreadCount();
      const count = response.data || 0;
      if (count > 0) {
        wx.setTabBarBadge({
          index: 2,
          text: count > 99 ? '99+' : String(count)
        });
      } else {
        wx.removeTabBarBadge({ index: 2 });
      }
    } catch (error) {
      console.error('更新徽标失败:', error);
    }
  },

  // 更换头像
  changeAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const tempFilePath = res.tempFilePaths[0];
        try {
          wx.showLoading({ title: '上传中...' });
          
          // 使用头像专用的上传方法
          const uploadResponse = await api.file.uploadAvatar(tempFilePath);
          
          // 解析上传返回的数据结构
          let avatarUrl;
          if (uploadResponse.success) {
            const uploadData = uploadResponse.data;
            // 根据后端返回的数据结构提取头像URL
            if (uploadData.url) {
              avatarUrl = uploadData.url;
            } else if (uploadData.path) {
              // 如果返回的是完整路径，确保包含完整URL前缀
              avatarUrl = uploadData.path.startsWith('http') ? uploadData.path : `http://localhost:8080${uploadData.path}`;
            } else {
              avatarUrl = uploadData;
            }
          } else {
            // 兼容旧版本返回格式
            avatarUrl = uploadResponse.data.url || uploadResponse.data;
          }
          
          // 更新用户头像（使用avatar字段，与后端实体类保持一致）
          const updateResponse = await api.user.updateProfile({
            avatar: avatarUrl
          });

          // 如果更新成功，更新本地存储的用户信息
          if (updateResponse && (updateResponse.success || updateResponse.code === 200)) {
            const currentUserInfo = api.user.getCurrentUser();
            if (currentUserInfo) {
              // 更新本地存储的用户信息的头像字段
              const updatedUserInfo = {
                ...currentUserInfo,
                avatar: avatarUrl,
                // 保留avatarUrl字段用于兼容性
                avatarUrl: avatarUrl
              };
              wx.setStorageSync('userInfo', updatedUserInfo);
              
              // 更新页面显示的头像
              this.setData({
                'userInfo.avatar': avatarUrl,
                'userInfo.avatarUrl': avatarUrl
              });
            }
          }

          // 重新加载完整的用户信息确保数据一致性
          await this.loadUserInfo();
          wx.showToast({ title: '头像更新成功', icon: 'success' });
        } catch (error) {
          console.error('上传头像失败:', error);
          wx.showToast({ title: '上传失败，请重试', icon: 'none' });
        } finally {
          wx.hideLoading();
        }
      }
    });
  },

  // 打开编辑资料弹窗
  editProfile() {
    this.setData({
      showEditModal: true,
      'editForm.username': this.data.userInfo.username || ''
    });
  },

  // 关闭编辑资料弹窗
  closeEditModal() {
    this.setData({ showEditModal: false });
  },

  // 阻止冒泡
  preventClose() {},

  // 输入用户名
  onUsernameInput(e) {
    this.setData({
      'editForm.username': e.detail.value
    });
  },

  // 保存资料
  async saveProfile() {
    const { username } = this.data.editForm;
    
    if (!username || !username.trim()) {
      wx.showToast({ title: '请输入用户名', icon: 'none' });
      return;
    }

    try {
      wx.showLoading({ title: '保存中...' });
      const updateResponse = await api.user.updateProfile({ username: username.trim() });

      // 如果更新成功，更新本地存储的用户信息
      if (updateResponse && updateResponse.data) {
        const currentUserInfo = api.user.getCurrentUser();
        if (currentUserInfo) {
          // 更新本地存储的用户信息的用户名字段
          const updatedUserInfo = {
            ...currentUserInfo,
            username: username.trim()
          };
          wx.setStorageSync('userInfo', updatedUserInfo);
          
          // 立即更新页面显示的用户名
          this.setData({
            'userInfo.username': username.trim()
          });
        }
      }

      // 重新加载完整的用户信息确保数据一致性
      await this.loadUserInfo();
      this.setData({ showEditModal: false });
      wx.showToast({ title: '保存成功', icon: 'success' });
    } catch (error) {
      console.error('保存失败:', error);
      wx.showToast({ title: error.message || '保存失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  // 打开修改密码弹窗
  changePassword() {
    this.setData({
      showPasswordModal: true,
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      }
    });
  },

  // 关闭修改密码弹窗
  closePasswordModal() {
    this.setData({ showPasswordModal: false });
  },

  // 输入当前密码
  onOldPasswordInput(e) {
    this.setData({
      'passwordForm.oldPassword': e.detail.value
    });
  },

  // 输入新密码
  onNewPasswordInput(e) {
    this.setData({
      'passwordForm.newPassword': e.detail.value
    });
  },

  // 输入确认密码
  onConfirmPasswordInput(e) {
    this.setData({
      'passwordForm.confirmPassword': e.detail.value
    });
  },

  // 保存密码
  async savePassword() {
    const { oldPassword, newPassword, confirmPassword } = this.data.passwordForm;

    // 验证
    if (!oldPassword) {
      wx.showToast({ title: '请输入当前密码', icon: 'none' });
      return;
    }
    if (!newPassword) {
      wx.showToast({ title: '请输入新密码', icon: 'none' });
      return;
    }
    if (newPassword.length < 8 || newPassword.length > 20) {
      wx.showToast({ title: '密码长度为8-20位', icon: 'none' });
      return;
    }
    if (newPassword !== confirmPassword) {
      wx.showToast({ title: '两次密码输入不一致', icon: 'none' });
      return;
    }

    try {
      wx.showLoading({ title: '修改中...' });
      await api.user.changePassword({
        oldPassword,
        newPassword
      });
      this.setData({ showPasswordModal: false });
      wx.showToast({ title: '密码修改成功', icon: 'success' });
    } catch (error) {
      console.error('修改密码失败:', error);
      wx.showToast({ title: error.message || '修改失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  // 跳转到我的预约
  goToMyReservations() {
    wx.switchTab({ url: '/pages/my-reservations/my-reservations' });
  },

  // 跳转到消息中心
  goToMessages() {
    wx.switchTab({ url: '/pages/messages/messages' });
  },

  // 跳转到设置
  goToSettings() {
    wx.navigateTo({ url: '/pages/settings/settings' });
  },

  // 管理实验室（管理员）
  manageLaboratories() {
    wx.showToast({ title: '管理功能开发中', icon: 'none' });
    // TODO: 实现管理员功能
  },

  // 管理预约（管理员）
  manageReservations() {
    wx.showToast({ title: '管理功能开发中', icon: 'none' });
    // TODO: 实现管理员功能
  },

  // 管理用户（管理员）
  manageUsers() {
    wx.showToast({ title: '管理功能开发中', icon: 'none' });
    // TODO: 实现管理员功能
  },

  // 退出登录
  logout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      confirmColor: '#ff4757',
      success: (res) => {
        if (res.confirm) {
          // 清除本地存储的token
          wx.removeStorageSync('token');
          // 清除tabBar徽标
          wx.removeTabBarBadge({ index: 2 });
          // 跳转到登录页
          wx.reLaunch({ url: '/pages/login/login' });
        }
      }
    });
  }
});
