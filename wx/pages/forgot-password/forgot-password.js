// pages/forgot-password/forgot-password.js
const api = require('../../api/index');

Page({
  data: {
    email: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: '',
    showPassword: false,
    showConfirmPassword: false,
    loading: false,
    codeCountdown: 0,
    countdownTimer: null
  },

  onUnload() {
    // 清理定时器
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer);
    }
  },

  // 邮箱输入
  onEmailInput(e) {
    this.setData({
      email: e.detail.value
    });
  },

  // 验证码输入
  onVerificationCodeInput(e) {
    this.setData({
      verificationCode: e.detail.value
    });
  },

  // 新密码输入
  onNewPasswordInput(e) {
    this.setData({
      newPassword: e.detail.value
    });
  },

  // 确认密码输入
  onConfirmPasswordInput(e) {
    this.setData({
      confirmPassword: e.detail.value
    });
  },

  // 切换密码显示/隐藏
  togglePassword() {
    this.setData({
      showPassword: !this.data.showPassword
    });
  },

  // 切换确认密码显示/隐藏
  toggleConfirmPassword() {
    this.setData({
      showConfirmPassword: !this.data.showConfirmPassword
    });
  },

  // 发送验证码
  async sendVerificationCode() {
    const { email } = this.data;

    // 验证邮箱格式
    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailReg.test(email)) {
      wx.showToast({
        title: '邮箱格式不正确',
        icon: 'none'
      });
      return;
    }

    try {
      wx.showLoading({ title: '发送中...' });
      
      await api.email.sendPasswordResetCode({ email });
      
      wx.hideLoading();
      wx.showToast({
        title: '验证码已发送',
        icon: 'success'
      });

      // 开始倒计时
      this.startCountdown();

    } catch (error) {
      wx.hideLoading();
      console.error('发送验证码失败:', error);
      wx.showToast({
        title: error.message || '发送失败',
        icon: 'none'
      });
    }
  },

  // 开始倒计时
  startCountdown() {
    let countdown = 60;
    this.setData({ codeCountdown: countdown });

    const timer = setInterval(() => {
      countdown--;
      if (countdown <= 0) {
        clearInterval(timer);
        this.setData({ 
          codeCountdown: 0,
          countdownTimer: null
        });
      } else {
        this.setData({ codeCountdown: countdown });
      }
    }, 1000);

    this.setData({ countdownTimer: timer });
  },

  // 处理重置密码
  async handleResetPassword() {
    const { email, verificationCode, newPassword, confirmPassword } = this.data;

    // 表单验证
    if (!email) {
      wx.showToast({
        title: '请输入邮箱',
        icon: 'none'
      });
      return;
    }

    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailReg.test(email)) {
      wx.showToast({
        title: '邮箱格式不正确',
        icon: 'none'
      });
      return;
    }

    if (!verificationCode) {
      wx.showToast({
        title: '请输入验证码',
        icon: 'none'
      });
      return;
    }

    if (verificationCode.length !== 6) {
      wx.showToast({
        title: '验证码应为6位数字',
        icon: 'none'
      });
      return;
    }

    if (!newPassword) {
      wx.showToast({
        title: '请输入新密码',
        icon: 'none'
      });
      return;
    }

    if (newPassword.length < 6) {
      wx.showToast({
        title: '密码至少6位',
        icon: 'none'
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      wx.showToast({
        title: '两次密码不一致',
        icon: 'none'
      });
      return;
    }

    this.setData({ loading: true });

    try {
      await api.user.resetPassword({
        email,
        newPassword,
        verificationCode
      });

      wx.showToast({
        title: '密码重置成功',
        icon: 'success'
      });

      // 延迟跳转到登录页
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);

    } catch (error) {
      console.error('重置密码失败:', error);
      wx.showToast({
        title: error.message || '重置失败',
        icon: 'none',
        duration: 2000
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 返回登录页面
  goBack() {
    wx.navigateBack();
  }
});
