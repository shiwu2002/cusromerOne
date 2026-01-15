// pages/login/login.js
const api = require('../../api/index');

Page({
  data: {
    email: '',
    password: '',
    showPassword: false,
    rememberMe: false,
    loading: false,
    wechatLoading: false
  },

  onLoad(options) {
    // 检查是否有保存的登录信息
    const savedEmail = wx.getStorageSync('savedEmail');
    const savedRemember = wx.getStorageSync('rememberMe');
    
    if (savedRemember && savedEmail) {
      this.setData({
        email: savedEmail,
        rememberMe: true
      });
    }
  },

  // 邮箱输入
  onEmailInput(e) {
    this.setData({
      email: e.detail.value
    });
  },

  // 密码输入
  onPasswordInput(e) {
    this.setData({
      password: e.detail.value
    });
  },

  // 切换密码显示/隐藏
  togglePassword() {
    this.setData({
      showPassword: !this.data.showPassword
    });
  },

  // 切换记住我
  toggleRemember() {
    this.setData({
      rememberMe: !this.data.rememberMe
    });
  },

  // 处理登录
  async handleLogin() {
    const { email, password, rememberMe } = this.data;

    // 表单验证
    if (!email) {
      wx.showToast({
        title: '请输入邮箱',
        icon: 'none'
      });
      return;
    }

    if (!password) {
      wx.showToast({
        title: '请输入密码',
        icon: 'none'
      });
      return;
    }

    // 邮箱格式验证
    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailReg.test(email)) {
      wx.showToast({
        title: '邮箱格式不正确',
        icon: 'none'
      });
      return;
    }

    this.setData({ loading: true });

    try {
      // 后端接口使用username字段，这里传入email作为username
      await api.user.login({ 
        username: email, 
        password: password 
      });
      
      // api.user.login已经保存了token和userInfo，这里只需处理"记住我"功能
      if (rememberMe) {
        wx.setStorageSync('savedEmail', email);
        wx.setStorageSync('rememberMe', true);
      } else {
        wx.removeStorageSync('savedEmail');
        wx.removeStorageSync('rememberMe');
      }

      wx.showToast({
        title: '登录成功',
        icon: 'success'
      });

      // 延迟跳转到首页
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        });
      }, 1500);

    } catch (error) {
      console.error('登录失败:', error);
      wx.showToast({
        title: error.message || '登录失败',
        icon: 'none',
        duration: 2000
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 跳转到注册页面
  goToRegister() {
    wx.navigateTo({
      url: '/pages/register/register'
    });
  },

  // 跳转到忘记密码页面
  goToForgotPassword() {
    wx.navigateTo({
      url: '/pages/forgot-password/forgot-password'
    });
  },

  // 微信一键登录
  async handleWechatLogin() {
    this.setData({ wechatLoading: true });

    try {
      // 1. 调用wx.login获取code
      const loginRes = await new Promise((resolve, reject) => {
        wx.login({
          success: resolve,
          fail: reject
        });
      });

      if (!loginRes.code) {
        throw new Error('获取微信code失败');
      }

      // 2. 使用code调用后端登录接口
      const res = await api.wechat.login(loginRes.code);

      // 3. 判断返回结果
      if (res.token) {
        // 已绑定，直接登录成功
        wx.setStorageSync('token', res.token);
        wx.setStorageSync('userInfo', res.user);

        wx.showToast({
          title: '登录成功',
          icon: 'success'
        });

        setTimeout(() => {
          wx.switchTab({
            url: '/pages/index/index'
          });
        }, 1500);

      } else if (res.needBind) {
        // 未绑定，跳转到绑定页面
        wx.navigateTo({
          url: `/pages/bind-account/bind-account?openid=${res.openid}&sessionKey=${res.sessionKey}${res.unionid ? '&unionid=' + res.unionid : ''}`
        });
      }

    } catch (error) {
      console.error('微信登录失败:', error);
      wx.showToast({
        title: error.message || '微信登录失败',
        icon: 'none',
        duration: 2000
      });
    } finally {
      this.setData({ wechatLoading: false });
    }
  }
});
