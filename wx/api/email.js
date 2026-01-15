// 邮箱验证API
const request = require('../utils/request.js');

/**
 * 发送注册验证邮件
 * @param {string} email 邮箱地址
 * @param {string} username 用户名
 * @returns {Promise}
 */
function sendRegisterEmail(email, username) {
  return request.post('/user/send-register-email', {
    email,
    username
  });
}

/**
 * 验证邮箱注册token
 * @param {string} token 验证token
 * @returns {Promise}
 */
function verifyEmail(token) {
  return request.get(`/user/verify-email?token=${token}`);
}

/**
 * 发送验证码邮件
 * @param {string} email 邮箱地址
 * @param {string} purpose 用途: register | reset-password | bind-email
 * @returns {Promise}
 */
function sendCode(email, purpose = 'verify') {
  return request.post('/user/send-code', {
    email,
    purpose
  });
}

/**
 * 验证验证码
 * @param {string} email 邮箱地址
 * @param {string} code 验证码
 * @returns {Promise}
 */
function verifyCode(email, code) {
  return request.post('/user/verify-code', {
    email,
    code
  });
}

/**
 * 绑定邮箱
 * @param {number} userId 用户ID
 * @param {string} email 邮箱地址
 * @param {string} code 验证码
 * @returns {Promise}
 */
function bindEmail(userId, email, code) {
  return request.post('/user/bind-email', {
    userId,
    email,
    code
  });
}

module.exports = {
  sendRegisterEmail,
  verifyEmail,
  sendCode,
  verifyCode,
  bindEmail
};
