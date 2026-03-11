// 登录页面（整合微信登录、账号登录/注册与自动绑定）
// 依据《微信小程序登录注册绑定整合方案》重构：
// - 首次进入页面自动调用微信登录（wx.login → /api/wx/login）
// - 后端返回 needBind=false：已绑定，直接返回 token 与用户信息，跳转首页
// - 后端返回 needBind=true：未绑定，保存 openid/unionid，展示账号登录与注册两种选择
// - 账号登录/注册时将 openid/unionid 一并提交给后端，由后端自动完成绑定
// - sessionKey 由后端保存，前端无需传递

const wechatApi = require('../../api/wechat');
const userApi = require('../../api/user');
const request = require('../../utils/request');

Page({
  data: {
    // 微信登录状态
    wxLoginLoading: false,
    needBind: false,

    // 微信返回的 openid/unionid
    openid: '',
    unionid: '',

    // 绑定选择标签：0=账号登录，1=注册新账号
    activeTab: 0,

    // 登录表单
    loginForm: {
      username: '',
      password: ''
    },
    showLoginPassword: false,
    loginLoading: false,
    loginDisabled: true, // 输入校验未通过时禁用登录按钮

    // 注册表单（email 可选）
    registerForm: {
      username: '',
      email: '',
      password: ''
    },
    showRegisterPassword: false,
    registerLoading: false,
    registerDisabled: true // 输入校验未通过时禁用注册按钮
  },

  onLoad() {
    // 若已登录，直接跳首页，避免重复触发登录流程
    if (typeof userApi.isLoggedIn === 'function' && userApi.isLoggedIn()) {
      wx.switchTab({ url: '/pages/index/index' });
      return;
    }
    // 页面加载后自动尝试微信一键登录
    this.wechatLogin();
  },

  // 切换标签页
  switchTab(e) {
    const index = parseInt(e.currentTarget.dataset.index);
    this.setData({ activeTab: index });
  },

  // 登录表单输入
  onLoginUsernameInput(e) {
    this.setData({ 'loginForm.username': e.detail.value }, () => {
      this.updateLoginDisabled();
    });
  },
  onLoginPasswordInput(e) {
    this.setData({ 'loginForm.password': e.detail.value }, () => {
      this.updateLoginDisabled();
    });
  },
  toggleLoginPassword() {
    this.setData({ showLoginPassword: !this.data.showLoginPassword });
  },

  // 注册表单输入
  onRegisterUsernameInput(e) {
    this.setData({ 'registerForm.username': e.detail.value }, () => {
      this.updateRegisterDisabled();
    });
  },
  onRegisterEmailInput(e) {
    this.setData({ 'registerForm.email': e.detail.value }, () => {
      this.updateRegisterDisabled();
    });
  },
  onRegisterPasswordInput(e) {
    this.setData({ 'registerForm.password': e.detail.value }, () => {
      this.updateRegisterDisabled();
    });
  },
  toggleRegisterPassword() {
    this.setData({ showRegisterPassword: !this.data.showRegisterPassword });
  },

  // 步骤 1：微信登录（wx.login → /api/wx/login）
  async wechatLogin() {
    if (this.data.wxLoginLoading) return; // 防抖
    this.setData({ wxLoginLoading: true });
    try {
      // 1) 调用微信登录获取 code
      const wxRes = await wx.login();
      if (!wxRes || !wxRes.code) {
        throw new Error('获取微信 code 失败');
      }
  
      // 2) 后端换取 openid/sessionKey，并判断是否已绑定
      const response = await wechatApi.login(wxRes.code);
      const res = response.data;
  
      if (res && res.needBind === false) {
        // 已绑定：登录成功，跳转首页
        wx.showToast({ title: '微信登录成功', icon: 'success' });
        setTimeout(() => {
          wx.switchTab({ url: '/pages/index/index' });
        }, 800);
        return;
      }
  
      // 未绑定：保存 openid/unionid/sessionKey，展示账号登录/注册选项
      const openid = res && res.openid ? res.openid : '';
      const unionid = res && res.unionid ? res.unionid : '';
      const sessionKey = res && res.sessionKey ? res.sessionKey : '';
  
      this.setData({
        needBind: true,
        openid,
        unionid,
        sessionKey,
        activeTab: 0
      });
  
      // 同时保存到本地，便于登录/注册时传递
      wx.setStorageSync('wechat_openid', openid);
      wx.setStorageSync('wechat_unionid', unionid);
      wx.setStorageSync('wechat_session_key', sessionKey);
    } catch (error) {
      console.error('微信登录失败:', error);
      wx.showToast({ title: error.message || '微信登录失败', icon: 'none' });
    } finally {
      this.setData({ wxLoginLoading: false });
    }
  },

  // 步骤 2A：账号登录（先登录获取 userId，再调用绑定接口）
  async userLogin() {
    if (this.data.loginLoading) return;
    const { username, password } = this.data.loginForm;
    // 简单校验
    if (!username) {
      wx.showToast({ title: '请输入用户名', icon: 'none' });
      return;
    }
    if (username.length < 2 || username.length > 20) {
      wx.showToast({ title: '用户名长度为 2-20 个字符', icon: 'none' });
      return;
    }
    if (!password) {
      wx.showToast({ title: '请输入密码', icon: 'none' });
      return;
    }
    if (password.length < 6 || password.length > 20) {
      wx.showToast({ title: '密码长度为 6-20 位', icon: 'none' });
      return;
    }
  
    this.setData({ loginLoading: true });
    try {
      const openid = wx.getStorageSync('wechat_openid');
      const unionid = wx.getStorageSync('wechat_unionid');
      const sessionKey = wx.getStorageSync('wechat_session_key');
  
      // 1) 先调用普通登录接口获取 userId
      const loginResponse = await userApi.login({
        username,
        password
      });
      const loginData = loginResponse.data;
  
      // 2) 获取到 userId 后，调用绑定接口
      if (openid && loginData && loginData.userId) {
        const bindResponse = await wechatApi.bind({
          userId: loginData.userId,
          openid,
          unionid,
          sessionKey
        });
          
        const bindData = bindResponse.data;
          
        // 绑定成功后，清除临时存储的微信信息
        wx.removeStorageSync('wechat_openid');
        wx.removeStorageSync('wechat_unionid');
        wx.removeStorageSync('wechat_session_key');
          
        wx.showToast({ title: '登录成功，微信已绑定', icon: 'success' });
      } else {
        // 如果没有 openid，只登录不绑定
        wx.removeStorageSync('wechat_openid');
        wx.removeStorageSync('wechat_unionid');
        wx.removeStorageSync('wechat_session_key');
        wx.showToast({ title: '登录成功', icon: 'success' });
      }
  
      // 跳转主页
      setTimeout(() => {
        wx.switchTab({ url: '/pages/index/index' });
      }, 800);
    } catch (error) {
      console.error('登录失败:', error);
      wx.showToast({ title: error.message || '登录失败', icon: 'none' });
    } finally {
      this.setData({ loginLoading: false });
    }
  },

  // 步骤 2B：注册新账号（先注册获取 userId，再调用绑定接口）
  async userRegister() {
    if (this.data.registerLoading) return;
    const { username, email, password } = this.data.registerForm;
  
    // 简单校验
    if (!username) {
      wx.showToast({ title: '请输入用户名', icon: 'none' });
      return;
    }
    if (username.length < 2 || username.length > 20) {
      wx.showToast({ title: '用户名长度为 2-20 个字符', icon: 'none' });
      return;
    }
    if (!password) {
      wx.showToast({ title: '请输入密码', icon: 'none' });
      return;
    }
    if (password.length < 6 || password.length > 20) {
      wx.showToast({ title: '密码长度为 6-20 位', icon: 'none' });
      return;
    }
    if (email) {
      const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailReg.test(email)) {
        wx.showToast({ title: '邮箱格式不正确', icon: 'none' });
        return;
      }
    }
  
    this.setData({ registerLoading: true });
    try {
      const openid = wx.getStorageSync('wechat_openid');
      const unionid = wx.getStorageSync('wechat_unionid');
      const sessionKey = wx.getStorageSync('wechat_session_key');
  
      // 1) 先调用注册接口获取 userId
      const registerResponse = await userApi.register({
        username,
        password,
        email
      });
      const registerData = registerResponse.data;
  
      // 2) 如果注册返回了 token 与用户信息，直接保存
      if (registerData && registerData.token) {
        request.setToken(registerData.token);
        wx.setStorageSync('userInfo', {
          userId: registerData.userId,
          username: registerData.username,
          userType: registerData.userType,
          realName: registerData.realName
        });
  
        // 3) 调用绑定接口
        if (openid && registerData.userId) {
          await wechatApi.bind({
            userId: registerData.userId,
            openid,
            unionid,
            sessionKey
          });
        }
      } else {
        // 如果注册接口没返回 token，需要重新登录获取
        const loginResponse = await userApi.login({ username, password });
        const loginData = loginResponse.data;
  
        // 获取到 userId 后，调用绑定接口
        if (openid && loginData && loginData.userId) {
          await wechatApi.bind({
            userId: loginData.userId,
            openid,
            unionid,
            sessionKey
          });
        }
      }
  
      // 清除临时存储的微信信息
      wx.removeStorageSync('wechat_openid');
      wx.removeStorageSync('wechat_unionid');
      wx.removeStorageSync('wechat_session_key');
  
      // 提示并跳转主页
      wx.showToast({ title: '注册成功，微信已绑定', icon: 'success' });
      setTimeout(() => {
        wx.switchTab({ url: '/pages/index/index' });
      }, 800);
    } catch (error) {
      console.error('注册失败:', error);
      wx.showToast({ title: error.message || '注册失败', icon: 'none' });
    } finally {
      this.setData({ registerLoading: false });
    }
  },

  // 根据当前登录表单状态更新按钮禁用态
  updateLoginDisabled() {
    const { username, password } = this.data.loginForm;
    const valid =
      !!username &&
      username.length >= 2 &&
      username.length <= 20 &&
      !!password &&
      password.length >= 6 &&
      password.length <= 20;
    this.setData({ loginDisabled: !valid });
  },

  // 根据当前注册表单状态更新按钮禁用态
  updateRegisterDisabled() {
    const { username, email, password } = this.data.registerForm;
    const emailOk =
      !email ||
      (/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email));
    const valid =
      !!username &&
      username.length >= 2 &&
      username.length <= 20 &&
      !!password &&
      password.length >= 6 &&
      password.length <= 20 &&
      emailOk;
    this.setData({ registerDisabled: !valid });
  }
});
