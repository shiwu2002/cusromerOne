// 用户认证与管理API
const request = require('../utils/request.js');

/**
 * 用户登录
 * @param {Object} loginData 登录数据 { username, password }
 * @returns {Promise}
 */
function login(loginData) {
  return request.post('/user/login', loginData, { skipAuth: true, noRedirectOn401: true }).then(res => {
    // 实际数据在data字段中
    const data = res.data || res;
    
    // 保存token和用户信息
    if (data.token) {
      request.setToken(data.token);
      wx.setStorageSync('userInfo', {
        userId: data.userId,
        username: data.username,
        userType: data.userType,
        realName: data.realName
      });
    }
    return data;
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
function changePassword(userId, oldPassword, newPassword) {
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
  return !!request.getToken();
}

module.exports = {
  login,
  register,
  logout,
  getUserInfo,
  updateUserInfo,
  changePassword,
  resetPasswordByEmail,
  getUserStatistics,
  getCurrentUser,
  isLoggedIn
};
