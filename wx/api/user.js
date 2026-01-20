// 用户认证与管理API
const request = require('../utils/request.js');

/**
 * 用户登录
 * @param {Object} loginData 登录数据 { username, password }
 * @returns {Promise}
 */
function login(loginData) {
  return request.post('/user/login', loginData, { skipAuth: true, noRedirectOn401: true }).then(response => {
    // 响应格式：{code: 200, message: "操作成功", data: {token, userId, username, userType, realName}, success: true}
    // 实际数据在response.data字段中
    const data = response.data;
    
    // 保存token和用户信息
    if (data && data.token) {
      request.setToken(data.token);
      wx.setStorageSync('userInfo', {
        userId: data.userId,
        username: data.username,
        userType: data.userType,
        realName: data.realName
      });
    }
    return response;
  });
}

/**
 * 用户注册
 * @param {Object} userData 用户数据
 * @returns {Promise}
 */
function register(userData) {
  return request.post('/user/register', userData, { skipAuth: true, noRedirectOn401: true });
}

/**
 * 退出登录
 */
function logout() {
  request.removeToken();
  wx.removeStorageSync('userInfo');
}

/**
 * 获取用户信息
 * @param {number} userId 用户ID
 * @returns {Promise}
 */
function getUserInfo(userId) {
  return request.get(`/user/${userId}`);
}

/**
 * 更新用户信息
 * @param {number} userId 用户ID
 * @param {Object} userData 用户数据
 * @returns {Promise}
 */
function updateUserInfo(userId, userData) {
  return request.put(`/user/${userId}`, userData);
}

/**
 * 修改密码
 * @param {number} userId 用户ID
 * @param {string} oldPassword 旧密码
 * @param {string} newPassword 新密码
 * @returns {Promise}
 */
function changeAdminPassword(userId, oldPassword, newPassword) {
  return request.put('/user/password', {
    id: userId,
    oldPassword,
    newPassword
  });
}

/**
 * 通过邮箱验证码重置密码
 * @param {string} email 邮箱
 * @param {string} code 验证码
 * @param {string} newPassword 新密码
 * @returns {Promise}
 */
function resetPasswordByEmail(email, code, newPassword) {
  return request.post('/user/reset-password-by-email', {
    email,
    code,
    newPassword
  });
}

/**
 * 获取当前用户信息
 * @returns {Promise}
 */
function getProfile() {
  return request.get('/user').catch(error => {
    // 如果 API 调用失败，提供模拟数据
    console.warn('API调用失败，使用模拟数据:', error);
    
    // 从本地存储获取基本信息
    const localUserInfo = getCurrentUser();
    if (localUserInfo) {
      // 返回模拟数据格式与API响应保持一致
      return Promise.resolve({
        success: true,
        code: 200,
        message: '使用本地缓存数据',
        data: {
          ...localUserInfo,
          phone: '138****8888',
          email: 'user@example.com',
          avatarUrl: '/images/wode.png',
          apiFallback: true
        }
      });
    }
    
    // 如果没有本地数据，抛出原始错误
    throw error;
  });
}

/**
 * 更新当前用户信息
 * @param {Object} userData 用户数据
 * @returns {Promise}
 */
function updateProfile(userData) {
  // 获取当前用户ID
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.userId) {
    return Promise.reject(new Error('无法获取当前用户ID'));
  }
  
  // 处理头像字段：如果传入的是avatarUrl，转换为avatar
  const processedData = { ...userData };
  if (processedData.avatarUrl && !processedData.avatar) {
    processedData.avatar = processedData.avatarUrl;
    delete processedData.avatarUrl;
  }
  
  return request.put(`/user/${currentUser.userId}`, processedData);
}

/**
 * 修改密码（当前用户）
 * @param {Object} passwordData 密码数据 {oldPassword, newPassword}
 * @returns {Promise}
 */
function changePassword(passwordData) {
  // 获取当前用户ID
  const currentUser = getCurrentUser();
  if (!currentUser || !currentUser.userId) {
    return Promise.reject(new Error('无法获取当前用户ID'));
  }
  
  return request.put('/user/password', {
    id: currentUser.userId,
    oldPassword: passwordData.oldPassword,
    newPassword: passwordData.newPassword
  });
}

/**
 * 获取用户统计信息
 * @returns {Promise}
 */
function getUserStatistics() {
  return request.get('/user/statistics');
}

/**
 * 获取当前登录用户信息
 * @returns {Object|null}
 */
function getCurrentUser() {
  return wx.getStorageSync('userInfo') || null;
}

/**
 * 检查是否已登录
 * @returns {boolean}
 */
function isLoggedIn() {
  return !!request.getToken() || !!getCurrentUser();
}

module.exports = {
  login,
  register,
  logout,
  getUserInfo,
  updateUserInfo,
  changeAdminPassword,
  resetPasswordByEmail,
  getProfile,
  updateProfile,
  changePassword,
  getUserStatistics,
  getCurrentUser,
  isLoggedIn
};
