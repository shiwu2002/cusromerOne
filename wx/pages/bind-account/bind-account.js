// pages/bind-account/bind-account.js
const api = require('../../api/index');

Page({
  data: {
    activeTab: 0,
    openid: '',
    sessionKey: '',
    unionid: '',
    
    // 登录绑定表单
    loginForm: {
      username: '',
      password: ''
    },
    showLoginPassword: false,
    loginLoading: false,
    
    // 注册绑定表单
    registerForm: {
      username: '',
      email: '',
      password: '',
      code: ''
    },
    showRegisterPassword: false,
    registerLoading: false,
    codeSending: false,
    countdown: 0,
    countdownTimer: null
  },

  onLoad(options) {
    // 获取URL参数
    const { openid, sessionKey, unionid } = options;
    
    if (!openid || !sessionKey) {
      wx.showToast({
        title: '参数错误',
        icon: 'none'
      });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
      return;
    }
    
    this.setData({
      openid,
      sessionKey,
      unionid: unionid || ''
    });
  },

  onUnload() {
    // 清除定时器
    if (this.data.countdownTimer) {
      clearInterval(this.data.countdownTimer);
    }
  },

  // 切换标签页
  switchTab(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    this.setData({
      activeTab: index
    });
  },

  // 登录绑定表单输入
  onLoginUsernameInput(e) {
    this.setData({
      'loginForm.username': e.detail.value
    });
  },

  onLoginPasswordInput(e) {
    this.setData({
      'loginForm.password': e.detail.value
    });
  },

  toggleLoginPassword() {
    this.setData({
      showLoginPassword: !this.data.showLoginPassword
    });
  },

  // 注册绑定表单输入
  onRegisterUsernameInput(e) {
    this.setData({
      'registerForm.username': e.detail.value
    });
  },

  onRegisterEmailInput(e) {
    this.setData({
      'registerForm.email': e.detail.value
    });
  },

  onRegisterPasswordInput(e) {
    this.setData({
      'registerForm.password': e.detail.value
    });
  },

  onRegisterCodeInput(e) {
    this.setData({
      'registerForm.code': e.detail.value
    });
  },

  toggleRegisterPassword() {
    this.setData({
      showRegisterPassword: !this.data.showRegisterPassword
    });
  },

  // 发送注册验证码
  async sendRegisterCode() {
    const { email } = this.data.registerForm;

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

    this.setData({ codeSending: true });

    try {
      await api.email.sendRegisterCode({ email });
      
      wx.showToast({
        title: '验证码已发送',
        icon: 'success'
      });

      // 开始倒计时
      this.startCountdown();

    } catch (error) {
      console.error('发送验证码失败:', error);
      wx.showToast({
        title: error.message || '发送失败',
        icon: 'none'
      });
    } finally {
      this.setData({ codeSending: false });
    }
  },

  // 开始倒计时
  startCountdown() {
    this.setData({ countdown: 60 });
    
    this.data.countdownTimer = setInterval(() => {
      const countdown = this.data.countdown - 1;
      
      if (countdown <= 0) {
        clearInterval(this.data.countdownTimer);
        this.setData({ 
          countdown: 0,
          countdownTimer: null
        });
      } else {
        this.setData({ countdown });
      }
    }, 1000);
  },

  // 登录并绑定
  async handleLoginBind() {
    const { username, password } = this.data.loginForm;
    const { openid, sessionKey, unionid } = this.data;

    // 表单验证
    if (!username) {
      wx.showToast({
        title: '请输入用户名',
        icon: 'none'
      });
      return;
    }

    if (username.length < 2 || username.length > 20) {
      wx.showToast({
        title: '用户名长度为2-20个字符',
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

    this.setData({ loginLoading: true });

    try {
      // 1. 先登录获取用户信息（api.user.login已经保存了token和userInfo）
      const loginRes = await api.user.login({ 
        username: username, 
        password: password 
      });
      
      // 2. 绑定微信
      await api.wechat.bind({
        userId: loginRes.userId,
        openid,
        sessionKey,
        unionid
      });

      wx.showToast({
        title: '绑定成功',
        icon: 'success'
      });

      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        });
      }, 1500);

    } catch (error) {
      console.error('绑定失败:', error);
      wx.showToast({
        title: error.message || '绑定失败',
        icon: 'none',
        duration: 2000
      });
    } finally {
      this.setData({ loginLoading: false });
    }
  },

  // 注册并绑定
  async handleRegisterBind() {
    const { username, email, password, code } = this.data.registerForm;
    const { openid, sessionKey, unionid } = this.data;

    // 表单验证
    if (!username) {
      wx.showToast({
        title: '请输入用户名',
        icon: 'none'
      });
      return;
    }

    if (username.length < 2 || username.length > 20) {
      wx.showToast({
        title: '用户名长度为2-20个字符',
        icon: 'none'
      });
      return;
    }

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

    if (!password) {
      wx.showToast({
        title: '请输入密码',
        icon: 'none'
      });
      return;
    }

    if (password.length < 6 || password.length > 20) {
      wx.showToast({
        title: '密码长度为6-20位',
        icon: 'none'
      });
      return;
    }

    if (!code) {
      wx.showToast({
        title: '请输入验证码',
        icon: 'none'
      });
      return;
    }

    this.setData({ registerLoading: true });

    try {
      // 1. 先注册账号
      const registerRes = await api.user.register({
        username,
        email,
        password,
        code
      });

      // 2. 使用注册返回的信息登录（保存token和userInfo）
      await api.user.login({
        username,
        password
      });

      // 3. 绑定微信
      const userInfo = wx.getStorageSync('userInfo');
      await api.wechat.bind({
        userId: userInfo.userId,
        openid,
        sessionKey,
        unionid
      });

      wx.showToast({
        title: '注册并绑定成功',
        icon: 'success'
      });

      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        });
      }, 1500);

    } catch (error) {
      console.error('注册绑定失败:', error);
      wx.showToast({
        title: error.message || '注册绑定失败',
        icon: 'none',
        duration: 2000
      });
    } finally {
      this.setData({ registerLoading: false });
    }
  }
});
