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

  // 步骤1：微信登录（wx.login → /api/wx/login）
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
      const res = await wechatApi.login(wxRes.code);
      // wechatApi.login 内部已在 needBind=false 且存在 token 时保存 token 与用户信息

      if (res && res.needBind === false) {
        // 已绑定：登录成功，跳转首页
        wx.showToast({ title: '登录成功', icon: 'success' });
        setTimeout(() => {
          wx.switchTab({ url: '/pages/index/index' });
        }, 800);
        return;
      }

      // 未绑定：保存 openid/unionid，展示账号登录/注册选项
      const openid = res && res.openid ? res.openid : '';
      const unionid = res && res.unionid ? res.unionid : '';

      this.setData({
        needBind: true,
        openid,
        unionid,
        activeTab: 0
      });

      // 同时保存到本地，便于登录/注册时传递
      wx.setStorageSync('wechat_openid', openid);
      wx.setStorageSync('wechat_unionid', unionid);
    } catch (error) {
      console.error('微信登录失败:', error);
      wx.showToast({ title: error.message || '微信登录失败', icon: 'none' });
    } finally {
      this.setData({ wxLoginLoading: false });
    }
  },

  // 步骤2A：账号登录（携带 openid/unionid 自动绑定）
  async userLogin() {
    if (this.data.loginLoading) return;
    const { username, password } = this.data.loginForm;
    // 简单校验
    if (!username) {
      wx.showToast({ title: '请输入用户名', icon: 'none' });
      return;
    }
    if (username.length < 2 || username.length > 20) {
      wx.showToast({ title: '用户名长度为2-20个字符', icon: 'none' });
      return;
    }
    if (!password) {
      wx.showToast({ title: '请输入密码', icon: 'none' });
      return;
    }
    if (password.length < 6 || password.length > 20) {
      wx.showToast({ title: '密码长度为6-20位', icon: 'none' });
      return;
    }

    this.setData({ loginLoading: true });
    try {
      const openid = wx.getStorageSync('wechat_openid');
      const unionid = wx.getStorageSync('wechat_unionid');

      // 登录时携带 openid/unionid，后端自动绑定（sessionKey 后端已保存）
      const data = await userApi.login({
        username,
        password,
        openid,
        unionid
      });

      // 清除临时存储的微信信息
      wx.removeStorageSync('wechat_openid');
      wx.removeStorageSync('wechat_unionid');

      // 处理绑定结果提示
      if (data.wechatBound) {
        wx.showToast({ title: '登录成功，微信已绑定', icon: 'success' });
      } else if (data.bindWarning) {
        wx.showToast({ title: data.bindWarning, icon: 'none' });
      } else {
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

  // 步骤2B：注册新账号（携带 openid/unionid 自动绑定）
  async userRegister() {
    if (this.data.registerLoading) return;
    const { username, email, password } = this.data.registerForm;

    // 简单校验
    if (!username) {
      wx.showToast({ title: '请输入用户名', icon: 'none' });
      return;
    }
    if (username.length < 2 || username.length > 20) {
      wx.showToast({ title: '用户名长度为2-20个字符', icon: 'none' });
      return;
    }
    if (!password) {
      wx.showToast({ title: '请输入密码', icon: 'none' });
      return;
    }
    if (password.length < 6 || password.length > 20) {
      wx.showToast({ title: '密码长度为6-20位', icon: 'none' });
      return;
    }
    if (email) {
      const emailReg = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
      if (!emailReg.test(email)) {
        wx.showToast({ title: '邮箱格式不正确', icon: 'none' });
        return;
      }
    }

    this.setData({ registerLoading: true });
    try {
      const openid = wx.getStorageSync('wechat_openid');
      const unionid = wx.getStorageSync('wechat_unionid');

      // 注册时携带 openid/unionid，后端自动绑定
      const data = await userApi.register({
        username,
        password,
        email,
        openid,
        unionid
      });

      // 如果注册返回了 token 与用户信息，直接保存；否则兼容走一次登录以确保 token 就绪
      if (data && data.token) {
        request.setToken(data.token);
        wx.setStorageSync('userInfo', {
          userId: data.userId,
          username: data.username,
          userType: data.userType,
          realName: data.realName,
          email: data.email
        });
      } else {
        await userApi.login({ username, password, openid, unionid });
      }

      // 清除临时存储的微信信息
      wx.removeStorageSync('wechat_openid');
      wx.removeStorageSync('wechat_unionid');

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
